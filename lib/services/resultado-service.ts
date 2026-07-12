import { prisma } from "@/lib/prisma";
import { ErrorAplicacion } from "@/lib/errors";
import { ResultadoExternoService } from "@/lib/services/resultado-externo-service";
import { registrarAuditoria } from "@/lib/services/auditoria-service";
import { NotificacionesService } from "@/lib/services/notificaciones-service";
import type {
  ResultadoObtenidoDTO,
  ResultadoPublicoDTO,
  SorteoListoParaResultadoDTO,
} from "@/types/sorteo";
import type { Participacion, Usuario } from "@prisma/client";

type ParticipacionConUsuario = Participacion & { usuario: Usuario };

/**
 * Determina y publica el ganador de un sorteo (Sprint 4, sección 3.6).
 * `ResultadoService` nunca acepta un ganador manual (Sprint 4, sección 2.2,
 * tabla de reglas): solo cruza un número contra las participaciones. El
 * único dato que entra "a mano" es el número de la Quiniela, a través de
 * `ResultadoExternoService`.
 */
export const ResultadoService = {
  /** A7 — sorteos cuya fecha de cierre ya pasó y todavía no tienen resultado. */
  async obtenerSorteosListosParaResultado(): Promise<SorteoListoParaResultadoDTO[]> {
    const sorteos = await prisma.sorteo.findMany({
      where: { estado: "ACTIVO", fechaCierre: { lte: new Date() } },
      include: { _count: { select: { participaciones: true } } },
      orderBy: { fechaCierre: "asc" },
    });

    return sorteos.map((sorteo) => ({
      id: sorteo.id,
      premio: sorteo.premio,
      fechaCierre: sorteo.fechaCierre.toISOString(),
      modalidadGanador: sorteo.modalidadGanador,
      cantidadParticipantes: sorteo._count.participaciones,
    }));
  },

  /** Estado actual del sorteo para A7/A8: si ya se calculó resultado y si ya se publicó. */
  async obtenerEstadoAdmin(sorteoId: string) {
    const sorteo = await prisma.sorteo.findUnique({
      where: { id: sorteoId },
      include: { resultado: true },
    });
    if (!sorteo) return null;

    return {
      sorteoId: sorteo.id,
      premio: sorteo.premio,
      modalidadGanador: sorteo.modalidadGanador,
      resultado: sorteo.resultado
        ? {
            sorteoId: sorteo.id,
            premio: sorteo.premio,
            numeroGanador: sorteo.resultado.numeroGanador,
            numeroPremiado: sorteo.resultado.numeroPremiado,
            ganadorNombre: null, // no hace falta en esta vista de estado — se completa al calcular
            desierto: sorteo.resultado.participacionId === null,
          }
        : null,
      publicado: sorteo.resultado?.publicadoEn != null,
    };
  },

  /**
   * Cruza el número de la Quiniela contra las participaciones del sorteo y
   * deja el resultado listo para revisar en A8 — todavía no lo publica.
   */
  async calcularResultado(
    sorteoId: string,
    numeroIngresado: number,
  ): Promise<ResultadoObtenidoDTO> {
    const sorteo = await prisma.sorteo.findUnique({ where: { id: sorteoId } });
    if (!sorteo) {
      throw new ErrorAplicacion("SORTEO_NO_ENCONTRADO", "Este sorteo no existe.");
    }

    // Se chequea primero si ya existe un resultado: una vez calculado, el
    // sorteo pasa a "RESULTADO_OBTENIDO" y ya no es "ACTIVO", así que el
    // chequeo de cierre de abajo también sería cierto — pero el motivo real
    // del rechazo es otro, y el mensaje tiene que reflejarlo.
    const yaExiste = await prisma.resultado.findUnique({ where: { sorteoId } });
    if (yaExiste) {
      throw new ErrorAplicacion(
        "RESULTADO_YA_OBTENIDO",
        "Ya se obtuvo un resultado para este sorteo.",
      );
    }

    if (sorteo.estado !== "ACTIVO" || sorteo.fechaCierre > new Date()) {
      throw new ErrorAplicacion("SORTEO_NO_CERRADO", "Este sorteo todavía no cerró.");
    }

    const { numero: numeroGanador } =
      await ResultadoExternoService.obtenerNumeroDelDia(numeroIngresado);

    const participaciones = await prisma.participacion.findMany({
      where: { sorteoId },
      include: { usuario: true },
    });

    const ganador =
      sorteo.modalidadGanador === "EXACTO"
        ? (participaciones.find((p) => p.numero === numeroGanador) ?? null)
        : encontrarMasCercano(participaciones, numeroGanador);

    await prisma.$transaction([
      prisma.resultado.create({
        data: {
          sorteoId,
          numeroGanador,
          numeroPremiado: ganador?.numero ?? null,
          participacionId: ganador?.id ?? null,
        },
      }),
      prisma.sorteo.update({
        where: { id: sorteoId },
        data: { estado: "RESULTADO_OBTENIDO" },
      }),
    ]);

    return {
      sorteoId,
      premio: sorteo.premio,
      numeroGanador,
      numeroPremiado: ganador?.numero ?? null,
      ganadorNombre: ganador?.usuario.nombre ?? null,
      desierto: ganador === null,
    };
  },

  /** A8 — hace visible el resultado para todos los usuarios (U6). */
  async publicarResultado(sorteoId: string, administradorId: string): Promise<void> {
    const resultado = await prisma.resultado.findUnique({
      where: { sorteoId },
      include: { sorteo: { select: { premio: true } } },
    });
    if (!resultado) {
      throw new ErrorAplicacion(
        "SORTEO_SIN_RESULTADO",
        "Todavía no se obtuvo el resultado de este sorteo.",
      );
    }
    if (resultado.publicadoEn) {
      throw new ErrorAplicacion(
        "RESULTADO_YA_PUBLICADO",
        "Este resultado ya fue publicado.",
      );
    }

    await prisma.$transaction([
      prisma.resultado.update({
        where: { id: resultado.id },
        data: { publicadoEn: new Date() },
      }),
      prisma.sorteo.update({
        where: { id: sorteoId },
        data: { estado: resultado.participacionId ? "PUBLICADO" : "DESIERTO" },
      }),
    ]);

    await registrarAuditoria({
      administradorId,
      accion: "PUBLICAR_RESULTADO",
      entidadTipo: "SORTEO",
      entidadId: sorteoId,
      detalle: resultado.participacionId
        ? `Resultado publicado para "${resultado.sorteo.premio}": número premiado ${resultado.numeroPremiado}.`
        : `Resultado publicado para "${resultado.sorteo.premio}": sorteo desierto.`,
    });

    await NotificacionesService.anunciarResultado(
      sorteoId,
      resultado.sorteo.premio,
      resultado.participacionId === null,
    );
  },

  /** A9 — datos del ganador para verificar y confirmar la entrega del premio. */
  async obtenerGanadorParaEntrega(sorteoId: string) {
    const resultado = await prisma.resultado.findUnique({
      where: { sorteoId },
      include: {
        sorteo: { select: { premio: true } },
        participacion: { include: { usuario: true } },
      },
    });
    if (!resultado) {
      throw new ErrorAplicacion(
        "SORTEO_SIN_RESULTADO",
        "Todavía no se obtuvo el resultado de este sorteo.",
      );
    }
    if (!resultado.participacionId || !resultado.participacion) {
      throw new ErrorAplicacion(
        "SORTEO_SIN_RESULTADO",
        "Este sorteo quedó desierto — no hay premio para entregar.",
      );
    }

    return {
      premio: resultado.sorteo.premio,
      numero: resultado.participacion.numero,
      ganadorNombre: resultado.participacion.usuario.nombre,
      ganadorTelefono: resultado.participacion.usuario.telefono,
      verificadoWhatsapp: resultado.verificadoWhatsapp,
      premioEntregado: resultado.premioEntregado,
    };
  },

  /** A9 — primer paso: marcar que se confirmó la membresía en WhatsApp. */
  async marcarVerificadoWhatsapp(sorteoId: string, verificado: boolean): Promise<void> {
    const resultado = await prisma.resultado.findUnique({ where: { sorteoId } });
    if (!resultado) {
      throw new ErrorAplicacion(
        "SORTEO_SIN_RESULTADO",
        "Todavía no se obtuvo el resultado de este sorteo.",
      );
    }
    await prisma.resultado.update({
      where: { sorteoId },
      data: { verificadoWhatsapp: verificado },
    });
  },

  /**
   * A9 — segundo paso: confirma la entrega. Nunca se confía en que el
   * cliente ya validó el checkbox (Sprint 4, sección 4.3): se vuelve a
   * exigir `verificadoWhatsapp` acá, en el servidor.
   */
  async confirmarEntregaPremio(sorteoId: string, administradorId: string): Promise<void> {
    const resultado = await prisma.resultado.findUnique({
      where: { sorteoId },
      include: {
        sorteo: { select: { premio: true } },
        participacion: { include: { usuario: true } },
      },
    });
    if (!resultado) {
      throw new ErrorAplicacion(
        "SORTEO_SIN_RESULTADO",
        "Todavía no se obtuvo el resultado de este sorteo.",
      );
    }
    if (!resultado.verificadoWhatsapp) {
      throw new ErrorAplicacion(
        "PREMIO_NO_VERIFICADO",
        "Marcá primero que el ganador sigue en el canal de WhatsApp.",
      );
    }

    if (resultado.premioEntregado) return;

    await prisma.resultado.update({
      where: { sorteoId },
      data: { premioEntregado: true },
    });

    await registrarAuditoria({
      administradorId,
      accion: "ENTREGAR_PREMIO",
      entidadTipo: "PARTICIPACION",
      entidadId: resultado.participacionId ?? sorteoId,
      detalle: `Premio de "${resultado.sorteo.premio}" entregado a ${resultado.participacion?.usuario.nombre ?? "ganador"}.`,
    });
  },

  /** U6 — resultado público. `null` si todavía no se publicó nada para este sorteo. */
  async obtenerResultadoPublico(sorteoId: string): Promise<ResultadoPublicoDTO | null> {
    const resultado = await prisma.resultado.findUnique({
      where: { sorteoId },
      include: { sorteo: { select: { premio: true } } },
    });
    if (!resultado || !resultado.publicadoEn) return null;

    return {
      premio: resultado.sorteo.premio,
      numeroGanador: resultado.numeroGanador,
      numeroPremiado: resultado.numeroPremiado,
      desierto: resultado.participacionId === null,
      publicadoEn: resultado.publicadoEn.toISOString(),
    };
  },
};

/**
 * Modalidad "número más cercano" (Sprint 4, sección 3.6): siempre hay
 * ganador si hay al menos una participación. Ante un empate de cercanía,
 * gana el número inmediatamente inferior — regla de negocio ya aprobada.
 */
function encontrarMasCercano(
  participaciones: ParticipacionConUsuario[],
  numeroGanador: number,
): ParticipacionConUsuario | null {
  if (participaciones.length === 0) return null;

  return participaciones.reduce((mejor, actual) => {
    const diffActual = Math.abs(actual.numero - numeroGanador);
    const diffMejor = Math.abs(mejor.numero - numeroGanador);
    if (diffActual < diffMejor) return actual;
    if (diffActual === diffMejor && actual.numero < mejor.numero) return actual;
    return mejor;
  });
}
