# PGL Club

La comunidad oficial de PGL Electrónica. Este repositorio es el código del producto — la documentación de producto y arquitectura vive en [`docs/`](./docs) (PCS y Sprints 1 a 4, todos aprobados).

**Estado actual: Módulo 8 — Pulido y lanzamiento, en progreso.** Primer avance: la bienvenida de Peggie (U1) ahora distingue a alguien que ya participó en un sorteo anterior de alguien nuevo (Sprint 1, sección 8.7) — hasta ahora ese punto del documento aprobado no estaba implementado en el código. Todavía quedan pendientes: prueba en dispositivos reales, revisión de accesibilidad, y el primer sorteo real con público — ver [checklist de este módulo](#checklist-de-cierre-del-módulo-8).

---

## Stack técnico y por qué

Decisiones ya justificadas en el PCS y el Sprint 4; acá se listan las que además implicaron elegir una versión o herramienta concreta al momento de escribir el código:

| Herramienta | Elegida | Por qué |
|---|---|---|
| Framework | Next.js 16 (App Router) | Aprobado en el PCS. Se había fijado inicialmente la versión 14 por estabilidad, pero `npm audit` detectó vulnerabilidades reales de severidad alta en esa línea (denegación de servicio, envenenamiento de caché, entre otras — ver detalle en el registro de validación técnica). Se actualizó a 16.2.10, la primera versión que las resuelve todas. |
| Lenguaje | TypeScript, modo `strict` | Reduce errores en tiempo de compilación antes de que lleguen a producción — más valioso todavía en un proyecto que va a crecer con módulos nuevos con el tiempo. |
| Estilos | Tailwind CSS 3 | Permite que los Design Tokens del Sprint 3 (`styles/tokens.css`) se conviertan directamente en utilidades (`bg-primary`, `rounded-md`, `shadow-1`) sin escribir CSS a mano por componente. |
| Base de datos | PostgreSQL 17 + Prisma 5.22 | PostgreSQL ya estaba aprobado en el PCS. Prisma se elige como ORM por su integración natural con TypeScript (tipos generados automáticamente desde el esquema) y por evitar escribir SQL a mano para las operaciones más comunes, sin perder la posibilidad de hacerlo cuando haga falta. *Nota: hay una versión mayor de Prisma disponible (7.x); se mantiene 5.22 por ahora porque no tiene vulnerabilidades reportadas y un salto de versión mayor amerita evaluarse aparte, no de paso en este módulo.* |
| Claves primarias | UUID | Evita exponer un conteo secuencial de registros (cuántos sorteos o usuarios existen) y funciona mejor con escritura distribuida — más alineado con "pensar en el crecimiento futuro" que un entero autoincremental. |
| Hosting | Vercel | Aprobado en el PCS — despliegue automático, sin mantenimiento de servidores. |
| Calidad de código | ESLint + Prettier | Un único formato de código en todo el equipo, y una única fuente de reglas de calidad, desde el primer archivo. |

## Estructura del proyecto

```
PGL-Club/
├── app/                            Next.js App Router
│   ├── (usuario)/                  U1-U6, en producción (Módulos 3 y 4)
│   │   ├── layout.tsx               contenedor mobile-first
│   │   ├── page.tsx                 U1/U2 — fetch server-side + <ParticipacionFlow>
│   │   └── resultado/[id]/          U6 — resultado público, personalizable
│   ├── (administrador)/            A1-A10 completo (Módulos 4 y 5)
│   │   ├── layout.tsx               async, muestra <BarraAdmin> solo si hay sesión
│   │   ├── login/page.tsx           A1
│   │   ├── panel/page.tsx           A2 — sorteo activo + historial + accesos
│   │   └── sorteos/
│   │       ├── crear/page.tsx       A3
│   │       └── [id]/
│   │           ├── editar/page.tsx      A4
│   │           ├── participantes/page.tsx  A5/A6
│   │           ├── premio/page.tsx      A9
│   │           └── resultado/page.tsx   A7 (obtener) + A8 (publicar), un solo flujo
│   ├── api/
│   │   ├── auth/                   login/ (POST) y logout/ (POST)
│   │   ├── admin/
│   │   │   ├── sorteos/             POST (A3), [id]/ PATCH (A4), [id]/duplicar/ POST (A10)
│   │   │   ├── sorteos/[id]/participantes/exportar/  GET, CSV
│   │   │   ├── sorteos/[id]/premio/ PATCH (verificar) + POST (confirmar entrega) — A9
│   │   │   └── participaciones/[id]/ DELETE (A5/A6, `?accion=liberar|eliminar`)
│   │   ├── sorteos/
│   │   │   ├── activo/                  GET sorteo activo + último resultado
│   │   │   ├── listos-para-resultado/   GET candidatos para A7
│   │   │   ├── [id]/participaciones/    GET (chequeo teléfono) / POST (reservar)
│   │   │   └── [id]/resultado/          GET (público) / POST (A7) / PATCH (A8) — ambos requieren sesión
│   │   └── metricas/
│   │       └── click-whatsapp/          POST — registra un clic hacia el canal de WhatsApp (Módulo 7)
│   ├── layout.tsx                  layout raíz: metadata, globals.css
│   └── globals.css                 Tailwind + import de los Design Tokens
├── components/
│   ├── ui/                         biblioteca de componentes del Sprint 3
│   ├── peggie/                     avatar, burbuja y catálogo de mensajes
│   ├── sorteos/                    NumberGrid, PrizeCard, CountdownTimer, ParticipacionFlow, screens/ (U1-U6)
│   └── admin/                      BarraAdmin, FormularioSorteo, ListaParticipantes, EntregaPremio, BotonDuplicar, ResultadoFlow
├── lib/
│   ├── prisma.ts                   instancia única de Prisma Client
│   ├── errors.ts                   taxonomía de errores (Sprint 4, 2.3)
│   ├── validation.ts                validaciones de negocio server-side
│   ├── utils.ts                     utilidades genéricas
│   ├── password.ts                  hash/verificación con `crypto.scrypt`
│   ├── session.ts                   cookie de sesión firmada (HMAC-SHA256)
│   ├── require-auth.ts              guardas de sesión para páginas y APIs
│   ├── api-error.ts                 traducción uniforme de `ErrorAplicacion` a respuesta HTTP
│   ├── request-ip.ts                 IP real del cliente a partir de `x-forwarded-for`
│   └── services/                    Sorteo-, Participacion-, Resultado-, ResultadoExterno-, Configuracion-, AdminSorteo-, Auditoria-, ParticipanteService, AuthService, LimitadorService, NotificacionesService, registrarEventoMetrica (Módulo 7)
├── hooks/
│   └── use-theme.ts                tema claro/oscuro
├── styles/
│   └── tokens.css                  Design Tokens — única fuente de verdad visual
├── types/
│   └── sorteo.ts                    DTOs compartidos servidor ↔ cliente
├── prisma/
│   ├── schema.prisma                modelo de datos completo (7 tablas + 1 reservada)
│   ├── seed.ts                      datos de prueba mínimos
│   └── migrations/                  historial de migraciones generado por Prisma
├── middleware.ts                   protección de rutas /panel y /sorteos/* (solo valida presencia de cookie)
├── public/                         activos estáticos (vacío por ahora)
└── docs/                           PCS y Sprints 1 a 4 (documentación de producto, ya existente)
```

### Biblioteca de componentes (`components/ui/`)

Implementación en código de la biblioteca ya aprobada en el Sprint 3: `Button`, `Card`, `Input`, `Checkbox`, `Badge`, `Tabs`, `Alert`, `Modal`, `Tooltip`, `Skeleton`, `StatCounter`. Ninguno conoce el negocio de sorteos — reciben datos por props y se apoyan únicamente en los Design Tokens (`styles/tokens.css`) a través de las utilidades de Tailwind configuradas en `tailwind.config.ts`.

### Módulo 8 — decisiones de implementación (en progreso)

- **Reconocer a un visitante recurrente no necesita ninguna consulta nueva a la base** (Sprint 1, sección 8.7): alcanza con que exista *cualquier* registro de participación guardado en `localStorage` (`ParticipacionFlow.tsx`), sin importar a qué sorteo pertenezca. Antes, ese mismo dato solo se leía si coincidía con el id del sorteo activo — que es exactamente lo que hacía falta para otra cosa (mostrar "Ver mi número" en *este* sorteo), pero dejaba a cualquiera que volviera en una semana distinta tratado como visitante nuevo, al revés de lo que pide el documento.
- **El tono de "bienvenida de vuelta" (`MENSAJES.bienvenidaDeVuelta`) no menciona ningún dato personal** — ni nombre, ni número anterior, ni teléfono — solo transmite que es una cara conocida, tal como lo exige la sección 8.7 ("sin necesidad de recordar datos personales").
- **Validado en navegador real** (Playwright contra el servidor de desarrollo, no solo revisión de código): primera visita sin `localStorage` muestra la bienvenida normal; una visita simulada con un registro de un sorteo distinto al activo muestra la bienvenida de vuelta.

### Módulo 7 — decisiones de implementación

- **`NotificacionesService` (`lib/services/notificaciones-service.ts`) es una implementación vacía a propósito** (Sprint 4, sección 5.1): `enviarConfirmacion` se llama desde `ParticipacionService.reservarNumero` justo después de confirmar la reserva, y `anunciarResultado` desde `ResultadoService.publicarResultado` justo después de publicar. El día que exista una API real de WhatsApp, el cambio queda contenido en ese único archivo — ningún llamador necesita tocarse.
- **El registro en `eventos_metricas` (`lib/services/metrica-service.ts`) se conecta en los tres momentos previstos** (Sprint 4, sección 5.3): `VISITA` en cada carga real de la pantalla principal (`app/(usuario)/page.tsx`), `PARTICIPACION` en cada reserva confirmada, y `CONVERSION_WHATSAPP` en cada clic hacia el canal — este último a través de un endpoint nuevo (`POST /api/metricas/click-whatsapp`) porque el clic ocurre en el cliente (`ParticipacionFlow.abrirWhatsapp`), no en un Server Component.
- **El clic hacia WhatsApp nunca espera la respuesta del registro de métrica.** `abrirWhatsapp` abre la ventana primero y dispara el `fetch` sin `await`, con un `catch` vacío — perder una fila de métricas no puede demorar ni romper la acción real que el usuario está esperando.
- **El registro de la participación en `eventos_metricas` ocurre después de que la transacción de reserva ya confirmó éxito, nunca dentro del mismo `try` que la traduce a errores de negocio.** Si esto se escribiera dentro del mismo bloque, una falla al registrar la métrica se traduciría (incorrectamente) en un error de "número ocupado" o "inesperado" de cara al usuario, aunque su número ya hubiera quedado reservado.
- **`CONVERSION_INSTAGRAM`, `CONVERSION_FACEBOOK` y `CONVERSION_CAMPANA` quedan en el enum sin ningún llamador todavía** — no existe hoy ningún enlace de esos canales en la interfaz real; se agregan el día que exista un enlace concreto que trackear, mismo criterio que ya se aplicó a `ResultadoExternoService` en el Módulo 4.

### Módulo 6 — decisiones de implementación

- **Límite de solicitudes respaldado en Postgres, no en memoria ni en un servicio externo** (decisión presentada con alternativas y confirmada por el Product Owner antes de programar). Una única tabla genérica (`intentos_acceso`, clave + conteo + ventana + bloqueo) sirve tanto para el bloqueo de login como para el límite del endpoint público de participación — no hace falta una tabla por caso de uso. Se descartó un contador en memoria porque no es confiable en el destino real del proyecto (Vercel, funciones serverless con múltiples instancias — cada instancia tendría su propio contador vacío), y un servicio externo (Redis/Upstash) porque suma infraestructura y dependencias nuevas para una escala de tráfico que no lo justifica, rompiendo el mismo principio ya aplicado en el Módulo 5 con el hashing de contraseñas.
- **Login: 5 intentos fallidos en 15 minutos bloquean por 15 minutos**, con la clave combinando usuario **e IP** (`login:admin:190.1.2.3`), no solo el usuario — si la clave fuera solo el usuario, cualquiera que supiera el nombre de usuario podría bloquear al administrador real a propósito, repitiendo contraseñas incorrectas desde cualquier lugar. Combinando usuario+IP, el bloqueo cae sobre quien está adivinando, no sobre el administrador legítimo que entra desde su propio lugar de siempre.
- **Participación pública: 20 solicitudes por IP por minuto bloquean esa IP por 5 minutos** — umbral generoso a propósito, para que un usuario real reintentando tras un número ocupado nunca choque con esto, solo un script.
- **Protección de rutas extendida a las APIs administrativas.** `middleware.ts` ahora también cubre `/api/admin/:path*`, no solo las páginas — la diferencia importante es que una API sin sesión responde con un JSON 401, nunca con la redirección HTML que reciben las páginas (un `fetch()` que sigue una redirección en silencio termina intentando interpretar el HTML de `/login` como si fuera la respuesta esperada).
- **CSRF: ya estaba resuelto desde el Módulo 5, no hizo falta código nuevo.** La cookie de sesión usa `sameSite: "lax"` + `HttpOnly` (Sprint 4, sección 6), y todas las acciones del administrador se disparan por `fetch()` con JSON, no por formularios HTML tradicionales — un sitio malicioso no puede lograr que el navegador de un administrador logueado dispare una de estas acciones, porque el navegador no adjunta la cookie a esas solicitudes cruzadas. Se documenta acá porque el Sprint 4 lo pedía explícitamente, no porque haya requerido un cambio.
- **Topes de longitud en entradas de texto sin límite previo** (nombre del participante, premio, URL de imagen) — antes se podían enviar cadenas arbitrariamente largas. No era una vulnerabilidad (Prisma parametriza todo, no hay riesgo de inyección), pero sí un caso límite sin cubrir.
- **Se cerró una deuda técnica documentada en el Módulo 5**: un `modalidadGanador` inválido enviado directo por API ya no cae en silencio a `"EXACTO"` — ahora se rechaza con `VALIDACION`, igual que cualquier otro dato mal formado.

### Módulo 5 — decisiones de implementación

- **Sesión firmada, no JWT.** La cookie `pgl_club_session` guarda el id del administrador y una expiración, firmados con HMAC-SHA256 (`lib/session.ts`) usando `ADMIN_SESSION_SECRET`. Es `HttpOnly`, así que ningún script en el navegador puede leerla — confirmado en la validación: `document.cookie` no la expone.
- **Defensa en profundidad, en dos capas reales.** `middleware.ts` corre en el Edge Runtime (sin acceso a `crypto` de Node) y solo puede verificar que la cookie *exista* — deja pasar a cualquiera que tenga alguna cookie con ese nombre, incluida una forjada a mano. La verificación de firma y vencimiento ocurre después, en el servidor (`requerirSesionPagina`/`requerirSesionApi`). Se probó exactamente ese ataque: forjar `document.cookie = "pgl_club_session=valor_falso..."` deja pasar el middleware pero el servidor responde 401/redirige al login igual.
- **Contraseñas con `crypto.scrypt` del propio Node**, no una librería externa como bcrypt — coherente con el resto del proyecto (Sprint 4: preferir la plataforma antes que sumar dependencias) y evita una superficie de vulnerabilidades adicional en `npm audit`.
- **"Liberar número" y "eliminar participante" son la misma operación técnica** (`ParticipanteService.quitarParticipacion`) — lo único que cambia es qué acción queda en la tabla `auditoria`, según qué botón tocó el administrador. Ya estaba previsto así en el diseño del enum `AccionAuditoria` del Módulo 2.
- **Exportación CSV en vez de un `.xlsx` binario real.** Excel abre `.csv` sin problema y evita sumar una dependencia solo para generar un archivo binario — documentado como decisión, no como pendiente.
- **Auditoría conectada de punta a punta.** Las seis acciones del enum (`CREAR_SORTEO`, `EDITAR_SORTEO`, `ELIMINAR_PARTICIPANTE`, `LIBERAR_NUMERO`, `PUBLICAR_RESULTADO`, `ENTREGAR_PREMIO`) ahora escriben con el `administradorId` real de la sesión — cierra la deuda técnica que había quedado abierta en el Módulo 4.

### Módulo 4 — decisiones de implementación

- **`ResultadoService` nunca acepta un ganador manual** (Sprint 4, sección 2.2): el único dato "a mano" es el número de la Quiniela — quién ganó siempre sale de cruzarlo contra las participaciones, en cualquiera de las dos modalidades.
- **Modalidad "número más cercano" con desempate real**, no solo documentado: `encontrarMasCercano` compara diferencias absolutas y, ante un empate exacto, se queda con el número menor — probado con un caso real de empate (30 y 34 igual de cerca del 32 → gana el 30).
- **`ResultadoExternoService` es la interfaz de la Quiniela** (Sprint 4, sección 5.2): hoy su única implementación es un pass-through de la carga manual del administrador. El día que exista una consulta automática real, cambia solo ese archivo.
- **A7/A8 sin panel completo todavía.** Como A2 (el panel real) es Módulo 5, `app/(administrador)/sorteos/page.tsx` es un índice mínimo y temporal, explícitamente marcado como tal en el código — se reemplaza cuando el panel completo exista.
- **U6 vive en una ruta propia** (`/resultado/[id]`), a diferencia de U1-U5 que comparten una sola ruta — a U6 se puede llegar desde U2 (último resultado) o por enlace directo, y necesita su propio id en la URL para eso.

### Módulo 3 — decisiones de implementación

- **U1-U5 en una sola ruta (`/`), no cinco URLs distintas.** Los wireframes y prototipos del Sprint 2/3 siempre trataron las "pantallas" como estados de una misma app, no como páginas separadas — `ParticipacionFlow` (client component) maneja el paso actual con estado local, evitando además tener que pasar datos sensibles (teléfono) entre rutas.
- **Server Component + Client Component, no todo junto.** `app/(usuario)/page.tsx` pide los datos al servidor (sorteo activo, último resultado, enlace de WhatsApp) y se los pasa a `ParticipacionFlow`, que es donde vive toda la interactividad — así se respeta la decisión del Sprint 4 de pedir datos desde el servidor siempre que se pueda.
- **Reserva atómica de verdad.** `ParticipacionService.reservarNumero` no valida "a mano" que un número esté libre: intenta crear la fila directamente y deja que la restricción única de la base de datos decida. Si Postgres la rechaza, se traduce ese rechazo a `NUMERO_OCUPADO` o `TELEFONO_YA_PARTICIPO` según qué columna violó la restricción — no hay ventana de tiempo en la que dos personas puedan creer que tienen el mismo número.
- **"Ya participaste" sin login.** Como el proyecto no tiene contraseñas (PCS, sección 9.4), reconocer a alguien que vuelve se resuelve guardando su teléfono en `localStorage` tras confirmar una participación — nunca se usa como fuente de verdad (siempre se vuelve a consultar la base), solo para decidir qué botón mostrar en U1.
- **Peggie sin color propio, con variedad de frases.** Cada mensaje tiene 2-3 variantes elegidas de forma determinística (a partir del id del sorteo, el teléfono, etc.) — nunca al azar en cada render, para no generar un parpadeo entre lo que pinta el servidor y lo que pinta el cliente.

## Configuración global del proyecto

- **`tailwind.config.ts`** — el puente entre los tokens (`styles/tokens.css`) y las utilidades de Tailwind. Ningún componente escribe un color, radio o sombra "a mano".
- **`tsconfig.json`** — modo estricto, alias `@/*` apuntando a la raíz del proyecto (por ejemplo, `@/components/ui`, `@/lib/utils`).
- **`eslint.config.mjs`** — configuración "flat" de ESLint 9, con las reglas oficiales de Next.js (`eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`). Nota: `next lint` fue removido del CLI de Next.js 16; el lint corre invocando `eslint` directamente.
- **`.prettierrc.json`** — formato de código único, con el plugin de Tailwind para ordenar clases automáticamente.
- **`.env.example`** — plantilla de variables de entorno; `.env` real nunca se versiona.

## Cómo ejecutar el proyecto localmente

1. Instalar las dependencias:
   ```
   npm install
   ```
2. Copiar el archivo de variables de entorno y completarlo con una base PostgreSQL real (por ejemplo, un proyecto gratuito en Neon o Supabase):
   ```
   cp .env.example .env
   ```
3. Levantar el servidor de desarrollo:
   ```
   npm run dev
   ```
4. Abrir `http://localhost:3000` — se va a ver la pantalla principal real (U1) con el sorteo activo del seed.

Comandos adicionales disponibles: `npm run lint`, `npm run typecheck`, `npm run format`.

### Base de datos (Módulo 2)

Con `DATABASE_URL` ya configurada en `.env`:

```
npm run prisma:migrate   # crea/aplica las migraciones y genera el cliente
npm run prisma:seed      # carga los datos de prueba mínimos
npm run prisma:studio    # abre Prisma Studio (http://localhost:5555) para inspeccionar los datos
```

`prisma/schema.prisma` todavía no tiene ninguna migración generada la primera vez — `npm run prisma:migrate` la crea.

## Cómo desplegar en Vercel

1. Subir este repositorio a GitHub (o el proveedor Git que se use).
2. En Vercel, crear un nuevo proyecto e importar el repositorio — Vercel detecta Next.js automáticamente, no hace falta configuración adicional de build.
3. Cargar la variable de entorno `DATABASE_URL` en la configuración del proyecto en Vercel (Settings → Environment Variables), con el mismo valor que en `.env` (o el de producción, si es una base distinta a la de desarrollo).
4. Desplegar. Cada cambio aprobado que se suba a la rama principal se despliega automáticamente (comportamiento por defecto de Vercel, ya aprobado en el PCS).

## Restricciones de este módulo

Deliberadamente, el Módulo 7 **no** incluye: ninguna integración automática real con WhatsApp ni con la Quiniela (`NotificacionesService` sigue sin hacer nada real, y `ResultadoExternoService` sigue siendo la carga manual del Módulo 4), ningún panel que consuma los datos de `eventos_metricas`, ni pulido final de accesibilidad/dispositivos reales ni el primer sorteo real con público. Eso pertenece al Módulo 8 (`docs/SPRINT-4-ARQUITECTURA-TECNICA.md`, sección 6.2).

## Checklist de cierre del Módulo 1

- [x] El proyecto instala sin errores (`npm install`) — 0 vulnerabilidades
- [x] El proyecto corre localmente (`npm run dev`) y la página de verificación muestra los Design Tokens y la biblioteca de componentes — verificado, `HTTP 200`
- [x] El modo oscuro funciona (botón en la página de verificación)
- [x] `npm run lint` no reporta errores
- [x] `npm run typecheck` no reporta errores
- [x] `npm run format:check` no reporta diferencias
- [x] `prisma/schema.prisma` queda conectado a PostgreSQL vía `DATABASE_URL`, sin modelos todavía — `npx prisma generate` recién va a funcionar (y corresponde correrlo) en el Módulo 2, cuando existan modelos reales. Correrlo antes falla a propósito ("You don't have any models defined").
- [x] El árbol de carpetas completo existe, con un `README.md` en cada carpeta reservada explicando su propósito
- [ ] El proyecto se despliega en Vercel sin errores de build — pendiente: requiere subir el repositorio a un proveedor Git y una base PostgreSQL real, no se pudo probar en este entorno
- [x] Cualquier persona que se sume al equipo puede leer este README y entender cómo está organizado PGL Club sin hacer preguntas adicionales

**Validación técnica: completa.** `npm install`, `npm run dev`, `npm run build`, `npm run lint` y `npm run typecheck` se ejecutaron realmente en esta máquina (Node.js v24.18.0 / npm 11.16.0, instalados para poder validar) y terminaron sin errores. El detalle de qué falló en el camino y cómo se corrigió está en el informe de validación entregado en el chat — no quedó nada pendiente sin resolver salvo la prueba de despliegue en Vercel, que excede lo que se puede probar desde acá.

## Checklist de cierre del Módulo 2

- [x] `prisma/schema.prisma` implementa las 7 entidades aprobadas + `eventos_metricas` reservada, con relaciones, claves primarias, claves foráneas, restricciones únicas, índices y enumeraciones
- [x] `npx prisma validate` y `npx prisma format` — sin errores
- [x] `npx prisma migrate dev` — migración generada y aplicada contra PostgreSQL real (no simulada)
- [x] `npx prisma generate` — Prisma Client generado sin errores
- [x] Seed (`npm run prisma:seed`) — corrido con éxito; datos verificados directamente en la base con `psql`, incluyendo el caso de modalidad "número más cercano" (número ganador ≠ número premiado)
- [x] Prisma Studio (`npm run prisma:studio`) — verificado en `http://localhost:5555`, `HTTP 200`
- [x] `npm run build`, `npm run lint`, `npm run typecheck`, `npm run format:check` — todos en verde después de agregar el modelo de datos
- [x] `npm audit` — 0 vulnerabilidades

**Entorno de validación:** PostgreSQL 17 instalado localmente (`winget install PostgreSQL.PostgreSQL.17`) porque no había ninguna base disponible en esta máquina. Es una base de **desarrollo**, no la de producción — en Vercel se usa el proveedor administrado (Neon/Supabase) definido en el PCS, con su propio `DATABASE_URL`.

## Checklist de cierre del Módulo 3

- [x] `npm run build`, `npm run lint`, `npm run typecheck`, `npm run format:check` — todos en verde
- [x] `npm audit` — 0 vulnerabilidades
- [x] Recorrido real en el navegador: U1 → U3 → U4 → U5 completo, con captura de pantalla en cada paso
- [x] La reserva de número quedó verificada directamente en PostgreSQL con `psql` (no solo confiando en la respuesta de la API)
- [x] Casos de error probados contra el servidor real, no simulados: número ocupado (409), teléfono que ya participó (409), sorteo inexistente (404), sorteo cerrado/no activo (409), nombre vacío (400), número fuera de rango (400) — los seis devuelven el código y el mensaje esperados
- [x] La grilla de números se construye dinámicamente a partir de `numeroInicial`/`cantidadNumeros` del sorteo — sin ningún rango fijo en el código (Sprint 4, sección 3.5)
- [x] Se encontraron y corrigieron dos errores reales durante la validación (no solo en la revisión del código): `prisma generate` fallando sin modelos definidos (Módulo 1, ya corregido) y la detección de conflictos de reserva usando el nombre del índice en vez de las columnas que Postgres realmente informa — ver detalle en el informe entregado en el chat
- [x] Base de datos reseteada a su estado limpio de seed después de las pruebas manuales

**Cambio importante:** la página de verificación del Módulo 1 (`app/page.tsx`) se eliminó — su único propósito era confirmar que los Design Tokens y la biblioteca de componentes funcionaban antes de que existiera una sola pantalla real. Ahora que U1 existe y ocupa esa misma ruta (`/`), mantener las dos hubiera sido un conflicto de rutas en Next.js además de código innecesario.

### Deuda técnica — Módulo 3

- **"Compartir" sin respaldo en desktop** (`navigator.share` sin alternativa de copiar enlace) — postergado a propósito por el enfoque mobile-first.
- **Sin límite de solicitudes** en `POST /participaciones` — previsto para el Módulo 6.
- **Sin pruebas automatizadas** — la validación fue real pero manual.
- **Contador regresivo con granularidad de un minuto**, no de segundos — decisión deliberada de simplicidad.
- **La grilla de números no está pensada para rangos muy grandes** (cientos de celdas) — no hizo falta evaluarlo para el alcance de este módulo.

## Checklist de cierre del Módulo 4

- [x] `npm run build`, `npm run lint`, `npm run typecheck`, `npm run format:check` — todos en verde
- [x] `npm audit` — 0 vulnerabilidades
- [x] Las dos modalidades probadas contra sorteos reales creados a propósito para este módulo: "exacto" con ganador, "exacto" desierto, y "número más cercano" con un empate real (30 y 34 igual de cerca del 32 → ganó el 30, según la regla de desempate aprobada)
- [x] Máquina de estados del sorteo verificada en la base con `psql`: ACTIVO → RESULTADO_OBTENIDO → PUBLICADO (con ganador) / DESIERTO (sin ganador)
- [x] A7, A8 y U6 recorridos en el navegador real, con captura de pantalla en cada paso — no solo probados por API
- [x] Reintentar publicar un resultado ya publicado, y volver a calcular un resultado ya obtenido, devuelven 409 con el código correcto en vez de romper o duplicar datos
- [x] Se encontró y corrigió un error real durante la validación: al reintentar calcular un resultado ya obtenido, el mensaje decía "todavía no cerró" en lugar de "ya se obtuvo un resultado" — el orden de las validaciones estaba invertido
- [x] Base de datos reseteada a su estado limpio de seed después de las pruebas manuales

### Deuda técnica — Módulo 4

- **Sin auditoría todavía.** `PUBLICAR_RESULTADO` es una de las seis acciones que la tabla `auditoria` debería registrar (Sprint 4, sección 3.7), pero como todavía no existe un administrador autenticado de verdad (eso es Módulo 5), no había ningún `administradorId` real para asociarle al registro. Se decidió no simular uno — se conecta la escritura real a `auditoria` en el Módulo 5, cuando exista una sesión de administrador genuina.
- **A7/A8 sin protección de acceso.** Cualquiera que conozca la URL puede entrar a `/sorteos` y publicar un resultado — a propósito, porque el login es Módulo 5. No es apto para producción tal como está; el propio Módulo 5 lo cierra.
- **Índice de administración temporal.** `app/(administrador)/sorteos/page.tsx` es una lista mínima, no el panel real (A2) con métricas y accesos — se reemplaza en el Módulo 5.
- **Caso "sorteo sin ninguna participación" en modalidad "número más cercano" no tiene un mensaje dedicado** — se trata como desierto (ninguna diferencia con la modalidad exacta), que es razonable, pero no está escrito en ningún documento previo porque no era un caso contemplado explícitamente.

## Checklist de cierre del Módulo 5

- [x] `npm run build`, `npm run lint`, `npm run typecheck`, `npm run format:check` — todos en verde
- [x] `npm audit` — 0 vulnerabilidades
- [x] A1-A10 recorridos en el navegador real (no solo por API): login con credenciales correctas e incorrectas, panel (A2), crear sorteo (A3), editar sorteo (A4, incluyendo el error de "ya hay un sorteo activo" mostrado en la propia pantalla), participantes con liberar/eliminar y su modal de confirmación (A5/A6), verificar y entregar premio (A9), duplicar sorteo (A10) y logout — con capturas de pantalla en los pasos clave
- [x] Cada acción se verificó directamente en PostgreSQL con `psql`, no solo confiando en la respuesta de la API o de la interfaz
- [x] Intentos deliberados de "romper el sistema": credenciales incorrectas repetidas, cookie de sesión forjada a mano (pasa el middleware pero el servidor la rechaza), acceso a páginas y APIs administrativas sin ninguna cookie, crear un segundo sorteo activo, bajar los cupos por debajo de lo ya reservado, editar un sorteo ya publicado, confirmar la entrega de un premio sin haber marcado la verificación de WhatsApp, confirmar la entrega dos veces seguidas, exportar CSV de un sorteo inexistente, y entradas límite en el formulario de sorteo (cantidad de números en cero o negativa, fecha de cierre en el pasado, premio vacío, número inicial no entero) — todos devolvieron el código y el mensaje esperados, sin romper ni corromper datos
- [x] Se encontraron y corrigieron dos errores reales durante la validación (no solo en la revisión del código, sino reproducidos contra el servidor real):
  1. **Eliminar al ganador de un sorteo ya publicado rompía con un error 500 sin manejar** (`Foreign key constraint violated`, código Prisma `P2003`) en lugar de devolver un rechazo prolijo — `ParticipanteService.quitarParticipacion` no validaba el estado del sorteo antes de borrar. Corregido aplicando la misma regla que ya existía para editar sorteos: no se pueden quitar participantes de un sorteo que no está en `BORRADOR` o `ACTIVO`.
  2. **Confirmar la entrega de un premio dos veces duplicaba el registro de auditoría** — `confirmarEntregaPremio` no era idempotente. Corregido: si el premio ya estaba marcado como entregado, la segunda llamada no vuelve a escribir en `auditoria`.
- [x] Base de datos reseteada a su estado limpio de seed después de las pruebas manuales

### Deuda técnica — Módulo 5

- ~~Sin límite de intentos de login ni bloqueo temporal~~ — **resuelto en el Módulo 6.**
- ~~Sin rate-limiting en ninguna API administrativa~~ — **resuelto en el Módulo 6** (protección de rutas extendida a `/api/admin/:path*`).
- **`middleware.ts` usa la convención de nombre que Next.js 16 marcó como obsoleta** (`middleware` en vez de `proxy`) — sigue funcionando sin problema y el build lo confirma, pero Next.js recomienda migrar a `proxy.ts` en algún momento futuro. No se migró en el Módulo 5 ni en el 6 a propósito: es el archivo que protege el acceso a todo el panel de administración, y renombrarlo sin una validación exhaustiva de que el nuevo nombre de convención tiene exactamente el mismo comportamiento sigue siendo un riesgo innecesario para el alcance actual. Queda como deuda abierta.
- **Exportar el CSV de un sorteo inexistente devuelve un archivo vacío (solo encabezados) en vez de un error 404.** No es un caso de corrupción de datos ni una falla de seguridad — simplemente no está pulido. Sigue sin tocarse porque el flujo real (el botón "Exportar" en la pantalla de participantes) nunca genera un id inexistente; solo aparece si alguien arma la URL a mano. Queda como deuda abierta.
- ~~Un `modalidadGanador` inválido enviado directamente por API cae en silencio a `"EXACTO"`~~ — **resuelto en el Módulo 6** (ahora se rechaza con `VALIDACION`).

## Checklist de cierre del Módulo 6

- [x] `npm run build`, `npm run lint`, `npm run typecheck`, `npm run format:check` — todos en verde
- [x] `npm audit` — 0 vulnerabilidades
- [x] Decisión técnica del mecanismo de límite de solicitudes presentada con alternativas (Postgres vs. memoria vs. servicio externo) antes de programar, con recomendación explícita y confirmación del Product Owner
- [x] Login: 5 intentos fallidos seguidos bloquean el par usuario+IP durante 15 minutos — probado contra el servidor real, incluyendo que la contraseña *correcta* también queda bloqueada mientras dura el bloqueo (no hay forma de saltearlo adivinando bien a tiempo), verificado directamente en la tabla `intentos_acceso` con `psql`, y confirmado que un login exitoso borra el registro de intentos
- [x] Participación pública: 20 solicitudes por IP en un minuto bloquean esa IP por 5 minutos — probado con 21 solicitudes reales contra el servidor, la 21ª bloqueada, sin ninguna participación fantasma creada en la base
- [x] Protección de rutas extendida a `/api/admin/:path*` — probado que una solicitud sin sesión a una API administrativa devuelve un JSON 401 (`NO_AUTENTICADO`), nunca la redirección HTML que reciben las páginas; y que una sesión válida sigue pasando sin problema
- [x] Caso límite "sesión vencida" probado de verdad: se generó a mano un token con firma HMAC válida pero con fecha de vencimiento en el pasado (mismo secreto que usa el servidor) y se inyectó como cookie — el servidor lo rechazó igual, confirmando que valida la expiración y no solo la firma
- [x] Caso límite "doble clic" probado de verdad: dos solicitudes de reserva idénticas disparadas en simultáneo contra el mismo número — una tuvo éxito, la otra devolvió `NUMERO_OCUPADO`, y la base terminó con exactamente una participación, no dos
- [x] Validaciones finales agregadas a entradas de texto sin tope de longitud (nombre del participante, premio, URL de imagen) y a `modalidadGanador` (ya no cae en silencio a un valor por defecto ante una entrada inválida)
- [x] Se encontró y corrigió un error real de diseño durante la implementación (no un bug de código, pero sí una falla real si no se corregía): la extensión del middleware a `/api/admin/:path*` inicialmente iba a redirigir con HTML igual que las páginas — se corrigió antes de probarlo en el navegador porque un `fetch()` sigue una redirección en silencio y termina intentando parsear la página de login como si fuera JSON, rompiendo cualquier llamada a la API sin sesión de una forma confusa en vez de un 401 claro
- [x] Base de datos reseteada a su estado limpio de seed después de las pruebas manuales (incluida la nueva tabla `intentos_acceso`, vacía en el seed)

### Deuda técnica — Módulo 6

- **El límite de solicitudes de participación es por IP, no por combinación de IP y sorteo o teléfono.** Un usuario real detrás de una IP compartida (varias personas en la misma red/NAT, común en algunas conexiones móviles) podría, en teoría, agotar el límite de esa IP si suficientes personas participan casi al mismo tiempo desde ahí. El umbral (20 solicitudes por minuto) es generoso a propósito para que esto sea improbable en la práctica, pero es una limitación real del enfoque por IP, no del todo eliminable sin pedir algún otro identificador al usuario — se documenta en vez de resolverse, porque agregar ese identificador sería una funcionalidad no pedida.
- **La tabla `intentos_acceso` no tiene un proceso de limpieza automática de filas viejas.** Con el tiempo va a acumular filas de bloqueos ya vencidos hace mucho — no afecta la lógica (una fila vencida se trata como si no existiera) ni el volumen esperado la vuelve un problema real a corto plazo, pero en algún momento futuro convendría un job de limpieza periódico. Fuera de alcance de este módulo.
- **`middleware.ts` sigue sin migrar a la convención `proxy.ts`** de Next.js 16 — deuda heredada del Módulo 5, misma razón (archivo crítico de seguridad, no se migra sin una validación exhaustiva aparte).
- **Exportar CSV de un sorteo inexistente sigue devolviendo un archivo vacío en vez de 404** — deuda heredada del Módulo 5, mismo motivo (inalcanzable desde la interfaz real).

## Checklist de cierre del Módulo 7

- [x] `npm run build`, `npm run lint`, `npm run typecheck`, `npm run format:check` — todos en verde
- [x] `npm audit` — 0 vulnerabilidades
- [x] Recorrido real contra el servidor y PostgreSQL reales (no simulado): visita a `/` (registra `VISITA`), reserva de número confirmada (registra `PARTICIPACION` y llama a `enviarConfirmacion`), clic hacia WhatsApp vía `POST /api/metricas/click-whatsapp` (registra `CONVERSION_WHATSAPP`), y ciclo completo de A7→A8 (registrar resultado y publicarlo, llamando a `anunciarResultado`) — las cuatro filas de `eventos_metricas` y la auditoría correspondiente se verificaron directamente con `psql`
- [x] Confirmado que un fallo hipotético al registrar la métrica de participación no puede traducirse en un error de negocio falso para el usuario: el registro ocurre fuera del `try` que traduce errores de la reserva
- [x] Base de datos reseteada a su estado limpio de seed (`prisma migrate reset`) después de las pruebas manuales

### Deuda técnica — Módulo 7

- **Ningún panel consume todavía los datos de `eventos_metricas`** — a propósito (Sprint 4, sección 5.3): el objetivo de este módulo era solo empezar a capturar, no mostrar. Queda para cuando se decida medir de verdad.
- **`CONVERSION_INSTAGRAM`, `CONVERSION_FACEBOOK` y `CONVERSION_CAMPANA` no tienen ningún llamador** — no existe hoy un enlace real de esos canales en la interfaz (Restricciones de este módulo).

## Checklist de cierre del Módulo 8

- [x] `npm run build`, `npm run lint`, `npm run typecheck`, `npm run format:check` — todos en verde
- [x] `npm audit` — 0 vulnerabilidades
- [x] Contenido definitivo de la bienvenida de Peggie para visitantes recurrentes (Sprint 1, sección 8.7) — implementado y verificado en navegador real (Playwright contra el servidor de desarrollo): primera visita vs. visita con una participación previa en otro sorteo
- [ ] Prueba en dispositivos reales — pendiente, no se puede probar desde este entorno
- [ ] Revisión de accesibilidad — pendiente
- [ ] Deploy real en Vercel con base de datos administrada (Neon/Supabase) — pendiente, ver sección "Cómo desplegar en Vercel"
- [ ] Primer sorteo real con público — pendiente, depende del deploy
