import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[4px] px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase transition-colors font-mono",
  {
    variants: {
      variant: {
        default: "bg-[#8B7CF6]/15 text-[#8B7CF6] border border-[#8B7CF6]/30",
        outline: "text-[#858593] border border-[#303039] bg-[#1E1E26]",
        secondary: "bg-[#292932] text-[#EDEDF2] border border-[#303039]",
        success: "bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30",
        warning: "bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30",
        critical: "bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30",
        high: "bg-[#FB923C]/15 text-[#FB923C] border border-[#FB923C]/30",
        medium: "bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30",
        low: "bg-[#60A5FA]/15 text-[#60A5FA] border border-[#60A5FA]/30",
        info: "bg-transparent text-[#858593] border border-[#303039]",
        open: "bg-[#8B7CF6]/15 text-[#8B7CF6] border border-[#8B7CF6]/30",
        closed: "bg-[#292932] text-[#858593] border border-[#303039]",
        merged: "bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30",
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
