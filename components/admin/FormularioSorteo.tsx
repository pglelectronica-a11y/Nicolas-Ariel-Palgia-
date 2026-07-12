"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, CardSubtitle, Input } from "@/components/ui";

export interface DatosFormularioSorteo {
  premio: string;
  imagenUrl: string;
  fechaCierre: string; // yyyy-MM-ddThh:mm, formato de <input type="datetime-local">
  numeroInicial: string;
  cantidadNumeros: string;
  modalidadGanador: "EXACTO" | "MAS_CERCANO";
}

export interface FormularioSorteoProps {
  modo: "crear" | "editar";
  sorteoId?: string;
  valoresIniciales: DatosFormularioSorteo;
  estadoActual?: string;
  cantidadReservada?: number;
}

const VALORES_VACIOS: DatosFormularioSorteo = {
  premio: "",
  imagenUrl: "",
  fechaCierre: "",
  numeroInicial: "0",
  cantidadNumeros: "100",
  modalidadGanador: "EXACTO",
};

/** A3 (crear) + A4 (editar) — mismos campos, Sprint 1 sección 3. */
export function FormularioSorteo({
  modo,
  sorteoId,
  valoresIniciales,
  estadoActual,
  cantidadReservada = 0,
}: FormularioSorteoProps) {
  const router = useRouter();
  const [valores, setValores] = useState<DatosFormularioSorteo>(
    valoresIniciales ?? VALORES_VACIOS,
  );
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function actualizar<K extends keyof DatosFormularioSorteo>(
    campo: K,
    valor: DatosFormularioSorteo[K],
  ) {
    setValores((actual) => ({ ...actual, [campo]: valor }));
  }

  async function guardar(activar: boolean) {
    setError(null);
    setCargando(true);
    try {
      const url =
        modo === "crear" ? "/api/admin/sorteos" : `/api/admin/sorteos/${sorteoId}`;
      const metodo = modo === "crear" ? "POST" : "PATCH";
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...valores, activar }),
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setError(datos.mensaje ?? "No se pudo guardar el sorteo.");
        return;
      }
      router.push("/panel");
      router.refresh();
    } finally {
      setCargando(false);
    }
  }

  const esCerrado =
    estadoActual && estadoActual !== "BORRADOR" && estadoActual !== "ACTIVO";

  if (esCerrado) {
    return (
      <Alert variant="warning">
        Este sorteo ya cerró — lo publicado no se puede volver a editar (Sprint 4, regla
        de negocio 9).
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-ink">
        {modo === "crear" ? "Crear sorteo" : "Editar sorteo"}
      </h1>
      {cantidadReservada > 0 && (
        <Card>
          <CardSubtitle>
            Ya hay {cantidadReservada} números reservados — la cantidad no puede bajar de
            eso.
          </CardSubtitle>
        </Card>
      )}
      <Input
        label="Premio"
        value={valores.premio}
        onChange={(e) => actualizar("premio", e.target.value)}
      />
      <Input
        label="Imagen (URL, opcional)"
        value={valores.imagenUrl}
        onChange={(e) => actualizar("imagenUrl", e.target.value)}
      />
      <Input
        label="Fecha y hora de cierre"
        type="datetime-local"
        value={valores.fechaCierre}
        onChange={(e) => actualizar("fechaCierre", e.target.value)}
      />
      <Input
        label="Número inicial"
        type="number"
        value={valores.numeroInicial}
        onChange={(e) => actualizar("numeroInicial", e.target.value)}
      />
      <Input
        label="Cantidad de números"
        type="number"
        value={valores.cantidadNumeros}
        onChange={(e) => actualizar("cantidadNumeros", e.target.value)}
      />
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[0.66rem] uppercase tracking-wider text-muted">
          Modalidad de determinación del ganador
        </label>
        <select
          value={valores.modalidadGanador}
          onChange={(e) =>
            actualizar("modalidadGanador", e.target.value as "EXACTO" | "MAS_CERCANO")
          }
          className="h-11 rounded-sm border border-border-strong bg-surface px-3 text-[0.92rem] text-ink"
        >
          <option value="EXACTO">Exacto (puede quedar desierto)</option>
          <option value="MAS_CERCANO">Número más cercano (siempre hay ganador)</option>
        </select>
      </div>
      {error && <Alert variant="error">{error}</Alert>}
      {modo === "crear" || estadoActual === "BORRADOR" ? (
        <Button
          variant="primary"
          block
          isLoading={cargando}
          onClick={() => guardar(true)}
        >
          Guardar y activar
        </Button>
      ) : (
        <Button
          variant="primary"
          block
          isLoading={cargando}
          onClick={() => guardar(false)}
        >
          Guardar cambios
        </Button>
      )}
      <Button variant="ghost" onClick={() => router.push("/panel")}>
        Cancelar
      </Button>
    </div>
  );
}
