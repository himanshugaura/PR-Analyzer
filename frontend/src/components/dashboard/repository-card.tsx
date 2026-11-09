"use client";

import Link from "next/link";
import { GitPullRequest, Lock, Globe, ArrowRight, Zap } from "lucide-react";
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
    <div className="group rounded-xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-4 transition-all hover:border-amber-500/20 hover:bg-white/[0.05]">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            {repository.private ? (
              <Lock className="h-3 w-3 text-zinc-600 shrink-0" />
            ) : (
              <Globe className="h-3 w-3 text-zinc-600 shrink-0" />
            )}
            <span className="text-[11px] text-zinc-600 font-mono truncate">
              {repository.ownerLogin}
            </span>
          </div>
          <Link
            href={`/repositories/${repository.id}`}
            className="text-sm font-semibold text-zinc-200 hover:text-amber-400 transition-colors truncate block"
          >
            {repository.name}
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-zinc-600 flex items-center gap-1 font-mono uppercase">
            <Zap className="h-3 w-3" />
            AI
          </span>
          <Switch
            checked={isAiActive}
            onCheckedChange={handleToggleAi}
            disabled={updateSettings.isPending}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
        <div className="flex items-center gap-1.5 text-zinc-600">
          <GitPullRequest className="h-3.5 w-3.5" />
          <span className="font-mono">
            {repository._count?.pullRequests ?? 0} PRs
          </span>
        </div>

        <Link
          href={`/repositories/${repository.id}`}
          className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-amber-400 transition-colors"
        >
          <span>View PRs</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
