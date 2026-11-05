"use client";

import Link from "next/link";
import { GitPullRequest, ArrowRight, User } from "lucide-react";
import { Badge } from "../ui/badge";
import { formatRelativeTime, formatSha } from "../../lib/utils";
import type { PullRequest } from "../../types";

export function PullRequestTable({
  pullRequests = [],
}: {
  pullRequests: PullRequest[];
}) {
  if (pullRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-12 text-center dark:border-zinc-800">
        <GitPullRequest className="h-8 w-8 text-zinc-400 mb-2 stroke-[1.5]" />
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          No Pull Requests Found
        </p>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm">
          When developers open PRs in this repository, they will automatically sync and appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-medium">
            <tr>
              <th className="py-3 px-4">Pull Request</th>
              <th className="py-3 px-4">State</th>
              <th className="py-3 px-4">Branches</th>
              <th className="py-3 px-4">AI Review Status</th>
              <th className="py-3 px-4">Last Updated</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950 font-normal">
            {pullRequests.map((pr) => {
              const latestReview = pr.reviews?.[0];

              return (
                <tr
                  key={pr.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  {/* PR Title & Number */}
                  <td className="py-3.5 px-4 font-medium text-zinc-950 dark:text-zinc-100 max-w-xs sm:max-w-md">
                    <Link
                      href={`/pull-requests/${pr.id}`}
                      className="hover:underline flex items-start gap-2"
                    >
                      <span className="font-mono text-zinc-400 shrink-0">
                        #{pr.number}
                      </span>
                      <span className="truncate">{pr.title}</span>
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                      {pr.authorLogin && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {pr.authorLogin}
                        </span>
                      )}
                      <span className="font-mono">SHA {formatSha(pr.headSha)}</span>
                    </div>
                  </td>

                  {/* State */}
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        pr.state === "OPEN"
                          ? "open"
                          : pr.state === "MERGED"
                          ? "merged"
                          : "closed"
                      }
                      className="font-mono text-[10px]"
                    >
                      {pr.state}
                    </Badge>
                  </td>

                  {/* Branches */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-[100px]">{pr.headBranch}</span>
                      <span className="text-zinc-400">→</span>
                      <span className="truncate max-w-[100px]">{pr.baseBranch}</span>
                    </div>
                  </td>

                  {/* Latest Review Status */}
                  <td className="py-3.5 px-4">
                    {latestReview ? (
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={
                            latestReview.status === "COMPLETED"
                              ? latestReview.totalFindings > 0
                                ? "high"
                                : "outline"
                              : latestReview.status === "FAILED"
                              ? "critical"
                              : "secondary"
                          }
                          className="font-mono text-[10px]"
                        >
                          {latestReview.status}
                        </Badge>
                        {latestReview.status === "COMPLETED" && (
                          <span className="font-mono text-[11px] text-zinc-500">
                            {latestReview.totalFindings} {latestReview.totalFindings === 1 ? "finding" : "findings"}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-400 text-[11px]">No review yet</span>
                    )}
                  </td>

                  {/* Updated Time */}
                  <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                    {formatRelativeTime(pr.updatedAt)}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/pull-requests/${pr.id}`}
                      className="inline-flex items-center gap-1 font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="h-3 w-3" />
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
