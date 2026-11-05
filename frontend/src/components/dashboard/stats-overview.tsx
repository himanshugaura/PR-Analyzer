import { GitPullRequest, GitFork, Shield, Box } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import type { GitHubInstallation } from "../../types";

export function StatsOverview({
  installations = [],
}: {
  installations: GitHubInstallation[];
}) {
  const totalInstallations = installations.length;
  const totalRepositories = installations.reduce(
    (acc, inst) => acc + (inst.repositories?.length || 0),
    0,
  );
  const activeAiRepos = installations.reduce(
    (acc, inst) =>
      acc +
      (inst.repositories?.filter((r) => r.settings?.aiReviewEnabled && r.enabled)
        .length || 0),
    0,
  );
  const totalPrs = installations.reduce(
    (acc, inst) =>
      acc +
      (inst.repositories?.reduce(
        (repoAcc, r) => repoAcc + (r._count?.pullRequests || 0),
        0,
      ) || 0),
    0,
  );

  const stats = [
    {
      title: "GitHub Installations",
      value: totalInstallations,
      icon: Box,
      description: "Connected GitHub accounts",
    },
    {
      title: "Repositories",
      value: totalRepositories,
      icon: GitFork,
      description: "Monitored codebases",
    },
    {
      title: "AI Review Active",
      value: activeAiRepos,
      icon: Shield,
      description: "Automated analysis enabled",
    },
    {
      title: "Pull Requests",
      value: totalPrs,
      icon: GitPullRequest,
      description: "PRs synced and evaluated",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-8">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title} className="bg-zinc-50/50 dark:bg-zinc-900/40">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {item.title}
                </span>
                <Icon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-mono">
                  {item.value}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                {item.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
