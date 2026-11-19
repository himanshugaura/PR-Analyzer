"use client";

import Link from "next/link";
import { ArrowLeft, GitBranch, ArrowRight, User, Calendar } from "lucide-react";
import { usePostReviewComments } from "../../hooks/use-reviews";
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
  const postCommentsMutation = usePostReviewComments();

  const stateBadgeClass = STATE_BADGE[pullRequest.state] ?? STATE_BADGE.CLOSED;

  return (
    <div className="space-y-3 mb-6">
      {/* Back link */}
      <Link
        href={pullRequest.repositoryId ? `/repositories/${pullRequest.repositoryId}` : "/repositories"}
        className="inline-flex items-center gap-1.5 text-xs text-[#858593] hover:text-[#8B7CF6] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>← Pull Requests</span>
      </Link>

      {/* Main header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#303039]">
        <div className="flex-1 min-w-0">
          {/* PR number + state badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs text-[#858593] bg-[#292932] border border-[#303039] rounded-[4px] px-1.5 py-0.5">
              #{pullRequest.number}
            </span>
            <span className={`text-[11px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[4px] ${stateBadgeClass}`}>
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
            {pullRequest.repository && (
              <span className="text-[#858593] font-mono">{pullRequest.repository.fullName ?? pullRequest.repository.name}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
