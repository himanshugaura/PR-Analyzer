"use client";

import { use, Suspense } from "react";
import { Loader2, Bug, FileText } from "lucide-react";
import { Container } from "../../../components/layout/container";
import { PullRequestHeader } from "../../../components/pull-request/pr-header";
import { ReviewMetricsBar } from "../../../components/pull-request/review-metrics-bar";
import { FindingsFilterBar } from "../../../components/pull-request/findings-filter-bar";
import { FindingCard } from "../../../components/pull-request/finding-card";
import { DiffViewer } from "../../../components/pull-request/diff-viewer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs";
import { usePullRequest, usePullRequestDiff } from "../../../hooks/use-pull-requests";
import { useReview } from "../../../hooks/use-reviews";
import { useUiStore } from "../../../store/use-ui-store";

function PullRequestReviewContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const prId = resolvedParams.id;

  const activeTab = useUiStore((s) => s.activeTab);
  const setActiveTab = useUiStore((s) => s.setActiveTab);

  const severityFilter = useUiStore((s) => s.severityFilter);
  const categoryFilter = useUiStore((s) => s.categoryFilter);
  const statusFilter = useUiStore((s) => s.statusFilter);

  // 1. Fetch Pull Request details
  const { data: pullRequest, isLoading: isLoadingPr, error: prError } = usePullRequest(prId);

  // Get the most recent review ID
  const latestReviewSummary = pullRequest?.reviews?.[0];
  const reviewId = latestReviewSummary?.id;

  // 2. Fetch full Review details & findings with filters
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

  if (isLoadingPr) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500 mb-2" />
          <p className="text-xs text-zinc-600 font-mono">Loading pull request...</p>
        </div>
      </Container>
    );
  }

  if (prError || !pullRequest) {
    return (
      <Container>
        <div className="rounded-lg border border-white/5 p-8 text-center text-xs text-zinc-500">
          Pull request not found or not accessible.
        </div>
      </Container>
    );
  }

  const review = reviewData?.review;
  const metrics = reviewData?.metrics;
  const findings = review?.findings || [];

  return (
    <Container>
      {/* Header with status & action buttons */}
      <PullRequestHeader
        pullRequest={pullRequest}
        latestReview={review}
      />

      {/* AI Review Summary / Metrics bar */}
      <ReviewMetricsBar review={review} metrics={metrics} />

      {/* Main Tabs: Findings vs Diff */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "findings" | "diff")}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="findings" className="gap-1.5">
              <Bug className="h-3.5 w-3.5" />
              <span>AI Findings ({metrics?.totalFindings ?? 0})</span>
            </TabsTrigger>
            <TabsTrigger value="diff" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span>Diff &amp; Files ({diffData?.files?.length ?? 0})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Findings */}
        <TabsContent value="findings">
          {isLoadingReview ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            </div>
          ) : !review ? (
            <div className="rounded-xl border border-white/5 p-8 text-center text-xs text-zinc-500">
              No review findings available. Trigger a review using the button above.
            </div>
          ) : (
            <div>
              <FindingsFilterBar totalCount={findings.length} />

              {findings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/8 p-12 text-center text-xs text-zinc-600">
                  No findings matching the selected filters.
                </div>
              ) : (
                <div className="space-y-4">
                  {findings.map((finding) => (
                    <FindingCard key={finding.id} finding={finding} />
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Raw Diff & Files */}
        <TabsContent value="diff">
          {isLoadingDiff ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            </div>
          ) : diffError ? (
            <div className="rounded-xl border border-red-900/30 bg-red-950/10 p-8 text-center text-xs text-red-400 space-y-3">
              <p>Failed to load diff files from GitHub: {(diffError as Error)?.message || "Bad Gateway"}</p>
              <button
                type="button"
                onClick={() => refetchDiff()}
                className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-zinc-200 hover:bg-white/10 text-xs cursor-pointer font-medium"
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
        </TabsContent>
      </Tabs>
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
        <Container>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500 mb-2" />
            <p className="text-xs text-zinc-600 font-mono">Loading review...</p>
          </div>
        </Container>
      }
    >
      <PullRequestReviewContent params={params} />
    </Suspense>
  );
}
