"use client";
import * as React from "react";
import { cn } from "../../lib/utils";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked, onCheckedChange, disabled, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-white/10 transition-all focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-amber-500 border-amber-500/60" : "bg-white/5",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-3.5 w-3.5 rounded-full shadow-sm transition-transform",
          checked ? "translate-x-4 bg-black" : "translate-x-0.5 bg-zinc-500"
        )}
      />
    </button>
  );
}
