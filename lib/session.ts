import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * Sesión del administrador (Sprint 4, sección 4.1): cookie firmada,
 * HttpOnly, de solo servidor — nunca un token manejado por JavaScript del
 * cliente. Vencimiento moderado (sección 4.5): 7 días, renovado en cada
 * lectura mientras haya actividad.
 */
const NOMBRE_COOKIE = "pgl_club_session";
const DURACION_MS = 7 * 24 * 60 * 60 * 1000;

interface PayloadSesion {
  administradorId: string;
  usuario: string;
  exp: number;
}

function obtenerSecreto(): string {
  const secreto = process.env.ADMIN_SESSION_SECRET;
  if (!secreto) {
    throw new Error(
      "Falta ADMIN_SESSION_SECRET en las variables de entorno — ver .env.example.",
    );
  }
  return secreto;
}

function firmar(payload: string): string {
  return createHmac("sha256", obtenerSecreto()).update(payload).digest("hex");
}

function crearToken(datos: PayloadSesion): string {
  const payload = Buffer.from(JSON.stringify(datos)).toString("base64url");
  const firma = firmar(payload);
  return `${payload}.${firma}`;
}

function verificarToken(token: string): PayloadSesion | null {
  const [payload, firma] = token.split(".");
  if (!payload || !firma) return null;

  const firmaEsperada = firmar(payload);
  const bufA = Buffer.from(firma, "hex");
  const bufB = Buffer.from(firmaEsperada, "hex");
  if (bufA.length !== bufB.length || !timingSafeEqual(bufA, bufB)) return null;

  try {
    const datos = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    ) as PayloadSesion;
    if (typeof datos.exp !== "number" || datos.exp < Date.now()) return null;
    return datos;
  } catch {
    return null;
  }
}

export async function crearSesion(
  administradorId: string,
  usuario: string,
): Promise<void> {
  const token = crearToken({ administradorId, usuario, exp: Date.now() + DURACION_MS });
  const store = await cookies();
  store.set(NOMBRE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_MS / 1000,
  });
}

export async function obtenerSesion(): Promise<PayloadSesion | null> {
  const store = await cookies();
  const token = store.get(NOMBRE_COOKIE)?.value;
  if (!token) return null;
  return verificarToken(token);
}

export async function destruirSesion(): Promise<void> {
  const store = await cookies();
  store.delete(NOMBRE_COOKIE);
}
