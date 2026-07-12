import { cn } from "@/lib/utils";

export interface PeggieProps {
  mensaje: string;
  className?: string;
}

/**
 * Peggie: presencia discreta, nunca compite con la acción principal (Sprint
 * 4 v1.1). Sin color propio — su calidez está en el mensaje, no en la
 * paleta. Vive únicamente del lado usuario (Sprint 1, sección 4: nunca
 * aparece en el panel de administración).
 */
export function Peggie({ mensaje, className }: PeggieProps) {
  return (
    <div className={cn("flex animate-fade-in items-start gap-2.5", className)}>
      <div
        aria-hidden="true"
        className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-ink"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" className="text-bg">
          <path
            d="M4 10l4 4 8-8"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="rounded-md bg-surface-2 px-3 py-2 text-[0.86rem] leading-snug text-ink">
        {mensaje}
      </p>
    </div>
  );
}
