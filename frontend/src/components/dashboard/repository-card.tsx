"use client";

import Link from "next/link";
import { GitPullRequest, Lock, Globe, ArrowRight, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Switch } from "../ui/switch";
import { useUpdateRepositorySettings } from "../../hooks/use-installations";
import type { Repository } from "../../types";

export function RepositoryCard({ repository }: { repository: Repository }) {
  const updateSettings = useUpdateRepositorySettings();
  const isAiActive = Boolean(repository.settings?.aiReviewEnabled && repository.enabled);

  const handleToggleAi = (checked: boolean) => {
    updateSettings.mutate({
      repositoryId: repository.id,
      aiReviewEnabled: checked,
      enabled: checked,
    });
  };

  return (
    <Card className="group transition-all hover:border-zinc-400 dark:hover:border-zinc-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              {repository.private ? (
                <Lock className="h-3 w-3 text-zinc-400 shrink-0" />
              ) : (
                <Globe className="h-3 w-3 text-zinc-400 shrink-0" />
              )}
              <span className="text-[11px] text-zinc-400 font-mono truncate">
                {repository.ownerLogin}
              </span>
            </div>
            <CardTitle className="text-sm font-semibold truncate hover:text-zinc-600 dark:hover:text-zinc-300">
              <Link href={`/repositories/${repository.id}`}>
                {repository.name}
              </Link>
            </CardTitle>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              AI
            </span>
            <Switch
              checked={isAiActive}
              onCheckedChange={handleToggleAi}
              disabled={updateSettings.isPending}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-900 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
            <GitPullRequest className="h-3.5 w-3.5" />
            <span className="font-mono text-xs">
              {repository._count?.pullRequests ?? 0} PRs
            </span>
          </div>

          <Link
            href={`/repositories/${repository.id}`}
            className="flex items-center gap-1 text-[11px] font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <span>View PRs</span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
