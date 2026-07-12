import { prisma } from "@/lib/prisma";
import { ErrorAplicacion } from "@/lib/errors";
import { registrarAuditoria } from "@/lib/services/auditoria-service";
import type { AccionAuditoria } from "@prisma/client";

/** A5/A6 — Sprint 1, sección 3. */
export const ParticipanteService = {
  async listarParticipantes(sorteoId: string) {
    const participaciones = await prisma.participacion.findMany({
      where: { sorteoId },
      include: { usuario: true },
      orderBy: { creadoEn: "desc" },
    });

    return participaciones.map((p) => ({
      id: p.id,
      nombre: p.usuario.nombre,
      telefono: p.usuario.telefono,
      numero: p.numero,
      creadoEn: p.creadoEn.toISOString(),
    }));
  },

  /**
   * "Liberar número" y "eliminar participante" son, en efecto, la misma
   * operación (Sprint 1, sección 3: ambas quitan la participación y
   * liberan el número) — lo que cambia es qué acción queda en la
   * auditoría, según cuál botón tocó el administrador.
   */
  async quitarParticipacion(
    participacionId: string,
    administradorId: string,
    accion: Extract<AccionAuditoria, "LIBERAR_NUMERO" | "ELIMINAR_PARTICIPANTE">,
  ) {
    const participacion = await prisma.participacion.findUnique({
      where: { id: participacionId },
      include: { usuario: true, sorteo: { select: { premio: true, estado: true } } },
    });
    if (!participacion) {
      throw new ErrorAplicacion(
        "PARTICIPACION_NO_ENCONTRADA",
        "Esta participación ya no existe.",
      );
    }

    if (
      participacion.sorteo.estado !== "BORRADOR" &&
      participacion.sorteo.estado !== "ACTIVO"
    ) {
      throw new ErrorAplicacion(
        "SORTEO_NO_EDITABLE",
        "Este sorteo ya cerró — no se pueden quitar participantes de un sorteo cerrado.",
      );
    }

    await prisma.participacion.delete({ where: { id: participacionId } });

    await registrarAuditoria({
      administradorId,
      accion,
      entidadTipo: "PARTICIPACION",
      entidadId: participacionId,
      detalle:
        accion === "LIBERAR_NUMERO"
          ? `Número ${participacion.numero} liberado (era de ${participacion.usuario.nombre}) en "${participacion.sorteo.premio}".`
          : `Participante ${participacion.usuario.nombre} (Nº ${participacion.numero}) eliminado de "${participacion.sorteo.premio}".`,
    });
  },

  async exportarCsv(sorteoId: string): Promise<string> {
    const participantes = await this.listarParticipantes(sorteoId);
    const filas = [
      ["Nombre", "Teléfono", "Número", "Fecha"],
      ...participantes.map((p) => [
        p.nombre,
        p.telefono,
        String(p.numero),
        new Date(p.creadoEn).toLocaleString("es-AR"),
      ]),
    ];
    return filas.map((fila) => fila.map(escaparCeldaCsv).join(",")).join("\r\n");
  },
};

function escaparCeldaCsv(valor: string): string {
  if (/[",\r\n]/.test(valor)) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}
