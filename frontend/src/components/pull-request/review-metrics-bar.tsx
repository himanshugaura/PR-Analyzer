import { TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import type { Review, ReviewMetrics } from "../../types";

const SEVERITY_CONFIG = [
  { key: "criticalCount", label: "Critical", color: "text-[#F87171]", bg: "bg-[#F87171]/10" },
  { key: "highCount", label: "High", color: "text-orange-400", bg: "bg-orange-400/10" },
  { key: "mediumCount", label: "Medium", color: "text-[#FBBF24]", bg: "bg-[#FBBF24]/10" },
  { key: "lowCount", label: "Low", color: "text-blue-400", bg: "bg-blue-400/10" },
  { key: "infoCount", label: "Info", color: "text-[#858593]", bg: "bg-[#858593]/10" },
] as const;

function computeQualityScore(metrics?: ReviewMetrics): number {
  if (!metrics) return 100;
  const score =
    100 -
    (metrics.criticalCount * 20 +
      metrics.highCount * 10 +
      metrics.mediumCount * 5 +
      metrics.lowCount * 2);
  return Math.max(0, Math.min(100, score));
}

function qualityColor(score: number): string {
  if (score >= 80) return "text-[#34D399]";
  if (score >= 60) return "text-[#FBBF24]";
  return "text-[#F87171]";
}

export function ReviewMetricsBar({
  review,
  metrics,
  onRunReview,
  isReviewing,
}: {
  review?: Review;
  metrics?: ReviewMetrics;
  onRunReview?: () => void;
  isReviewing?: boolean;
}) {
  if (!review) {
    return (
      <div className="rounded-[8px] border border-dashed border-[#303039] p-8 text-center text-xs text-[#858593] mb-6 flex flex-col items-center justify-center gap-2 bg-[#1E1E26]/40">
        <Sparkles className="h-7 w-7 text-[#8B7CF6] mb-1" />
        <span className="text-sm font-semibold text-[#EDEDF2]">No AI Review Generated Yet</span>
        <span className="text-xs text-[#858593] max-w-sm">
          This pull request hasn&apos;t been reviewed yet. Click the button below to generate a complete Gemini AI code analysis.
        </span>
        {onRunReview && (
          <Button
            size="sm"
            onClick={onRunReview}
            disabled={isReviewing}
            className="mt-3 h-8 px-4 text-xs gap-1.5 bg-[#8B7CF6] hover:bg-[#7C3AED] text-white font-medium cursor-pointer shadow-sm"
          >
            {isReviewing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Running Review...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Generate AI Review</span>
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  const isCompleted = review.status === "COMPLETED";
  const qualityScore = computeQualityScore(metrics);
  const qColor = qualityColor(qualityScore);

  return (
    <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Quality score */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-1">
              <TrendingUp className="h-4 w-4 text-[#858593] mb-1" />
              <span className={`text-[42px] font-bold font-mono leading-none ${qColor}`}>
                {isCompleted ? qualityScore : "—"}
              </span>
              {isCompleted && <span className="text-[14px] text-[#858593] font-mono">/100</span>}
            </div>
            <span className="text-[10px] text-[#858593] font-mono uppercase tracking-wider mt-1">Quality</span>
          </div>
        </div>

        {/* Severity summary */}
        {isCompleted && metrics && (
          <div className="flex items-center gap-2">
            {SEVERITY_CONFIG.map(({ key, label, color, bg }) => {
              const count = metrics[key] ?? 0;
              return (
                <div
                  key={key}
                  className={`flex flex-col items-center rounded-[6px] border border-[#303039] ${bg} px-3 py-2 min-w-[52px]`}
                >
                  <span className={`text-[18px] font-bold font-mono leading-none ${count > 0 ? color : "text-[#303039]"}`}>
                    {count}
                  </span>
                  <span className="text-[9px] text-[#858593] font-mono uppercase tracking-wider mt-1">{label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
