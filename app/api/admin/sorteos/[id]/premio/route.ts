import { NextRequest, NextResponse } from "next/server";
import { ResultadoService } from "@/lib/services/resultado-service";
import { requerirSesionApi } from "@/lib/require-auth";
import { responderError } from "@/lib/api-error";

/** PATCH /api/admin/sorteos/:id/premio — A9, paso 1: marcar verificado en WhatsApp. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sorteoId } = await params;
  try {
    await requerirSesionApi();
    const { verificado } = await request.json().catch(() => ({ verificado: false }));
    await ResultadoService.marcarVerificadoWhatsapp(sorteoId, Boolean(verificado));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return responderError(error);
  }
}

/** POST /api/admin/sorteos/:id/premio — A9, paso 2: confirmar entrega. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sorteoId } = await params;
  try {
    const sesion = await requerirSesionApi();
    await ResultadoService.confirmarEntregaPremio(sorteoId, sesion.administradorId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return responderError(error);
  }
}
