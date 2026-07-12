import { prisma } from "@/lib/prisma";

/** Lectura de parámetros globales (Sprint 4, sección 3.8) — clave/valor, sin lógica adicional. */
export const ConfiguracionService = {
  async obtenerValor(clave: string): Promise<string | null> {
    const fila = await prisma.configuracion.findUnique({ where: { clave } });
    return fila?.valor ?? null;
  },
};
