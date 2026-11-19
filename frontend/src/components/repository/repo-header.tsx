import Link from "next/link";
import { ArrowLeft, GitBranch, Globe, Lock } from "lucide-react";
import { Badge } from "../ui/badge";
import { formatDate } from "../../lib/utils";
import type { Repository } from "../../types";

export function RepoHeader({ repository }: { repository: Repository }) {
  return (
    <div className="space-y-4 mb-6">
      <Link
        href="/repositories"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#858593] hover:text-[#8B7CF6] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>← Back to Repositories</span>
      </Link>

      <div className="pb-4 border-b border-[#303039]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs text-[#858593] font-mono">
            {repository.ownerLogin} /
          </span>
          <Badge variant="outline" className="text-[10px]">
            {repository.private ? (
              <span className="flex items-center gap-1">
                <Lock className="h-2.5 w-2.5" /> Private
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Globe className="h-2.5 w-2.5" /> Public
              </span>
            )}
          </Badge>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[#EDEDF2]">
          {repository.name}
        </h1>

        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-[#858593]">
          {repository.defaultBranch && (
            <span className="flex items-center gap-1 font-mono text-[#8B7CF6]">
              <GitBranch className="h-3 w-3" />
              {repository.defaultBranch}
            </span>
          )}
          <span>Created {formatDate(repository.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
