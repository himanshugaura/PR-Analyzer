"use client";

import Link from "next/link";
import { ArrowLeft, GitBranch, RefreshCw, Send } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
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

  return (
    <div className="space-y-4 mb-6">
      <Link
        href={pullRequest.repositoryId ? `/repositories/${pullRequest.repositoryId}` : "/"}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to {pullRequest.repository?.name || "Repository"}</span>
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs text-zinc-600">#{pullRequest.number}</span>
            <Badge
              variant={
                pullRequest.state === "OPEN" ? "open" : pullRequest.state === "MERGED" ? "merged" : "closed"
              }
            >
              {pullRequest.state}
            </Badge>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            {pullRequest.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-600">
            <span className="flex items-center gap-1 font-mono">
              <GitBranch className="h-3 w-3" />
              {pullRequest.headBranch} → {pullRequest.baseBranch}
            </span>
            {pullRequest.authorLogin && (
              <span className="font-mono">{pullRequest.authorLogin}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerReviewMutation.mutate({ pullRequestId: pullRequest.id, forceReReview: true })}
            isLoading={triggerReviewMutation.isPending}
            className="gap-1.5 text-xs h-8"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Trigger Review</span>
          </Button>

          {latestReview && (
            <Button
              size="sm"
              onClick={() => postCommentsMutation.mutate(latestReview.id)}
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
