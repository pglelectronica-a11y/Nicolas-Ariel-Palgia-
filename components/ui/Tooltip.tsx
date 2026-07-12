import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  label: string;
  children: ReactNode;
  className?: string;
}

/** Tooltip por hover/foco, sin librería de posicionamiento — alcanza para un primitivo v1. */
export function Tooltip({ label, children, className }: TooltipProps) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full",
          "whitespace-nowrap rounded-sm bg-ink px-2.5 py-1 font-mono text-[0.66rem] text-bg",
          "opacity-0 transition-opacity duration-fast ease-standard group-focus-within:opacity-100 group-hover:opacity-100",
        )}
      >
        {label}
      </span>
    </span>
  );
}
