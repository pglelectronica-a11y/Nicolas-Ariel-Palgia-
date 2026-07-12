import { NextResponse } from "next/server";
import { ErrorAplicacion } from "@/lib/errors";

/**
 * Traduce cualquier error de un Route Handler a la respuesta JSON estándar.
 * `mensajeInesperado` permite mantener la voz de Peggie en los endpoints de
 * cara al usuario, y un tono más neutro en los de administración.
 */
export function responderError(
  error: unknown,
  mensajeInesperado = "Algo no salió como esperaba.",
) {
  if (error instanceof ErrorAplicacion) {
    return NextResponse.json(
      { codigo: error.codigo, mensaje: error.message },
      { status: error.estadoHttp },
    );
  }
  console.error(error);
  return NextResponse.json(
    { codigo: "INESPERADO", mensaje: mensajeInesperado },
    { status: 500 },
  );
}
