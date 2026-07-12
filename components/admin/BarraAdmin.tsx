"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export interface BarraAdminProps {
  usuario: string;
}

/** Barra superior del panel: quién está conectado + accesos + salir. */
export function BarraAdmin({ usuario }: BarraAdminProps) {
  const router = useRouter();

  async function salir() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <p className="font-mono text-xs uppercase tracking-wide text-muted">
          PGL Club — Administración
        </p>
        <Link href="/panel" className="text-xs font-semibold text-primary underline">
          Panel
        </Link>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted">
        <span>{usuario}</span>
        <button
          type="button"
          onClick={salir}
          className="font-semibold text-primary underline"
        >
          Salir
        </button>
      </div>
    </div>
  );
}
