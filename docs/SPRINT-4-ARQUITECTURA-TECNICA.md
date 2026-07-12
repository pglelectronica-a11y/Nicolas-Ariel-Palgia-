# Sprint 4 — Arquitectura Técnica

**Versión:** 1.1 (aprobado)
**Depende de:** [PCS.md](./PCS.md) v0.2, [SPRINT-1-FUNCIONAL.md](./SPRINT-1-FUNCIONAL.md) v1.2, [SPRINT-2-WIREFRAMES.md](./SPRINT-2-WIREFRAMES.md), [SPRINT-3-DISEÑO-VISUAL.md](./SPRINT-3-DISEÑO-VISUAL.md) (todos aprobados)
**Estado:** Aprobado por el Product Owner

Este documento traduce todo lo ya aprobado (arquitectura general, funcionalidad, pantallas y diseño visual) en una estructura técnica concreta, lista para que la etapa de programación sea pura ejecución. No contiene código: contiene las decisiones que el código va a respetar.

**Contenido:** 1. Frontend · 2. Backend · 3. Base de datos · 4. Seguridad · 5. Integraciones futuras · 6. Estrategia de desarrollo y roadmap técnico · 7. Validación final.

---

## 1. Frontend

### 1.1 Organización de carpetas (conceptual)

Siguiendo el monolito modular ya aprobado (PCS, sección 8), el proyecto Next.js se organiza así:

