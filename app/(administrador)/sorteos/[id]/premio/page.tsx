import { notFound } from "next/navigation";
import { requerirSesionPagina } from "@/lib/require-auth";
import { ResultadoService } from "@/lib/services/resultado-service";
import { ErrorAplicacion } from "@/lib/errors";
import { EntregaPremio } from "@/components/admin/EntregaPremio";

export const dynamic = "force-dynamic";

/** A9 — Sprint 1, sección 3. */
export default async function PaginaPremio({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sorteoId } = await params;
  await requerirSesionPagina(`/sorteos/${sorteoId}/premio`);

  let ganador;
  try {
    ganador = await ResultadoService.obtenerGanadorParaEntrega(sorteoId);
  } catch (error) {
    if (error instanceof ErrorAplicacion && error.codigo === "SORTEO_SIN_RESULTADO") {
      notFound();
    }
    throw error;
  }

  return (
    <EntregaPremio
      sorteoId={sorteoId}
      premio={ganador.premio}
      numero={ganador.numero}
      ganadorNombre={ganador.ganadorNombre}
      ganadorTelefono={ganador.ganadorTelefono}
      verificadoInicial={ganador.verificadoWhatsapp}
      entregadoInicial={ganador.premioEntregado}
    />
  );
}
