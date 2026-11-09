import { GitPullRequest, ExternalLink } from "lucide-react";
import { RepositoryCard } from "./repository-card";
import type { GitHubInstallation } from "../../types";

const GITHUB_APP_INSTALL_URL =
  process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL ||
  "https://github.com/apps/pr-analyzer-ai/installations/new";

export function InstallationList({ installations }: { installations: GitHubInstallation[] }) {
  if (installations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/8 p-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/5">
          <GitPullRequest className="h-6 w-6 text-amber-500/60" />
        </div>
        <p className="text-sm font-semibold text-zinc-400 mb-1">No GitHub App Installations Found</p>
        <p className="text-xs text-zinc-600 mb-6 max-w-xs mx-auto">
          Install the PR Analyzer GitHub App on your account or organization.
          Once installed, your authorized repositories will automatically appear here.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={GITHUB_APP_INSTALL_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-amber-500 text-black text-xs font-semibold hover:bg-amber-400 transition-colors"
            >
              Install GitHub App
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </a>
        </div>
      </div>
    );
  }

  const allRepos = installations.flatMap((inst) =>
    (inst.repositories || []).map((repo) => ({ ...repo }))
  );

  if (allRepos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/8 p-12 text-center text-xs text-zinc-600">
        No repositories found in connected installations.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {allRepos.map((repo) => (
        <RepositoryCard key={repo.id} repository={repo} />
      ))}
    </div>
  );
}
