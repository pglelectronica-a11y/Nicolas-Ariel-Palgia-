"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Modal controlado: no se monta nada en el DOM mientras `open` es falso.
 * Cierra con Escape y al tocar el fondo, como cualquier diálogo accesible.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "w-full max-w-sm rounded-lg border border-border bg-surface p-5 shadow-3",
          "animate-modal-in",
          className,
        )}
      >
        <p id="modal-title" className="font-semibold text-ink">
          {title}
        </p>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}
