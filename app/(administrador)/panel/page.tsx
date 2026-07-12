import Link from "next/link";
import { AdminSorteoService } from "@/lib/services/admin-sorteo-service";
import { requerirSesionPagina } from "@/lib/require-auth";
import {
  Badge,
  Button,
  Card,
  CardSubtitle,
  CardTitle,
  StatCounter,
} from "@/components/ui";
import { BotonDuplicar } from "@/components/admin/BotonDuplicar";

export const dynamic = "force-dynamic";

const ETIQUETA_ESTADO: Record<string, string> = {
  BORRADOR: "Borrador",
  ACTIVO: "Activo",
  CERRADO: "Cerrado",
  RESULTADO_OBTENIDO: "Resultado obtenido",
  PUBLICADO: "Publicado",
  DESIERTO: "Desierto",
};

/** A2 — Sprint 1, sección 3. Métricas legibles en menos de 5 segundos (Sprint 4, sección 6). */
export default async function PaginaPanel() {
  await requerirSesionPagina("/panel");
  const { sorteoActivo, historial } = await AdminSorteoService.obtenerResumenPanel();

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-bold text-ink">Panel</h1>

      {sorteoActivo ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            <StatCounter
              value={sorteoActivo.cantidadParticipantes}
              label="Participantes"
            />
            <StatCounter value={sorteoActivo.numerosLibres} label="Números libres" />
            <StatCounter
              value={sorteoActivo.cerrado ? "Cerrado" : "Activo"}
              label="Estado"
            />
          </div>
          <Card>
            <CardTitle>{sorteoActivo.premio}</CardTitle>
            <CardSubtitle>
              Cierra el{" "}
              {new Intl.DateTimeFormat("es-AR", {
                dateStyle: "short",
                timeStyle: "short",
              }).format(new Date(sorteoActivo.fechaCierre))}
            </CardSubtitle>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Link href={`/sorteos/${sorteoActivo.id}/editar`}>
              <Button variant="secondary">Editar</Button>
            </Link>
            <Link href={`/sorteos/${sorteoActivo.id}/participantes`}>
              <Button variant="secondary">Ver participantes</Button>
            </Link>
            {sorteoActivo.cerrado && (
              <Link href={`/sorteos/${sorteoActivo.id}/resultado`}>
                <Button variant="primary">Obtener resultado</Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardTitle>No hay ningún sorteo activo</CardTitle>
          <CardSubtitle>Creá uno nuevo para empezar la semana.</CardSubtitle>
          <Link href="/sorteos/crear">
            <Button variant="primary" className="mt-3">
              Crear sorteo
            </Button>
          </Link>
        </Card>
      )}

      <div>
        <h2 className="mb-2 text-sm font-bold text-ink">Historial</h2>
        {historial.length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay sorteos anteriores.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {historial.map((sorteo) => (
              <Card key={sorteo.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">{sorteo.premio}</p>
                  <p className="text-xs text-muted">
                    {sorteo.cantidadParticipantes} participantes
                    {sorteo.numeroPremiado !== null &&
                      ` · ganó el Nº ${sorteo.numeroPremiado}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={sorteo.estado === "PUBLICADO" ? "success" : "neutral"}>
                    {ETIQUETA_ESTADO[sorteo.estado] ?? sorteo.estado}
                  </Badge>
                  <Link
                    href={`/sorteos/${sorteo.id}/participantes`}
                    className="text-xs text-primary underline"
                  >
                    Ver
                  </Link>
                  <BotonDuplicar sorteoId={sorteo.id} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
