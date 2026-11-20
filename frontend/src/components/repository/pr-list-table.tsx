"use client";

import Link from "next/link";
import { GitPullRequest, ArrowRight, User, CheckCircle2, AlertTriangle, Clock, Sparkles } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { formatRelativeTime } from "../../lib/utils";
import { useTriggerReview } from "../../hooks/use-reviews";
import type { PullRequest } from "../../types";

export function PullRequestTable({
  pullRequests = [],
}: {
  pullRequests: PullRequest[];
}) {
  const triggerReviewMutation = useTriggerReview();
  if (pullRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[8px] border border-dashed border-[#303039] py-16 text-center bg-[#1E1E26]/40">
        <GitPullRequest className="h-8 w-8 text-[#858593] mb-3 stroke-[1.5]" />
        <p className="text-sm font-semibold text-[#EDEDF2]">No Pull Requests Found</p>
        <p className="text-xs text-[#858593] mt-1 max-w-sm">
          When developers open PRs in this repository, they will automatically sync and appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#303039] text-[#858593] font-mono uppercase tracking-wider text-[11px] bg-[#17171D]">
            <tr>
              <th className="py-2.5 px-4">Pull Request</th>
              <th className="py-2.5 px-4">State</th>
              <th className="py-2.5 px-4">Branches</th>
              <th className="py-2.5 px-4">AI Review</th>
              <th className="py-2.5 px-4">Updated</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#303039]/60">
            {pullRequests.map((pr) => {
              const latestReview = pr.reviews?.[0];
              const totalFindings = latestReview?.totalFindings ?? 0;
              const hasReview = Boolean(latestReview);
              const isCompleted = latestReview?.status === "COMPLETED";

              return (
                <tr
                  key={pr.id}
                  className="hover:bg-[#292932]/50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-[#EDEDF2] max-w-xs sm:max-w-md">
                    <Link
                      href={`/pull-requests/${pr.id}`}
                      className="hover:text-[#8B7CF6] transition-colors flex items-start gap-2"
                    >
                      <span className="font-mono text-[#858593] shrink-0 text-xs">
                        #{pr.number}
                      </span>
                      <span className="truncate text-xs font-semibold">{pr.title}</span>
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[#858593]">
                      {pr.authorLogin && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {pr.authorLogin}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        pr.state === "OPEN"
                          ? "open"
                          : pr.state === "MERGED"
                          ? "merged"
                          : "closed"
                      }
                      className="text-[10px]"
                    >
                      {pr.state}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-[#858593]">
                    <span className="text-[#8B7CF6]">{pr.headBranch}</span>
                    <span className="mx-1 text-[#303039]">→</span>
                    <span className="text-[#EDEDF2]">{pr.baseBranch}</span>
                  </td>

                  <td className="py-3 px-4">
                    {!hasReview ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          triggerReviewMutation.mutate({ pullRequestId: pr.id });
                        }}
                        disabled={
                          triggerReviewMutation.isPending &&
                          triggerReviewMutation.variables?.pullRequestId === pr.id
                        }
                        className="h-6 px-2.5 text-[11px] font-mono gap-1.5 border-[#8B7CF6]/40 text-[#8B7CF6] hover:bg-[#8B7CF6]/15 hover:text-[#A78BFA] transition-all cursor-pointer"
                      >
                        {triggerReviewMutation.isPending &&
                        triggerReviewMutation.variables?.pullRequestId === pr.id ? (
                          <>
                            <Clock className="h-3 w-3 animate-spin text-[#8B7CF6]" />
                            <span>Reviewing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 text-[#8B7CF6]" />
                            <span>Run Review</span>
                          </>
                        )}
                      </Button>
                    ) : isCompleted ? (
                      <div className="flex items-center gap-1.5">
                        {totalFindings === 0 ? (
                          <Badge variant="success" className="text-[10px] gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Clean</span>
                          </Badge>
                        ) : (
                          <Badge
                            variant={totalFindings > 3 ? "critical" : "warning"}
                            className="text-[10px] gap-1 font-mono"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            <span>{totalFindings} issues</span>
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Clock className="h-3 w-3 animate-spin" />
                        <span>Analyzing</span>
                      </Badge>
                    )}
                  </td>

                  <td className="py-3 px-4 text-[#858593] text-[11px] whitespace-nowrap">
                    {formatRelativeTime(pr.updatedAt)}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Link href={`/pull-requests/${pr.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-xs gap-1 border-[#303039] hover:bg-[#292932]"
                      >
                        <span>View</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
