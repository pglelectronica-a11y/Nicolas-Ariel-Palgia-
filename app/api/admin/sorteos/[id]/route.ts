import { NextRequest, NextResponse } from "next/server";
import {
  AdminSorteoService,
  type DatosSorteo,
} from "@/lib/services/admin-sorteo-service";
import { requerirSesionApi } from "@/lib/require-auth";
import { responderError } from "@/lib/api-error";

/** PATCH /api/admin/sorteos/:id — A4. Body incluye `activar: boolean`. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sorteoId } = await params;
  try {
    const sesion = await requerirSesionApi();
    const body = await request.json().catch(() => ({}));
    const { activar, ...datos } = body as Record<string, unknown>;
    const sorteo = await AdminSorteoService.editarSorteo(
      sorteoId,
      datos as unknown as DatosSorteo,
      sesion.administradorId,
      Boolean(activar),
    );
    return NextResponse.json({ sorteo });
  } catch (error) {
    return responderError(error);
  }
}
