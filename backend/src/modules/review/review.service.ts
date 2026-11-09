import { prisma } from "../../core/config/db.js";
import { env } from "../../core/config/env.js";
import { getGeminiClient } from "../../core/config/gemini.js";
import { logger } from "../../core/config/logger.js";
import { createInstallationOctokit } from "../../core/config/octokit.js";
import {
  CommentStatus,
  DiffSide,
  FindingCategory,
  FindingStatus,
  ReviewStatus,
  Severity,
} from "../../generated/prisma/enums.js";
import ApiError from "../../shared/utils/ApiError.js";
import type {
  AiFindingPayload,
  AiReviewAnalysisResult,
  FindingFilterOptions,
  PostReviewResult,
  ReviewMetrics,
  ReviewTriggerOptions,
} from "../../shared/types/review.types.js";
import { fetchPullRequestFiles } from "../pullRequest/pullRequest.service.js";
import {
  formatFilesForPrompt,
  generateFindingFingerprint,
} from "./diffParser.js";

const SEVERITY_LEVELS: Record<Severity, number> = {
  [Severity.CRITICAL]: 4,
  [Severity.HIGH]: 3,
  [Severity.MEDIUM]: 2,
  [Severity.LOW]: 1,
  [Severity.INFO]: 0,
};

const PROMPT_VERSION = "v1.0";

/**
 * Executes Gemini LLM content generation with structured JSON schema
 * to evaluate code changes and extract actionable findings.
 */
