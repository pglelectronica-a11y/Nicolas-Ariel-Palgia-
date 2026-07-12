import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Mensaje de error puntual (Sprint 1, catálogo de errores). Cuando existe, el campo pasa a estado de error. */
  error?: string;
}

/** Campo de formulario con label en mayúsculas monoespaciadas (firma visual del Sprint 3) y estado de error. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-mono text-[0.66rem] uppercase tracking-wider text-muted"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            "h-11 w-full rounded-sm border border-border-strong bg-surface px-3.5",
            "text-[0.92rem] text-ink transition-shadow duration-fast ease-standard",
            "focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-tint",
            error && "border-error focus:border-error focus:ring-error-tint",
            className,
          )}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-error">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
