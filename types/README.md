# `types/`

Las siete tablas del Módulo 2 (usuarios, sorteos, participaciones, resultados, administradores, auditoría, configuración) ya tienen sus tipos generados automáticamente por Prisma en `@prisma/client` (por ejemplo, `import type { Sorteo } from "@prisma/client"`) — no hace falta redeclararlos acá.

Esta carpeta sigue reservada para tipos propios de la aplicación que combinen más de una entidad o que no vengan directamente del esquema (por ejemplo, el tipo de una respuesta de API que junta un `Sorteo` con su cantidad de participantes). Se completa a partir del Módulo 3, cuando exista código que los necesite.
