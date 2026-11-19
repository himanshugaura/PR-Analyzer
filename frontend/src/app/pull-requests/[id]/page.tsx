"use client";

import { use, useState, Suspense, useMemo } from "react";
import Link from "next/link";
import {
  Loader2,
  Bug,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  LayoutDashboard,
  ArrowRight,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Code2,
} from "lucide-react";
import { Container } from "../../../components/layout/container";
import { PullRequestHeader } from "../../../components/pull-request/pr-header";
import { ReviewMetricsBar } from "../../../components/pull-request/review-metrics-bar";
import { FindingsFilterBar } from "../../../components/pull-request/findings-filter-bar";
import { FindingCard } from "../../../components/pull-request/finding-card";
import { DiffViewer } from "../../../components/pull-request/diff-viewer";
import { Badge } from "../../../components/ui/badge";
import {
  usePullRequest,
  usePullRequestDiff,
} from "../../../hooks/use-pull-requests";
import {
  useReview,
} from "../../../hooks/use-reviews";
import { useUiStore } from "../../../store/use-ui-store";
import type { Finding } from "../../../types";

const PR_TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "review", label: "Code Review", icon: Bug },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "summary", label: "AI Summary", icon: Sparkles },
  { id: "changes", label: "Changes", icon: FileText },
] as const;

type PrTab = (typeof PR_TABS)[number]["id"];

function PullRequestReviewContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const prId = resolvedParams.id;

  const [activeTab, setActiveTab] = useState<PrTab>("overview");

  const severityFilter = useUiStore((s) => s.severityFilter);
  const categoryFilter = useUiStore((s) => s.categoryFilter);
  const statusFilter = useUiStore((s) => s.statusFilter);

  // 1. Fetch Pull Request details
  const {
    data: pullRequest,
    isLoading: isLoadingPr,
    error: prError,
  } = usePullRequest(prId);

  // Get latest review summary
  const latestReviewSummary = pullRequest?.reviews?.[0];
  const reviewId = latestReviewSummary?.id;

  // 2. Fetch Review details
  const { data: reviewData, isLoading: isLoadingReview } = useReview(reviewId, {
    severity: severityFilter,
    category: categoryFilter,
    status: statusFilter,
  });

  // 3. Fetch PR Diff data
  const {
    data: diffData,
    isLoading: isLoadingDiff,
    error: diffError,
    refetch: refetchDiff,
  } = usePullRequestDiff(prId);

  const review = reviewData?.review;
  const metrics = reviewData?.metrics;
  const findings: Finding[] = review?.findings || [];

  // Security-specific findings
  const securityFindings = useMemo(
    () => findings.filter((f) => f.category === "SECURITY"),
    [findings]
  );

  if (isLoadingPr) {
    return (
      <Container className="py-16">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#8B7CF6] mb-3" />
          <p className="text-xs text-[#858593] font-mono">Loading pull request...</p>
        </div>
      </Container>
    );
  }

  if (prError || !pullRequest) {
    return (
      <Container className="py-16">
        <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-8 text-center text-xs text-[#858593]">
          Pull request not found or not accessible.
        </div>
      </Container>
    );
  }

  const isCompleted = review?.status === "COMPLETED";
  const totalFindingsCount = metrics?.totalFindings ?? findings.length;

  return (
    <Container className="py-6 space-y-6">
      {/* PR Header & Metadata */}
      <PullRequestHeader pullRequest={pullRequest} latestReview={review} />

      {/* Primary 5-Tab Bar */}
      <div className="flex items-center gap-1 border-b border-[#303039] overflow-x-auto pb-px">
        {PR_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          let countBadge: number | null = null;
          if (tab.id === "review") countBadge = totalFindingsCount;
          if (tab.id === "security") countBadge = securityFindings.length;
          if (tab.id === "changes") countBadge = diffData?.files?.length ?? null;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer shrink-0 ${
                isActive
                  ? "border-[#8B7CF6] text-[#EDEDF2]"
                  : "border-transparent text-[#858593] hover:text-[#EDEDF2]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {countBadge !== null && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-[#8B7CF6]/20 text-[#8B7CF6]"
                      : "bg-[#292932] text-[#858593]"
                  }`}
                >
                  {countBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: OVERVIEW ─── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Review Metrics Bar */}
          <ReviewMetricsBar review={review} metrics={metrics} />

          {/* PR Body / Description Card */}
          {pullRequest.body && (
            <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-4 space-y-2">
              <h3 className="text-xs font-semibold text-[#858593] uppercase tracking-wider font-mono">
                Pull Request Description
              </h3>
              <p className="text-xs text-[#EDEDF2] whitespace-pre-wrap leading-relaxed font-sans">
                {pullRequest.body}
              </p>
            </div>
          )}

          {/* Recent Findings Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#EDEDF2] flex items-center gap-2">
                <Bug className="h-4 w-4 text-[#8B7CF6]" />
                <span>Top Detected Issues ({findings.length})</span>
              </h3>
              {findings.length > 3 && (
                <button
                  onClick={() => setActiveTab("review")}
                  className="text-xs text-[#8B7CF6] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All ({findings.length}) <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {findings.length === 0 ? (
              <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-8 text-center text-xs text-[#858593]">
                {isCompleted
                  ? "✓ No issues found. This pull request looks clean!"
                  : "Automated AI review runs continuously on every commit."}
              </div>
            ) : (
              <div className="space-y-3">
                {findings.slice(0, 3).map((f) => (
                  <FindingCard key={f.id} finding={f} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: CODE REVIEW ─── */}
      {activeTab === "review" && (
        <div className="space-y-4">
          <FindingsFilterBar totalCount={findings.length} />

          {isLoadingReview ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-[#8B7CF6]" />
            </div>
          ) : findings.length === 0 ? (
            <div className="rounded-[8px] border border-dashed border-[#303039] p-12 text-center text-xs text-[#858593] bg-[#1E1E26]/40">
              No findings matching the selected filters.
            </div>
          ) : (
            <div className="space-y-3">
              {findings.map((finding) => (
                <FindingCard key={finding.id} finding={finding} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: SECURITY AUDIT ─── */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <div className="p-4 rounded-[8px] border border-[#303039] bg-[#1E1E26] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-[6px] ${
                  securityFindings.length === 0
                    ? "bg-[#34D399]/10 text-[#34D399]"
                    : "bg-[#F87171]/10 text-[#F87171]"
                }`}
              >
                {securityFindings.length === 0 ? (
                  <ShieldCheck className="h-5 w-5" />
                ) : (
                  <ShieldAlert className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#EDEDF2]">
                  {securityFindings.length === 0
                    ? "Security Audit Clean"
                    : `${securityFindings.length} Security Issues Detected`}
                </h3>
                <p className="text-xs text-[#858593]">
                  {securityFindings.length === 0
                    ? "No high-risk vulnerabilities, injection vectors, or leaked secrets found."
                    : "Review the flagged security findings below and apply recommended mitigations."}
                </p>
              </div>
            </div>

            <Badge
              variant={securityFindings.length === 0 ? "success" : "critical"}
            >
              {securityFindings.length === 0 ? "PASSED" : "ACTION REQUIRED"}
            </Badge>
          </div>

          {securityFindings.length === 0 ? (
            <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-8 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-[#34D399] mx-auto" />
              <div className="text-sm font-semibold text-[#EDEDF2]">
                Zero Vulnerabilities Detected
              </div>
              <p className="text-xs text-[#858593] max-w-md mx-auto">
                Static and AI analysis checked for SQL injection, cross-site scripting (XSS), credential exposure, and improper error disclosures.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {securityFindings.map((finding) => (
                <FindingCard key={finding.id} finding={finding} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: AI SUMMARY ─── */}
      {activeTab === "summary" && (
        <div className="space-y-4">
          <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#303039]">
              <Sparkles className="h-4 w-4 text-[#8B7CF6]" />
              <h3 className="text-sm font-semibold text-[#EDEDF2]">
                Executive Pull Request Summary
              </h3>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-[#EDEDF2]">
              <p>
                This pull request modifies branch{" "}
                <span className="font-mono text-[#8B7CF6] bg-[#8B7CF6]/10 px-1 py-0.5 rounded">
                  {pullRequest.headBranch}
                </span>{" "}
                to merge into{" "}
                <span className="font-mono text-[#858593] bg-[#292932] px-1 py-0.5 rounded">
                  {pullRequest.baseBranch}
                </span>
                .
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-[6px] bg-[#101014] border border-[#303039]/50">
                  <div className="text-[11px] text-[#858593] uppercase tracking-wider mb-1">
                    Risk Assessment
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      totalFindingsCount > 3
                        ? "text-[#F87171]"
                        : totalFindingsCount > 0
                        ? "text-[#FBBF24]"
                        : "text-[#34D399]"
                    }`}
                  >
                    {totalFindingsCount > 3
                      ? "High Risk"
                      : totalFindingsCount > 0
                      ? "Moderate Risk"
                      : "Low Risk (Ready to Merge)"}
                  </div>
                </div>

                <div className="p-3 rounded-[6px] bg-[#101014] border border-[#303039]/50">
                  <div className="text-[11px] text-[#858593] uppercase tracking-wider mb-1">
                    Files Changed
                  </div>
                  <div className="text-sm font-semibold text-[#EDEDF2] font-mono">
                    {diffData?.files?.length ?? 0} files
                  </div>
                </div>

                <div className="p-3 rounded-[6px] bg-[#101014] border border-[#303039]/50">
                  <div className="text-[11px] text-[#858593] uppercase tracking-wider mb-1">
                    Engine Version
                  </div>
                  <div className="text-sm font-semibold text-[#8B7CF6] font-mono">
                    Gemini Reviewer
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <h4 className="text-xs font-semibold text-[#858593] uppercase tracking-wider mb-2 font-mono">
                  Key Recommendations
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-[#858593]">
                  <li>
                    Verify test coverage for newly added routes and functions.
                  </li>
                  <li>
                    Ensure error handlers gracefully bubble up HTTP status codes.
                  </li>
                  <li>
                    Check that all secrets remain within secure environment variables.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: CHANGES (DIFF VIEWER) ─── */}
      {activeTab === "changes" && (
        <div>
          {isLoadingDiff ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-[#8B7CF6]" />
            </div>
          ) : diffError ? (
            <div className="rounded-[8px] border border-[#F87171]/20 bg-[#F87171]/5 p-8 text-center text-xs text-[#F87171] space-y-3">
              <p>
                Failed to load diff files from GitHub:{" "}
                {(diffError as Error)?.message || "Bad Gateway"}
              </p>
              <button
                type="button"
                onClick={() => refetchDiff()}
                className="px-3 py-1.5 rounded-[4px] bg-[#1E1E26] border border-[#303039] text-[#EDEDF2] hover:bg-[#292932] text-xs cursor-pointer font-medium"
              >
                Retry Loading Diff
              </button>
            </div>
          ) : (
            <DiffViewer
              files={diffData?.files || []}
              rawDiff={diffData?.rawDiff}
            />
          )}
        </div>
      )}
    </Container>
  );
}

export default function PullRequestReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <Container className="py-16">
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#8B7CF6] mb-2" />
            <p className="text-xs text-[#858593] font-mono">Loading review...</p>
          </div>
        </Container>
      }
    >
      <PullRequestReviewContent params={params} />
    </Suspense>
  );
}
