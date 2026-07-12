import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/** Placeholder de carga con efecto shimmer — para usarse mientras llegan datos reales. */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-sm bg-[length:200%_100%]",
        "bg-[linear-gradient(100deg,var(--surface-2)_30%,var(--border)_50%,var(--surface-2)_70%)]",
        className,
      )}
      {...props}
    />
  );
}