export const analyzeDiffWithAI = async (
  prTitle: string,
  prBody: string | null,
  formattedDiff: string,
): Promise<AiReviewAnalysisResult> => {
  const ai = getGeminiClient();

  const systemInstruction = `You are an elite Staff Software Engineer and Senior Application Security Architect performing a Pull Request Code Review.
Analyze the provided code diff carefully and identify genuine, actionable defects:
- Critical and high-severity security vulnerabilities (injections, broken authentication, data leaks, SSRF, IDOR).
- Functional bugs, off-by-one errors, race conditions, null-pointer dereferences, and logic flaws.
- Performance regressions (N+1 queries, unindexed lookups, memory leaks, blocking CPU tasks).
- Missing error handling, unhandled rejected promises, resource leaks.
- Serious maintainability or architectural design flaws.

Rules:
1. ONLY flag real, high-confidence issues. Do NOT comment on formatting, whitespace, or stylistic nitpicks unless they cause a bug.
2. Ensure line numbers map accurately to the new code indicated by 'Line <number> (+):' or 'Line <number> ( ):'.
3. Set confidence between 0.0 and 1.0. Only include findings where confidence >= 0.70.
4. Output valid JSON adhering to the expected schema.`;

  const userPrompt = `Pull Request Title: ${prTitle}
Pull Request Description: ${prBody || "None provided"}

Changes & Annotated Diff:
${formattedDiff}

Provide your analysis in JSON format adhering strictly to this structure:
{
  "summary": "Executive summary of review findings",
  "findings": [
    {
      "filePath": "file path from the diff",
      "line": 10,
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO",
      "category": "SECURITY" | "BUG" | "PERFORMANCE" | "CODE_QUALITY" | "ERROR_HANDLING",
      "title": "Brief descriptive title",
      "message": "Clear explanation of the issue and security/correctness risk",
      "suggestion": "Concrete suggested fix or code snippet",
      "confidence": 0.95
    }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: [userPrompt],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text?.trim() || "{}";
    const rawParsed = JSON.parse(responseText);

    let rawFindings: any[] = [];
    let summary: string | undefined = undefined;

    if (Array.isArray(rawParsed)) {
      rawFindings = rawParsed;
    } else if (rawParsed && typeof rawParsed === "object") {
      summary = rawParsed.summary;
      if (Array.isArray(rawParsed.findings)) {
        rawFindings = rawParsed.findings;
      } else if (Array.isArray(rawParsed.issues)) {
        rawFindings = rawParsed.issues;
      }
    }

    const validCategories = new Set(Object.values(FindingCategory));
    const validSeverities = new Set(Object.values(Severity));

    const validatedFindings: AiFindingPayload[] = [];

    for (const f of rawFindings) {
      const filePath = f.filePath || f.file || f.filename || f.path;
      if (!filePath || typeof filePath !== "string") continue;

      const rawSeverity = String(f.severity || "MEDIUM").toUpperCase();
      let severity: Severity = Severity.MEDIUM;
      if (validSeverities.has(rawSeverity as Severity)) {
        severity = rawSeverity as Severity;
      } else if (rawSeverity.includes("CRIT")) {
        severity = Severity.CRITICAL;
      } else if (rawSeverity.includes("HIGH")) {
        severity = Severity.HIGH;
      } else if (rawSeverity.includes("MED")) {
        severity = Severity.MEDIUM;
      } else if (rawSeverity.includes("LOW")) {
        severity = Severity.LOW;
      } else if (rawSeverity.includes("INFO")) {
        severity = Severity.INFO;
      }

      const rawCategory = String(f.category || "CODE_QUALITY").toUpperCase();
      let category: FindingCategory = FindingCategory.CODE_QUALITY;
      if (validCategories.has(rawCategory as FindingCategory)) {
        category = rawCategory as FindingCategory;
      } else if (rawCategory.includes("SEC")) {
        category = FindingCategory.SECURITY;
      } else if (
        rawCategory.includes("BUG") ||
        rawCategory.includes("RUN") ||
        rawCategory.includes("LOGIC")
      ) {
        category = FindingCategory.BUG;
      } else if (rawCategory.includes("PERF")) {
        category = FindingCategory.PERFORMANCE;
      } else if (rawCategory.includes("ERR") || rawCategory.includes("EXCEPT")) {
        category = FindingCategory.ERROR_HANDLING;
      } else if (rawCategory.includes("STYLE") || rawCategory.includes("LINT")) {
        category = FindingCategory.STYLE;
      } else if (rawCategory.includes("MAINTAIN")) {
        category = FindingCategory.MAINTAINABILITY;
      }

      const message =
        f.message ||
        f.description ||
        f.comment ||
        "Potential defect detected in this change.";

      const title =
        f.title?.slice(0, 200) ||
        f.name?.slice(0, 200) ||
        message.slice(0, 100);

      const rawLine =
        typeof f.line === "number"
          ? f.line
          : typeof f.lineNumber === "number"
            ? f.lineNumber
            : null;

      const side =
        f.side?.toUpperCase() === "LEFT" ? DiffSide.LEFT : DiffSide.RIGHT;

      validatedFindings.push({
        filePath,
        line: rawLine,
        startLine: typeof f.startLine === "number" ? f.startLine : null,
        side,
        severity,
        category,
        title,
        message,
        suggestion: f.suggestion || f.recommendation || f.fix || null,
        confidence: typeof f.confidence === "number" ? f.confidence : 0.85,
      });
    }

    return {
      summary: summary || `Analyzed pull request diff: ${validatedFindings.length} findings identified.`,
      findings: validatedFindings,
    };
  } catch (error) {
    logger.error("Gemini AI code review generation failed", { error });
    throw new ApiError(502, `AI review generation failed: ${String(error)}`);
  }
};

/**
 * Triggers and persists a complete AI review pipeline for a pull request.
 */
export const runPullRequestReview = async ({
  pullRequestId,
  triggeredById = null,
  forceReReview = false,
}: ReviewTriggerOptions) => {
  const pr = await prisma.pullRequest.findUnique({
    where: { id: pullRequestId },
    include: {
      repository: {
        include: {
          installation: true,
          settings: true,
        },
      },
    },
  });

  if (!pr) {
    throw new ApiError(404, "Pull request not found");
  }

  const settings = pr.repository.settings;
  if (settings && (!settings.enabled || !settings.aiReviewEnabled)) {
    logger.info(
      `AI review skipped for PR #${pr.number} (${pr.repository.fullName}): AI review is disabled in repository settings`,
    );
    return null;
  }

  // Check if a review already exists for this exact headSha
  const existingReview = await prisma.review.findUnique({
    where: {
      pullRequestId_headSha: {
        pullRequestId,
        headSha: pr.headSha,
      },
    },
    include: {
      findings: true,
    },
  });

  if (existingReview) {
    if (existingReview.status === ReviewStatus.COMPLETED && !forceReReview) {
      logger.info(
        `Review for PR #${pr.number} at SHA ${pr.headSha.slice(0, 7)} already completed. Returning cached review.`,
      );
      return existingReview;
    }

    if (existingReview.status === ReviewStatus.RUNNING) {
      logger.info(
        `Review for PR #${pr.number} at SHA ${pr.headSha.slice(0, 7)} is currently running.`,
      );
      return existingReview;
    }
  }

  // Mark or create Review record as RUNNING
  const review = await prisma.review.upsert({
    where: {
      pullRequestId_headSha: {
        pullRequestId,
        headSha: pr.headSha,
      },
    },
    create: {
      pullRequestId,
      headSha: pr.headSha,
      status: ReviewStatus.RUNNING,
      triggeredById,
      startedAt: new Date(),
      model: env.GEMINI_MODEL,
      promptVersion: PROMPT_VERSION,
    },
    update: {
      status: ReviewStatus.RUNNING,
      startedAt: new Date(),
      completedAt: null,
      errorMessage: null,
      totalFindings: 0,
      model: env.GEMINI_MODEL,
      promptVersion: PROMPT_VERSION,
      ...(triggeredById ? { triggeredById } : {}),
    },
  });

  try {
    // 1. Fetch changed files from GitHub
    const files = await fetchPullRequestFiles(
      pr.repository.installation.installationId,
      pr.repository.ownerLogin,
      pr.repository.name,
      pr.number,
    );

    // 2. Format diff for prompt
    const { formattedDiff, reviewedFileCount } = formatFilesForPrompt(files);

    if (reviewedFileCount === 0 || !formattedDiff) {
      logger.info(
        `No reviewable code changes detected for PR #${pr.number} (${pr.repository.fullName})`,
      );

      return prisma.review.update({
        where: { id: review.id },
        data: {
          status: ReviewStatus.COMPLETED,
          completedAt: new Date(),
          totalFindings: 0,
        },
        include: { findings: true },
      });
    }

    // 3. Call AI Analysis
    const analysis = await analyzeDiffWithAI(pr.title, pr.body, formattedDiff);

    // 4. Filter findings by repository minimumSeverity threshold
    const minSeverityThreshold = settings?.minimumSeverity
      ? SEVERITY_LEVELS[settings.minimumSeverity]
      : SEVERITY_LEVELS[Severity.LOW];

    const eligibleFindings = analysis.findings.filter(
      (finding) => SEVERITY_LEVELS[finding.severity] >= minSeverityThreshold,
    );

    // 5. Persist findings to database in a transaction
    const completedReview = await prisma.$transaction(async (tx) => {
      // Clear previous findings for this review if re-running
      await tx.finding.deleteMany({
        where: { reviewId: review.id },
      });

      // Insert new findings with deterministic fingerprints
      if (eligibleFindings.length > 0) {
        await tx.finding.createMany({
          data: eligibleFindings.map((f) => ({
            reviewId: review.id,
            severity: f.severity,
            category: f.category,
            title: f.title,
            message: f.message,
            suggestion: f.suggestion,
            filePath: f.filePath,
            line: f.line,
            startLine: f.startLine,
            side: f.side ?? DiffSide.RIGHT,
            fingerprint: generateFindingFingerprint(
              f.filePath,
              f.line,
              f.category,
              f.title,
            ),
            confidence: f.confidence,
            status: FindingStatus.OPEN,
          })),
          skipDuplicates: true,
        });
      }

      return tx.review.update({
        where: { id: review.id },
        data: {
          status: ReviewStatus.COMPLETED,
          completedAt: new Date(),
          totalFindings: eligibleFindings.length,
          errorMessage: null,
        },
        include: {
          findings: {
            orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
          },
        },
      });
    });

    logger.info(
      `AI review completed for PR #${pr.number} (SHA ${pr.headSha.slice(0, 7)}): ${eligibleFindings.length} findings recorded`,
    );

    // 6. Post review comments back to GitHub if autoComment is enabled
    if (settings?.autoComment !== false) {
      postReviewToGitHub(review.id).catch((err) => {
        logger.error(
          `Background GitHub review comment posting failed for review ${review.id}:`,
          { error: err },
        );
      });
    }

    return completedReview;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`AI review pipeline failed for PR #${pr.number}:`, { error });

    await prisma.review.update({
      where: { id: review.id },
      data: {
        status: ReviewStatus.FAILED,
        completedAt: new Date(),
        errorMessage: errorMsg,
      },
    });

    throw error;
  }
};

