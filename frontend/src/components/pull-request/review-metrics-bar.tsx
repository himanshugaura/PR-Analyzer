import { Shield, Clock } from "lucide-react";
import { Badge } from "../ui/badge";
import { formatRelativeTime, formatSha } from "../../lib/utils";
import type { Review, ReviewMetrics } from "../../types";

export function ReviewMetricsBar({
  review,
  metrics,
}: {
  review?: Review;
  metrics?: ReviewMetrics;
}) {
  if (!review) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 p-6 text-center text-xs text-zinc-400 mb-6">
        No review has been executed yet for this pull request. Click &quot;Trigger AI Review&quot; above to start analysis.
      </div>
    );
  }

  const isCompleted = review.status === "COMPLETED";
  const isFailed = review.status === "FAILED";
  const isRunning = review.status === "RUNNING";

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                AI Review Report
              </span>
              <Badge
                variant={
                  isCompleted
                    ? "default"
                    : isFailed
                    ? "critical"
                    : "outline"
                }
                className="text-[10px] font-mono"
              >
                {review.status}
              </Badge>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Model: {review.model || "gemini-2.5-flash"} • Target SHA: {formatSha(review.headSha)}
            </p>
          </div>
        </div>

        <div className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
          <Clock className="h-3 w-3" />
          <span>
            {review.completedAt
              ? `Completed ${formatRelativeTime(review.completedAt)}`
              : isRunning
              ? "Analysis in progress..."
              : `Started ${formatRelativeTime(review.startedAt)}`}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3">
        <div className="rounded-md border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-2.5 text-center">
          <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
            Critical
          </p>
          <p className="text-xl font-bold font-mono text-zinc-950 dark:text-zinc-50 mt-0.5">
            {metrics?.criticalCount ?? 0}
          </p>
        </div>

        <div className="rounded-md border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-2.5 text-center">
          <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
            High
          </p>
          <p className="text-xl font-bold font-mono text-zinc-950 dark:text-zinc-50 mt-0.5">
            {metrics?.highCount ?? 0}
          </p>
        </div>

        <div className="rounded-md border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-2.5 text-center">
          <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
            Medium
          </p>
          <p className="text-xl font-bold font-mono text-zinc-950 dark:text-zinc-50 mt-0.5">
            {metrics?.mediumCount ?? 0}
          </p>
        </div>

        <div className="rounded-md border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-2.5 text-center">
          <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
            Low
          </p>
          <p className="text-xl font-bold font-mono text-zinc-950 dark:text-zinc-50 mt-0.5">
            {metrics?.lowCount ?? 0}
          </p>
        </div>

        <div className="rounded-md border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-2.5 text-center">
          <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
            Info
          </p>
          <p className="text-xl font-bold font-mono text-zinc-950 dark:text-zinc-50 mt-0.5">
            {metrics?.infoCount ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}
