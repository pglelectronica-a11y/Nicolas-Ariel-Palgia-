import { requerirSesionPagina } from "@/lib/require-auth";
import { FormularioSorteo } from "@/components/admin/FormularioSorteo";

export const dynamic = "force-dynamic";

/** A3 — Sprint 1, sección 3. */
export default async function PaginaCrearSorteo() {
  await requerirSesionPagina("/sorteos/crear");

  return (
    <FormularioSorteo
      modo="crear"
      valoresIniciales={{
        premio: "",
        imagenUrl: "",
        fechaCierre: "",
        numeroInicial: "0",
        cantidadNumeros: "100",
        modalidadGanador: "EXACTO",
      }}
    />
  );
}
