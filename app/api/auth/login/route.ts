import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth-service";
import { ErrorAplicacion } from "@/lib/errors";
import { obtenerIp } from "@/lib/request-ip";

/** POST /api/auth/login — A1. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { codigo: "VALIDACION", mensaje: "Solicitud inválida." },
      { status: 400 },
    );
  }

  const { usuario, password } = body as Record<string, unknown>;

  try {
    await AuthService.iniciarSesion(usuario, password, obtenerIp(request));
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ErrorAplicacion) {
      return NextResponse.json(
        { codigo: error.codigo, mensaje: error.message },
        { status: error.estadoHttp },
      );
    }
    console.error(error);
    return NextResponse.json(
      { codigo: "INESPERADO", mensaje: "Algo no salió como esperaba." },
      { status: 500 },
    );
  }
}
