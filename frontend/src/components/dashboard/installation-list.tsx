import { Box, Building2, User } from "lucide-react";
import { Badge } from "../ui/badge";
import { RepositoryCard } from "./repository-card";
import type { GitHubInstallation } from "../../types";

export function InstallationList({
  installations = [],
}: {
  installations: GitHubInstallation[];
}) {
  if (installations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-800">
        <Box className="h-10 w-10 text-zinc-400 mb-3 stroke-[1.5]" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          No GitHub Installations Connected
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
          Connect your GitHub App installation using your Installation ID to start analyzing pull requests.
        </p>
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

              <span className="text-xs text-zinc-400 font-mono">
                {repos.length} {repos.length === 1 ? "repository" : "repositories"} authorized
              </span>
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
