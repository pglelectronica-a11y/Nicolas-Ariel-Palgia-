import { PrismaClient } from "@prisma/client";

/**
 * Instancia única de Prisma Client. En desarrollo, Next.js recarga módulos
 * en caliente y cada recarga crearía una conexión nueva sin este patrón —
 * se guarda en `globalThis` para sobrevivir a esas recargas.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
