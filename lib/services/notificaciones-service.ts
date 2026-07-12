/**
 * Interfaz de notificaciones — WhatsApp (Sprint 4, sección 5.1). Hoy no hace
 * nada (implementación vacía): el resto del sistema ya la llama en los
 * momentos correctos (participación confirmada, resultado publicado), así
 * que conectar la API real de WhatsApp más adelante queda contenido en este
 * único archivo — nada de `ParticipacionService` ni `ResultadoService`
 * necesita cambiar.
 */
export const NotificacionesService = {
  async enviarConfirmacion(
    _telefono: string,
    _premio: string,
    _numero: number,
  ): Promise<void> {
    // vacío a propósito — Módulo 7 (Sprint 4, sección 5.1)
  },

  async anunciarResultado(
    _sorteoId: string,
    _premio: string,
    _desierto: boolean,
  ): Promise<void> {
    // vacío a propósito — Módulo 7 (Sprint 4, sección 5.1)
  },
};
