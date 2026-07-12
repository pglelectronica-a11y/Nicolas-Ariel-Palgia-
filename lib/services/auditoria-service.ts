import { prisma } from "@/lib/prisma";
import type { AccionAuditoria, TipoEntidadAuditoria } from "@prisma/client";

interface DatosAuditoria {
  administradorId: string;
  accion: AccionAuditoria;
  entidadTipo: TipoEntidadAuditoria;
  entidadId: string;
  detalle: string;
}

/**
 * Registro de solo lectura de acciones administrativas (Sprint 4, sección
 * 3.7). Cada servicio la llama como último paso de la acción correspondiente
 * — nunca es una responsabilidad aparte que alguien podría olvidar.
 *
 * Nota (deuda técnica del Módulo 4, ahora resuelta): `PUBLICAR_RESULTADO` no
 * se registraba porque todavía no existía un administrador autenticado de
 * verdad. Con el login del Módulo 5, `ResultadoService.publicarResultado`
 * ya recibe un `administradorId` real y escribe acá.
 */
export async function registrarAuditoria(datos: DatosAuditoria): Promise<void> {
  await prisma.auditoria.create({ data: datos });
}
