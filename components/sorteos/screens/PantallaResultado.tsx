"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { Peggie } from "@/components/peggie/Peggie";
import { elegirVariante, MENSAJES } from "@/components/peggie/messages";
import type { ResultadoPublicoDTO } from "@/types/sorteo";

export interface PantallaResultadoProps {
  sorteoId: string;
  resultado: ResultadoPublicoDTO;
  whatsappUrl: string;
}

const CLAVE_ALMACENAMIENTO = "pgl-club-participacion";

/** U6 — Sprint 1, sección 2. Se personaliza si quien entra es el propio ganador. */
export function PantallaResultado({
  sorteoId,
  resultado,
  whatsappUrl,
}: PantallaResultadoProps) {
  const [miNumero, setMiNumero] = useState<number | null>(null);

  useEffect(() => {
    const guardado = window.localStorage.getItem(CLAVE_ALMACENAMIENTO);
    if (!guardado) return;
    try {
      const datos: { sorteoId: string; telefono: string } = JSON.parse(guardado);
      if (datos.sorteoId !== sorteoId) return;
      fetch(
        `/api/sorteos/${sorteoId}/participaciones?telefono=${encodeURIComponent(datos.telefono)}`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.participacion) {
            setMiNumero(data.participacion.numero);
          }
        })
        .catch(() => {
          /* no se pudo confirmar — se muestra el resultado sin personalizar */
        });
    } catch {
      // localStorage corrupto: se ignora
    }
  }, [sorteoId]);

  const numeroMostrado = resultado.desierto
    ? resultado.numeroGanador
    : resultado.numeroPremiado!;
  const gane =
    miNumero !== null && !resultado.desierto && miNumero === resultado.numeroPremiado;
  const semilla = `${sorteoId}-${numeroMostrado}`;

  const mensaje = gane
    ? elegirVariante(MENSAJES.resultadoPropio(numeroMostrado, resultado.premio), semilla)
    : resultado.desierto
      ? elegirVariante(MENSAJES.resultadoSinGanador(numeroMostrado), semilla)
      : elegirVariante(
          MENSAJES.resultadoConGanador(numeroMostrado, resultado.premio),
          semilla,
        );

  return (
    <div className="flex flex-col gap-4">
      <Peggie mensaje={mensaje} />
      <Card className="text-center">
        <p className="font-mono text-xs uppercase tracking-wide text-muted">
          {resultado.desierto ? "Número sorteado" : "Número ganador"}
        </p>
        <p className="my-1 font-mono text-5xl font-bold text-primary">{numeroMostrado}</p>
        <p className="text-sm text-muted">{resultado.premio}</p>
        {resultado.numeroGanador !== resultado.numeroPremiado && !resultado.desierto && (
          <p className="mt-2 text-xs text-muted">
            Salió el {resultado.numeroGanador} — como nadie lo tenía, se lo llevó el
            número más cercano.
          </p>
        )}
      </Card>
      <Button
        variant="primary"
        block
        onClick={() => window.open(whatsappUrl, "_blank", "noopener,noreferrer")}
      >
        {elegirVariante(MENSAJES.invitacionWhatsapp(), semilla)}
      </Button>
      <Link href="/" className="text-center text-sm font-semibold text-primary underline">
        Ver el próximo sorteo
      </Link>
    </div>
  );
}
