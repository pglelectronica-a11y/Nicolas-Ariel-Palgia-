import { obtenerSesion } from "@/lib/session";
import { BarraAdmin } from "@/components/admin/BarraAdmin";

/**
 * Layout del grupo de rutas (administrador) — Sprint 4, sección 1.4. Sin
 * Peggie a propósito (Sprint 1, sección 4: nunca aparece en el panel).
 * `/login` comparte este layout pero todavía no hay sesión ahí — la barra
 * con usuario/salir solo aparece si `obtenerSesion()` encuentra una.
 */
export default async function LayoutAdministrador({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await obtenerSesion();

  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-4 py-6">
      {sesion ? (
        <BarraAdmin usuario={sesion.usuario} />
      ) : (
        <p className="mb-5 font-mono text-xs uppercase tracking-wide text-muted">
          PGL Club — Administración
        </p>
      )}
      {children}
    </div>
  );
}
