import type { Config } from "tailwindcss";

/**
 * Puente entre los tokens de diseño (styles/tokens.css) y las utilidades de Tailwind.
 * Ningún color, radio, sombra o duración se escribe "a mano" en un componente:
 * todo pasa por acá, que a su vez lee las variables CSS del Sprint 3.
 */
const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        "primary-tint": "var(--primary-tint)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        success: "var(--success)",
        "success-tint": "var(--success-tint)",
        error: "var(--error)",
        "error-tint": "var(--error-tint)",
        warning: "var(--warning)",
        "warning-tint": "var(--warning-tint)",
        info: "var(--info)",
        "info-tint": "var(--info-tint)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        btn: "var(--radius-btn)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        1: "var(--shadow-1)",
        2: "var(--shadow-2)",
        3: "var(--shadow-3)",
      },
      transitionDuration: {
        instant: "var(--dur-instant)",
        fast: "var(--dur-fast)",
        base: "var(--dur-base)",
        slow: "var(--dur-slow)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        emphasis: "var(--ease-emphasis)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"Segoe UI"',
          "system-ui",
          "sans-serif",
        ],
        mono: ["ui-monospace", '"SF Mono"', "Consolas", '"Liberation Mono"', "monospace"],
      },
      screens: {
        tablet: "768px",
        desktop: "1024px",
      },
      keyframes: {
        "modal-in": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "modal-in": "modal-in 320ms cubic-bezier(0.16,1,0.3,1)",
        "fade-in": "fade-in 220ms cubic-bezier(0.2,0.7,0.3,1)",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
