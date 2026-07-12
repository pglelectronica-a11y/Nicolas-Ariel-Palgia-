/**
 * Taxonomía única de errores (Sprint 4, sección 2.3): validación, conflicto,
 * no encontrado, servicio externo, inesperado. El backend solo devuelve un
 * código; el frontend traduce ese código al mensaje de Peggie ya escrito
 * (Sprint 1), sin acoplar copy y lógica de errores.
 */
export type CodigoError =
  | "VALIDACION"
  | "NUMERO_OCUPADO"
  | "TELEFONO_YA_PARTICIPO"
  | "SORTEO_CERRADO"
  | "SORTEO_NO_ENCONTRADO"
  | "SORTEO_NO_CERRADO"
  | "RESULTADO_YA_OBTENIDO"
  | "RESULTADO_YA_PUBLICADO"
  | "SORTEO_SIN_RESULTADO"
  | "CREDENCIALES_INVALIDAS"
  | "NO_AUTENTICADO"
  | "SORTEO_YA_ACTIVO"
  | "SORTEO_NO_EDITABLE"
  | "CANTIDAD_INSUFICIENTE"
  | "PARTICIPACION_NO_ENCONTRADA"
  | "PREMIO_NO_VERIFICADO"
  | "DEMASIADOS_INTENTOS"
  | "SERVICIO_EXTERNO"
  | "INESPERADO";

const ESTADO_HTTP: Record<CodigoError, number> = {
  VALIDACION: 400,
  NUMERO_OCUPADO: 409,
  TELEFONO_YA_PARTICIPO: 409,
  SORTEO_CERRADO: 409,
  SORTEO_NO_ENCONTRADO: 404,
  SORTEO_NO_CERRADO: 409,
  RESULTADO_YA_OBTENIDO: 409,
  RESULTADO_YA_PUBLICADO: 409,
  SORTEO_SIN_RESULTADO: 409,
  CREDENCIALES_INVALIDAS: 401,
  NO_AUTENTICADO: 401,
  SORTEO_YA_ACTIVO: 409,
  SORTEO_NO_EDITABLE: 409,
  CANTIDAD_INSUFICIENTE: 409,
  PARTICIPACION_NO_ENCONTRADA: 404,
  PREMIO_NO_VERIFICADO: 409,
  DEMASIADOS_INTENTOS: 429,
  SERVICIO_EXTERNO: 502,
  INESPERADO: 500,
};

export class ErrorAplicacion extends Error {
  readonly codigo: CodigoError;
  readonly estadoHttp: number;

  constructor(codigo: CodigoError, mensaje: string) {
    super(mensaje);
    this.codigo = codigo;
    this.estadoHttp = ESTADO_HTTP[codigo];
    this.name = "ErrorAplicacion";
  }
}
