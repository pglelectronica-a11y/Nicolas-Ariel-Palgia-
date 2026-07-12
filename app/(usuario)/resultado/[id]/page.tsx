import { notFound } from "next/navigation";
import { ResultadoService } from "@/lib/services/resultado-service";
import { ConfiguracionService } from "@/lib/services/configuracion-service";
import { PantallaResultado } from "@/components/sorteos/screens/PantallaResultado";

export const dynamic = "force-dynamic";

/** U6 — Sprint 1, sección 2. */
export default async function PaginaResultado({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sorteoId } = await params;
  const [resultado, whatsappUrl] = await Promise.all([
    ResultadoService.obtenerResultadoPublico(sorteoId),
    ConfiguracionService.obtenerValor("whatsapp_canal_url"),
  ]);

  if (!resultado) notFound();

  return (
    <PantallaResultado
      sorteoId={sorteoId}
      resultado={resultado}
      whatsappUrl={whatsappUrl ?? "https://wa.me/"}
    />
  );
}
