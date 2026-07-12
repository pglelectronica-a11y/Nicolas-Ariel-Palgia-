import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/**
 * Hashing de contraseñas con `crypto.scrypt` (Node, sin dependencias
 * nuevas) — Sprint 4, sección 4.1: "la contraseña se almacena como hash,
 * nunca en texto plano". Formato guardado: "salt:hash", ambos en hex.
 */
const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, almacenado: string): boolean {
  const [salt, hash] = almacenado.split(":");
  if (!salt || !hash) return false;
  const hashIntento = scryptSync(password, salt, KEYLEN);
  const hashGuardado = Buffer.from(hash, "hex");
  if (hashIntento.length !== hashGuardado.length) return false;
  // timingSafeEqual evita que un atacante infiera la contraseña midiendo
  // cuánto tarda la comparación carácter por carácter.
  return timingSafeEqual(hashIntento, hashGuardado);
}
