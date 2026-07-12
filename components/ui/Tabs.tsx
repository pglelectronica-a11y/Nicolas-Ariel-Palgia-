import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Primitivo de navegación por pestañas — completamente controlado desde
 * afuera. No decide qué pantalla mostrar: eso es responsabilidad de quien
 * lo use (el panel de administración, en un módulo posterior).
 */
export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn("inline-flex gap-1 rounded-pill bg-surface-2 p-1", className)}
    >
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.value)}
            className={cn(
              "rounded-pill px-3.5 py-1.5 text-sm font-semibold transition-colors duration-fast ease-standard",
              isActive ? "bg-surface text-ink shadow-1" : "text-muted hover:text-ink",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
