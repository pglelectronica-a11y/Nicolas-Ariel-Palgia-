import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Reemplaza el contenido por un spinner y bloquea la interacción, sin mover el layout. */
  isLoading?: boolean;
  /** Ocupa el 100% del ancho disponible — patrón habitual en las pantallas mobile-first. */
  block?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white shadow-1 hover:bg-primary-hover hover:-translate-y-px",
  secondary: "bg-surface text-ink border border-border-strong hover:border-ink",
  ghost: "bg-transparent text-primary underline underline-offset-2 px-0",
  destructive: "bg-error text-white hover:brightness-95",
};

/**
 * Botón base del Design System (Sprint 3). No sabe nada del negocio de
 * sorteos — solo variantes visuales, estado de carga y estado deshabilitado.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      isLoading = false,
      block = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled ?? isLoading}
        aria-busy={isLoading}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 rounded-btn px-5 py-3",
          "text-sm font-semibold transition-all duration-fast ease-standard",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0",
          "active:scale-[0.97]",
          block && "w-full",
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        <span className={cn(isLoading && "invisible")}>{children}</span>
        {isLoading && (
          <span
            className="absolute h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            aria-hidden="true"
          />
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
