import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface StatCounterProps extends HTMLAttributes<HTMLDivElement> {
  value: string | number;
  label: string;
}

/** Tarjeta de métrica del panel administrador — pensada para leerse en menos de cinco segundos. */
export function StatCounter({ value, label, className, ...props }: StatCounterProps) {
  return (
    <div
      className={cn("rounded-md border border-border bg-surface p-4", className)}
      {...props}
    >
      <p className="font-mono text-[1.7rem] font-bold tracking-tight text-ink">{value}</p>
      <p className="mt-0.5 text-[0.76rem] text-muted">{label}</p>
    </div>
  );
}
