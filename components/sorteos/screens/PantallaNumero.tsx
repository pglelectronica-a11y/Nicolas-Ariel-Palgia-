import { Alert, Button } from "@/components/ui";
import { Peggie } from "@/components/peggie/Peggie";
import { elegirVariante, MENSAJES } from "@/components/peggie/messages";
import { NumberGrid } from "@/components/sorteos/NumberGrid";

export interface PantallaNumeroProps {
  numeroInicial: number;
  cantidadNumeros: number;
  numerosOcupados: number[];
  numeroSeleccionado: number | null;
  onSeleccionar: (numero: number) => void;
  onConfirmar: () => void;
  onVolver: () => void;
  cargando: boolean;
  error: string | null;
}

/** U4 — Sprint 1, sección 2. Elegir no reserva: la reserva ocurre recién al confirmar. */
export function PantallaNumero({
  numeroInicial,
  cantidadNumeros,
  numerosOcupados,
  numeroSeleccionado,
  onSeleccionar,
  onConfirmar,
  onVolver,
  cargando,
  error,
}: PantallaNumeroProps) {
  return (
    <div className="flex flex-col gap-4">
      <Peggie
        mensaje={elegirVariante(
          MENSAJES.elegirNumero(),
          String(numeroInicial + cantidadNumeros),
        )}
      />
      <NumberGrid
        numeroInicial={numeroInicial}
        cantidadNumeros={cantidadNumeros}
        numerosOcupados={numerosOcupados}
        numeroSeleccionado={numeroSeleccionado}
        onSeleccionar={onSeleccionar}
      />
      {error && <Alert variant="error">{error}</Alert>}
      <Button
        variant="primary"
        block
        disabled={numeroSeleccionado === null}
        isLoading={cargando}
        onClick={onConfirmar}
      >
        {numeroSeleccionado !== null
          ? `Confirmar número ${numeroSeleccionado}`
          : "Confirmar número"}
      </Button>
      <Button variant="ghost" onClick={onVolver}>
        Volver
      </Button>
    </div>
  );
}
