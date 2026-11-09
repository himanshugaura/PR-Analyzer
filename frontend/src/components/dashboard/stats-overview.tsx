import { GitPullRequest, GitFork, Shield, Boxes } from "lucide-react";
import type { GitHubInstallation } from "../../types";

export function StatsOverview({ installations = [] }: { installations: GitHubInstallation[] }) {
  const totalInstallations = installations.length;
  const totalRepositories = installations.reduce((acc, inst) => acc + (inst.repositories?.length || 0), 0);
  const activeAiRepos = installations.reduce(
    (acc, inst) => acc + (inst.repositories?.filter((r) => r.settings?.aiReviewEnabled && r.enabled).length || 0),
    0
  );
  const totalPrs = installations.reduce(
    (acc, inst) => acc + (inst.repositories?.reduce((repoAcc, r) => repoAcc + (r._count?.pullRequests || 0), 0) || 0),
    0
  );

  const stats = [
    { title: "Installations", value: totalInstallations, icon: Boxes },
    { title: "Repositories", value: totalRepositories, icon: GitFork },
    { title: "AI Review Active", value: activeAiRepos, icon: Shield },
    { title: "Pull Requests", value: totalPrs, icon: GitPullRequest },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-8">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className="rounded-xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                {item.title}
              </span>
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <span className="text-3xl font-bold font-mono text-zinc-100">
              {item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
