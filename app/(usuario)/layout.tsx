/**
 * Layout del grupo de rutas (usuario) — Sprint 4, sección 1.4. Contenedor
 * angosto y centrado (mobile-first), consistente en las seis pantallas de
 * usuario. Peggie se monta pantalla por pantalla, no acá: cada una necesita
 * un mensaje distinto.
 */
export default function LayoutUsuario({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 py-6 tablet:max-w-lg desktop:max-w-lg">
      <p className="mb-5 text-sm font-bold tracking-tight text-ink">PGL Club</p>
      {children}
    </div>
  );
}
