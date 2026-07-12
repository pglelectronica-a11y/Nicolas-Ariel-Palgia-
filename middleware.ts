import { NextRequest, NextResponse } from "next/server";

/**
 * Protección de rutas centralizada (Sprint 4, sección 4.2): toda ruta de
 * administración pasa por acá antes de renderizarse — no queda repartida
 * pantalla por pantalla, así ninguna futura pantalla puede quedar
 * desprotegida por olvido. `/login` es la única excepción explícita.
 *
 * Solo valida que la cookie de sesión *exista* — la firma y el vencimiento
 * se verifican en el servidor (`lib/session.ts`), porque el middleware de
 * Next.js corre en el Edge Runtime y no tiene acceso a Node `crypto`.
 * Quien intente falsificar la cookie pasa este primer filtro, pero cae en
 * la verificación real al llegar a la página o a la API.
 */
const COOKIE_SESION = "pgl_club_session";

export function middleware(request: NextRequest) {
  const tieneCookie = request.cookies.has(COOKIE_SESION);
  if (tieneCookie) return NextResponse.next();

  // Una API espera una respuesta JSON, no una redirección HTML — un
  // `fetch()` que reciba un 3xx la sigue en silencio y termina intentando
  // parsear la página de login como si fuera el cuerpo de la respuesta.
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { codigo: "NO_AUTENTICADO", mensaje: "Tenés que iniciar sesión." },
      { status: 401 },
    );
  }

  const login = new URL("/login", request.url);
  login.searchParams.set("redirigir", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/panel", "/sorteos/:path*", "/api/admin/:path*"],
};
