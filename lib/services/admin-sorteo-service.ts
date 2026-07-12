import { prisma } from "@/lib/prisma";
import { ErrorAplicacion } from "@/lib/errors";
import { registrarAuditoria } from "@/lib/services/auditoria-service";

export interface DatosSorteo {
  premio: unknown;
  imagenUrl?: unknown;
  fechaCierre: unknown;
  numeroInicial: unknown;
  cantidadNumeros: unknown;
  modalidadGanador: unknown;
}

/**
 * A2 (panel), A3 (crear), A4 (editar), A10 (duplicar) — Sprint 1. Reglas de
 * negocio ya aprobadas (Sprint 4, sección 2.2): un solo sorteo activo a la
 * vez, lo publicado no se reabre, los cupos no bajan de lo ya reservado,
 * duplicar no activa.
 */
export const AdminSorteoService = {
  async obtenerResumenPanel() {
    const sorteoActivo = await prisma.sorteo.findFirst({
      where: { estado: "ACTIVO" },
      orderBy: { creadoEn: "desc" },
      include: { _count: { select: { participaciones: true } } },
    });

    const historial = await prisma.sorteo.findMany({
      where: sorteoActivo ? { id: { not: sorteoActivo.id } } : undefined,
      orderBy: { creadoEn: "desc" },
      take: 10,
      include: { _count: { select: { participaciones: true } }, resultado: true },
    });

    return {
      sorteoActivo: sorteoActivo
        ? {
            id: sorteoActivo.id,
            premio: sorteoActivo.premio,
            fechaCierre: sorteoActivo.fechaCierre.toISOString(),
            cerrado: sorteoActivo.fechaCierre <= new Date(),
            cantidadParticipantes: sorteoActivo._count.participaciones,
            numerosLibres:
              sorteoActivo.cantidadNumeros - sorteoActivo._count.participaciones,
            cantidadNumeros: sorteoActivo.cantidadNumeros,
          }
        : null,
      historial: historial.map((s) => ({
        id: s.id,
        premio: s.premio,
        estado: s.estado,
        cantidadParticipantes: s._count.participaciones,
        numeroPremiado: s.resultado?.numeroPremiado ?? null,
      })),
    };
  },

  async obtenerSorteoParaEditar(sorteoId: string) {
    const sorteo = await prisma.sorteo.findUnique({
      where: { id: sorteoId },
      include: { _count: { select: { participaciones: true } } },
    });
    if (!sorteo)
      throw new ErrorAplicacion("SORTEO_NO_ENCONTRADO", "Este sorteo no existe.");
    return sorteo;
  },

  async crearSorteo(datos: DatosSorteo, administradorId: string) {
    const validado = validarDatosSorteo(datos);

    const yaHayActivo = await prisma.sorteo.findFirst({ where: { estado: "ACTIVO" } });
    if (yaHayActivo) {
      throw new ErrorAplicacion(
        "SORTEO_YA_ACTIVO",
        "Ya existe un sorteo activo. Cerralo o esperá a que se publique antes de crear otro.",
      );
    }

    const sorteo = await prisma.sorteo.create({
      data: { ...validado, estado: "ACTIVO" },
    });

    await registrarAuditoria({
      administradorId,
      accion: "CREAR_SORTEO",
      entidadTipo: "SORTEO",
      entidadId: sorteo.id,
      detalle: `Sorteo "${sorteo.premio}" creado y activado.`,
    });

    return sorteo;
  },

  async editarSorteo(
    sorteoId: string,
    datos: DatosSorteo,
    administradorId: string,
    activar: boolean,
  ) {
    const validado = validarDatosSorteo(datos);

    const sorteo = await prisma.sorteo.findUnique({
      where: { id: sorteoId },
      include: { _count: { select: { participaciones: true } } },
    });
    if (!sorteo)
      throw new ErrorAplicacion("SORTEO_NO_ENCONTRADO", "Este sorteo no existe.");

    if (sorteo.estado !== "BORRADOR" && sorteo.estado !== "ACTIVO") {
      throw new ErrorAplicacion(
        "SORTEO_NO_EDITABLE",
        "Este sorteo ya cerró — lo publicado no se puede volver a editar.",
      );
    }

    if (validado.cantidadNumeros < sorteo._count.participaciones) {
      throw new ErrorAplicacion(
        "CANTIDAD_INSUFICIENTE",
        `No podés bajar de ${sorteo._count.participaciones} números: ya hay participantes con números en ese rango.`,
      );
    }

    if (activar && sorteo.estado === "BORRADOR") {
      const yaHayActivo = await prisma.sorteo.findFirst({
        where: { estado: "ACTIVO", id: { not: sorteoId } },
      });
      if (yaHayActivo) {
        throw new ErrorAplicacion(
          "SORTEO_YA_ACTIVO",
          "Ya existe un sorteo activo. Cerralo antes de activar este.",
        );
      }
    }

    const actualizado = await prisma.sorteo.update({
      where: { id: sorteoId },
      data: { ...validado, estado: activar ? "ACTIVO" : sorteo.estado },
    });

    await registrarAuditoria({
      administradorId,
      accion: "EDITAR_SORTEO",
      entidadTipo: "SORTEO",
      entidadId: sorteo.id,
      detalle: `Sorteo "${actualizado.premio}" editado.${activar ? " Activado." : ""}`,
    });

    return actualizado;
  },

  async duplicarSorteo(sorteoId: string, administradorId: string) {
    const original = await prisma.sorteo.findUnique({ where: { id: sorteoId } });
    if (!original)
      throw new ErrorAplicacion("SORTEO_NO_ENCONTRADO", "Este sorteo no existe.");

    const fechaCierre = new Date();
    fechaCierre.setDate(fechaCierre.getDate() + 7);

    const nuevo = await prisma.sorteo.create({
      data: {
        premio: original.premio,
        imagenUrl: original.imagenUrl,
        numeroInicial: original.numeroInicial,
        cantidadNumeros: original.cantidadNumeros,
        modalidadGanador: original.modalidadGanador,
        fechaCierre,
        estado: "BORRADOR",
      },
    });

    await registrarAuditoria({
      administradorId,
      accion: "CREAR_SORTEO",
      entidadTipo: "SORTEO",
      entidadId: nuevo.id,
      detalle: `Sorteo "${nuevo.premio}" duplicado desde "${original.premio}" (borrador).`,
    });

    return nuevo;
  },
};

