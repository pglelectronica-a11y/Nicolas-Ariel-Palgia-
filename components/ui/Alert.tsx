import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type AlertVariant = "success" | "error" | "warning" | "info";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

// Nota: los tokens de color son variables CSS con valores hexadecimales sólidos
// (styles/tokens.css), no tripletas rgb — por eso los bordes usan el color
// semántico directo en vez del modificador de opacidad "/40" de Tailwind,
// que solo funciona con colores definidos como "rgb(var(--x) / <alpha-value>)".
const variantClasses: Record<AlertVariant, string> = {
  success: "bg-success-tint border-success",
  error: "bg-error-tint border-error",
  warning: "bg-warning-tint border-warning",
  info: "bg-info-tint border-info",
};

export function Alert({ className, variant = "info", children, ...props }: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "rounded-sm border px-3.5 py-3 text-sm text-ink",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
