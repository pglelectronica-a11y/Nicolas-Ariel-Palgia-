import { notFound } from "next/navigation";
import { ResultadoService } from "@/lib/services/resultado-service";
import { ResultadoFlow } from "@/components/admin/ResultadoFlow";
import { requerirSesionPagina } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

/** A7 + A8 — Sprint 1, pantallas A7 y A8. */
export default async function PaginaResultado({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sorteoId } = await params;
  await requerirSesionPagina(`/sorteos/${sorteoId}/resultado`);

  const estado = await ResultadoService.obtenerEstadoAdmin(sorteoId);
  if (!estado) notFound();

  return (
    <ResultadoFlow sorteoId={sorteoId} premio={estado.premio} estadoInicial={estado} />
  );
}
