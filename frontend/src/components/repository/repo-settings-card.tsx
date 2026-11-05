"use client";

import { useState } from "react";
import { Sliders, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { useUpdateRepositorySettings } from "../../hooks/use-installations";
import type { Repository, Severity } from "../../types";

const SEVERITIES: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

export function RepoSettingsCard({ repository }: { repository: Repository }) {
  const settings = repository.settings;
  const updateMutation = useUpdateRepositorySettings();

  const [aiReviewEnabled, setAiReviewEnabled] = useState(
    settings?.aiReviewEnabled ?? true,
  );
  const [autoComment, setAutoComment] = useState(settings?.autoComment ?? true);
  const [minimumSeverity, setMinimumSeverity] = useState<Severity>(
    settings?.minimumSeverity ?? "LOW",
  );
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
    <Card className="mb-8">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-zinc-500" />
            <CardTitle>AI Review Settings</CardTitle>
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            isLoading={updateMutation.isPending}
            className="h-8 gap-1 text-xs"
          >
            {isSaved ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Saved</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </Button>
        </div>
        <CardDescription>
          Configure how the AI reviewer behaves when developers open or update pull requests in this repository.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-zinc-100 dark:border-zinc-900">
          {/* AI Review Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Automated AI Review
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Analyze PR diffs on open & push
              </p>
            </div>
            <Switch
              checked={aiReviewEnabled}
              onCheckedChange={setAiReviewEnabled}
            />
          </div>

          {/* Auto Comment Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Post Inline Comments
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Post review directly to GitHub
              </p>
            </div>
            <Switch checked={autoComment} onCheckedChange={setAutoComment} />
          </div>

          {/* Minimum Severity Selector */}
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Minimum Severity Threshold
            </p>
            <div className="flex items-center gap-1">
              <select
                value={minimumSeverity}
                onChange={(e) => setMinimumSeverity(e.target.value as Severity)}
                className="w-full text-xs font-mono rounded-md border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s} and above
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
