import { NextRequest, NextResponse } from "next/server";
import { ParticipacionService } from "@/lib/services/participacion-service";
import { responderError } from "@/lib/api-error";
import { obtenerIp } from "@/lib/request-ip";

const MENSAJE_INESPERADO = "Uy, algo no salió como esperaba. Volvamos a intentar.";

/**
 * GET /api/sorteos/:id/participaciones?telefono=...
 * Usado por U3 para detectar "ya estás participando con este número"
 * antes de dejar avanzar a elegir número (Sprint 1, pantalla U3).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sorteoId } = await params;
  const telefono = request.nextUrl.searchParams.get("telefono");

  if (!telefono) {
    return NextResponse.json(
      { codigo: "VALIDACION", mensaje: "Falta el teléfono." },
      { status: 400 },
    );
  }

  try {
    const participacion = await ParticipacionService.buscarParticipacionPorTelefono(
      sorteoId,
      telefono,
    );
    return NextResponse.json({ participacion });
  } catch (error) {
    return responderError(error, MENSAJE_INESPERADO);
  }
}

/**
 * POST /api/sorteos/:id/participaciones
 * Reserva un número en firme (Sprint 1, pantalla U4). Body: { nombre, telefono, numero }.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sorteoId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { codigo: "VALIDACION", mensaje: "Solicitud inválida." },
      { status: 400 },
    );
  }

  const { nombre, telefono, numero } = body as Record<string, unknown>;

  try {
    const participacion = await ParticipacionService.reservarNumero(
      sorteoId,
      { nombre, telefono, numero },
      obtenerIp(request),
    );
    return NextResponse.json({ participacion }, { status: 201 });
  } catch (error) {
    return responderError(error, MENSAJE_INESPERADO);
  }
}
