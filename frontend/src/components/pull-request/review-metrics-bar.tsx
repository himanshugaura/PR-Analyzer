import { Shield, Clock } from "lucide-react";
import { Badge } from "../ui/badge";
import { formatRelativeTime } from "../../lib/utils";
import type { Review, ReviewMetrics } from "../../types";

export function ReviewMetricsBar({ review, metrics }: { review?: Review; metrics?: ReviewMetrics }) {
  if (!review) {
    return (
      <div className="rounded-xl border border-dashed border-white/8 p-6 text-center text-xs text-zinc-600 mb-6">
        No review has been run yet. Click &quot;Trigger Review&quot; to start analysis.
      </div>
    );
  }

  const isCompleted = review.status === "COMPLETED";
  const isFailed = review.status === "FAILED";
  const isRunning = review.status === "RUNNING";

  const severityCounts = [
    { label: "Critical", value: metrics?.criticalCount ?? 0, color: "text-red-400" },
    { label: "High", value: metrics?.highCount ?? 0, color: "text-orange-400" },
    { label: "Medium", value: metrics?.mediumCount ?? 0, color: "text-amber-400" },
    { label: "Low", value: metrics?.lowCount ?? 0, color: "text-zinc-400" },
    { label: "Info", value: metrics?.infoCount ?? 0, color: "text-zinc-600" },
  ];

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-200">AI Review Report</span>
              <Badge
                variant={isCompleted ? "default" : isFailed ? "critical" : "outline"}
              >
                {review.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-zinc-600 flex items-center gap-1 font-mono">
          <Clock className="h-3 w-3" />
          <span>
            {review.completedAt
              ? `Completed ${formatRelativeTime(review.completedAt)}`
              : isRunning
              ? "Analysis running..."
              : `Started ${formatRelativeTime(review.startedAt)}`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 pt-3">
        {severityCounts.map((item) => (
          <div key={item.label} className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-center">
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 mb-1">{item.label}</p>
            <p className={`text-2xl font-bold font-mono ${item.value > 0 ? item.color : "text-zinc-700"}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
