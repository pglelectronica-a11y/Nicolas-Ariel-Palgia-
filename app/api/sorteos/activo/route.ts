import { NextResponse } from "next/server";
import { SorteoService } from "@/lib/services/sorteo-service";

/**
 * GET /api/sorteos/activo
 * Capa de exposición (Sprint 4, sección 2.1): solo llama al servicio y
 * devuelve la respuesta — ninguna regla de negocio vive acá.
 */
export async function GET() {
  const [sorteoActivo, ultimoResultado] = await Promise.all([
    SorteoService.obtenerSorteoActivo(),
    SorteoService.obtenerUltimoResultadoPublicado(),
  ]);

  return NextResponse.json({ sorteoActivo, ultimoResultado });
}
