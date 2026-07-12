"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface NumberGridProps {
  numeroInicial: number;
  cantidadNumeros: number;
  numerosOcupados: number[];
  numeroSeleccionado: number | null;
  onSeleccionar: (numero: number) => void;
}

/**
 * Grilla de números — siempre construida a partir de `numeroInicial` y
 * `cantidadNumeros` del sorteo (Sprint 4, sección 3.5). Nunca hay un rango
 * fijo acá: un sorteo de 1 a 50 o de 000 a 999 usa exactamente el mismo
 * componente. No sabe quién ocupa cada número (Sprint 1, U4) — solo si
 * está libre.
 */
export function NumberGrid({
  numeroInicial,
  cantidadNumeros,
  numerosOcupados,
  numeroSeleccionado,
  onSeleccionar,
}: NumberGridProps) {
  const ocupados = useMemo(() => new Set(numerosOcupados), [numerosOcupados]);
  const numeros = useMemo(
    () => Array.from({ length: cantidadNumeros }, (_, i) => numeroInicial + i),
    [numeroInicial, cantidadNumeros],
  );

  return (
    <div
      className="grid grid-cols-8 gap-1.5"
      role="group"
      aria-label="Números disponibles"
    >
      {numeros.map((numero) => {
        const ocupado = ocupados.has(numero);
        const seleccionado = numeroSeleccionado === numero;
        return (
          <button
            key={numero}
            type="button"
            disabled={ocupado}
            aria-pressed={seleccionado}
            onClick={() => onSeleccionar(numero)}
            className={cn(
              "aspect-square rounded-sm border font-mono text-xs font-semibold transition-all duration-fast ease-standard",
              ocupado
                ? "cursor-not-allowed border-dashed border-border-strong bg-surface-2 text-faint"
                : "border-border-strong bg-surface text-ink hover:-translate-y-px",
              seleccionado && "scale-105 border-primary bg-primary text-white shadow-1",
            )}
          >
            {numero}
          </button>
        );
      })}
    </div>
  );
}
