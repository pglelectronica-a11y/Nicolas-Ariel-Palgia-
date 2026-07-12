import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind sin colisiones (por ejemplo, dos anchos distintos
 * pasados por props y por defecto). Es infraestructura genérica, no lógica de
 * negocio: la usan todos los componentes de components/ui.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
