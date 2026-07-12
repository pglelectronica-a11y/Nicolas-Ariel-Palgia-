import { Alert, Button, Card } from "@/components/ui";
import { Peggie } from "@/components/peggie/Peggie";
import { elegirVariante, MENSAJES } from "@/components/peggie/messages";
import type { ParticipacionConfirmadaDTO } from "@/types/sorteo";

export interface PantallaConfirmacionProps {
  participacion: ParticipacionConfirmadaDTO;
  onCompartir: () => void;
  onInvitacionWhatsapp: () => void;
  onVerSorteo: () => void;
}

/** U5 — Sprint 1, sección 2. Pantalla de solo lectura. */
export function PantallaConfirmacion({
  participacion,
  onCompartir,
  onInvitacionWhatsapp,
  onVerSorteo,
}: PantallaConfirmacionProps) {
  const semilla = String(participacion.numero);
  return (
    <div className="flex flex-col gap-4">
      <Peggie
        mensaje={elegirVariante(MENSAJES.confirmacion(participacion.numero), semilla)}
      />
      <Card className="text-center">
        <p className="font-mono text-xs uppercase tracking-wide text-muted">
          Tu número reservado
        </p>
        <p className="my-1 font-mono text-5xl font-bold text-primary">
          {participacion.numero}
        </p>
        <p className="text-sm text-muted">{participacion.premio}</p>
      </Card>
      <Alert variant="info">{elegirVariante(MENSAJES.condicionPremio(), semilla)}</Alert>
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onCompartir}>
          Compartir
        </Button>
        <Button variant="primary" className="flex-1" onClick={onInvitacionWhatsapp}>
          {elegirVariante(MENSAJES.invitacionWhatsapp(), semilla)}
        </Button>
      </div>
      <Button variant="ghost" onClick={onVerSorteo}>
        Ver el sorteo
      </Button>
    </div>
  );
}
