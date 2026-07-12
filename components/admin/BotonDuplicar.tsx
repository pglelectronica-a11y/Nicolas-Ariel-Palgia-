"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BotonDuplicar({ sorteoId }: { sorteoId: string }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function duplicar() {
    setCargando(true);
    try {
      const respuesta = await fetch(`/api/admin/sorteos/${sorteoId}/duplicar`, {
        method: "POST",
      });
      const datos = await respuesta.json();
      if (respuesta.ok) {
        router.push(`/sorteos/${datos.sorteo.id}/editar`);
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={duplicar}
      disabled={cargando}
      className="text-xs font-semibold text-primary underline disabled:opacity-40"
    >
      {cargando ? "Duplicando…" : "Duplicar"}
    </button>
  );
}
