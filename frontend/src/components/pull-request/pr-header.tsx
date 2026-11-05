"use client";

import Link from "next/link";
import {
  ArrowLeft,
  GitBranch,
  RefreshCw,
  Send,
  User,
  Clock,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { formatSha, formatDate } from "../../lib/utils";
import { useTriggerReview, usePostReviewComments } from "../../hooks/use-reviews";
import type { PullRequest, Review } from "../../types";

export function PullRequestHeader({
  pullRequest,
  latestReview,
}: {
  pullRequest: PullRequest;
  latestReview?: Review;
}) {
  const triggerReviewMutation = useTriggerReview();
  const postCommentsMutation = usePostReviewComments();

  const handleTriggerReview = () => {
    triggerReviewMutation.mutate({
      pullRequestId: pullRequest.id,
      forceReReview: true,
    });
  };

  const handlePostComments = () => {
    if (latestReview) {
      postCommentsMutation.mutate(latestReview.id);
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Back button */}
      <Link
        href={
          pullRequest.repositoryId
            ? `/repositories/${pullRequest.repositoryId}`
            : "/"
        }
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>
          Back to {pullRequest.repository?.name || "Repository"}
        </span>
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              #{pullRequest.number}
            </span>
            <Badge
              variant={
                pullRequest.state === "OPEN"
                  ? "open"
                  : pullRequest.state === "MERGED"
                  ? "merged"
                  : "closed"
              }
              className="font-mono text-[10px]"
            >
              {pullRequest.state}
            </Badge>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            {pullRequest.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {pullRequest.authorLogin && (
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {pullRequest.authorLogin}
              </span>
            )}
            <span className="flex items-center gap-1 font-mono">
              <GitBranch className="h-3.5 w-3.5" />
              {pullRequest.headBranch} → {pullRequest.baseBranch}
            </span>
            <span className="font-mono">
              Commit {formatSha(pullRequest.headSha)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Synced {formatDate(pullRequest.syncedAt)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerReview}
            isLoading={triggerReviewMutation.isPending}
            className="gap-1.5 text-xs h-8"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Trigger AI Review</span>
          </Button>

          {latestReview && (
            <Button
              size="sm"
              onClick={handlePostComments}
              isLoading={postCommentsMutation.isPending}
              disabled={latestReview.status !== "COMPLETED"}
              className="gap-1.5 text-xs h-8"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Post to GitHub</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
