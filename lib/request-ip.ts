import type { NextRequest } from "next/server";

/**
 * Vercel (y la mayoría de los proxies) informan el cliente real en
 * `x-forwarded-for` — puede traer una cadena "cliente, proxy1, proxy2"; el
 * primero es el origen real. `NextRequest.ip` fue removido en Next 15+, por
 * eso se lee directo del header.
 */
export function obtenerIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const primero = forwardedFor?.split(",")[0]?.trim();
  return primero || request.headers.get("x-real-ip") || "desconocido";
}
