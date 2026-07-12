import { NextRequest, NextResponse } from "next/server";
import { registrarEventoMetrica } from "@/lib/services/metrica-service";
import { responderError } from "@/lib/api-error";

/**
 * POST /api/metricas/click-whatsapp
 * Registra un clic hacia el canal de WhatsApp (Sprint 4, sección 5.3).
 * Se dispara desde el cliente en el mismo momento en que se abre el enlace
 * (`ParticipacionFlow.abrirWhatsapp`) — nunca bloquea esa acción.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { sorteoId } = body as Record<string, unknown>;

  try {
    await registrarEventoMetrica({
      tipo: "CONVERSION_WHATSAPP",
      sorteoId: typeof sorteoId === "string" ? sorteoId : null,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return responderError(error);
  }
}