/**
 * Fetches a single review by ID with its findings and metrics,
 * enforcing user tenancy check.
 */
export const getReviewById = async (
  reviewId: string,
  userId: string,
  filter?: FindingFilterOptions,
) => {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      pullRequest: {
        repository: {
          installation: {
            userId,
          },
        },
      },
    },
    include: {
      pullRequest: {
        include: {
          repository: true,
        },
      },
      findings: {
        where: {
          ...(filter?.severity ? { severity: filter.severity } : {}),
          ...(filter?.category ? { category: filter.category } : {}),
          ...(filter?.status ? { status: filter.status } : {}),
          ...(filter?.filePath
            ? { filePath: { contains: filter.filePath, mode: "insensitive" } }
            : {}),
        },
        orderBy: [{ severity: "asc" }, { line: "asc" }],
      },
    },
  });

  if (!review) {
    throw new ApiError(404, "Review not found or not accessible by this user");
  }

  // Calculate metrics breakdown
  const metrics: ReviewMetrics = {
    totalFindings: review.findings.length,
    criticalCount: review.findings.filter((f) => f.severity === Severity.CRITICAL).length,
    highCount: review.findings.filter((f) => f.severity === Severity.HIGH).length,
    mediumCount: review.findings.filter((f) => f.severity === Severity.MEDIUM).length,
    lowCount: review.findings.filter((f) => f.severity === Severity.LOW).length,
    infoCount: review.findings.filter((f) => f.severity === Severity.INFO).length,
    status: review.status,
  };

  return {
    review,
    metrics,
  };
};

