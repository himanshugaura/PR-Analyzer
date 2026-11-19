"use client";

import { X } from "lucide-react";
import { useUiStore } from "../../store/use-ui-store";
import type { FindingCategory, FindingStatus, Severity } from "../../types";

const SEVERITIES: Array<Severity | "ALL"> = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
const STATUSES: Array<FindingStatus | "ALL"> = ["ALL", "OPEN", "RESOLVED", "DISMISSED"];

const CATEGORIES: Array<FindingCategory | "ALL"> = [
  "ALL",
  "BUG",
  "SECURITY",
  "PERFORMANCE",
  "CODE_QUALITY",
  "STYLE",
  "MAINTAINABILITY",
  "ERROR_HANDLING",
  "TESTING",
  "DATABASE",
  "API",
  "OTHER",
];

const SEVERITY_ACTIVE: Record<string, string> = {
  CRITICAL: "bg-[#F87171]/15 text-[#F87171] border-[#F87171]/30",
  HIGH: "bg-orange-400/15 text-orange-400 border-orange-400/30",
  MEDIUM: "bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30",
  LOW: "bg-blue-400/15 text-blue-400 border-blue-400/30",
  INFO: "bg-[#858593]/15 text-[#858593] border-[#858593]/30",
  ALL: "bg-[#8B7CF6]/15 text-[#8B7CF6] border-[#8B7CF6]/30",
};

export function FindingsFilterBar({ totalCount }: { totalCount?: number }) {
  const selectedSeverity = useUiStore((s) => s.severityFilter);
  const setSeverity = useUiStore((s) => s.setSeverityFilter);
  const selectedStatus = useUiStore((s) => s.statusFilter);
  const setStatus = useUiStore((s) => s.setStatusFilter);
  const selectedCategory = useUiStore((s) => s.categoryFilter);
  const setCategory = useUiStore((s) => s.setCategoryFilter);
  const resetFilters = useUiStore((s) => s.resetFilters);

  const hasActiveFilters = !!(selectedSeverity || selectedStatus || selectedCategory);

  const activeChips: Array<{ label: string; onRemove: () => void }> = [];
  if (selectedSeverity) activeChips.push({ label: `Severity: ${selectedSeverity}`, onRemove: () => setSeverity(undefined) });
  if (selectedCategory) activeChips.push({ label: `Category: ${selectedCategory}`, onRemove: () => setCategory(undefined) });
  if (selectedStatus) activeChips.push({ label: `Status: ${selectedStatus}`, onRemove: () => setStatus(undefined) });

  return (
    <div className="bg-[#1E1E26] border border-[#303039] rounded-[8px] p-3 space-y-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {/* Severity filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-[#858593] font-mono uppercase tracking-wider mr-1">
            Severity{totalCount !== undefined ? ` (${totalCount})` : ""}:
          </span>
          {SEVERITIES.map((sev) => {
            const isSelected = sev === "ALL" ? !selectedSeverity : selectedSeverity === sev;
            const activeClass = SEVERITY_ACTIVE[sev] ?? SEVERITY_ACTIVE.ALL;
            return (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverity(sev === "ALL" ? undefined : sev)}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-[4px] border transition-all cursor-pointer ${
                  isSelected
                    ? activeClass
                    : "bg-transparent text-[#858593] border-[#303039] hover:border-[#303039]/80 hover:text-[#EDEDF2]"
                }`}
              >
                {sev}
              </button>
            );
          })}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#858593] font-mono uppercase tracking-wider mr-1">Status:</span>
          {STATUSES.map((st) => {
            const isSelected = st === "ALL" ? !selectedStatus : selectedStatus === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatus(st === "ALL" ? undefined : st)}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-[4px] border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#8B7CF6]/15 text-[#8B7CF6] border-[#8B7CF6]/30"
                    : "bg-transparent text-[#858593] border-[#303039] hover:border-[#303039]/80 hover:text-[#EDEDF2]"
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-[#858593] font-mono uppercase tracking-wider mr-1">Category:</span>
        <select
          value={selectedCategory ?? "ALL"}
          onChange={(e) => setCategory(e.target.value === "ALL" ? undefined : (e.target.value as FindingCategory))}
          className="bg-[#101014] border border-[#303039] rounded-[6px] text-[#EDEDF2] text-[12px] font-mono px-2 py-1 focus:outline-none focus:border-[#8B7CF6] cursor-pointer transition-colors"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Active filter chips + clear */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#303039]/60">
          {activeChips.map((chip) => (
            <span
              key={chip.label}
              className="flex items-center gap-1 bg-[#8B7CF6]/10 text-[#8B7CF6] border border-[#8B7CF6]/20 rounded-[4px] px-2 py-0.5 text-[11px] font-mono"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.onRemove}
                className="ml-0.5 hover:text-[#EDEDF2] cursor-pointer transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] text-[#858593] hover:text-[#EDEDF2] transition-colors font-mono cursor-pointer ml-1"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
