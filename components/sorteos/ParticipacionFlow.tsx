"use client";

import { useEffect, useState } from "react";
import { PantallaPrincipal } from "@/components/sorteos/screens/PantallaPrincipal";
import { PantallaSinSorteo } from "@/components/sorteos/screens/PantallaSinSorteo";
import { PantallaDatos } from "@/components/sorteos/screens/PantallaDatos";
import { PantallaNumero } from "@/components/sorteos/screens/PantallaNumero";
import { PantallaConfirmacion } from "@/components/sorteos/screens/PantallaConfirmacion";
import type {
  ParticipacionConfirmadaDTO,
  SorteoActivoDTO,
  UltimoResultadoDTO,
} from "@/types/sorteo";

type Paso = "principal" | "datos" | "numero" | "confirmacion";

const CLAVE_ALMACENAMIENTO = "pgl-club-participacion";

interface ParticipacionGuardada {
  sorteoId: string;
  telefono: string;
}

export interface ParticipacionFlowProps {
  sorteoActivo: SorteoActivoDTO | null;
  ultimoResultado: UltimoResultadoDTO | null;
  whatsappUrl: string;
}

/**
 * Orquesta las pantallas U1 a U5 (Sprint 1 y 2). El recorrido es lineal a
 * propósito (Sprint 2, sección 2): un único paso hacia adelante y un único
 * "Volver" por pantalla, sin menú de navegación libre.
 */
export function ParticipacionFlow({
  sorteoActivo,
  ultimoResultado,
  whatsappUrl,
}: ParticipacionFlowProps) {
  const [paso, setPaso] = useState<Paso>("principal");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [numerosOcupados, setNumerosOcupados] = useState<number[]>(
    sorteoActivo?.numerosOcupados ?? [],
  );
  const [numeroSeleccionado, setNumeroSeleccionado] = useState<number | null>(null);
  const [participacion, setParticipacion] = useState<ParticipacionConfirmadaDTO | null>(
    null,
  );
  const [telefonoRecordado, setTelefonoRecordado] = useState<string | null>(null);
  const [errorDatos, setErrorDatos] = useState<string | null>(null);
  const [errorNumero, setErrorNumero] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!sorteoActivo) return;
    const guardado = window.localStorage.getItem(CLAVE_ALMACENAMIENTO);
    if (!guardado) return;
    try {
      const datos: ParticipacionGuardada = JSON.parse(guardado);
      if (datos.sorteoId === sorteoActivo.id) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage solo existe en el cliente, mismo patrón que hooks/use-theme.ts
        setTelefonoRecordado(datos.telefono);
      }
    } catch {
      // localStorage corrupto: se ignora, el usuario simplemente participa de nuevo
    }
  }, [sorteoActivo]);

  function abrirWhatsapp() {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    fetch("/api/metricas/click-whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sorteoId: sorteoActivo?.id ?? null }),
    }).catch(() => {
      /* clic hacia WhatsApp ya se abrió; registrar la métrica es secundario */
    });
  }

  async function buscarParticipacion(sorteoId: string, telefonoBuscado: string) {
    const respuesta = await fetch(
      `/api/sorteos/${sorteoId}/participaciones?telefono=${encodeURIComponent(telefonoBuscado)}`,
    );
    const datos = await respuesta.json();
    return datos.participacion as ParticipacionConfirmadaDTO | null;
  }

  async function verMiNumero() {
    if (!sorteoActivo || !telefonoRecordado) return;
    setCargando(true);
    const encontrada = await buscarParticipacion(sorteoActivo.id, telefonoRecordado);
    setCargando(false);
    if (encontrada) {
      setParticipacion(encontrada);
      setPaso("confirmacion");
    }
  }

  async function continuarDesdeDatos() {
    if (!sorteoActivo) return;
    setErrorDatos(null);
    setCargando(true);
    try {
      const existente = await buscarParticipacion(sorteoActivo.id, telefono);
      if (existente) {
        setParticipacion(existente);
        setErrorDatos("Ya estás participando con este número.");
        setCargando(false);
        return;
      }
      setPaso("numero");
    } catch {
      setErrorDatos("Se ve que se cortó la conexión. Probemos de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  async function confirmarNumero() {
    if (!sorteoActivo || numeroSeleccionado === null) return;
    setErrorNumero(null);
    setCargando(true);
    try {
      const respuesta = await fetch(`/api/sorteos/${sorteoActivo.id}/participaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, telefono, numero: numeroSeleccionado }),
      });
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        if (datos.codigo === "NUMERO_OCUPADO") {
          setNumerosOcupados((actual) => [...actual, numeroSeleccionado]);
          setNumeroSeleccionado(null);
        }
        if (datos.codigo === "SORTEO_CERRADO") {
          setPaso("principal");
        }
        setErrorNumero(
          datos.mensaje ?? "Uy, algo no salió como esperaba. Volvamos a intentar.",
        );
        return;
      }

      setParticipacion(datos.participacion);
      window.localStorage.setItem(
        CLAVE_ALMACENAMIENTO,
        JSON.stringify({ sorteoId: sorteoActivo.id, telefono }),
      );
      setPaso("confirmacion");
    } catch {
      setErrorNumero("Se ve que se cortó la conexión. Probemos de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  function compartir() {
    if (navigator.share && sorteoActivo) {
      navigator
        .share({
          title: "PGL Club",
          text: `Estoy participando por ${sorteoActivo.premio} en PGL Club. ¡Sumate vos también!`,
          url: window.location.href,
        })
        .catch(() => {
          /* el usuario canceló el selector nativo — no es un error */
        });
    }
  }

  if (!sorteoActivo) {
    return (
      <PantallaSinSorteo
        ultimoResultado={ultimoResultado}
        onInvitacionWhatsapp={abrirWhatsapp}
      />
    );
  }

  if (paso === "confirmacion" && participacion) {
    return (
      <PantallaConfirmacion
        participacion={participacion}
        onCompartir={compartir}
        onInvitacionWhatsapp={abrirWhatsapp}
        onVerSorteo={() => setPaso("principal")}
      />
    );
  }

  if (paso === "numero") {
    return (
      <PantallaNumero
        numeroInicial={sorteoActivo.numeroInicial}
        cantidadNumeros={sorteoActivo.cantidadNumeros}
        numerosOcupados={numerosOcupados}
        numeroSeleccionado={numeroSeleccionado}
        onSeleccionar={setNumeroSeleccionado}
        onConfirmar={confirmarNumero}
        onVolver={() => setPaso("datos")}
        cargando={cargando}
        error={errorNumero}
      />
    );
  }

  if (paso === "datos") {
    return (
      <PantallaDatos
        nombre={nombre}
        telefono={telefono}
        onCambiarNombre={setNombre}
        onCambiarTelefono={setTelefono}
        onContinuar={continuarDesdeDatos}
        onVolver={() => setPaso("principal")}
        cargando={cargando}
        error={errorDatos}
        verParticipacionExistente={participacion ? () => setPaso("confirmacion") : null}
      />
    );
  }

  return (
    <PantallaPrincipal
      sorteo={{ ...sorteoActivo, numerosOcupados }}
      yaParticipo={telefonoRecordado !== null}
      onParticipar={() => setPaso("datos")}
      onVerMiNumero={verMiNumero}
      onInvitacionWhatsapp={abrirWhatsapp}
    />
  );
}
