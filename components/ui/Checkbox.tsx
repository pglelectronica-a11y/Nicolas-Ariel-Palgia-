import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex cursor-pointer select-none items-center gap-2.5 text-[0.88rem] text-ink",
          className,
        )}
      >
        <span className="relative inline-flex h-5 w-5 flex-none items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="peer absolute h-5 w-5 cursor-pointer appearance-none rounded-[6px] border border-border-strong bg-surface transition-colors duration-fast ease-standard checked:border-primary checked:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            {...props}
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="pointer-events-none absolute h-3 w-3 scale-0 text-white peer-checked:scale-100"
          >
            <path
              d="M4 10l4 4 8-8"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {label}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
