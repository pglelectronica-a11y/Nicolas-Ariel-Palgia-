import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { Peggie } from "@/components/peggie/Peggie";
import { elegirVariante, MENSAJES } from "@/components/peggie/messages";
import type { UltimoResultadoDTO } from "@/types/sorteo";

export interface PantallaSinSorteoProps {
  ultimoResultado: UltimoResultadoDTO | null;
  onInvitacionWhatsapp: () => void;
}

/** U2 — Sprint 1, sección 2. Reemplaza a U1 cuando no hay sorteo activo. */
export function PantallaSinSorteo({
  ultimoResultado,
  onInvitacionWhatsapp,
}: PantallaSinSorteoProps) {
  const semilla = ultimoResultado?.premio ?? "sin-sorteo";
  return (
    <div className="flex flex-col gap-4">
      <Peggie mensaje={elegirVariante(MENSAJES.sinSorteoActivo(), semilla)} />
      {ultimoResultado && (
        <Link href={`/resultado/${ultimoResultado.sorteoId}`}>
          <Card>
            <p className="font-mono text-xs uppercase tracking-wide text-muted">
              Último resultado
            </p>
            <p className="mt-1 text-lg font-bold text-ink">
              Ganó el Nº {ultimoResultado.numeroPremiado} — {ultimoResultado.premio}
            </p>
          </Card>
        </Link>
      )}
      <Button variant="primary" block onClick={onInvitacionWhatsapp}>
        {elegirVariante(MENSAJES.invitacionWhatsapp(), semilla)}
      </Button>
    </div>
  );
}
