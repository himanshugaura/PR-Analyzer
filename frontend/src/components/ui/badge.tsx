import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium tracking-tight transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-900 text-zinc-50 border border-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-200",
        outline:
          "text-zinc-700 border border-zinc-300 dark:text-zinc-300 dark:border-zinc-800",
        secondary:
          "bg-zinc-100 text-zinc-900 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800",
        critical:
          "bg-zinc-950 text-white border border-zinc-700 dark:bg-zinc-900 dark:border-zinc-500 font-semibold",
        high: "bg-zinc-800 text-zinc-100 border border-zinc-700",
        medium: "bg-zinc-700/40 text-zinc-300 border border-zinc-700/60",
        low: "bg-zinc-900/60 text-zinc-400 border border-zinc-800",
        info: "bg-transparent text-zinc-400 border border-zinc-800/80",
        open: "bg-zinc-900 text-zinc-100 border border-zinc-700 dark:bg-zinc-100 dark:text-zinc-950",
        closed: "bg-zinc-800 text-zinc-400 border border-zinc-700 line-through",
        merged: "bg-zinc-700 text-zinc-200 border border-zinc-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
