import { notFound } from "next/navigation";
import { requerirSesionPagina } from "@/lib/require-auth";
import { AdminSorteoService } from "@/lib/services/admin-sorteo-service";
import { ErrorAplicacion } from "@/lib/errors";
import { FormularioSorteo } from "@/components/admin/FormularioSorteo";

export const dynamic = "force-dynamic";

function aFechaLocal(fecha: Date): string {
  const desplazado = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
  return desplazado.toISOString().slice(0, 16);
}

/** A4 — Sprint 1, sección 3. */
export default async function PaginaEditarSorteo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sorteoId } = await params;
  await requerirSesionPagina(`/sorteos/${sorteoId}/editar`);

  let sorteo;
  try {
    sorteo = await AdminSorteoService.obtenerSorteoParaEditar(sorteoId);
  } catch (error) {
    if (error instanceof ErrorAplicacion && error.codigo === "SORTEO_NO_ENCONTRADO") {
      notFound();
    }
    throw error;
  }

  return (
    <FormularioSorteo
      modo="editar"
      sorteoId={sorteoId}
      estadoActual={sorteo.estado}
      cantidadReservada={sorteo._count.participaciones}
      valoresIniciales={{
        premio: sorteo.premio,
        imagenUrl: sorteo.imagenUrl ?? "",
        fechaCierre: aFechaLocal(sorteo.fechaCierre),
        numeroInicial: String(sorteo.numeroInicial),
        cantidadNumeros: String(sorteo.cantidadNumeros),
        modalidadGanador: sorteo.modalidadGanador,
      }}
    />
  );
}
