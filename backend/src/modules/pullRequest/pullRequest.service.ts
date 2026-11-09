import { prisma } from "../../core/config/db.js";
import { logger } from "../../core/config/logger.js";
import { createInstallationOctokit } from "../../core/config/octokit.js";
import { PullRequestState } from "../../generated/prisma/enums.js";
import ApiError from "../../shared/utils/ApiError.js";
import type {
  GitHubPullRequestFile,
  PullRequestDiffData,
} from "../../shared/types/github.types.js";
import type { ListPullRequestsQueryInput } from "./pullRequest.validation.js";

/**
 * Fetches the unified raw git diff string directly from GitHub for a PR.
 */
export const fetchPullRequestRawDiff = async (
  installationId: number | bigint,
  owner: string,
  repo: string,
  pullNumber: number,
): Promise<string> => {
  try {
    const octokit = createInstallationOctokit(installationId);
    const response = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
      mediaType: {
        format: "diff",
      },
    });

    return (response.data as unknown as string) || "";
  } catch (error) {
    logger.error("Failed to fetch raw PR diff from GitHub", {
      owner,
      repo,
      pullNumber,
      error,
    });
    throw new ApiError(502, `Failed to retrieve PR diff from GitHub: ${String(error)}`);
  }
};

/**
 * Fetches the complete list of changed files with additions, deletions, and patch hunks.
 */
export const fetchPullRequestFiles = async (
  installationId: number | bigint,
  owner: string,
  repo: string,
  pullNumber: number,
): Promise<GitHubPullRequestFile[]> => {
  try {
    const octokit = createInstallationOctokit(installationId);
    const files = await octokit.paginate(octokit.rest.pulls.listFiles, {
      owner,
      repo,
      pull_number: pullNumber,
      per_page: 100,
    });

    return files.map((file) => ({
      sha: file.sha,
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      blob_url: file.blob_url,
      raw_url: file.raw_url,
      contents_url: file.contents_url,
      patch: file.patch,
      previous_filename: file.previous_filename,
    }));
  } catch (error) {
    logger.error("Failed to fetch changed files for PR from GitHub", {
      owner,
      repo,
      pullNumber,
      error,
    });
    throw new ApiError(502, `Failed to retrieve PR files from GitHub: ${String(error)}`);
  }
};

/**
 * Combines raw diff and changed files for a Pull Request by database ID,
 * verifying that the requesting user owns the underlying GitHub installation.
 */
export const getPullRequestDiffData = async (
  pullRequestId: string,
  userId: string,
): Promise<PullRequestDiffData> => {
  const pr = await prisma.pullRequest.findFirst({
    where: {
      id: pullRequestId,
      repository: {
        installation: {
          userId,
        },
      },
    },
    include: {
      repository: {
        include: {
          installation: true,
        },
      },
    },
  });

  if (!pr) {
    throw new ApiError(404, "Pull request not found or not accessible by this user");
  }

  const owner = pr.repository.ownerLogin;
  const repo = pr.repository.name;
  const pullNumber = pr.number;
  const installationId = pr.repository.installation.installationId;

  const [rawDiff, files] = await Promise.all([
    fetchPullRequestRawDiff(installationId, owner, repo, pullNumber),
    fetchPullRequestFiles(installationId, owner, repo, pullNumber),
  ]);

  return {
    owner,
    repo,
    pullNumber,
    baseSha: pr.baseSha,
    headSha: pr.headSha,
    rawDiff,
    files,
  };
};

/**
 * Lists pull requests for a given repository owned by the user.
 */
export const listPullRequestsByRepository = async (
  repositoryId: string,
  userId: string,
  query?: ListPullRequestsQueryInput,
) => {
  const repository = await prisma.repository.findFirst({
    where: {
      id: repositoryId,
      installation: {
        userId,
      },
    },
  });

  if (!repository) {
    throw new ApiError(404, "Repository not found or not accessible by this user");
  }

  const page = query?.page ?? 1;
  const limit = query?.limit ?? 20;
  const skip = (page - 1) * limit;

  const whereClause = {
    repositoryId,
    ...(query?.state && query.state !== "ALL"
      ? { state: query.state as "OPEN" | "CLOSED" | "MERGED" }
      : {}),
    ...(query?.search
      ? {
          OR: [
            { title: { contains: query.search, mode: "insensitive" as const } },
            { authorLogin: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  let total = await prisma.pullRequest.count({ where: whereClause });

  // If no PRs exist in database yet and not searching, auto-import past PRs from GitHub!
  if (total === 0 && !query?.search) {
    try {
      const repoWithInst = await prisma.repository.findUnique({
        where: { id: repositoryId },
        include: { installation: true },
      });

      if (repoWithInst?.installation) {
        const octokit = createInstallationOctokit(repoWithInst.installation.installationId);
        const { data: githubPRs } = await octokit.rest.pulls.list({
          owner: repoWithInst.ownerLogin,
          repo: repoWithInst.name,
          state: "all",
          per_page: 50,
        });

        for (const pr of githubPRs) {
          let state: PullRequestState = PullRequestState.OPEN;
          if (pr.merged_at) {
            state = PullRequestState.MERGED;
          } else if (pr.state === "closed") {
            state = PullRequestState.CLOSED;
          }

          await prisma.pullRequest.upsert({
            where: { githubId: BigInt(pr.id) },
            create: {
              githubId: BigInt(pr.id),
              number: pr.number,
              title: pr.title,
              body: pr.body ?? null,
              state,
              authorGithubId: pr.user?.id ? BigInt(pr.user.id) : null,
              authorLogin: pr.user?.login ?? null,
              baseBranch: pr.base.ref,
              headBranch: pr.head.ref,
              baseSha: pr.base.sha,
              headSha: pr.head.sha,
              repositoryId: repoWithInst.id,
              createdAt: new Date(pr.created_at),
              updatedAt: new Date(pr.updated_at),
              closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
              mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
              syncedAt: new Date(),
            },
            update: {
              number: pr.number,
              title: pr.title,
              body: pr.body ?? null,
              state,
              headSha: pr.head.sha,
              baseSha: pr.base.sha,
              updatedAt: new Date(pr.updated_at),
              closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
              mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
              syncedAt: new Date(),
            },
          });
        }

        if (githubPRs.length > 0) {
          total = await prisma.pullRequest.count({ where: whereClause });
          logger.info(`Auto-imported ${githubPRs.length} past PRs for repository ${repoWithInst.fullName}`);
        }
      }
    } catch (err) {
      logger.error("Failed to auto-sync existing PRs from GitHub:", err);
    }
  }

  const pullRequests = await prisma.pullRequest.findMany({
    where: whereClause,
    include: {
      _count: {
        select: { reviews: true },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          status: true,
          totalFindings: true,
          createdAt: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    skip,
    take: limit,
  });

  return {
    pullRequests,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Retrieves a single pull request by ID with its latest reviews.
 */
export const getPullRequestById = async (
  pullRequestId: string,
  userId: string,
) => {
  const pr = await prisma.pullRequest.findFirst({
    where: {
      id: pullRequestId,
      repository: {
        installation: {
          userId,
        },
      },
    },
    include: {
      repository: {
        include: {
          settings: true,
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { findings: true },
          },
        },
      },
    },
  });

  if (!pr) {
    throw new ApiError(404, "Pull request not found or not accessible by this user");
  }

  return pr;
};
