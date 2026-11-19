"use client";

import { use, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  GitBranch,
  Lock,
  Globe,
  Search,
  ChevronLeft,
  ChevronRight,
  GitPullRequest,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { RepoSettingsCard } from "../../../components/repository/repo-settings-card";
import { PullRequestTable } from "../../../components/repository/pr-list-table";
import { useInstallations } from "../../../hooks/use-installations";
import { useRepositoryPullRequests } from "../../../hooks/use-pull-requests";
import type { PullRequestState } from "../../../types";

const TABS = ["Pull Requests", "Settings"] as const;
type Tab = (typeof TABS)[number];

const STATE_FILTERS = ["ALL", "OPEN", "CLOSED", "MERGED"] as const;
type StateFilter = (typeof STATE_FILTERS)[number];

function RepositoryContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const repositoryId = resolvedParams.id;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("Pull Requests");
  const [stateFilter, setStateFilter] = useState<StateFilter>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: installations = [], isLoading: isLoadingInst } = useInstallations();

  const repository = installations
    .flatMap((inst) => inst.repositories || [])
    .find((r) => r.id === repositoryId);

  const { data: prData, isLoading: isLoadingPrs } = useRepositoryPullRequests(
    repositoryId,
    {
      state: stateFilter === "ALL" ? undefined : (stateFilter as PullRequestState),
      page,
      limit: 20,
      search: search || undefined,
    }
  );

  if (isLoadingInst) {
    return (
      <div className="min-h-screen bg-[#101014] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#8B7CF6]" />
          <p className="text-[13px] text-[#858593]">Loading repository...</p>
        </div>
      </div>
    );
  }

  if (!repository) {
    return (
      <div className="min-h-screen bg-[#101014] p-8">
        <div className="bg-[#1E1E26] border border-[#303039] rounded-[8px] p-10 text-center">
          <p className="text-[#858593] text-sm">
            Repository not found or you do not have permission to view it.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/repositories")}
          >
            Back to Repositories
          </Button>
        </div>
      </div>
    );
  }

  const pullRequests = prData?.pullRequests || [];
  const pagination = prData?.pagination;

  return (
    <div className="min-h-screen bg-[#101014] p-6 md:p-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.push("/repositories")}
        className="inline-flex items-center gap-1.5 text-[13px] text-[#858593] hover:text-[#EDEDF2] transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Repositories
      </button>

      {/* Repo Header */}
      <div className="mb-6 pb-6 border-b border-[#303039]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[13px] text-[#858593] font-mono">{repository.ownerLogin} /</span>
              <h1 className="text-[22px] font-semibold text-[#EDEDF2] tracking-tight">
                {repository.name}
              </h1>
              {repository.private ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#292932] border border-[#303039] rounded-[6px] text-[11px] text-[#858593]">
                  <Lock className="h-3 w-3" />
                  Private
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#292932] border border-[#303039] rounded-[6px] text-[11px] text-[#858593]">
                  <Globe className="h-3 w-3" />
                  Public
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              {repository.defaultBranch && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#292932] border border-[#303039] rounded-[6px] text-[12px] text-[#858593] font-mono">
                  <GitBranch className="h-3 w-3" />
                  {repository.defaultBranch}
                </span>
              )}
              <span className="text-[12px] text-[#858593]">
                {repository._count?.pullRequests ?? 0} pull requests
              </span>
            </div>
          </div>
          <Badge variant={repository.enabled ? "success" : "secondary"}>
            {repository.enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#303039]">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "text-[#EDEDF2] border-[#8B7CF6]"
                : "text-[#858593] border-transparent hover:text-[#EDEDF2]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Pull Requests Tab */}
      {activeTab === "Pull Requests" && (
        <div className="space-y-4">
          {/* Filters row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* State filter */}
            <div className="flex items-center gap-0.5 bg-[#1E1E26] border border-[#303039] rounded-[6px] p-0.5">
              {STATE_FILTERS.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => { setStateFilter(st); setPage(1); }}
                  className={`px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-colors ${
                    stateFilter === st
                      ? "bg-[#292932] text-[#EDEDF2]"
                      : "text-[#858593] hover:text-[#EDEDF2]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#858593]" />
              <Input
                placeholder="Search pull requests..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 h-9"
              />
            </div>
          </div>

          {/* PR Table */}
          {isLoadingPrs ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-5 w-5 animate-spin text-[#8B7CF6]" />
            </div>
          ) : pullRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-[#1E1E26] border border-[#303039] rounded-[8px]">
              <GitPullRequest className="h-8 w-8 text-[#303039]" />
              <p className="text-sm font-medium text-[#858593]">No Pull Requests Found</p>
              <p className="text-[13px] text-[#858593]/60 max-w-sm text-center">
                When developers open PRs in this repository, they will automatically sync and appear here.
              </p>
            </div>
          ) : (
            <PullRequestTable pullRequests={pullRequests} />
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-[12px] text-[#858593]">
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "Settings" && (
        <RepoSettingsCard repository={repository} />
      )}
    </div>
  );
}

export default function RepositoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#101014] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-[#8B7CF6]" />
            <p className="text-[13px] text-[#858593]">Loading repository...</p>
          </div>
        </div>
      }
    >
      <RepositoryContent params={params} />
    </Suspense>
  );
}