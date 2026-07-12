import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type CardProps = HTMLAttributes<HTMLDivElement>;

/** Contenedor de superficie estándar: tarjetas de premio, resúmenes, filas de contenido. */
export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-md border border-border bg-surface p-4 shadow-1", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-[0.95rem] font-semibold text-ink", className)} {...props}>
      {children}
    </p>
  );
}

export function CardSubtitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("mt-0.5 text-sm text-muted", className)} {...props}>
      {children}
    </p>
  );
}
