import { SorteoService } from "@/lib/services/sorteo-service";
import { ConfiguracionService } from "@/lib/services/configuracion-service";
import { registrarEventoMetrica } from "@/lib/services/metrica-service";
import { ParticipacionFlow } from "@/components/sorteos/ParticipacionFlow";

export const dynamic = "force-dynamic"; // el sorteo activo cambia con cada participación — nunca se cachea

/**
 * U1 / U2 — Sprint 1, sección 2. Server Component: los datos se piden
 * directamente al servidor (Sprint 4, sección 1.6), la interactividad
 * (elegir número, formularios) vive en ParticipacionFlow.
 */
export default async function PaginaPrincipal() {
  const [sorteoActivo, ultimoResultado, whatsappUrl] = await Promise.all([
    SorteoService.obtenerSorteoActivo(),
    SorteoService.obtenerUltimoResultadoPublicado(),
    ConfiguracionService.obtenerValor("whatsapp_canal_url"),
  ]);

  await registrarEventoMetrica({ tipo: "VISITA", sorteoId: sorteoActivo?.id ?? null });

  return (
    <ParticipacionFlow
      sorteoActivo={sorteoActivo}
      ultimoResultado={ultimoResultado}
      whatsappUrl={whatsappUrl ?? "https://wa.me/"}
    />
  );
}
