/**
 * Interfaz de la fuente externa — la Quiniela Nacional Vespertina (Sprint 4,
 * sección 5.2). Hoy la única implementación real es la carga manual del
 * administrador (Sprint 1, pantalla A7, prevista desde el inicio como plan
 * de contingencia). El día que exista una consulta automática a una fuente
 * real, se reemplaza únicamente este archivo — nada de `ResultadoService`
 * necesita cambiar, porque solo conoce esta interfaz.
 */
export interface ResultadoExterno {
  numero: number;
}

export const ResultadoExternoService = {
  async obtenerNumeroDelDia(numeroCargadoManualmente: number): Promise<ResultadoExterno> {
    return { numero: numeroCargadoManualmente };
  },
};
