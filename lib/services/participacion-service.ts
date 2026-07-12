import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ErrorAplicacion } from "@/lib/errors";
import { validarNombre, validarNumero, validarTelefono } from "@/lib/validation";
import { LimitadorService, type PoliticaLimite } from "@/lib/services/limitador-service";
import { registrarEventoMetrica } from "@/lib/services/metrica-service";
import { NotificacionesService } from "@/lib/services/notificaciones-service";
import type { ParticipacionConfirmadaDTO } from "@/types/sorteo";

/**
 * Política de límite de solicitudes del endpoint público de participación
 * (Módulo 6 — Sprint 4, sección 6): 20 intentos por IP en un minuto
 * bloquean esa IP por 5 minutos. Es generoso a propósito — una persona real
 * reintentando tras un número ocupado no debería nunca chocar con esto,
 * solo un script automatizado.
 */
const POLITICA_PARTICIPACION: PoliticaLimite = {
  maxIntentos: 20,
  ventanaMs: 60 * 1000,
  bloqueoMs: 5 * 60 * 1000,
};

interface DatosParticipacion {
  nombre: unknown;
  telefono: unknown;
  numero: unknown;
}

export const ParticipacionService = {
  /** U3: "Ya estás participando con este número" (Sprint 1, pantalla U3). */
  async buscarParticipacionPorTelefono(sorteoId: string, telefonoCrudo: string) {
    const telefono = validarTelefono(telefonoCrudo);
    const usuario = await prisma.usuario.findUnique({ where: { telefono } });
    if (!usuario) return null;

    const participacion = await prisma.participacion.findUnique({
      where: { sorteoId_usuarioId: { sorteoId, usuarioId: usuario.id } },
      include: { sorteo: { select: { premio: true, fechaCierre: true } } },
    });
    if (!participacion) return null;

    const resultado: ParticipacionConfirmadaDTO = {
      numero: participacion.numero,
      premio: participacion.sorteo.premio,
      fechaCierre: participacion.sorteo.fechaCierre.toISOString(),
    };
    return resultado;
  },

  /**
   * Reserva un número de forma atómica (Sprint 1, sección 6, regla 3;
   * Sprint 4, sección 2.2). La reserva ocurre recién acá — elegir un número
   * en la grilla no escribe nada en la base todavía. Las dos restricciones
   * únicas de `participaciones` (Sprint 4, sección 3.4) son las que en
   * definitiva impiden que dos personas se queden con el mismo número o que
   * un mismo teléfono participe dos veces, incluso bajo carrera de pedidos
   * simultáneos — acá solo se traduce esa violación a un error legible.
   */
  async reservarNumero(
    sorteoId: string,
    datos: DatosParticipacion,
    ip: string,
  ): Promise<ParticipacionConfirmadaDTO> {
    const claveLimite = `participar:${ip}`;
    const bloqueo = await LimitadorService.verificarBloqueo(claveLimite);
    if (bloqueo.bloqueado) {
      throw new ErrorAplicacion(
        "DEMASIADOS_INTENTOS",
        "Uy, muchos intentos seguidos. Esperá un toque y volvé a intentar.",
      );
    }
    await LimitadorService.registrarIntento(claveLimite, POLITICA_PARTICIPACION);

    const nombre = validarNombre(datos.nombre);
    const telefono = validarTelefono(datos.telefono);

    const sorteo = await prisma.sorteo.findUnique({ where: { id: sorteoId } });
    if (!sorteo) {
      throw new ErrorAplicacion("SORTEO_NO_ENCONTRADO", "Este sorteo no existe.");
    }
    if (sorteo.estado !== "ACTIVO" || sorteo.fechaCierre <= new Date()) {
      throw new ErrorAplicacion("SORTEO_CERRADO", "Este sorteo ya cerró.");
    }

    const numero = validarNumero(
      datos.numero,
      sorteo.numeroInicial,
      sorteo.cantidadNumeros,
    );

    let participacion;
    try {
      participacion = await prisma.$transaction(async (tx) => {
        const usuario = await tx.usuario.upsert({
          where: { telefono },
          update: { nombre },
          create: { nombre, telefono },
        });

        return tx.participacion.create({
          data: { sorteoId, usuarioId: usuario.id, numero },
        });
      });
    } catch (error) {
      throw traducirErrorDeReserva(error);
    }

    await registrarEventoMetrica({ tipo: "PARTICIPACION", sorteoId });
    await NotificacionesService.enviarConfirmacion(
      telefono,
      sorteo.premio,
      participacion.numero,
    );

    return {
      numero: participacion.numero,
      premio: sorteo.premio,
      fechaCierre: sorteo.fechaCierre.toISOString(),
    };
  },
};

/**
 * Traduce la restricción única que Postgres rechazó al error de negocio
 * correspondiente. Nota: Prisma reporta en `meta.target`, para Postgres,
 * las *columnas* de la restricción violada (por ejemplo `["sorteo_id",
 * "numero"]`) — no el nombre que se le dio al índice con `map:` en el
 * schema. Por eso acá se identifica la restricción por columna, no por
 * nombre.
 */
function traducirErrorDeReserva(error: unknown): ErrorAplicacion {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    const columnas = Array.isArray(error.meta?.target)
      ? (error.meta.target as string[])
      : [];
    if (columnas.includes("numero")) {
      return new ErrorAplicacion(
        "NUMERO_OCUPADO",
        "Uy, justo lo tomó otra persona. Elegí otro, todavía quedan varios libres.",
      );
    }
    if (columnas.includes("usuario_id")) {
      return new ErrorAplicacion(
        "TELEFONO_YA_PARTICIPO",
        "Ya estás participando con este número.",
      );
    }
  }
  return new ErrorAplicacion(
    "INESPERADO",
    "Uy, algo no salió como esperaba. Volvamos a intentar.",
  );
}
