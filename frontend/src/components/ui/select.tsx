"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  wrapperClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, wrapperClassName, children, ...props }, ref) => {
    return (
      <div className={cn("relative inline-flex items-center", wrapperClassName)}>
        <select
          ref={ref}
          className={cn(
            "bg-[#1E1E26] border border-[#303039] rounded-[6px] px-3 py-2 text-[13px] text-[#EDEDF2]",
            "appearance-none cursor-pointer pr-8 w-full",
            "focus:border-[#8B7CF6] focus:outline-none",
            "transition-colors duration-150",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#858593] pointer-events-none"
        />
      </div>
    );
  }
);
Select.displayName = "Select";
