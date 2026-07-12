import { Card } from "@/components/ui";

export interface PrizeCardProps {
  premio: string;
  imagenUrl: string | null;
  subtitulo: string;
}

/** Tarjeta de premio — U1 (Sprint 1). Sin imagen todavía: se completa cuando exista carga real de imágenes. */
export function PrizeCard({ premio, imagenUrl, subtitulo }: PrizeCardProps) {
  return (
    <Card>
      {imagenUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- imagen provista por el administrador, dominio no conocido de antemano
        <img
          src={imagenUrl}
          alt={premio}
          className="mb-3 h-36 w-full rounded-sm object-cover"
        />
      ) : (
        <div className="mb-3 flex h-36 items-center justify-center rounded-sm bg-surface-2 font-mono text-xs uppercase text-faint">
          Imagen del premio
        </div>
      )}
      <p className="text-lg font-bold text-ink">{premio}</p>
      <p className="mt-0.5 text-sm text-muted">{subtitulo}</p>
    </Card>
  );
}
