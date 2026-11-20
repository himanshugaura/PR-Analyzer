"use client";

import Link from "next/link";
import {
  ArrowLeft,
  GitBranch,
  ArrowRight,
  User,
  Calendar,
  Sparkles,
  RefreshCw,
  Send,
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { usePostReviewComments, useTriggerReview } from "../../hooks/use-reviews";
import type { PullRequest, Review } from "../../types";
import { formatDate } from "../../lib/utils";

const STATE_BADGE: Record<string, string> = {
  OPEN: "bg-[#8B7CF6]/15 text-[#8B7CF6] border border-[#8B7CF6]/25",
  CLOSED: "bg-[#858593]/15 text-[#858593] border border-[#858593]/25",
  MERGED: "bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/25",
};

export function PullRequestHeader({
  pullRequest,
  latestReview,
}: {
  pullRequest: PullRequest;
  latestReview?: Review;
}) {
  const triggerReviewMutation = useTriggerReview();
  const postCommentsMutation = usePostReviewComments();

  const isCompleted = latestReview?.status === "COMPLETED";
  const hasPostedComments = Boolean(
    latestReview?.findings?.some((f) => f.commentStatus === "POSTED")
  );

  const stateBadgeClass = STATE_BADGE[pullRequest.state] ?? STATE_BADGE.CLOSED;
  const repoFullName = pullRequest.repository?.fullName ?? pullRequest.repository?.name;
  const githubPrUrl = repoFullName
    ? `https://github.com/${repoFullName}/pull/${pullRequest.number}`
    : null;

  return (
    <div className="space-y-4 mb-6">
      {/* Back link */}
      <Link
        href={pullRequest.repositoryId ? `/repositories/${pullRequest.repositoryId}` : "/repositories"}
        className="inline-flex items-center gap-1.5 text-xs text-[#858593] hover:text-[#8B7CF6] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>← Pull Requests</span>
      </Link>

      {/* Main header row */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#303039]">
        <div className="flex-1 min-w-[280px]">
          {/* PR number + state badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs text-[#858593] bg-[#292932] border border-[#303039] rounded-[4px] px-1.5 py-0.5">
              #{pullRequest.number}
            </span>
            <span
              className={`text-[11px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[4px] ${stateBadgeClass}`}
            >
              {pullRequest.state}
            </span>
          </div>

          {/* PR title */}
          <h1 className="text-[22px] font-bold tracking-tight text-[#EDEDF2] leading-tight mb-3">
            {pullRequest.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#858593]">
            {pullRequest.authorLogin && (
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span className="font-mono">{pullRequest.authorLogin}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5 font-mono">
              <GitBranch className="h-3.5 w-3.5" />
              <span className="text-[#EDEDF2]">{pullRequest.baseBranch}</span>
              <ArrowRight className="h-3 w-3 text-[#858593]" />
              <span className="text-[#EDEDF2]">{pullRequest.headBranch}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(pullRequest.createdAt)}</span>
            </span>
            {repoFullName && (
              <span className="text-[#858593] font-mono">{repoFullName}</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. Run / Re-run AI Review button */}
          {!isCompleted ? (
            <Button
              size="sm"
              onClick={() =>
                triggerReviewMutation.mutate({
                  pullRequestId: pullRequest.id,
                  forceReReview: false,
                })
              }
              disabled={triggerReviewMutation.isPending}
              className="h-8 px-3 text-xs gap-1.5 bg-[#8B7CF6] hover:bg-[#7C3AED] text-white font-medium border-0 shadow-sm cursor-pointer"
            >
              {triggerReviewMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Analyzing PR...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Run AI Review</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                triggerReviewMutation.mutate({
                  pullRequestId: pullRequest.id,
                  forceReReview: true,
                })
              }
              disabled={triggerReviewMutation.isPending}
              className="h-8 px-3 text-xs gap-1.5 border-[#303039] hover:bg-[#292932] text-[#EDEDF2] cursor-pointer"
            >
              {triggerReviewMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#8B7CF6]" />
                  <span>Re-running...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5 text-[#858593]" />
                  <span>Re-run Review</span>
                </>
              )}
            </Button>
          )}

          {/* 2. Post to GitHub button (available when review completed) */}
          {latestReview && isCompleted && (
            <Button
              size="sm"
              onClick={() => postCommentsMutation.mutate(latestReview.id)}
              disabled={postCommentsMutation.isPending}
              className={`h-8 px-3 text-xs gap-1.5 font-medium transition-all cursor-pointer ${
                postCommentsMutation.isSuccess || hasPostedComments
                  ? "bg-[#34D399]/20 hover:bg-[#34D399]/30 text-[#34D399] border border-[#34D399]/40"
                  : "bg-amber-500 hover:bg-amber-400 text-black font-semibold border border-amber-500/50"
              }`}
            >
              {postCommentsMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Posting to GitHub...</span>
                </>
              ) : postCommentsMutation.isSuccess || hasPostedComments ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399]" />
                  <span>Posted to GitHub ✓</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Post to GitHub</span>
                </>
              )}
            </Button>
          )}

          {/* 3. Link to GitHub PR */}
          {githubPrUrl && (
            <a
              href={githubPrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs text-[#858593] hover:text-[#EDEDF2] bg-[#1E1E26] hover:bg-[#292932] border border-[#303039] rounded-md transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Action feedback banners */}
      {postCommentsMutation.isSuccess && (
        <div className="flex items-center gap-2 p-2.5 rounded-[6px] bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399] text-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>
            {postCommentsMutation.data?.reviewCommentCount !== undefined &&
            postCommentsMutation.data.reviewCommentCount > 0
              ? `Successfully posted ${postCommentsMutation.data.reviewCommentCount} review comments to GitHub PR #${pullRequest.number}!`
              : `Review summary successfully posted to GitHub PR #${pullRequest.number}!`}
          </span>
        </div>
      )}

      {postCommentsMutation.isError && (
        <div className="flex items-center gap-2 p-2.5 rounded-[6px] bg-[#F87171]/10 border border-[#F87171]/30 text-[#F87171] text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            Failed to post comments to GitHub:{" "}
            {postCommentsMutation.error instanceof Error
              ? postCommentsMutation.error.message
              : "Unknown error"}
          </span>
        </div>
      )}

      {triggerReviewMutation.isError && (
        <div className="flex items-center gap-2 p-2.5 rounded-[6px] bg-[#F87171]/10 border border-[#F87171]/30 text-[#F87171] text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            Failed to start AI review:{" "}
            {triggerReviewMutation.error instanceof Error
              ? triggerReviewMutation.error.message
              : "Unknown error"}
          </span>
        </div>
      )}
    </div>
  );
}
