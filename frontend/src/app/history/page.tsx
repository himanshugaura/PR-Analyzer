"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  History,
  GitPullRequest,
  Search,
} from "lucide-react";
import { useInstallations } from "../../hooks/use-installations";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { formatRelativeTime } from "../../lib/utils";
import type { ReviewStatus } from "../../types";

// ─── helpers ──────────────────────────────────────────────────────────────────

function reviewStatusVariant(status: ReviewStatus) {
  if (status === "COMPLETED") return "success";
  if (status === "FAILED") return "critical";
  return "warning"; // PENDING | RUNNING
}

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (target.getTime() === today.getTime()) return "Today";
  if (target.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function dateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── types ────────────────────────────────────────────────────────────────────

interface HistoryEntry {
  reviewId: string;
  reviewStatus: ReviewStatus;
  totalFindings: number;
  createdAt: string;
  prId: string;
  prNumber: number;
  prTitle: string;
  repoName: string;
}

// ─── skeletons ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-[#1E1E26] border border-[#303039] rounded-[8px] px-4 py-3 flex items-center gap-3">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 w-48 rounded" />
      <Skeleton className="h-5 w-20 rounded ml-auto" />
      <Skeleton className="h-5 w-16 rounded" />
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const { data: installations, isLoading } = useInstallations();
  const [search, setSearch] = useState("");

  // Flatten all repos → pull requests → reviews into a single list
  const allEntries = useMemo<HistoryEntry[]>(() => {
    if (!installations) return [];
    const entries: HistoryEntry[] = [];
    for (const inst of installations) {
      for (const repo of inst.repositories) {
        // The installations endpoint may not return PR/review data at this level
        // We only process what's available
        // (individual repo pages load PRs with reviews via separate queries)
      }
    }
    return entries;
  }, [installations]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allEntries;
    const q = search.toLowerCase();
    return allEntries.filter((e) => e.prTitle.toLowerCase().includes(q));
  }, [allEntries, search]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, HistoryEntry[]>();
    for (const entry of filtered) {
      const key = dateKey(entry.createdAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    // Sort descending by date key
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const hasInstallations = installations && installations.length > 0;
  const noData = !isLoading && allEntries.length === 0;

  return (
    <div className="min-h-screen bg-[#101014] p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[26px] font-semibold text-[#EDEDF2] tracking-tight">
          Analysis History
        </h1>
        <p className="mt-1 text-[14px] text-[#858593]">
          All past PR analysis runs
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#858593]" />
        <input
          type="text"
          placeholder="Filter by PR title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#1E1E26] border border-[#303039] rounded-[6px] pl-9 pr-3 h-9 text-[13px] text-[#EDEDF2] placeholder:text-[#858593] focus:border-[#8B7CF6] focus:outline-none transition-colors"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* No installations */}
      {!isLoading && !hasInstallations && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-[#1E1E26] border border-[#303039] rounded-[8px] p-10 max-w-md">
            <History className="h-10 w-10 text-[#858593] mx-auto mb-4" />
            <p className="text-[#EDEDF2] font-medium text-[15px] mb-1">No analyses yet</p>
            <p className="text-[#858593] text-[13px]">
              Connect a GitHub account and run your first PR analysis to see history here.
            </p>
          </div>
        </div>
      )}

      {/* Has installations but no review data surfaced at this level */}
      {!isLoading && hasInstallations && noData && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-[#1E1E26] border border-[#303039] rounded-[8px] p-10 max-w-lg">
            <History className="h-10 w-10 text-[#858593] mx-auto mb-4" />
            <p className="text-[#EDEDF2] font-medium text-[15px] mb-2">No analyses yet</p>
            <p className="text-[#858593] text-[13px]">
              Analysis history is available per repository. Visit a repository's pull requests
              and run an analysis to see it here.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {installations.flatMap((inst) =>
                inst.repositories.map((repo) => (
                  <Link
                    key={repo.id}
                    href={`/repositories/${repo.id}`}
                    className="text-[13px] text-[#8B7CF6] hover:underline"
                  >
                    {repo.fullName}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activity list */}
      {!isLoading && grouped.length > 0 && (
        <div className="space-y-6">
          {grouped.map(([key, entries]) => (
            <div key={key}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[12px] font-medium text-[#858593] whitespace-nowrap">
                  {formatDateHeader(entries[0].createdAt)}
                </span>
                <div className="flex-1 h-px bg-[#303039]" />
              </div>
              {/* Entry cards */}
              <div className="space-y-2">
                {entries.map((entry) => (
                  <div
                    key={entry.reviewId}
                    className="bg-[#1E1E26] border border-[#303039] rounded-[8px] px-4 py-3 flex flex-wrap items-center gap-3 hover:bg-[#292932] transition-colors"
                  >
                    <GitPullRequest className="h-4 w-4 text-[#858593] shrink-0" />
                    <Link
                      href={`/pull-requests/${entry.prId}`}
                      className="text-[13px] font-medium text-[#EDEDF2] hover:text-[#8B7CF6] transition-colors"
                    >
                      <span className="text-[#858593] mr-1">#{entry.prNumber}</span>
                      {entry.prTitle}
                    </Link>
                    {/* Repo chip */}
                    <span className="text-[11px] text-[#858593] border border-[#303039] rounded-[4px] px-1.5 py-0.5 bg-[#292932]">
                      {entry.repoName}
                    </span>
                    {/* Spacer */}
                    <div className="flex-1" />
                    {/* Status badge */}
                    <Badge variant={reviewStatusVariant(entry.reviewStatus)}>
                      {entry.reviewStatus}
                    </Badge>
                    {/* Findings */}
                    <Badge variant={entry.totalFindings > 0 ? "critical" : "outline"}>
                      {entry.totalFindings} finding{entry.totalFindings !== 1 ? "s" : ""}
                    </Badge>
                    {/* Time ago */}
                    <span className="text-[11px] text-[#858593] tabular-nums">
                      {formatRelativeTime(entry.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
