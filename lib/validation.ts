import { ErrorAplicacion } from "@/lib/errors";

/**
 * Validaciones de negocio repetidas en el servidor (Sprint 4, sección 4.3):
 * nunca se confía únicamente en lo ya validado en pantalla.
 */

export function validarNombre(nombre: unknown): string {
  if (
    typeof nombre !== "string" ||
    nombre.trim().length < 2 ||
    nombre.trim().length > 80
  ) {
    throw new ErrorAplicacion(
      "VALIDACION",
      "Contanos tu nombre para poder identificarte.",
    );
  }
  return nombre.trim();
}

/** Acepta números de celular argentinos con o sin espacios/guiones, 8 a 13 dígitos. */
export function validarTelefono(telefono: unknown): string {
  if (typeof telefono !== "string") {
    throw new ErrorAplicacion(
      "VALIDACION",
      "Revisá tu número de celular, parece incompleto.",
    );
  }
  const soloDigitos = telefono.replace(/[^\d]/g, "");
  if (soloDigitos.length < 8 || soloDigitos.length > 13) {
    throw new ErrorAplicacion(
      "VALIDACION",
      "Revisá tu número de celular, parece incompleto.",
    );
  }
  return soloDigitos;
}

export function validarNumero(
  numero: unknown,
  numeroInicial: number,
  cantidadNumeros: number,
): number {
  const valor = Number(numero);
  const numeroFinal = numeroInicial + cantidadNumeros - 1;
  if (!Number.isInteger(valor) || valor < numeroInicial || valor > numeroFinal) {
    throw new ErrorAplicacion("VALIDACION", "Ese número no es válido para este sorteo.");
  }
  return valor;
}
