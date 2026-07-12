import { prisma } from "@/lib/prisma";
import type { SorteoActivoDTO, UltimoResultadoDTO } from "@/types/sorteo";

/**
 * Reglas de negocio del sorteo (Sprint 4, sección 2.1). "El cierre es
 * automático" (sección 2.2): un sorteo con fecha de cierre ya pasada nunca
 * se considera activo, sin importar lo que diga el campo `estado` — se
 * recalcula en cada lectura, no depende de una tarea programada.
 */
export const SorteoService = {
  async obtenerSorteoActivo(): Promise<SorteoActivoDTO | null> {
    const sorteo = await prisma.sorteo.findFirst({
      where: { estado: "ACTIVO", fechaCierre: { gt: new Date() } },
      orderBy: { creadoEn: "desc" },
      include: { participaciones: { select: { numero: true } } },
    });

    if (!sorteo) return null;

    return {
      id: sorteo.id,
      premio: sorteo.premio,
      imagenUrl: sorteo.imagenUrl,
      fechaCierre: sorteo.fechaCierre.toISOString(),
      numeroInicial: sorteo.numeroInicial,
      cantidadNumeros: sorteo.cantidadNumeros,
      numerosOcupados: sorteo.participaciones.map((p) => p.numero),
    };
  },

  /** Para U2 — "Mirá quién ganó la semana pasada" (Sprint 1, sección 2.2). */
  async obtenerUltimoResultadoPublicado(): Promise<UltimoResultadoDTO | null> {
    const resultado = await prisma.resultado.findFirst({
      where: { publicadoEn: { not: null } },
      orderBy: { publicadoEn: "desc" },
      include: { sorteo: { select: { id: true, premio: true } } },
    });

    if (!resultado) return null;

    return {
      sorteoId: resultado.sorteo.id,
      premio: resultado.sorteo.premio,
      numeroPremiado: resultado.numeroPremiado,
      publicadoEn: resultado.publicadoEn?.toISOString() ?? null,
    };
  },
};
