import { NextResponse } from "next/server";
import { AdminSorteoService } from "@/lib/services/admin-sorteo-service";
import { requerirSesionApi } from "@/lib/require-auth";
import { responderError } from "@/lib/api-error";

/** POST /api/admin/sorteos/:id/duplicar — A10. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sorteoId } = await params;
  try {
    const sesion = await requerirSesionApi();
    const nuevo = await AdminSorteoService.duplicarSorteo(
      sorteoId,
      sesion.administradorId,
    );
    return NextResponse.json({ sorteo: nuevo }, { status: 201 });
  } catch (error) {
    return responderError(error);
  }
}
