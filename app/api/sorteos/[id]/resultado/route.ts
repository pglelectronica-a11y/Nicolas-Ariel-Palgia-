import { NextRequest, NextResponse } from "next/server";
import { ResultadoService } from "@/lib/services/resultado-service";
import { requerirSesionApi } from "@/lib/require-auth";
import { responderError } from "@/lib/api-error";

/** GET /api/sorteos/:id/resultado — U6, resultado público (null si no se publicó). Sin auth: es de cara al usuario. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sorteoId } = await params;
  const resultado = await ResultadoService.obtenerResultadoPublico(sorteoId);
  return NextResponse.json({ resultado });
}

/** POST /api/sorteos/:id/resultado — A7, cruza el número ingresado contra las participaciones. Requiere sesión. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sorteoId } = await params;

  try {
    await requerirSesionApi();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { codigo: "VALIDACION", mensaje: "Solicitud inválida." },
        { status: 400 },
      );
    }

    const { numero } = body as Record<string, unknown>;
    const numeroIngresado = Number(numero);
    if (!Number.isInteger(numeroIngresado)) {
      return NextResponse.json(
        { codigo: "VALIDACION", mensaje: "Ingresá el número que salió en la Quiniela." },
        { status: 400 },
      );
    }

    const resultado = await ResultadoService.calcularResultado(sorteoId, numeroIngresado);
    return NextResponse.json({ resultado }, { status: 201 });
  } catch (error) {
    return responderError(error);
  }
}

/** PATCH /api/sorteos/:id/resultado — A8, publica el resultado ya calculado. Requiere sesión. */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sorteoId } = await params;
  try {
    const sesion = await requerirSesionApi();
    await ResultadoService.publicarResultado(sorteoId, sesion.administradorId);
    return NextResponse.json({ publicado: true });
  } catch (error) {
    return responderError(error);
  }
}
