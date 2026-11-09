"use client";

import { useState } from "react";
import { SlidersHorizontal, Check } from "lucide-react";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { useUpdateRepositorySettings } from "../../hooks/use-installations";
import type { Repository, Severity } from "../../types";

const SEVERITIES: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

export function RepoSettingsCard({ repository }: { repository: Repository }) {
  const settings = repository.settings;
  const updateMutation = useUpdateRepositorySettings();

  const [aiReviewEnabled, setAiReviewEnabled] = useState(settings?.aiReviewEnabled ?? true);
  const [autoComment, setAutoComment] = useState(settings?.autoComment ?? true);
  const [minimumSeverity, setMinimumSeverity] = useState<Severity>(settings?.minimumSeverity ?? "LOW");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      repositoryId: repository.id,
      aiReviewEnabled,
      autoComment,
      minimumSeverity,
      enabled: aiReviewEnabled,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] backdrop-blur-sm mb-8">
      <div className="flex items-center justify-between p-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-200">AI Review Settings</p>
            <p className="text-[11px] text-zinc-600">Configure reviewer behavior for this repository</p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          isLoading={updateMutation.isPending}
          className="h-8 gap-1.5 text-xs"
        >
          {isSaved ? (
            <>
              <Check className="h-3 w-3" />
              <span>Saved</span>
            </>
          ) : (
            <span>Save Changes</span>
          )}
        </Button>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* AI Review Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-white/[0.02]">
            <div>
              <p className="text-xs font-semibold text-zinc-200">Automated AI Review</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">Analyze PR diffs on open &amp; push</p>
            </div>
            <Switch checked={aiReviewEnabled} onCheckedChange={setAiReviewEnabled} />
          </div>

          {/* Auto Comment Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-white/[0.02]">
            <div>
              <p className="text-xs font-semibold text-zinc-200">Post Inline Comments</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">Post review directly to GitHub</p>
            </div>
            <Switch checked={autoComment} onCheckedChange={setAutoComment} />
          </div>

          {/* Minimum Severity */}
          <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
            <p className="text-xs font-semibold text-zinc-200 mb-2">Minimum Severity Threshold</p>
            <select
              value={minimumSeverity}
              onChange={(e) => setMinimumSeverity(e.target.value as Severity)}
              className="w-full text-xs font-mono rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-500/50"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s} className="bg-zinc-900">
                  {s} and above
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
