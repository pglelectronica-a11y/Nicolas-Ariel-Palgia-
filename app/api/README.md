# Route Handlers (`api/`)

Reservado para los Módulos 2 a 5, a medida que cada uno los necesite: `sorteos`, `sorteos/[id]/participaciones`, `sorteos/[id]/resultado`, `admin/...` (docs/SPRINT-4-ARQUITECTURA-TECNICA.md, sección 2.4).

Cada endpoint solo va a recibir la solicitud, validarla superficialmente y llamar al servicio correspondiente en `lib/` — nunca va a contener lógica de negocio propia (Sprint 4, sección 2.1).

No contiene código todavía porque el Módulo 1 es solo la fundación del proyecto: sin base de datos, no hay nada real que exponer.
