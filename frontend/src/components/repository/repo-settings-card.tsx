"use client";

import { useState } from "react";
import { SlidersHorizontal, Check, Loader2, Sparkles } from "lucide-react";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { useUpdateRepositorySettings } from "../../hooks/use-installations";
import type { Repository, Severity } from "../../types";

const SEVERITIES: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

export function RepoSettingsCard({ repository }: { repository: Repository }) {
  const settings = repository.settings;
  const updateMutation = useUpdateRepositorySettings();

  const [autoComment, setAutoComment] = useState(settings?.autoComment ?? true);
  const [minimumSeverity, setMinimumSeverity] = useState<Severity>(settings?.minimumSeverity ?? "LOW");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      repositoryId: repository.id,
      aiReviewEnabled: true,
      autoComment,
      minimumSeverity,
      enabled: true,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] mb-8 overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-[#303039]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#8B7CF6]/10 text-[#8B7CF6]">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#EDEDF2]">Review Configuration</p>
            <p className="text-[11px] text-[#858593]">Configure reviewer behavior for this repository</p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="h-8 gap-1.5 text-xs"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Saving...</span>
            </>
          ) : isSaved ? (
            <>
              <Check className="h-3 w-3" />
              <span>Saved</span>
            </>
          ) : (
            <span>Save Changes</span>
          )}
        </Button>
      </div>

      <div className="divide-y divide-[#303039]/60 p-5 space-y-4">
        {/* Permanent AI Review Status */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-[#EDEDF2]">AI Code Review</p>
              <span className="text-[10px] text-[#34D399] font-mono uppercase tracking-wider bg-[#34D399]/10 border border-[#34D399]/20 px-1.5 py-0.2 rounded">
                Always Active
              </span>
            </div>
            <p className="text-[11px] text-[#858593]">Gemini analysis runs automatically on all opened and synchronized pull requests.</p>
          </div>
        </div>

        {/* Toggle: Auto Comment */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <p className="text-xs font-semibold text-[#EDEDF2]">Automatic PR Commenting</p>
            <p className="text-[11px] text-[#858593]">Directly post detected findings and suggestions as line comments on GitHub.</p>
          </div>
          <Switch checked={autoComment} onCheckedChange={setAutoComment} />
        </div>

        {/* Minimum Severity Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
          <div>
            <p className="text-xs font-semibold text-[#EDEDF2]">Minimum Severity Threshold</p>
            <p className="text-[11px] text-[#858593]">Only post comments for issues that meet or exceed this severity.</p>
          </div>
          <div className="flex items-center gap-1 bg-[#101014] border border-[#303039] rounded-[6px] p-0.5">
            {SEVERITIES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setMinimumSeverity(s)}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-[4px] transition-colors cursor-pointer ${
                  minimumSeverity === s
                    ? "bg-[#292932] text-[#8B7CF6] font-semibold"
                    : "text-[#858593] hover:text-[#EDEDF2]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
