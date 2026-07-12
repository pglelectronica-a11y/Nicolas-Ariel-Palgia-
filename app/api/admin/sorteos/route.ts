import { NextRequest, NextResponse } from "next/server";
import { AdminSorteoService } from "@/lib/services/admin-sorteo-service";
import { requerirSesionApi } from "@/lib/require-auth";
import { responderError } from "@/lib/api-error";

/** POST /api/admin/sorteos — A3. */
export async function POST(request: NextRequest) {
  try {
    const sesion = await requerirSesionApi();
    const body = await request.json().catch(() => ({}));
    const sorteo = await AdminSorteoService.crearSorteo(body, sesion.administradorId);
    return NextResponse.json({ sorteo }, { status: 201 });
  } catch (error) {
    return responderError(error);
  }
}
