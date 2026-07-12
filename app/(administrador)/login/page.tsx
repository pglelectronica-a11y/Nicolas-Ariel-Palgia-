"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Input } from "@/components/ui";

/** A1 — Sprint 1, sección 3. */
function FormularioLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ingresar() {
    setError(null);
    setCargando(true);
    try {
      const respuesta = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setError(datos.mensaje ?? "Usuario o contraseña incorrectos.");
        return;
      }
      const redirigir = searchParams.get("redirigir") ?? "/panel";
      router.push(redirigir);
      router.refresh();
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-ink">Ingresar</h1>
      <Input
        label="Usuario"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
        autoComplete="username"
      />
      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        onKeyDown={(e) => e.key === "Enter" && ingresar()}
      />
      {error && <Alert variant="error">{error}</Alert>}
      <Button variant="primary" block isLoading={cargando} onClick={ingresar}>
        Ingresar
      </Button>
    </div>
  );
}

export default function PaginaLogin() {
  return (
    <Suspense>
      <FormularioLogin />
    </Suspense>
  );
}
