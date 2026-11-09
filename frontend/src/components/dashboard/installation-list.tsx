"use client";

import { Box, Building2, User, ExternalLink, Plus } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { RepositoryCard } from "./repository-card";
import { useUiStore } from "../../store/use-ui-store";
import type { GitHubInstallation } from "../../types";

const GITHUB_APP_INSTALL_URL =
  process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL ||
  "https://github.com/apps/pr-analyzer-ai/installations/new";

export function InstallationList({
  installations = [],
}: {
  installations: GitHubInstallation[];
}) {
  const setLinkModalOpen = useUiStore((s) => s.setLinkModalOpen);

  if (installations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-8 sm:p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 mb-4">
          <Box className="h-6 w-6 text-zinc-400 stroke-[1.5]" />
        </div>
        <h3 className="text-base font-semibold tracking-tight text-zinc-100">
          No GitHub App Installations Found
        </h3>
        <p className="mt-1.5 text-xs text-zinc-400 max-w-md">
          Install the PR Analyzer GitHub App on your account or organization. Once installed, your authorized repositories will automatically appear here.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <a
            href={GITHUB_APP_INSTALL_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="gap-2 text-xs h-9 px-5">
              <span>Install GitHub App</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLinkModalOpen(true)}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            <span>Or enter ID manually</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {installations.map((installation) => {
        const isOrg = installation.accountType === "ORGANIZATION";
        const repos = installation.repositories || [];

        return (
          <div key={installation.id} className="space-y-4">
            {/* Installation Account Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
                  {isOrg ? (
                    <Building2 className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                    Installation #{installation.installationId}
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {installation.accountType}
                    </Badge>
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 font-mono">
                  {repos.length} {repos.length === 1 ? "repository" : "repositories"} authorized
                </span>

                <a
                  href={GITHUB_APP_INSTALL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-zinc-400 hover:text-zinc-100 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Configure Repos</span>
                </a>
              </div>
            </div>

            {/* Repositories Grid */}
            {repos.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {repos.map((repo) => (
                  <RepositoryCard key={repo.id} repository={repo} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic py-2">
                No repositories authorized yet for this installation.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
