import { prisma } from "@/lib/prisma";

export interface PoliticaLimite {
  maxIntentos: number;
  ventanaMs: number;
  bloqueoMs: number;
}

export interface EstadoBloqueo {
  bloqueado: boolean;
  segundosRestantes?: number;
}

/**
 * Límite de intentos genérico, respaldado en Postgres (Módulo 6 — Sprint 4,
 * sección 6). `clave` identifica el recurso protegido (por ejemplo
 * `login:admin:190.191.1.1` o `participar:190.191.1.1`) — la misma tabla
 * sirve para login y para el endpoint público de participación, cada uno
 * con su propia política de ventana/bloqueo.
 */
export const LimitadorService = {
  async verificarBloqueo(clave: string): Promise<EstadoBloqueo> {
    const registro = await prisma.intentoAcceso.findUnique({ where: { clave } });
    if (!registro?.bloqueadoHasta || registro.bloqueadoHasta <= new Date()) {
      return { bloqueado: false };
    }
    return {
      bloqueado: true,
      segundosRestantes: Math.ceil(
        (registro.bloqueadoHasta.getTime() - Date.now()) / 1000,
      ),
    };
  },

  async registrarIntento(clave: string, politica: PoliticaLimite): Promise<void> {
    const ahora = new Date();
    const registro = await prisma.intentoAcceso.findUnique({ where: { clave } });

    const ventanaVencida =
      !registro ||
      (registro.bloqueadoHasta !== null && registro.bloqueadoHasta <= ahora) ||
      ahora.getTime() - registro.primerIntento.getTime() > politica.ventanaMs;

    if (ventanaVencida) {
      await prisma.intentoAcceso.upsert({
        where: { clave },
        create: { clave, intentos: 1, primerIntento: ahora, bloqueadoHasta: null },
        update: { intentos: 1, primerIntento: ahora, bloqueadoHasta: null },
      });
      return;
    }

    const intentos = registro.intentos + 1;
    await prisma.intentoAcceso.update({
      where: { clave },
      data: {
        intentos,
        bloqueadoHasta:
          intentos >= politica.maxIntentos
            ? new Date(ahora.getTime() + politica.bloqueoMs)
            : null,
      },
    });
  },

  async resetear(clave: string): Promise<void> {
    await prisma.intentoAcceso.deleteMany({ where: { clave } });
  },
};
