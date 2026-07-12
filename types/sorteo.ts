/**
 * Formas de datos compartidas entre servicios, API y componentes de cliente
 * (Sprint 4, sección 1.1: types/ para lo que no viene directo del esquema).
 * Los tipos de las entidades en sí (Sorteo, Participacion, etc.) ya los
 * genera @prisma/client — esto es lo que combina más de una entidad o lo
 * que cruza la frontera servidor → cliente.
 */

export interface SorteoActivoDTO {
  id: string;
  premio: string;
  imagenUrl: string | null;
  fechaCierre: string; // ISO — las fechas no viajan como Date a través de JSON
  numeroInicial: number;
  cantidadNumeros: number;
  numerosOcupados: number[];
}

export interface UltimoResultadoDTO {
  sorteoId: string;
  premio: string;
  numeroPremiado: number | null;
  publicadoEn: string | null;
}

export interface ParticipacionConfirmadaDTO {
  numero: number;
  premio: string;
  fechaCierre: string;
}

/** A7 — sorteos cuya fecha de cierre ya pasó y todavía no tienen resultado. */
export interface SorteoListoParaResultadoDTO {
  id: string;
  premio: string;
  fechaCierre: string;
  modalidadGanador: "EXACTO" | "MAS_CERCANO";
  cantidadParticipantes: number;
}

/** A7/A8 — resultado ya calculado, todavía no publicado (vista del administrador). */
export interface ResultadoObtenidoDTO {
  sorteoId: string;
  premio: string;
  numeroGanador: number;
  numeroPremiado: number | null;
  ganadorNombre: string | null;
  desierto: boolean;
}

/** U6 — resultado ya publicado (vista pública). */
export interface ResultadoPublicoDTO {
  premio: string;
  numeroGanador: number;
  numeroPremiado: number | null;
  desierto: boolean;
  publicadoEn: string;
}
