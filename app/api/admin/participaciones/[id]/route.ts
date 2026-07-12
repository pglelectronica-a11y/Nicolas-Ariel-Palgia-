import { NextRequest, NextResponse } from "next/server";
import { ParticipanteService } from "@/lib/services/participante-service";
import { requerirSesionApi } from "@/lib/require-auth";
import { responderError } from "@/lib/api-error";

/** DELETE /api/admin/participaciones/:id?accion=liberar|eliminar — A5/A6. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: participacionId } = await params;
  const accionCruda = request.nextUrl.searchParams.get("accion");
  const accion = accionCruda === "eliminar" ? "ELIMINAR_PARTICIPANTE" : "LIBERAR_NUMERO";

  try {
    const sesion = await requerirSesionApi();
    await ParticipanteService.quitarParticipacion(
      participacionId,
      sesion.administradorId,
      accion,
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return responderError(error);
  }
}