/**
 * Updates the resolution status of a finding (OPEN, RESOLVED, DISMISSED).
 */
export const updateFindingStatus = async (
  findingId: string,
  userId: string,
  status: FindingStatus,
) => {
  const finding = await prisma.finding.findFirst({
    where: {
      id: findingId,
      review: {
        pullRequest: {
          repository: {
            installation: {
              userId,
            },
          },
        },
      },
    },
  });

  if (!finding) {
    throw new ApiError(404, "Finding not found or not accessible by this user");
  }

  return prisma.finding.update({
    where: { id: findingId },
    data: { status },
  });
};

/**
 * Formats a clean markdown body for an inline GitHub review comment.
 */
const formatFindingComment = (finding: {
  severity: Severity;
  category: FindingCategory;
  title: string;
  message: string;
  suggestion?: string | null;
  confidence?: number | null;
}): string => {
  const emojiMap: Record<Severity, string> = {
    [Severity.CRITICAL]: "🚨",
    [Severity.HIGH]: "⚠️",
    [Severity.MEDIUM]: "⚡",
    [Severity.LOW]: "🔍",
    [Severity.INFO]: "💡",
  };

  const emoji = emojiMap[finding.severity] || "⚠️";
  const confidencePercent = Math.round((finding.confidence || 0.8) * 100);

  let body = `### ${emoji} **[${finding.severity}]** ${finding.title}\n\n`;
  body += `**Category:** \`${finding.category}\` | **Confidence:** \`${confidencePercent}%\`\n\n`;
  body += `${finding.message}\n`;

  if (finding.suggestion) {
    body += `\n**Suggested Fix:**\n\`\`\`suggestion\n${finding.suggestion}\n\`\`\`\n`;
  }

  body += `\n---\n*Reported by [PR Analyzer](https://github.com)*`;

  return body;
};

/**
 * Formats the summary report markdown displayed in the main GitHub PR review description.
 */
const formatReviewSummary = (
  findings: Array<{
    severity: Severity;
    title: string;
    filePath: string;
    line?: number | null;
    message: string;
  }>,
  headSha: string,
  inlineCount: number,
): string => {
  const critical = findings.filter((f) => f.severity === Severity.CRITICAL).length;
  const high = findings.filter((f) => f.severity === Severity.HIGH).length;
  const medium = findings.filter((f) => f.severity === Severity.MEDIUM).length;
  const low = findings.filter((f) => f.severity === Severity.LOW).length;
  const info = findings.filter((f) => f.severity === Severity.INFO).length;

  let summary = `## 🤖 AI Code Review Summary\n\n`;
  summary += `**Commit Analyzed:** \`${headSha.slice(0, 7)}\`\n`;
  summary += `**Total Issues Detected:** **${findings.length}**\n\n`;
  summary += `| Severity | Count |\n|---|---|\n`;
  summary += `| 🚨 Critical | ${critical} |\n`;
  summary += `| ⚠️ High | ${high} |\n`;
  summary += `| ⚡ Medium | ${medium} |\n`;
  summary += `| 🔍 Low | ${low} |\n`;
  summary += `| 💡 Info | ${info} |\n\n`;

  if (findings.length === 0) {
    summary += `✅ **No high-priority issues detected!** Code changes look clean.\n`;
  } else if (inlineCount < findings.length) {
    summary += `### 📋 General / File-Level Findings\n\n`;
    for (const f of findings) {
      if (!f.line) {
        summary += `- **[${f.severity}]** \`${f.filePath}\`: **${f.title}** - ${f.message}\n`;
      }
    }
    summary += `\n`;
  }

  summary += `---\n*Automated review generated by PR Analyzer AI*`;
  return summary;
};

