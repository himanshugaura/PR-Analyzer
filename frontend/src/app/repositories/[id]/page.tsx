"use client";

import { use, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Container } from "../../../components/layout/container";
import { RepoHeader } from "../../../components/repository/repo-header";
import { RepoSettingsCard } from "../../../components/repository/repo-settings-card";
import { PullRequestTable } from "../../../components/repository/pr-list-table";
import { useInstallations } from "../../../hooks/use-installations";
import { useRepositoryPullRequests } from "../../../hooks/use-pull-requests";
import type { PullRequestState } from "../../../types";

function RepositoryContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const repositoryId = resolvedParams.id;

  const [selectedState, setSelectedState] = useState<PullRequestState | "ALL">("ALL");

  // Fetch all installations to find this repo
  const { data: installations = [], isLoading: isLoadingInst } = useInstallations();

  // Find repository from installations
  const repository = installations
    .flatMap((inst) => inst.repositories || [])
    .find((r) => r.id === repositoryId);

  // Fetch pull requests for this repository
  const { data: prData, isLoading: isLoadingPrs } = useRepositoryPullRequests(
    repositoryId,
    {
      state: selectedState,
    },
  );

  if (isLoadingInst) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500 mb-2" />
          <p className="text-xs text-zinc-400 font-mono">Loading repository...</p>
        </div>
      </Container>
    );
  }

  if (!repository) {
    return (
      <Container>
        <div className="rounded-lg border border-zinc-800 p-8 text-center text-xs text-zinc-400">
          Repository not found or you do not have permission to view it.
        </div>
      </Container>
    );
  }

  const pullRequests = prData?.pullRequests || [];

  return (
    <Container>
      {/* Repository Header */}
      <RepoHeader repository={repository} />

      {/* Review Settings Config */}
      <RepoSettingsCard repository={repository} />

      {/* Pull Requests List */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold tracking-tight text-zinc-100">
            Pull Requests ({prData?.pagination.total ?? pullRequests.length})
          </h2>

          {/* State Filter Buttons */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-xs">
            {(["ALL", "OPEN", "MERGED", "CLOSED"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedState(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                  selectedState === st
                    ? "bg-zinc-800 text-zinc-100 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {isLoadingPrs ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
          </div>
        ) : (
          <PullRequestTable pullRequests={pullRequests} />
        )}
      </div>
    </Container>
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
        <Container>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500 mb-2" />
            <p className="text-xs text-zinc-400 font-mono">Loading repository...</p>
          </div>
        </Container>
      }
    >
      <RepositoryContent params={params} />
    </Suspense>
  );
}
