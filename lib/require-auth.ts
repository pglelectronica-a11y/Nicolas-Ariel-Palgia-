import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/session";
import { ErrorAplicacion } from "@/lib/errors";

/**
 * Segunda verificación real, además del middleware (Sprint 4, sección 4.2):
 * el middleware corre en el Edge Runtime y solo puede confirmar que la
 * cookie *existe*, no validar su firma (Node `crypto` no está disponible
 * ahí) — la validación completa pasa siempre por acá, en el servidor.
 */

/** Para Server Components de página: redirige a /login si la sesión no es válida. */
export async function requerirSesionPagina(pathnameActual: string) {
  const sesion = await obtenerSesion();
  if (!sesion) {
    redirect(`/login?redirigir=${encodeURIComponent(pathnameActual)}`);
  }
  return sesion;
}

/** Para Route Handlers: lanza un 401 si la sesión no es válida. */
export async function requerirSesionApi() {
  const sesion = await obtenerSesion();
  if (!sesion) {
    throw new ErrorAplicacion("NO_AUTENTICADO", "Tenés que iniciar sesión.");
  }
  return sesion;
}
