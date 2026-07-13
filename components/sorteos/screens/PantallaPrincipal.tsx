"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { Peggie } from "@/components/peggie/Peggie";
import { elegirVariante, MENSAJES } from "@/components/peggie/messages";
import { PrizeCard } from "@/components/sorteos/PrizeCard";
import { CountdownTimer } from "@/components/sorteos/CountdownTimer";
import type { SorteoActivoDTO } from "@/types/sorteo";

export interface PantallaPrincipalProps {
  sorteo: SorteoActivoDTO;
  yaParticipo: boolean;
  esVisitanteRecurrente: boolean;
  onParticipar: () => void;
  onVerMiNumero: () => void;
  onInvitacionWhatsapp: () => void;
}

/** U1 — Sprint 1, sección 2. */
export function PantallaPrincipal({
  sorteo,
  yaParticipo,
  esVisitanteRecurrente,
  onParticipar,
  onVerMiNumero,
  onInvitacionWhatsapp,
}: PantallaPrincipalProps) {
  const cuposLibres = sorteo.cantidadNumeros - sorteo.numerosOcupados.length;
  const sinCupos = cuposLibres <= 0;
  const bienvenida = esVisitanteRecurrente
    ? MENSAJES.bienvenidaDeVuelta(sorteo.premio)
    : MENSAJES.bienvenida(sorteo.premio);

  const [fechaCierreTexto, setFechaCierreTexto] = useState<string | null>(null);

  useEffect(() => {
    // Intl.DateTimeFormat puede formatear el mismo locale de forma distinta
    // entre el servidor (Node) y el navegador — se calcula recién acá, ya
    // montado, para no arriesgar un error de hidratación (mismo patrón que
    // hooks/use-theme.ts y CountdownTimer: servidor y primer render del
    // cliente arrancan iguales, y se corrige al valor real en este efecto).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- el valor real solo se puede calcular en el cliente, mismo patrón que hooks/use-theme.ts
    setFechaCierreTexto(
      new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(
        new Date(sorteo.fechaCierre),
      ),
    );
  }, [sorteo.fechaCierre]);

  return (
    <div className="flex flex-col gap-4">
      <Peggie mensaje={elegirVariante(bienvenida, sorteo.id)} />
      <PrizeCard
        premio={sorteo.premio}
        imagenUrl={sorteo.imagenUrl}
        subtitulo={fechaCierreTexto ? `Cierra en ${fechaCierreTexto}` : "Cierra pronto"}
      />
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          {sinCupos
            ? "Se agotaron los números"
            : `${cuposLibres} de ${sorteo.cantidadNumeros} números disponibles`}
        </span>
        <CountdownTimer fechaCierre={sorteo.fechaCierre} />
      </div>

      {yaParticipo ? (
        <Button variant="primary" block onClick={onVerMiNumero}>
          Ver mi número
        </Button>
      ) : (
        <Button variant="primary" block disabled={sinCupos} onClick={onParticipar}>
          Participar
        </Button>
      )}
      <Button variant="secondary" block onClick={onInvitacionWhatsapp}>
        {elegirVariante(MENSAJES.invitacionWhatsapp(), sorteo.id)}
      </Button>
    </div>
  );
}
