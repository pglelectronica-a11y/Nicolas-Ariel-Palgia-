import { prisma } from "@/lib/prisma";
import type { TipoEventoMetrica } from "@prisma/client";

interface DatosEventoMetrica {
  tipo: TipoEventoMetrica;
  sorteoId?: string | null;
  origen?: string | null;
}

/**
 * Registro de eventos en la tabla reservada de métricas (Sprint 4, sección
 * 5.3 / PCS sección 22). Módulo 7 solo deja la captura conectada en los
 * momentos clave (visita, participación, clic hacia WhatsApp) — todavía no
 * existe ningún panel que consuma estos datos.
 */
export async function registrarEventoMetrica(datos: DatosEventoMetrica): Promise<void> {
  await prisma.eventoMetrica.create({
    data: {
      tipo: datos.tipo,
      sorteoId: datos.sorteoId ?? null,
      origen: datos.origen ?? null,
    },
  });
}
