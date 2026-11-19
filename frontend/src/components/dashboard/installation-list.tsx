"use client";

import { Building2, Plus } from "lucide-react";
import { RepositoryCard } from "./repository-card";
import { Button } from "../ui/button";
import type { GitHubInstallation } from "../../types";

const GITHUB_APP_INSTALL_URL =
  process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL ||
  "https://github.com/apps/revue-de-pr/installations/new";

export function InstallationList({
  installations = [],
}: {
  installations: GitHubInstallation[];
}) {
  const allRepos = installations.flatMap((inst) => inst.repositories || []);

  if (allRepos.length === 0) {
    return (
      <div className="rounded-[8px] border border-dashed border-[#303039] bg-[#1E1E26]/50 p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#8B7CF6]/10 text-[#8B7CF6] mb-4">
          <Building2 className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-[#EDEDF2] mb-1">
          No repositories connected
        </h3>
        <p className="text-xs text-[#858593] max-w-sm mx-auto mb-6">
          Install the PR Analyzer GitHub App to connect your repositories and begin receiving automated AI code reviews.
        </p>
        <a
          href={GITHUB_APP_INSTALL_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="sm" className="gap-2">
            <Plus className="h-3.5 w-3.5" />
            <span>Install GitHub App</span>
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {allRepos.map((repo) => (
        <RepositoryCard key={repo.id} repository={repo} />
      ))}
    </div>
  );
}
