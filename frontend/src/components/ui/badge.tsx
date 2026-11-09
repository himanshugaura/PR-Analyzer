import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase transition-colors font-mono",
  {
    variants: {
      variant: {
        default: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
        outline: "text-zinc-400 border border-white/10 bg-white/5",
        secondary: "bg-white/5 text-zinc-300 border border-white/10",
        critical: "bg-red-500/15 text-red-400 border border-red-500/30",
        high: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
        medium: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
        low: "bg-zinc-700/40 text-zinc-400 border border-zinc-700/50",
        info: "bg-transparent text-zinc-500 border border-white/10",
        open: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
        closed: "bg-zinc-800 text-zinc-500 border border-zinc-700",
        merged: "bg-zinc-700/30 text-zinc-300 border border-zinc-600/50",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
