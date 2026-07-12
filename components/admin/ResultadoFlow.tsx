"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert, Button, Card, CardSubtitle, CardTitle, Input } from "@/components/ui";
import type { ResultadoObtenidoDTO } from "@/types/sorteo";

export interface ResultadoFlowProps {
  sorteoId: string;
  premio: string;
  estadoInicial: {
    resultado: ResultadoObtenidoDTO | null;
    publicado: boolean;
    modalidadGanador: "EXACTO" | "MAS_CERCANO";
  };
}

/**
 * A7 (obtener resultado) + A8 (publicar resultado) — Sprint 1. Sin Peggie:
 * es una herramienta de trabajo del administrador, no de cara al público.
 */
export function ResultadoFlow({ sorteoId, premio, estadoInicial }: ResultadoFlowProps) {
  const [resultado, setResultado] = useState<ResultadoObtenidoDTO | null>(
    estadoInicial.resultado,
  );
  const [publicado, setPublicado] = useState(estadoInicial.publicado);
  const [numero, setNumero] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function obtenerResultado() {
    setError(null);
    const numeroIngresado = Number(numero);
    if (!Number.isInteger(numeroIngresado)) {
      setError("Ingresá el número que salió en la Quiniela.");
      return;
    }
    setCargando(true);
    try {
      const respuesta = await fetch(`/api/sorteos/${sorteoId}/resultado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero: numeroIngresado }),
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setError(datos.mensaje ?? "No se pudo obtener el resultado.");
        return;
      }
      setResultado(datos.resultado);
    } finally {
      setCargando(false);
    }
  }

  async function publicar() {
    setError(null);
    setCargando(true);
    try {
      const respuesta = await fetch(`/api/sorteos/${sorteoId}/resultado`, {
        method: "PATCH",
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setError(datos.mensaje ?? "No se pudo publicar el resultado.");
        return;
      }
      setPublicado(true);
    } finally {
      setCargando(false);
    }
  }

  if (publicado && resultado) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="success">
          Resultado publicado. Ya es visible para todos los usuarios.
        </Alert>
        <ResultadoPreview premio={premio} resultado={resultado} />
        {!resultado.desierto && (
          <Link href={`/sorteos/${sorteoId}/premio`}>
            <Button variant="primary" block>
              Verificar y entregar el premio
            </Button>
          </Link>
        )}
        <Link href="/panel" className="text-center text-sm text-primary underline">
          Volver al panel
        </Link>
      </div>
    );
  }

  if (resultado) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-lg font-bold text-ink">Publicar resultado</h1>
        <ResultadoPreview premio={premio} resultado={resultado} />
        <p className="text-sm text-muted">
          Así lo van a ver los usuarios en la pantalla de resultado.
        </p>
        {error && <Alert variant="error">{error}</Alert>}
        <Button variant="primary" block isLoading={cargando} onClick={publicar}>
          Publicar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-ink">Obtener resultado</h1>
      <Card>
        <CardTitle>{premio}</CardTitle>
        <CardSubtitle>
          Fuente: Quiniela Nacional Vespertina — modalidad{" "}
          {estadoInicial.modalidadGanador === "EXACTO" ? "exacto" : "número más cercano"}
        </CardSubtitle>
      </Card>
      <Input
        label="Número que salió"
        placeholder="Ej. 47"
        inputMode="numeric"
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
      />
      {error && <Alert variant="error">{error}</Alert>}
      <Button variant="primary" block isLoading={cargando} onClick={obtenerResultado}>
        Obtener resultado
      </Button>
    </div>
  );
}

function ResultadoPreview({
  premio,
  resultado,
}: {
  premio: string;
  resultado: ResultadoObtenidoDTO;
}) {
  return (
    <Card className="text-center">
      <p className="font-mono text-xs uppercase tracking-wide text-muted">
        Número de la Quiniela: {resultado.numeroGanador}
      </p>
      {resultado.desierto ? (
        <p className="my-2 text-lg font-bold text-ink">
          Sin ganador — nadie reservó este número
        </p>
      ) : (
        <>
          <p className="my-1 font-mono text-4xl font-bold text-primary">
            {resultado.numeroPremiado}
          </p>
          <p className="text-sm text-muted">
            {resultado.ganadorNombre ?? "Ganador"} · {premio}
          </p>
        </>
      )}
    </Card>
  );
}