function validarDatosSorteo(datos: DatosSorteo) {
  const premio = typeof datos.premio === "string" ? datos.premio.trim() : "";
  if (premio.length < 2 || premio.length > 120) {
    throw new ErrorAplicacion("VALIDACION", "Completá el premio para continuar.");
  }

  const fechaCierre = new Date(String(datos.fechaCierre));
  if (Number.isNaN(fechaCierre.getTime()) || fechaCierre <= new Date()) {
    throw new ErrorAplicacion(
      "VALIDACION",
      "La fecha de cierre tiene que ser posterior a hoy.",
    );
  }

  const numeroInicial = Number(datos.numeroInicial);
  if (!Number.isInteger(numeroInicial) || numeroInicial < 0) {
    throw new ErrorAplicacion(
      "VALIDACION",
      "El número inicial tiene que ser un entero válido.",
    );
  }

  const cantidadNumeros = Number(datos.cantidadNumeros);
  if (!Number.isInteger(cantidadNumeros) || cantidadNumeros < 1) {
    throw new ErrorAplicacion(
      "VALIDACION",
      "La cantidad de números tiene que ser mayor a cero.",
    );
  }

  if (datos.modalidadGanador !== "EXACTO" && datos.modalidadGanador !== "MAS_CERCANO") {
    throw new ErrorAplicacion(
      "VALIDACION",
      "La modalidad de determinación del ganador no es válida.",
    );
  }
  const modalidadGanador = datos.modalidadGanador;

  const imagenUrlCruda =
    typeof datos.imagenUrl === "string" ? datos.imagenUrl.trim() : "";
  if (imagenUrlCruda.length > 500) {
    throw new ErrorAplicacion("VALIDACION", "La URL de la imagen es demasiado larga.");
  }
  const imagenUrl = imagenUrlCruda || null;

  return {
    premio,
    imagenUrl,
    fechaCierre,
    numeroInicial,
    cantidadNumeros,
    modalidadGanador,
  } as const;
}
