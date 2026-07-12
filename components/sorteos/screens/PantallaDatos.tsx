import { Alert, Button, Input } from "@/components/ui";
import { Peggie } from "@/components/peggie/Peggie";
import { elegirVariante, MENSAJES } from "@/components/peggie/messages";

export interface PantallaDatosProps {
  nombre: string;
  telefono: string;
  onCambiarNombre: (valor: string) => void;
  onCambiarTelefono: (valor: string) => void;
  onContinuar: () => void;
  onVolver: () => void;
  cargando: boolean;
  error: string | null;
  verParticipacionExistente: (() => void) | null;
}

/** U3 — Sprint 1, sección 2. */
export function PantallaDatos({
  nombre,
  telefono,
  onCambiarNombre,
  onCambiarTelefono,
  onContinuar,
  onVolver,
  cargando,
  error,
  verParticipacionExistente,
}: PantallaDatosProps) {
  return (
    <div className="flex flex-col gap-4">
      <Peggie mensaje={elegirVariante(MENSAJES.comoParticipar(), telefono || "datos")} />
      <Input
        label="Nombre"
        placeholder="Ej. María Gómez"
        value={nombre}
        onChange={(e) => onCambiarNombre(e.target.value)}
        autoComplete="name"
      />
      <Input
        label="Teléfono"
        placeholder="11 xxxx xxxx"
        value={telefono}
        onChange={(e) => onCambiarTelefono(e.target.value)}
        inputMode="tel"
        autoComplete="tel"
      />
      <Alert variant="info">
        {elegirVariante(MENSAJES.condicionPremio(), telefono || "condicion")}
      </Alert>
      {error && (
        <Alert variant="error">
          {error}
          {verParticipacionExistente && (
            <button
              type="button"
              onClick={verParticipacionExistente}
              className="ml-1 font-semibold underline"
            >
              Ver mi participación
            </button>
          )}
        </Alert>
      )}
      <Button variant="primary" block onClick={onContinuar} isLoading={cargando}>
        Continuar
      </Button>
      <Button variant="ghost" onClick={onVolver}>
        Volver
      </Button>
    </div>
  );
}
