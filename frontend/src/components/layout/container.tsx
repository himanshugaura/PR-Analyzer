import React from "react";
import { cn } from "../../lib/utils";

export function Container({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <main
      className={cn("relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6", className)}
      {...props}
    >
      {children}
    </main>
  );
}
