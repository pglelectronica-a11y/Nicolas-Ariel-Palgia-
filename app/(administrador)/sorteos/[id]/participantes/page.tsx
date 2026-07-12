import { requerirSesionPagina } from "@/lib/require-auth";
import { ParticipanteService } from "@/lib/services/participante-service";
import { ListaParticipantes } from "@/components/admin/ListaParticipantes";

export const dynamic = "force-dynamic";

/** A5 — Sprint 1, sección 3. */
export default async function PaginaParticipantes({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sorteoId } = await params;
  await requerirSesionPagina(`/sorteos/${sorteoId}/participantes`);

  const participantes = await ParticipanteService.listarParticipantes(sorteoId);

  return <ListaParticipantes sorteoId={sorteoId} participantes={participantes} />;
}
