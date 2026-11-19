"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  GitPullRequest,
  Search,
  Filter,
  ArrowRight,
  GitBranch,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Calendar,
  CheckCircle2,
  FolderGit2,
} from "lucide-react";
import { Container } from "../../components/layout/container";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { useInstallations } from "../../hooks/use-installations";
import { formatRelativeTime } from "../../lib/utils";
import type { PullRequest, PullRequestState } from "../../types";

const STATUS_TABS = ["ALL", "OPEN", "MERGED", "CLOSED"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

export default function PullRequestsPage() {
  const [activeTab, setActiveTab] = useState<StatusTab>("ALL");
  const [search, setSearch] = useState("");
  const [selectedRepoId, setSelectedRepoId] = useState<string>("ALL");

  const { data: installations = [], isLoading } = useInstallations();

  const allRepos = useMemo(
    () => installations.flatMap((inst) => inst.repositories || []),
    [installations]
  );

  // Filter pull requests across repositories
  const filteredRepos = useMemo(() => {
    if (selectedRepoId === "ALL") return allRepos;
    return allRepos.filter((r) => r.id === selectedRepoId);
  }, [allRepos, selectedRepoId]);

  return (
    <Container className="py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#303039]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#EDEDF2]">
              Pull Requests
            </h1>
            <Badge variant="outline" className="text-[11px] font-mono">
              {allRepos.length} Repos
            </Badge>
          </div>
          <p className="text-xs text-[#858593] mt-1">
            Browse and inspect AI review findings across all connected repositories.
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center bg-[#1E1E26] border border-[#303039] rounded-[6px] p-0.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-[4px] text-xs font-medium transition-colors cursor-pointer ${
                activeTab === tab
                  ? "bg-[#292932] text-[#EDEDF2]"
                  : "text-[#858593] hover:text-[#EDEDF2]"
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#858593]" />
          <Input
            placeholder="Search pull requests by title or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-xs bg-[#1E1E26] border-[#303039]"
          />
        </div>

        {/* Repository Filter Dropdown */}
        <div className="w-full sm:w-64">
          <select
            value={selectedRepoId}
            onChange={(e) => setSelectedRepoId(e.target.value)}
            className="w-full h-9 rounded-[6px] bg-[#1E1E26] border border-[#303039] px-3 text-xs text-[#EDEDF2] appearance-none cursor-pointer focus:border-[#8B7CF6] outline-none"
          >
            <option value="ALL">All Repositories ({allRepos.length})</option>
            {allRepos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r._count?.pullRequests ?? 0} PRs)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PR Table & Repos Overview */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-[#8B7CF6] mb-3" />
          <p className="text-xs text-[#858593] font-mono">Loading pull requests...</p>
        </div>
      ) : allRepos.length === 0 ? (
        <div className="rounded-[8px] border border-dashed border-[#303039] bg-[#1E1E26]/50 p-12 text-center">
          <GitPullRequest className="mx-auto h-8 w-8 text-[#858593] mb-3" />
          <h3 className="text-sm font-semibold text-[#EDEDF2] mb-1">
            No repositories connected
          </h3>
          <p className="text-xs text-[#858593] mb-4">
            Connect a GitHub repository to track and review pull requests.
          </p>
          <Link href="/repositories">
            <Button size="sm">Connect Repository</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#303039] flex items-center justify-between text-xs text-[#858593]">
              <span className="font-semibold text-[#EDEDF2] uppercase tracking-wider text-[11px]">
                Repository Pull Request Hub
              </span>
              <span>Showing {filteredRepos.length} repository queues</span>
            </div>

            <div className="divide-y divide-[#303039]/60">
              {filteredRepos.map((repo) => {
                const prCount = repo._count?.pullRequests ?? 0;
                return (
                  <div
                    key={repo.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#292932]/30 transition-colors"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <FolderGit2 className="h-4 w-4 text-[#8B7CF6]" />
                        <span className="text-sm font-semibold text-[#EDEDF2]">
                          {repo.name}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {repo.defaultBranch || "main"}
                        </Badge>
                        {repo.private && (
                          <Badge variant="secondary" className="text-[10px]">
                            Private
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#858593]">
                        <span>Owner: {repo.ownerLogin}</span>
                        <span>•</span>
                        <span className="font-mono">{prCount} pull requests</span>
                        <span>•</span>
                        <span>Updated {formatRelativeTime(repo.updatedAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Link href={`/repositories/${repo.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1.5 border-[#303039] hover:bg-[#292932]"
                        >
                          <GitPullRequest className="h-3.5 w-3.5" />
                          <span>View PR Queue ({prCount})</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
