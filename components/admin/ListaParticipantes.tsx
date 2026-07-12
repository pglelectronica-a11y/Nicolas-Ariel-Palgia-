"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Modal } from "@/components/ui";

export interface ParticipanteFila {
  id: string;
  nombre: string;
  telefono: string;
  numero: number;
  creadoEn: string;
}

export interface ListaParticipantesProps {
  sorteoId: string;
  participantes: ParticipanteFila[];
}

/** A5/A6 — Sprint 1, sección 3. */
export function ListaParticipantes({ sorteoId, participantes }: ListaParticipantesProps) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [enConfirmacion, setEnConfirmacion] = useState<{
    fila: ParticipanteFila;
    accion: "liberar" | "eliminar";
  } | null>(null);
  const [cargando, setCargando] = useState(false);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return participantes;
    return participantes.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.telefono.includes(q) ||
        String(p.numero).includes(q),
    );
  }, [participantes, busqueda]);

  async function confirmar() {
    if (!enConfirmacion) return;
    setCargando(true);
    try {
      await fetch(
        `/api/admin/participaciones/${enConfirmacion.fila.id}?accion=${enConfirmacion.accion}`,
        {
          method: "DELETE",
        },
      );
      setEnConfirmacion(null);
      router.refresh();
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-ink">Participantes</h1>
      <Input
        placeholder="Buscar por nombre, teléfono o número"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      {filtrados.length === 0 ? (
        <p className="text-sm text-muted">
          {participantes.length === 0
            ? "Todavía no hay participantes."
            : "No hay resultados para esa búsqueda."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[0.62rem] uppercase text-muted">
                <th className="pb-2">Nombre</th>
                <th className="pb-2">Teléfono</th>
                <th className="pb-2">Nº</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="py-2">{p.nombre}</td>
                  <td className="py-2 text-muted">{p.telefono}</td>
                  <td className="py-2 font-mono">{p.numero}</td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      className="mr-3 font-mono text-xs text-primary underline"
                      onClick={() => setEnConfirmacion({ fila: p, accion: "liberar" })}
                    >
                      Liberar
                    </button>
                    <button
                      type="button"
                      className="font-mono text-xs text-error underline"
                      onClick={() => setEnConfirmacion({ fila: p, accion: "eliminar" })}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Button
        variant="secondary"
        className="self-start"
        onClick={() =>
          window.open(`/api/admin/sorteos/${sorteoId}/participantes/exportar`, "_blank")
        }
      >
        Exportar a Excel
      </Button>

      <Modal
        open={enConfirmacion !== null}
        onClose={() => setEnConfirmacion(null)}
        title={
          enConfirmacion
            ? `¿${enConfirmacion.accion === "liberar" ? "Liberar el número" : "Eliminar a"} ${
                enConfirmacion.accion === "liberar"
                  ? enConfirmacion.fila.numero
                  : enConfirmacion.fila.nombre
              }?`
            : ""
        }
        description="Esta acción no se puede deshacer."
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEnConfirmacion(null)}>
            Cancelar
          </Button>
          <Button variant="destructive" isLoading={cargando} onClick={confirmar}>
            Confirmar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