/**
 * Posts review findings directly to GitHub as a review with inline line comments.
 */
export const postReviewToGitHub = async (
  reviewId: string,
): Promise<PostReviewResult> => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      pullRequest: {
        include: {
          repository: {
            include: {
              installation: true,
              settings: true,
            },
          },
        },
      },
      findings: true,
    },
  });

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  const { pullRequest } = review;
  const { repository } = pullRequest;
  const settings = repository.settings;

  if (settings && !settings.autoComment) {
    logger.info(
      `Skipping GitHub comment posting for PR #${pullRequest.number}: autoComment is disabled in repository settings`,
    );
    return {
      posted: false,
      reviewCommentCount: 0,
      skippedReason: "autoComment is disabled in repository settings",
    };
  }

  const octokit = createInstallationOctokit(
    repository.installation.installationId,
  );

  // Filter open findings that have valid line numbers for inline commenting
  const eligibleInlineFindings = review.findings.filter(
    (f) => typeof f.line === "number" && f.line > 0 && f.status === FindingStatus.OPEN,
  );

  const inlineComments = eligibleInlineFindings.map((f) => ({
    path: f.filePath,
    line: f.line as number,
    side: f.side === DiffSide.LEFT ? ("LEFT" as const) : ("RIGHT" as const),
    body: formatFindingComment(f),
  }));

  const summaryBody = formatReviewSummary(
    review.findings,
    review.headSha,
    inlineComments.length,
  );

  try {
    const response = await octokit.rest.pulls.createReview({
      owner: repository.ownerLogin,
      repo: repository.name,
      pull_number: pullRequest.number,
      commit_id: review.headSha,
      event: "COMMENT",
      body: summaryBody,
      comments: inlineComments.length > 0 ? inlineComments : undefined,
    });

    // Mark findings as POSTED in database
    await prisma.finding.updateMany({
      where: { reviewId },
      data: { commentStatus: CommentStatus.POSTED },
    });

    logger.info(
      `Successfully posted GitHub review #${response.data.id} with ${inlineComments.length} inline comments for PR #${pullRequest.number}`,
    );

    return {
      posted: true,
      reviewCommentCount: inlineComments.length,
      githubReviewId: response.data.id,
    };
  } catch (error) {
    logger.warn(
      `Batch inline review failed for PR #${pullRequest.number}. Attempting fallback summary comment...`,
      { error },
    );

    // Fallback: If inline comments failed (e.g. line outside diff range), post comprehensive summary review
    try {
      const fallbackResponse = await octokit.rest.pulls.createReview({
        owner: repository.ownerLogin,
        repo: repository.name,
        pull_number: pullRequest.number,
        commit_id: review.headSha,
        event: "COMMENT",
        body:
          `${summaryBody}\n\n### 📝 Detailed Findings\n` +
          review.findings
            .map(
              (f) =>
                `#### [${f.severity}] ${f.title} (\`${f.filePath}${f.line ? `:${f.line}` : ""}\`)\n${f.message}${f.suggestion ? `\n\`\`\`suggestion\n${f.suggestion}\n\`\`\`` : ""}`,
            )
            .join("\n\n"),
      });

      await prisma.finding.updateMany({
        where: { reviewId },
        data: { commentStatus: CommentStatus.POSTED },
      });

      return {
        posted: true,
        reviewCommentCount: 0,
        githubReviewId: fallbackResponse.data.id,
      };
    } catch (fallbackError) {
      logger.error("Failed to post fallback review comment to GitHub", {
        error: fallbackError,
      });

      await prisma.finding.updateMany({
        where: { reviewId },
        data: { commentStatus: CommentStatus.FAILED },
      });

      throw new ApiError(
        502,
        `Failed to post review comments to GitHub: ${String(fallbackError)}`,
      );
    }
  }
};

