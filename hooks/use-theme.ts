"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "pgl-club-theme";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Aplica y persiste el tema claro/oscuro ya preparado en styles/tokens.css.
 * No es lógica de negocio: es infraestructura de presentación, igual que
 * el resto de lo que vive en hooks/ durante el Módulo 1.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Excepción deliberada a react-hooks/set-state-in-effect: la preferencia
    // real (localStorage / prefers-color-scheme) solo existe en el navegador,
    // así que no se puede conocer durante el render en el servidor. Server y
    // primer render del cliente arrancan siempre en "light" a propósito, para
    // que coincidan y no haya un error de hidratación; recién en este efecto,
    // ya montado, se corrige al valor real — es el mismo patrón que usan las
    // implementaciones de tema claro/oscuro de Next.js.
    const preferred = getPreferredTheme();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(preferred);
    document.documentElement.setAttribute("data-theme", preferred);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
