"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Checkbox } from "@/components/ui";

export interface EntregaPremioProps {
  sorteoId: string;
  premio: string;
  numero: number;
  ganadorNombre: string;
  ganadorTelefono: string;
  verificadoInicial: boolean;
  entregadoInicial: boolean;
}

/** A9 — Sprint 1, sección 3. */
export function EntregaPremio({
  sorteoId,
  premio,
  numero,
  ganadorNombre,
  ganadorTelefono,
  verificadoInicial,
  entregadoInicial,
}: EntregaPremioProps) {
  const router = useRouter();
  const [verificado, setVerificado] = useState(verificadoInicial);
  const [entregado, setEntregado] = useState(entregadoInicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function marcarVerificado(valor: boolean) {
    setVerificado(valor);
    await fetch(`/api/admin/sorteos/${sorteoId}/premio`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificado: valor }),
    });
    router.refresh();
  }

  async function confirmarEntrega() {
    setError(null);
    setCargando(true);
    try {
      const respuesta = await fetch(`/api/admin/sorteos/${sorteoId}/premio`, {
        method: "POST",
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setError(datos.mensaje ?? "No se pudo confirmar la entrega.");
        return;
      }
      setEntregado(true);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-ink">Entrega del premio</h1>
      <Card>
        <p className="text-sm font-semibold text-ink">
          {ganadorNombre} — Nº {numero}
        </p>
        <p className="text-xs text-muted">
          {premio} · {ganadorTelefono}
        </p>
      </Card>
      {entregado ? (
        <Alert variant="success">Premio entregado.</Alert>
      ) : (
        <>
          <Checkbox
            label="Verificado en WhatsApp"
            checked={verificado}
            onChange={(e) => marcarVerificado(e.target.checked)}
          />
          {error && <Alert variant="error">{error}</Alert>}
          <Button
            variant="primary"
            block
            disabled={!verificado}
            isLoading={cargando}
            onClick={confirmarEntrega}
          >
            Confirmar entrega
          </Button>
        </>
      )}
    </div>
  );
}
