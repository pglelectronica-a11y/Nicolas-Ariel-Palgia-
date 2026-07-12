"use client";

import { useEffect, useState } from "react";

export interface CountdownTimerProps {
  fechaCierre: string; // ISO
}

function formatear(msRestante: number): string {
  if (msRestante <= 0) return "Cerrando...";
  const totalMin = Math.floor(msRestante / 60000);
  const dias = Math.floor(totalMin / (60 * 24));
  const horas = Math.floor((totalMin % (60 * 24)) / 60);
  const minutos = totalMin % 60;
  if (dias > 0) return `${dias}d ${horas}h`;
  if (horas > 0) return `${horas}h ${minutos}m`;
  return `${minutos}m`;
}

/**
 * Contador regresivo (Sprint 3, sección 8.3): sensación de oportunidad real
 * con datos concretos, sin mensajes de presión. Arranca sin texto en el
 * primer render (servidor y cliente coinciden) y recién en el cliente, ya
 * montado, calcula el tiempo real — mismo patrón que hooks/use-theme.ts.
 */
export function CountdownTimer({ fechaCierre }: CountdownTimerProps) {
  const [texto, setTexto] = useState<string | null>(null);

  useEffect(() => {
    const cierre = new Date(fechaCierre).getTime();
    function actualizar() {
      setTexto(formatear(cierre - Date.now()));
    }
    actualizar();
    const intervalo = setInterval(actualizar, 60_000);
    return () => clearInterval(intervalo);
  }, [fechaCierre]);

  return (
    <span className="font-mono text-xs font-semibold text-primary">{texto ?? "…"}</span>
  );
}