- **app/** — rutas de la aplicación (Next.js App Router).
  - **(usuario)/** — grupo de rutas públicas: principal, participar/paso-1, participar/paso-2, confirmación, resultado.
  - **(administrador)/** — grupo de rutas protegidas: login, panel, sorteos/crear, sorteos/[id]/editar, sorteos/[id]/participantes, sorteos/[id]/resultado.
  - **api/** — puntos de entrada del backend, organizados por módulo (sorteos, participaciones, resultados, admin).
- **components/**
  - **ui/** — la biblioteca de componentes del Sprint 3, uno a uno: Button, Card, Input, Checkbox, Badge, Tabs, Alert, Modal, Tooltip, Skeleton, StatCounter.
  - **peggie/** — el avatar, la burbuja de mensaje y la lógica de variantes de frases (Sprint 1, capítulo 8.6).
  - **sorteos/** — componentes propios del módulo: grilla de números (siempre construida a partir del número inicial y la cantidad de números del sorteo, nunca de un rango fijo en el código — sección 3.5), tarjeta de premio, contador regresivo.
  - **admin/** — componentes propios del panel: tabla de participantes, tarjeta de estadística, diálogo de confirmación.
- **lib/** — lógica que no es interfaz: validaciones, formateadores, cliente de acceso a datos, constantes de negocio (por ejemplo, los estados posibles de un sorteo).
- **hooks/** — hooks de React reutilizables: sorteo activo, participación, cuenta regresiva, tema claro/oscuro.
- **styles/** — los tokens de diseño del Sprint 3 (colores, tipografía, espaciado, animación) como variables, la única fuente de verdad visual del código.
- **types/** — tipos de TypeScript que reflejan uno a uno las entidades de la base de datos (sección 3).

### 1.2 Componentes reutilizables

Los mismos que ya se diseñaron y probaron en el Sprint 3 (ver su biblioteca de componentes): ninguno se rediseña durante el desarrollo, solo se implementa lo ya aprobado. Los componentes de `ui/` no conocen nada del negocio de sorteos — reciben datos por props y no saben qué es un "número ganador"; eso vive en `components/sorteos/`.

### 1.3 Convenciones de nombres

- Componentes: `PascalCase.tsx` (`NumberGrid.tsx`, `PeggieBubble.tsx`).
- Hooks: `use-camelCase.ts`, siempre empiezan con "use" (`useSorteoActivo`, `useCountdown`).
- Utilidades y constantes: `kebab-case.ts` (`format-phone.ts`).
- Segmentos de ruta: `kebab-case` (`participar/paso-1`).
- Tipos: `PascalCase` singular, calcados de las entidades de base de datos (`Usuario`, `Sorteo`, `Participacion`, `Resultado`).
- Endpoints de API: sustantivos en plural (`/api/sorteos`, `/api/sorteos/:id/participaciones`).

### 1.4 Sistema de navegación

Implementa exactamente el sistema ya definido en el Sprint 2 (sección 2 de ese documento), ahora con una traducción técnica directa: el grupo de rutas `(usuario)` tiene su propio *layout* que monta a Peggie; el grupo `(administrador)` tiene un layout distinto, sin Peggie, con la barra de pestañas fija (Panel · Participantes · Historial). Esto convierte una regla de diseño ("Peggie nunca aparece en el panel") en una restricción de arquitectura, no en una convención que alguien podría olvidar.

### 1.5 Organización de layouts

`RootLayout` (fuentes, proveedor de tema claro/oscuro) → `LayoutUsuario` (monta a Peggie, zona de acción fija al pie en mobile) → `LayoutAdministrador` (barra de navegación superior, franja de estadísticas). Cada pantalla del Sprint 2 se apoya en uno de estos dos layouts, nunca en ambos.

### 1.6 Manejo de estados

La mayoría de los datos se piden directamente al servidor (Server Components de Next.js) — no hace falta una librería de estado global. Se usa estado local de componente solo donde tiene sentido (el número seleccionado antes de confirmar, en U4) y un contexto liviano únicamente para el tema claro/oscuro. **Se descarta deliberadamente** una librería de estado global (Redux, Zustand, etc.): el producto no tiene hoy estado complejo compartido entre pantallas lejanas, y agregarla sería complejidad sin beneficio real (regla del PCS, sección 5). Se reconsidera solo si un módulo futuro (por ejemplo, Puntos) lo justifica.

### 1.7 Responsive y estrategia Mobile First

Los mismos puntos de quiebre ya usados en el Sprint 3: base mobile sin *media query*, y refinamientos aditivos a partir de 768px (tablet) y 1024px (desktop). Todo componente se construye primero para el ancho más chico y solo se le agregan reglas para pantallas más grandes — nunca al revés.

---

## 2. Backend

Next.js aloja frontend y backend en el mismo proyecto (PCS, sección 9.1) — "backend" acá significa la lógica de servidor dentro del mismo repositorio, no un servicio aparte.

### 2.1 Organización interna

Cada módulo (Sorteos hoy, otros a futuro) repite las tres capas ya definidas en el PCS (sección 15):

1. **Capa de datos** — funciones de acceso a cada entidad (usuarios, sorteos, participaciones, resultados). Es la única capa que sabe cómo se guardan los datos.
2. **Capa de reglas de negocio** — un *servicio* por responsabilidad: `SorteoService` (crear, editar, cerrar automáticamente, duplicar), `ParticipacionService` (reservar un número de forma atómica, validar teléfono único, liberar, eliminar), `ResultadoService` (obtener el resultado externo, determinar ganador, publicar, marcar entrega), `AdminAuthService` (login, sesión), `ExportService` (generar el Excel de participantes).
3. **Capa de exposición** — los *route handlers* de `api/` que el frontend consume; no contienen lógica de negocio, solo reciben la solicitud, la validan superficialmente y llaman al servicio correspondiente.

Además, un espacio **core** compartido por todos los módulos: utilidades de sesión/autenticación, el cliente de base de datos, validaciones genéricas, y la interfaz de notificaciones (sección 5.1).

### 2.2 Reglas de negocio y validaciones

Cada una de las 13 reglas funcionales del Sprint 1 se traduce en dónde vive y cómo se hace cumplir:

| Regla (Sprint 1) | Dónde se aplica |
|---|---|
| Un usuario, un número por sorteo | Restricción única en base de datos (teléfono, sorteo) + mensaje amigable antes de llegar ahí |
| Un número, un dueño | Restricción única en base de datos (sorteo, número) — es lo que hace posible la regla siguiente |
| Elegir no es reservar | Solo se escribe en base de datos al confirmar, dentro de una operación atómica |
| El cierre es automático | Se calcula comparando la fecha de cierre contra la hora actual en cada lectura — no depende de una tarea programada para "sentirse" cerrado a tiempo |
| El ganador surge de un cruce | `ResultadoService` nunca acepta un ganador manual, solo un número a cruzar contra las participaciones |
| Sin reserva, no hay premio *(solo modalidad "exacto" — sección 3.6)* | Si el cruce no encuentra participación, el resultado queda marcado "desierto"; en modalidad "número más cercano" esto no puede ocurrir |
| Seguir en WhatsApp para cobrar | Campo de verificación manual en `resultados`, no un chequeo automático (ver sección 5.1) |
| Un solo sorteo activo | Validación en `SorteoService.crear()` antes de insertar |
| Lo publicado no se reabre | Los sorteos en estado "publicado" son de solo lectura a nivel de servicio |
| Confirmación en acciones irreversibles | Se exige un segundo llamado explícito (no una sola solicitud) para liberar/eliminar |
| Cupos no bajan de lo reservado | Validación en `SorteoService.editar()` contra el conteo real de participaciones |
| Duplicar no activa | El sorteo duplicado nace en estado "borrador" |
| Cancelación solo por el administrador | No existe endpoint público para liberar una participación propia |

### 2.3 Manejo de errores

Una taxonomía única de errores, reutilizada por todos los módulos, que se corresponde 1 a 1 con los "Estados del sistema" ya definidos en el Sprint 1: error de validación, error de conflicto (por ejemplo, número ya tomado), no encontrado, error de servicio externo (la Quiniela no responde), y error inesperado. El backend solo devuelve un código de error; es el frontend el que traduce ese código al mensaje de Peggie ya escrito — así el copy y la lógica de errores nunca se acoplan.

### 2.4 Organización de APIs

Rutas agrupadas por módulo y recurso, en plural: `/api/sorteos`, `/api/sorteos/:id/participaciones`, `/api/sorteos/:id/resultado`, `/api/admin/...` (protegidas, sección 4).

**Alternativas consideradas:** GraphQL o tRPC agregarían flexibilidad de consulta que este producto no necesita todavía — la cantidad de pantallas y de datos por pantalla es chica y estable. **Recomendación:** *Route Handlers* de Next.js (REST simple), sin dependencias nuevas, coherente con la regla de no sumar tecnología sin un beneficio real.

---

## 3. Base de datos

Transformación del modelo conceptual del PCS (sección 17) en tablas reales — sin SQL todavía, solo su diseño.

### 3.1 Tablas

**usuarios** — id · nombre · teléfono (único) · fecha de creación. Es la identidad reutilizada por cualquier módulo futuro.

**sorteos** — id · premio · imagen · fecha de inicio · fecha de cierre · **número inicial** · cantidad de números · **modalidad de determinación del ganador** (exacto / número más cercano) · estado (borrador / activo / cerrado / resultado obtenido / publicado / desierto) · fechas de creación y actualización.

**participaciones** — id · sorteo (relación) · usuario (relación) · número · fecha de creación.

**resultados** — id · sorteo (relación, uno a uno) · número ganador (el que salió en la Quiniela) · número premiado (el que efectivamente ganó — coincide con el ganador salvo en modalidad "más cercano") · participación ganadora (relación, puede no existir solo en modalidad "exacto") · fecha de publicación · verificado en WhatsApp (sí/no) · premio entregado (sí/no).

**administradores** — id · usuario · contraseña (hash) · fecha de creación · último ingreso.

**auditoría** *(nueva)* — id · administrador (relación) · acción (crear sorteo / editar sorteo / eliminar participante / liberar número / publicar resultado / entregar premio) · tipo de entidad afectada · id de la entidad afectada · detalle (qué cambió, en texto) · fecha. Ver sección 3.6.

**configuración** *(nueva)* — clave (texto, única) · valor (texto) · descripción. Ver sección 3.7.

**eventos_métricas** *(reservada, sin implementar — PCS sección 22)* — id · tipo (participación / visita / conversión por canal) · sorteo relacionado (opcional) · origen (Instagram / Facebook / WhatsApp / campaña) · fecha. Se deja modelada para no tener que rediseñar la base cuando se decida medir.

### 3.2 Relaciones

- Un usuario tiene muchas participaciones (una por cada sorteo distinto en el que participó).
- Un sorteo tiene muchas participaciones y, como máximo, un resultado.
- Una participación puede ser, como máximo, la ganadora de un resultado.
- Un administrador tiene muchos registros de auditoría.

### 3.3 Claves e índices

- Claves primarias autogeneradas en todas las tablas.
- Claves foráneas: `participaciones → sorteos`, `participaciones → usuarios`, `resultados → sorteos`, `resultados → participaciones` (opcional), `auditoría → administradores`.
- Índices sobre `participaciones.sorteo_id`, `participaciones.usuario_id`, `sorteos.estado` y `auditoría.fecha`, para que las consultas más frecuentes sean rápidas incluso con miles de filas.

### 3.4 Restricciones e integridad

- **Único** (sorteo, número) en `participaciones` → hace cumplir "un número, un dueño" a nivel de base de datos, no solo de código: dos confirmaciones simultáneas del mismo número no pueden convivir.
- **Único** (sorteo, usuario) en `participaciones` → hace cumplir "un usuario, un número por sorteo".
- **Único** (teléfono) en `usuarios`. **Único** (clave) en `configuración`.
- El campo `estado` de `sorteos` y el campo `modalidad` solo aceptan los valores ya definidos (restricción de valores permitidos).
- Que el número esté dentro del rango del sorteo (entre el número inicial y el número inicial + cantidad de números - 1) se valida en la capa de servicio, no en la base de datos — es una regla que depende de otro registro (el propio sorteo), y ese tipo de regla vive mejor en el código.
- Eliminar un sorteo con participaciones existentes está restringido — liberar o eliminar una participación puntual es siempre una acción explícita del administrador (Sprint 1, pantalla A6), nunca un efecto secundario automático de borrar otra cosa.

### 3.5 Cantidad de números y número inicial — configurable por sorteo

La cantidad de números y el número inicial dejan de ser un supuesto fijo (por ejemplo "siempre 00 a 99") y pasan a ser dos campos más del sorteo, definidos por el administrador al crearlo (pantalla A3, que gana estos dos campos nuevos). La grilla de números (componente `NumberGrid`, sección 1.2) siempre se construye a partir de estos dos valores — nunca hay un rango escrito en el código. Un sorteo puede ir de 1 a 50, de 000 a 999, o cualquier otro rango, sin tocar una sola línea.

### 3.6 Modalidad de determinación del ganador

Cada sorteo define, al crearse, una de dos modalidades — un campo nuevo en `sorteos`, ya incluido en 3.1:

- **Ganador exacto** (comportamiento ya descrito en el Sprint 1): se cruza el número de la Quiniela contra los números reservados; si nadie lo reservó, el sorteo queda desierto. La regla funcional "sin reserva, no hay premio" (Sprint 1, regla 6) sigue aplicando, pero **ahora es específica de esta modalidad**, no universal.
- **Número más cercano** (nueva): siempre hay un ganador. Si el número exacto de la Quiniela no fue reservado, gana quien reservó el número disponible más próximo.

**Decisión de negocio para aprobación, no asumida:** en "número más cercano", si dos números reservados quedan igual de cerca (por ejemplo, salió el 50 y están reservados el 49 y el 51), se define que gana el número inmediatamente **inferior** — es la convención más habitual en sorteos de este tipo, pero queda sujeta a confirmación del Product Owner.

`ResultadoService` implementa ambas modalidades como dos estrategias intercambiables detrás de la misma interfaz — agregar una tercera modalidad en el futuro (si alguna vez hiciera falta) no obliga a tocar la que ya funciona.

### 3.7 Auditoría

Registra, como mínimo, las seis acciones administrativas indicadas: creación de sorteos, edición, eliminación de participantes, liberación de números, publicación de resultados y entrega de premios. Cada registro guarda quién la hizo, cuándo, sobre qué (sorteo o participación) y un detalle en texto simple de qué cambió. No es editable ni eliminable desde el panel — es de solo lectura por diseño, porque una auditoría que se puede borrar no sirve como auditoría. Vive en la capa de datos del núcleo compartido (sección 2.1), y cada servicio (`SorteoService`, `ParticipacionService`, `ResultadoService`) escribe en ella como último paso de la acción correspondiente, no como una responsabilidad aparte que alguien podría olvidar llamar.

### 3.8 Configuración global

Se modela como una tabla de **clave/valor** (`configuración`: clave, valor, descripción) en lugar de columnas fijas.

**Alternativas consideradas:** una tabla con una columna por parámetro (nombre de empresa, enlace de WhatsApp, redes sociales, etc.) es más simple de leer al principio, pero cada parámetro nuevo exigiría modificar la estructura de la base de datos. **Recomendación:** clave/valor — agregar un parámetro nuevo (por ejemplo, un enlace a una futura red social) es agregar una fila, no una migración. Ejemplos de claves previstas: `nombre_empresa`, `whatsapp_canal_url`, `instagram_url`, `facebook_url`.

Esta tabla no tiene, por ahora, una pantalla propia de edición en el panel (no fue parte de las 16 pantallas ya aprobadas) — se edita directamente por quien administra la base de datos. Si más adelante se necesita que el administrador la edite desde el panel, es una pantalla nueva a definir y aprobar en su momento, no algo que se agrega ahora por la puerta de atrás.

### 3.9 Amendment a pantallas ya aprobadas

Esta actualización agrega **dos campos nuevos** a las pantallas A3 (Crear sorteo) y A4 (Editar sorteo) ya aprobadas en el Sprint 2: **"Número inicial"** y **"Modalidad de determinación del ganador"**. Es una extensión menor, pedida explícitamente por el Product Owner en esta misma actualización — no una desviación del proceso ni una decisión unilateral. Se deja registrada acá para que quede trazable.

---

## 4. Seguridad

### 4.1 Autenticación del administrador

Usuario y contraseña, con la contraseña almacenada como *hash* (nunca en texto plano). Sesión basada en una cookie firmada y de solo servidor (HttpOnly) en lugar de un token guardado del lado del cliente — más simple y más segura frente a scripts maliciosos, ya que el panel de administración es la única superficie autenticada del proyecto.

### 4.2 Protección de rutas

Toda ruta dentro de `(administrador)` pasa primero por una verificación de sesión antes de renderizarse; sin sesión válida, redirige al login. La protección vive en un único lugar (middleware), no repetida pantalla por pantalla — así ninguna futura pantalla de administración puede quedar desprotegida por olvido.

### 4.3 Validaciones

Toda validación de negocio se repite en el servidor, sin importar lo que ya haya validado la pantalla — nunca se confía únicamente en el frontend, porque cualquiera podría llamar a la API directamente.

### 4.4 Permisos

Un único rol de administrador para esta primera versión (no hace falta granularidad todavía, ya que hoy opera una sola persona). Queda preparado para diferenciar roles en el futuro (por ejemplo, "operador" vs. "administrador total") sin rediseñar el sistema de sesión.

### 4.5 Sesiones

Vencimiento moderado (recomendado: 7 días, con renovación silenciosa mientras haya actividad) — estándar razonable para una herramienta interna de uso semanal.

### 4.6 Buenas prácticas

Límite de solicitudes (*rate limiting*) sobre el endpoint de participación, para dificultar el abuso automatizado; variables de entorno para todo secreto (cadena de conexión a la base de datos, clave de sesión), nunca en el repositorio; HTTPS garantizado por el proveedor de hosting; protección contra CSRF en toda acción del administrador que modifique datos.

---

## 5. Integraciones futuras (arquitectura, sin implementar)

### 5.1 WhatsApp

Una interfaz `NotificacionesService` con métodos como "enviar confirmación" y "anunciar resultado". Hoy esa interfaz existe pero no hace nada (una implementación vacía) — el resto del sistema ya la llama en los momentos correctos (participación confirmada, resultado publicado), así que el día que se conecte la API real de WhatsApp, el cambio queda contenido en un solo archivo.

### 5.2 Quiniela Nacional

Una interfaz `ResultadoExternoService` con un único método ("obtener el número del día"). La implementación inicial puede ser la carga manual del administrador, ya prevista como plan de contingencia (Sprint 1, pantalla A7); reemplazarla más adelante por una consulta automática no afecta a `ResultadoService`, que solo conoce la interfaz, no cómo se obtiene el número.

### 5.3 Estadísticas / Analytics

La tabla `eventos_métricas` (sección 3.1) y una función simple para registrar un evento, llamada en los momentos clave (una participación, una visita, un clic hacia WhatsApp). Se empieza a capturar información desde el primer sorteo, aunque todavía no exista ningún panel que la consuma — el día que se decida medir, los datos ya van a estar ahí.

### 5.4 Módulos futuros

La misma organización en tres capas por módulo (sección 2.1) es, en sí misma, la arquitectura de integración: cualquier módulo nuevo (Ofertas Flash, Puntos, Cupones) se agrega como una carpeta más en `components/`, `app/api/` y su propio conjunto de servicios, reutilizando `usuarios` y el núcleo compartido. El criterio de aceptación sigue siendo el mismo del PCS: ningún módulo nuevo debería requerir tocar el módulo de Sorteos para funcionar.

---

## 6. Estrategia de desarrollo y roadmap técnico

### 6.1 Orden recomendado

El orden prioriza tener, lo antes posible, algo que se pueda probar de punta a punta con datos reales — primero los datos, después el camino del usuario (el corazón del producto), recién después el panel completo, y al final lo que endurece y prepara el futuro.

### 6.2 Módulos de desarrollo

| Módulo | Contenido | Cómo se prueba de forma independiente |
|---|---|---|
| **Módulo 1 — Base del proyecto** | Proyecto Next.js inicializado, tokens de diseño del Sprint 3 cargados como variables, conexión a la base de datos, despliegue automático a Vercel. | La aplicación se despliega y muestra una pantalla con el sistema de diseño aplicado, sin datos todavía. |
| **Módulo 2 — Núcleo de datos** | Las siete tablas de la sección 3 (incluidas auditoría y configuración), la capa de acceso a datos, y los tipos de TypeScript. | Se puede crear, leer y borrar un registro de cada tabla sin pasar por ninguna pantalla. |
| **Módulo 3 — Participación del usuario** | Pantallas U1 a U5 conectadas a datos reales: ver el sorteo activo, cargar datos, elegir número (según número inicial/cantidad configurados), confirmar. | Una persona real puede participar de punta a punta desde su celular, en un sorteo con un rango de números distinto al de prueba. |
| **Módulo 4 — Resultado y publicación** | Pantalla U6, y del lado administrador A7/A8 (obtener y publicar resultado, incluida la carga manual de contingencia), con ambas modalidades de determinación del ganador (sección 3.6). | Se puede cerrar un sorteo de prueba en cada modalidad y publicar un ganador real en ambos casos. |
| **Módulo 5 — Panel de administración completo** | A1 (login), A2 (panel), A3/A4 (crear/editar, con número inicial y modalidad), A5/A6 (participantes), A9 (verificar premio), A10 (duplicar). Cada acción relevante queda escrita en auditoría (sección 3.7). | El administrador completa un ciclo semanal entero sin tocar la base de datos a mano, y cada acción queda registrada. |
| **Módulo 6 — Seguridad y endurecimiento** | Protección de rutas, límite de solicitudes, validaciones finales, manejo de errores robusto en todos los casos límite del Sprint 1. | Pruebas deliberadas de abuso y de casos límite (número repetido, doble clic, sesión vencida) se comportan como está documentado. |
| **Módulo 7 — Preparación de integraciones** | Las interfaces de la sección 5 (WhatsApp, Quiniela, métricas) como código vacío pero ya conectado en los momentos correctos. | Los métodos se llaman en el momento esperado y no rompen nada, aunque todavía no hagan nada real. |
| **Módulo 8 — Pulido y lanzamiento** | Prueba en dispositivos reales, revisión de accesibilidad, contenido definitivo de los mensajes de Peggie, primer sorteo real con público. | El primer sorteo semanal real se completa sin intervención manual fuera de lo ya diseñado. |

Los Módulos 3 y 5 podrían avanzar en paralelo si hubiera más de una persona desarrollando; en solitario, se recomienda respetar el orden de la tabla.

---

## 7. Validación final del Sprint

- [x] Estructura de Frontend (carpetas, componentes, convenciones, navegación, layouts, estado, responsive) aprobada
- [x] Estructura de Backend (capas, servicios, reglas de negocio, errores, API) aprobada
- [x] Modelo de base de datos (tablas, relaciones, claves, índices, integridad) aprobado
- [x] Números configurables por sorteo (número inicial + cantidad) aprobados
- [x] Modalidad de determinación del ganador (exacto / más cercano) aprobada, incluida la regla de desempate propuesta
- [x] Entidad de auditoría aprobada
- [x] Entidad de configuración global aprobada
- [x] Seguridad (autenticación, protección de rutas, sesiones, buenas prácticas) aprobada
- [x] Arquitectura de integraciones futuras aprobada
- [x] Roadmap técnico y módulos de desarrollo aprobados
- [x] Documento Sprint 4 — Arquitectura Técnica aprobado en su totalidad

**Sprint 4 aprobado el 2026-07-08. Comienza el Sprint 5: desarrollo, siguiendo el orden de módulos de la sección 6.2.**
