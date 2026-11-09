"use client";

import Link from "next/link";
import { GitPullRequest, ArrowRight, User } from "lucide-react";
import { Badge } from "../ui/badge";
import { formatRelativeTime, formatSha } from "../../lib/utils";
import type { PullRequest } from "../../types";

export function PullRequestTable({ pullRequests = [] }: { pullRequests: PullRequest[] }) {
  if (pullRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/8 py-16 text-center">
        <GitPullRequest className="h-8 w-8 text-zinc-700 mb-3 stroke-[1.5]" />
        <p className="text-sm font-semibold text-zinc-500">No Pull Requests Found</p>
        <p className="text-xs text-zinc-700 mt-1 max-w-sm">
          When developers open PRs in this repository, they will automatically sync and appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/5 text-zinc-600 font-mono uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Pull Request</th>
              <th className="py-3 px-4">State</th>
              <th className="py-3 px-4">Branches</th>
              <th className="py-3 px-4">AI Review</th>
              <th className="py-3 px-4">Updated</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {pullRequests.map((pr) => {
              const latestReview = pr.reviews?.[0];
              return (
                <tr
                  key={pr.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3.5 px-4 font-medium text-zinc-200 max-w-xs sm:max-w-md">
                    <Link
                      href={`/pull-requests/${pr.id}`}
                      className="hover:text-amber-400 transition-colors flex items-start gap-2"
                    >
                      <span className="font-mono text-zinc-600 shrink-0">#{pr.number}</span>
                      <span className="truncate">{pr.title}</span>
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-600">
                      {pr.authorLogin && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {pr.authorLogin}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        pr.state === "OPEN" ? "open" : pr.state === "MERGED" ? "merged" : "closed"
                      }
                    >
                      {pr.state}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-600">
                    <div className="flex items-center gap-1">
                      <span className="truncate max-w-[80px]">{pr.headBranch}</span>
                      <span className="text-zinc-700">→</span>
                      <span className="truncate max-w-[80px]">{pr.baseBranch}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {latestReview ? (
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={
                            latestReview.status === "COMPLETED"
                              ? latestReview.totalFindings > 0 ? "high" : "outline"
                              : latestReview.status === "FAILED" ? "critical" : "secondary"
                          }
                        >
                          {latestReview.status}
                        </Badge>
                        {latestReview.status === "COMPLETED" && (
                          <span className="font-mono text-[11px] text-zinc-500">
                            {latestReview.totalFindings} issues
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-700 text-[11px] font-mono">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-zinc-600 text-[11px] font-mono">
                    {formatRelativeTime(pr.updatedAt)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/pull-requests/${pr.id}`}
                      className="inline-flex items-center gap-1 font-medium text-zinc-500 hover:text-amber-400 transition-colors"
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
