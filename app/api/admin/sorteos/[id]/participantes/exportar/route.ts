import { NextResponse } from "next/server";
import { ParticipanteService } from "@/lib/services/participante-service";
import { requerirSesionApi } from "@/lib/require-auth";
import { responderError } from "@/lib/api-error";

/** GET /api/admin/sorteos/:id/participantes/exportar — A5, "Exportar a Excel". */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sorteoId } = await params;
  try {
    await requerirSesionApi();
    const csv = await ParticipanteService.exportarCsv(sorteoId);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="participantes-${sorteoId}.csv"`,
      },
    });
  } catch (error) {
    return responderError(error);
  }
}
