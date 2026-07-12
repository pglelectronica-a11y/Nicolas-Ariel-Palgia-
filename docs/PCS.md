# PCS — PGL Club Specification

**Versión:** 0.2 (aprobado)
**Etapa:** Sprint 5 — Desarrollo, en curso
**Estado:** Arquitectura, visión, especificación funcional, wireframes, diseño visual y arquitectura técnica aprobados por el Product Owner

Este documento es la única fuente oficial del proyecto **PGL Club**. Toda decisión importante aprobada de aquí en adelante se incorpora a este documento. No debe existir información relevante del proyecto fuera de este archivo.

### Documentos del proyecto

- **PCS.md** (este archivo) — arquitectura, visión y tecnologías. Fuente oficial de todo lo aprobado.
- **[SPRINT-1-FUNCIONAL.md](./SPRINT-1-FUNCIONAL.md)** — especificación funcional completa del Módulo Sorteos (pantallas, botones, estados, errores, recorridos, psicología del usuario y conversión, mensajes de Peggie). **Aprobado.**
- **[SPRINT-2-WIREFRAMES.md](./SPRINT-2-WIREFRAMES.md)** — wireframes en escala de grises de las 16 pantallas: navegación, ubicación de Peggie, responsive, componentes. **Aprobado.**
- **[SPRINT-3-DISEÑO-VISUAL.md](./SPRINT-3-DISEÑO-VISUAL.md)** — Design System definitivo (Dirección A + voz de Peggie de C + movimiento de B): colores, tipografía, grid, bordes/sombras, iconografía, animación, biblioteca de componentes, dashboard administrador. **Aprobado.**
- **[SPRINT-4-ARQUITECTURA-TECNICA.md](./SPRINT-4-ARQUITECTURA-TECNICA.md)** — estructura técnica completa: frontend, backend, base de datos (incluye números configurables, modalidad de ganador, auditoría y configuración global), seguridad, integraciones futuras y roadmap de módulos de desarrollo. **Aprobado.**

---

## 1. Misión

Construir la comunidad tecnológica más importante de Argentina, acercando tecnología, beneficios, entretenimiento y oportunidades a través de PGL Electrónica.

## 2. Visión

PGL Club no será una página de sorteos. Será la comunidad oficial de PGL Electrónica. Los sorteos serán únicamente el primer paso.

Con el tiempo la plataforma incorporará beneficios, ofertas, novedades, promociones y nuevos módulos que mantengan una comunidad activa alrededor de la marca. El objetivo es que los usuarios ingresen frecuentemente porque siempre existe algo nuevo.

La base del sistema (núcleo común, identidad de usuario, panel de administración) debe sostener esta visión sin reescribirse cada vez que se incorpore algo nuevo.

## 3. Objetivo principal

El objetivo de PGL Club **no** es hacer sorteos. El objetivo es hacer crecer la comunidad oficial de WhatsApp de PGL Electrónica.

Los sorteos son únicamente la herramienta inicial para lograrlo. Toda decisión futura —de producto, de diseño o técnica— debe favorecer ese crecimiento.

## 4. Principio fundamental

> Cada nueva funcionalidad deberá aportar valor al usuario y, al mismo tiempo, fortalecer la comunidad de PGL Electrónica.

Este principio es permanente y debe utilizarse para evaluar cualquier decisión futura del proyecto, sin excepción.

## 5. Filosofía de producto

PGL Club se construye pensando que algún día podrá tener decenas de miles de usuarios. Las decisiones priorizan, en este orden de importancia:

- Simplicidad.
- Escalabilidad.
- Facilidad de mantenimiento.
- Bajo costo operativo.
- Excelente experiencia de usuario.

No se desarrollan funciones únicamente porque sean técnicamente interesantes. Cada funcionalidad debe resolver un problema real o aportar valor al usuario, en línea con el principio fundamental (sección 4).

## 6. Alcance

### 6.1 Alcance general del proyecto
Una plataforma web modular, con un núcleo común (identidad de usuario, panel de administración, diseño) y módulos independientes que se agregan con el tiempo (sorteos, ofertas flash, novedades, puntos, cupones, juegos, etc.).

### 6.2 Alcance de la primera versión (Sprint 1 en adelante)
Únicamente el módulo **Sorteo Semanal**:
- Un sorteo activo por semana, con premio, imagen y fecha.
- Participación pública desde el celular en menos de un minuto.
- Reserva de número por usuario.
- Determinación automática del ganador según el resultado de la Quiniela Nacional Vespertina.
- Panel de administración para gestionar todo el ciclo del sorteo.

Todo lo demás (integración completa de WhatsApp, puntos, cupones, juegos) queda fuera de esta versión y se incorporará en Sprints futuros, cada uno aprobado antes de empezar.

## 7. Ubicación del proyecto

PGL Club **no** será un sitio independiente. Será una sección oficial dentro del sitio institucional de la marca.

**URL principal:** `https://pglelectronica.com.ar/club`

El objetivo es aprovechar la identidad, el posicionamiento y la confianza ya construidos por PGL Electrónica, en lugar de empezar de cero con una marca nueva.

En el futuro podrá comprarse el dominio `pglclub.com.ar`, pero únicamente como redireccionamiento hacia la URL oficial. No existirá un sitio separado.

**Nota pendiente de validar (no se decide en este documento):** cómo se integra técnicamente `/club` dentro del sitio institucional existente depende de con qué tecnología está construido hoy `pglelectronica.com.ar`. Esto no cambia la arquitectura ni las tecnologías ya aprobadas para PGL Club en este documento, pero es un punto a confirmar antes de definir el despliegue final. Se deja registrado también como riesgo en la sección 23.

## 8. Arquitectura general

### 8.1 Alternativas consideradas

**A. Monolito tradicional** — Todo el código en un solo bloque, sin separación interna por módulos.
Ventaja: es lo más simple de arrancar.
Problema: en cuanto se agregue el segundo módulo (por ejemplo Ofertas Flash), el código de sorteos y el de ofertas empiezan a mezclarse, y mantenerlo se vuelve cada vez más difícil. No cumple con el requisito de crecer sin rehacer la base.

**B. Microservicios** — Cada módulo es una aplicación independiente, con su propia base de datos e infraestructura, comunicándose entre sí por red.
Ventaja: escala muy bien para equipos grandes y tráfico masivo distribuido en muchos servicios.
Problema: agrega una complejidad operativa que no se justifica hoy — múltiples despliegues, comunicación entre servicios, más infraestructura para mantener. Para un equipo de una persona administrando el sistema, esto es complejidad sin beneficio real.

**C. Monolito modular** — Un solo proyecto, un solo despliegue, pero organizado internamente en módulos independientes: un núcleo común (`core`) y carpetas separadas por módulo (`sorteos`, y a futuro `ofertas`, `puntos`, etc.). Cada módulo tiene su propia lógica y sus propios datos, y no depende de los demás para funcionar.

### 8.2 Recomendación

**Monolito modular.**

Justificación: mantiene la simplicidad de un solo sistema para administrar y alojar (apropiado para el tamaño actual del equipo y del tráfico), pero cada módulo nuevo se agrega en su propio espacio sin tocar los anteriores. Si en el futuro un módulo puntual necesitara escalar por separado (por ejemplo, si el sistema de puntos creciera enormemente), ese módulo puntual podría separarse más adelante sin tener que rediseñar todo el sistema. Es el punto intermedio correcto entre simplicidad hoy y crecimiento futuro.

## 9. Tecnologías recomendadas

Regla aplicada en toda esta sección: no se elige una tecnología por ser más moderna, se elige por resolver mejor el problema con la menor complejidad posible.

### 9.1 Frontend + Backend

**Alternativas:**

- **A. Next.js (React)** — Un mismo proyecto sirve tanto las pantallas que ve el usuario como la lógica del servidor. Un solo lenguaje (TypeScript), un solo repositorio, un solo despliegue.
- **B. Frontend y backend separados** (por ejemplo React suelto + un servidor Node/Express aparte) — Más flexible en teoría, pero implica el doble de infraestructura, configuración de comunicación entre ambos, y dos despliegues para mantener sincronizados. No aporta un beneficio real para este proyecto.
- **C. Plataformas sin código** (Bubble, Glide, etc.) — Permiten arrancar muy rápido, pero limitan fuertemente la lógica personalizada que este proyecto necesita (por ejemplo, determinar automáticamente un ganador cruzando datos de una fuente externa), y atan el proyecto a un proveedor externo. Contradice la idea de una plataforma pensada para crecer por muchos años bajo control propio.

**Recomendación: Next.js (TypeScript).**

Justificación: un solo proyecto para mantener, ideal para pantallas mobile-first, con comunidad y documentación enormes (fácil de mantener a largo plazo), y que crece de forma natural: cada módulo nuevo es simplemente una nueva sección dentro del mismo proyecto.

### 9.2 Base de datos

**Alternativas:**

- **A. PostgreSQL (relacional)** — Los datos se guardan en tablas relacionadas entre sí, con reglas estrictas de integridad (por ejemplo: "este número no puede estar reservado dos veces" se puede garantizar a nivel de base de datos, no solo de código).
- **B. Bases de datos documentales** (MongoDB, Firestore) — Muy rápidas para arrancar y flexibles, pero más débiles a la hora de garantizar reglas de integridad estrictas bajo mucha gente entrando al mismo tiempo (justo el escenario de un lunes de sorteo), y menos naturales para relacionar datos entre módulos futuros (por ejemplo, un sistema de puntos que dependa de la participación en sorteos).
- **C. Firebase (paquete completo: base de datos + autenticación + hosting)** — Muy rápido para un prototipo, pero ata el proyecto a un proveedor específico, y da menos control sobre lógica de negocio compleja como la determinación automática del ganador. El costo además puede crecer de forma poco predecible con el uso.

**Recomendación: PostgreSQL, alojado en un proveedor administrado** (por ejemplo Neon o Supabase, que ofrecen un nivel gratuito o muy económico para este tamaño de proyecto).

Justificación: la integridad de los datos es crítica en un sorteo (un número no puede quedar reservado por dos personas), y los módulos futuros (puntos, cupones, referidos) son naturalmente relacionales entre sí y con los usuarios. Un proveedor administrado evita tener que mantener un servidor de base de datos propio.

### 9.3 Hosting

**Alternativas:**

- **A. Vercel** — Plataforma creada específicamente para proyectos Next.js. El despliegue es automático con cada cambio aprobado, incluye red de distribución de contenido (CDN) y escala solo ante picos de tráfico, sin intervención manual.
- **B. Servidor propio (VPS)** — Control total, pero exige mantenimiento manual: actualizaciones de seguridad, configuración de escalado, monitoreo. Es trabajo operativo que no aporta valor al producto en esta etapa.
- **C. Nube completa (AWS, Azure, GCP)** — Muy potente, pero con una complejidad de configuración que no tiene sentido para el tamaño actual del proyecto. Es una herramienta pensada para otro tipo de escala.

**Recomendación: Vercel** para la aplicación, junto con el proveedor de base de datos elegido en el punto anterior.

Justificación: costo mínimo (nivel gratuito cubre perfectamente esta etapa), cero mantenimiento de servidores, y escalado automático — relevante porque se espera que todos los lunes haya un pico de gente entrando al mismo tiempo.

### 9.4 Identidad de usuario (registro y acceso)

**Alternativas:**

- **A. Registro simple por nombre y número de teléfono, sin contraseña** — El usuario escribe su nombre y su celular y ya puede participar.
- **B. Registro tradicional con email y contraseña** — Es el estándar de muchas aplicaciones, pero agrega fricción (crear y recordar una contraseña) que atenta directamente contra el objetivo de "participar en menos de un minuto".
- **C. Login social (Google, Facebook)** — Reduce fricción de contraseña, pero depende de que el usuario tenga esas cuentas a mano, y agrega una dependencia externa que no aporta nada sobre el dato que realmente importa acá: el número de celular (el mismo que se va a usar después para WhatsApp).

**Recomendación: registro simple por nombre y número de teléfono.**

Justificación: es la opción más rápida, y el dato que se pide (el celular) es exactamente el dato que después sirve para invitar a esa persona al canal de WhatsApp. Queda preparado para agregar en el futuro una verificación por código (OTP) enviado por WhatsApp, sin tener que rediseñar el registro.

### 9.5 Panel de administración

Se recomienda que viva dentro del mismo proyecto Next.js, en una sección separada y protegida con acceso propio (usuario y contraseña reales, a diferencia del acceso simple del usuario final). Esto evita mantener un segundo proyecto aparte solo para administración.

## 10. Identidad visual

Tomar como referencia la identidad visual de `https://pglelectronica.com.ar`. **No copiar el diseño** — utilizar únicamente la identidad de marca como inspiración.

La plataforma debe transmitir:

- Tecnología.
- Profesionalismo.
- Confianza.
- Modernidad.
- Simplicidad.
- Cercanía.

El usuario debe sentir en todo momento que continúa dentro del ecosistema oficial de PGL Electrónica, nunca que salió a un sitio distinto.

## 11. Peggie

Peggie es la anfitriona oficial de PGL Club. No es solamente una mascota: es el **personaje principal del proyecto**.

Peggie es quien:

- Recibe al usuario.
- Explica cómo participar.
- Presenta los sorteos.
- Recuerda las reglas.
- Muestra novedades.
- Presenta futuros módulos.
- Anuncia los ganadores.
- Acompaña toda la experiencia.

**Personalidad:** simpática, divertida, cercana, inteligente, tecnológica, optimista, amigable.

Peggie se convierte en la identidad del proyecto. A nivel de arquitectura, vive en el núcleo común (sección 14) y se reutiliza en cualquier módulo futuro, sin ser una funcionalidad en sí misma.

## 12. Experiencia de usuario (UX)

Reglas permanentes que rigen todo el proyecto:

- Cada pantalla tiene un único objetivo.
- El usuario nunca debe sentirse perdido.
- Todo el proceso de participación se completa en menos de un minuto.
- Cada acción importante puede realizarse con un solo botón.
- Se reduce al máximo cualquier fricción.
- Se diseña siempre primero para teléfonos celulares.
- La navegación es extremadamente intuitiva.
- Siempre se prioriza la simplicidad sobre agregar funciones innecesarias.

## 13. Identidad del proyecto

El usuario nunca debe sentir que está entrando simplemente a una página para participar de un sorteo. Debe sentir que está entrando a la comunidad oficial de PGL Electrónica.

Cada decisión de diseño, comunicación y experiencia debe reforzar ese concepto.

## 14. Organización de carpetas (conceptual)

La organización interna del proyecto refleja directamente la arquitectura de monolito modular:

- **Núcleo (core):** todo lo que es común a toda la plataforma — identidad visual, Peggie, usuarios, panel de administración base, componentes compartidos.
- **Módulos:** cada funcionalidad de negocio vive en su propio espacio, aislada de las demás.
  - Módulo *Sorteos* (primera versión).
  - Espacio reservado para módulos futuros (ver sección 21).
- **Panel de administración:** organizado por módulo, de modo que cada módulo nuevo agrega su propia sección de administración sin modificar las existentes.

Esta organización es la que permite la regla central del proyecto: **agregar módulos sin rehacer el sistema.**

## 15. Organización del backend

El backend (la lógica que corre del lado del servidor, dentro del mismo proyecto Next.js) se organiza en tres capas simples:

1. **Capa de datos:** acceso a la base de datos, una responsabilidad por entidad (usuarios, sorteos, participaciones, resultados).
2. **Capa de reglas de negocio:** la lógica propia de cada módulo (por ejemplo: "un usuario no puede reservar un número ya tomado", "el ganador es quien tiene el número que coincide con el resultado de la Quiniela").
3. **Capa de exposición:** los puntos de entrada que usa el frontend para pedir o enviar información (por ejemplo, "reservar un número", "listar participantes").

Cada módulo (Sorteos, y a futuro los demás) repite esta misma estructura de tres capas, de forma independiente entre sí.

## 16. Organización del frontend

Pensado mobile-first (se diseña primero para celular, y se adapta después a pantallas más grandes). Las pantallas de la primera versión:

**Lado usuario:**
- Pantalla principal: sorteo activo (premio, imagen, fecha límite), con Peggie recibiendo al usuario.
- Pantalla de participación: elegir número disponible y confirmar datos.
- Pantalla de confirmación: número reservado + invitación a sumarse al canal de WhatsApp.
- Pantalla de resultado: ganador publicado.

**Lado administrador:**
- Pantalla de sorteo activo con acciones rápidas.
- Pantalla de creación/edición de sorteo.
- Pantalla de listado de participantes con acciones (liberar número, eliminar, exportar).
- Pantalla de resultado y publicación del ganador.

La definición exacta de dónde y cómo aparece Peggie en cada pantalla se resuelve en el Sprint 1 (sección 25).

## 17. Organización de la base de datos (conceptual)

Sin entrar en sintaxis técnica, las entidades principales de la primera versión son:

- **Usuario:** nombre y número de teléfono. Es la identidad que se reutiliza en todos los módulos futuros.
- **Sorteo:** premio, imagen, fecha de inicio, fecha de cierre, cantidad de números disponibles, estado (activo / cerrado / con ganador publicado).
- **Participación:** relación entre un usuario, un sorteo y el número que reservó. Un mismo número no puede repetirse dentro de un mismo sorteo.
- **Resultado:** el número ganador de un sorteo (obtenido de la Quiniela Nacional Vespertina) y, si corresponde, el participante ganador.

Esta forma de organizar los datos es la que permite, más adelante, conectar módulos nuevos (por ejemplo Puntos) al mismo Usuario sin duplicar información, y es también la base que permitirá registrar las métricas descritas en la sección 22.

## 18. Flujo completo del usuario

1. El usuario ve una convocatoria (por ejemplo, en el canal de WhatsApp o redes) y entra a la web.
2. Peggie lo recibe y le explica en pocas palabras cómo participar.
3. Ve el sorteo activo de la semana: premio, imagen y fecha límite.
4. Toca "Participar".
5. Ingresa su nombre y número de celular (sin contraseña).
6. Ve los números disponibles y elige uno libre.
7. Confirma: el número queda reservado a su nombre al instante.
8. Recibe la confirmación en pantalla, junto con la condición para reclamar el premio (sección 19).
9. Puede compartir el sorteo para invitar a más gente.
10. Se lo invita a sumarse al canal de WhatsApp de PGL Electrónica (la acción principal que persigue todo el proyecto).
11. Después del sorteo de la Quiniela Nacional Vespertina, el sistema obtiene el resultado y determina automáticamente el número ganador.
12. Peggie anuncia el resultado y el usuario puede verlo en la web.

Tiempo total esperado del paso 4 al 8: menos de un minuto.

## 19. Regla permanente: reclamo de premios

Para reclamar cualquier premio será obligatorio continuar siendo miembro del canal oficial de WhatsApp de PGL Electrónica en el momento en que se determina el ganador.

No es obligatorio ingresar desde el canal para participar, pero sí permanecer suscripto para poder recibir el premio. Esta condición debe informarse claramente durante la participación (paso 8 del flujo de usuario), y es Peggie quien la comunica.

## 20. Flujo completo del administrador

1. Ingresa al panel con su usuario y contraseña.
2. Ve el sorteo activo actual y el historial de sorteos anteriores.
3. Crea un nuevo sorteo: define premio, imagen, fecha de cierre y cantidad de números.
4. Puede editar el premio, la imagen o la fecha mientras el sorteo esté en curso.
5. Ve el listado completo de participantes con su número y datos de contacto.
6. Puede liberar un número (por ejemplo, si detecta un dato falso).
7. Puede eliminar un participante.
8. Puede exportar el listado completo de participantes a Excel.
9. Llegado el momento del sorteo, obtiene automáticamente el resultado de la Quiniela y el sistema determina quién ganó.
10. Verifica que el ganador continúe siendo miembro del canal de WhatsApp antes de confirmar la entrega del premio (sección 19).
11. Publica el resultado para que todos los usuarios lo vean.
12. Duplica el sorteo de esta semana para crear rápidamente el de la semana siguiente, con el mismo formato y datos nuevos.

## 21. Diseño preparado para crecer / Módulos futuros

PGL Club se diseña como una **plataforma**, no como una página de sorteos. Los sorteos son únicamente el primer módulo. Toda la arquitectura permite incorporar nuevas funcionalidades sin modificar la estructura principal (ver Arquitectura general, sección 8).

Cada módulo es independiente. La incorporación de un módulo nuevo nunca debe romper el funcionamiento de los demás.

Entre otros, podrán incorporarse con el tiempo:

- Sorteos.
- Beneficios exclusivos.
- Ofertas Flash.
- Novedades.
- Nuevos ingresos.
- Cupones.
- Programa de puntos.
- Eventos.
- Juegos.
- Noticias.
- Sistema de referidos.
- Beneficios para clientes frecuentes.
- Módulos aún no definidos.

Dos casos particulares merecen mención aparte:

- **Integración con WhatsApp:** se incorpora como una capa transversal (no un módulo aislado), usada por todos los módulos para notificar (por ejemplo, avisar un nuevo sorteo, un cupón o una oferta flash).
- **Peggie:** al ser un elemento de identidad de marca (sección 11), vive en el núcleo común y se reutiliza en cualquier módulo.

Criterio de validación para cualquier decisión técnica futura: **ningún módulo nuevo debería requerir tocar el módulo de Sorteos para funcionar.**

## 22. Métricas

Desde el primer día la arquitectura debe quedar **preparada** para medir el crecimiento del proyecto. No se implementa todavía — solo se deja prevista la base de datos y la arquitectura para poder registrar, entre otras cosas:

- Participantes por sorteo.
- Usuarios nuevos.
- Usuarios recurrentes.
- Crecimiento semanal.
- Crecimiento mensual.
- Origen del tráfico.
- Conversión desde Instagram.
- Conversión desde Facebook.
- Conversión desde WhatsApp.
- Conversión desde campañas pagas.
- Evolución del canal de WhatsApp.
- Participación por día.
- Participación por campaña.

## 23. Riesgos posibles

- **Colisión de números:** dos personas eligen el mismo número al mismo tiempo. Se mitiga garantizando la reserva como una operación segura a nivel de base de datos, no solo de pantalla.
- **Participaciones falsas o duplicadas:** alguien intenta participar varias veces con datos inventados para aumentar sus chances. Se mitiga validando que el número de teléfono sea único por sorteo, con una verificación más estricta (OTP por WhatsApp) prevista para cuando esa integración exista.
- **Dependencia de una fuente externa:** el resultado depende de la Quiniela Nacional Vespertina, que es una fuente fuera de nuestro control. Es necesario definir una fuente confiable para consultar el resultado y un proceso manual de respaldo si esa fuente no está disponible a tiempo.
- **Picos de tráfico los lunes:** al concentrarse la participación en un mismo horario, puede haber mucha gente entrando a la vez. Se mitiga con la elección de hosting con escalado automático.
- **Integración con el sitio institucional (`/club`):** cómo se sirve técnicamente PGL Club dentro de `pglelectronica.com.ar/club` depende de la tecnología del sitio institucional actual, todavía no confirmada. Es necesario validarlo antes de definir el despliegue final, para no duplicar trabajo ni afectar el sitio existente.
- **Verificación de membresía en WhatsApp al momento del premio:** confirmar que el ganador sigue en el canal puede requerir un paso manual o una integración futura con la API de WhatsApp; hasta que esa integración exista, este control puede depender del administrador.
- **Dependencia de una sola persona administrando el sistema:** el panel debe ser lo suficientemente simple como para que otra persona de confianza pueda operarlo en el futuro.
- **Crecimiento desordenado:** agregar módulos sin respetar la separación definida en este documento generaría con el tiempo el mismo problema que se busca evitar. Se mitiga con la disciplina de Sprints y la actualización constante del PCS.

## 24. Recomendaciones

- Mantener este documento (PCS) como única fuente de verdad; cualquier decisión nueva se agrega acá, no queda solo en una conversación.
- No adelantar el desarrollo de módulos futuros (puntos, cupones, juegos, etc.) hasta que el módulo de Sorteos esté terminado y aprobado.
- Priorizar siempre la velocidad y simplicidad de la participación (el objetivo de "menos de un minuto") por sobre agregar funciones adicionales al flujo del usuario.
- Medir el éxito del proyecto por el crecimiento del canal de WhatsApp, no por la cantidad de sorteos realizados.
- Mantener a Peggie y el tono de marca consistentes en cualquier módulo nuevo que se incorpore.

## 24.5 Registro de Sprints (resumen de avance)

- Sprint 0 — Arquitectura y visión: **aprobado** (2026-07-08).
- Sprint 1 — Especificación funcional: **aprobado** (2026-07-08).
- Sprint 2 — Wireframes navegables: **aprobado** (2026-07-08), base oficial de estructura y flujo.
- Sprint 3 — Diseño visual y Design System (Dirección A + voz de Peggie de C + movimiento de B): **aprobado** (2026-07-08).
- Sprint 4 — Arquitectura técnica (incluye números configurables, modalidad de ganador, auditoría y configuración global): **aprobado** (2026-07-08).
- Sprint 5 — Desarrollo: en curso, siguiendo el roadmap de módulos de `SPRINT-4-ARQUITECTURA-TECNICA.md` sección 6.
  - Módulo 1 — Fundación del proyecto: **aprobado por el Product Owner.**
  - Módulo 2 — Núcleo de datos: **aprobado por el Product Owner.**
  - Módulo 3 — Participación del usuario: **aprobado por el Product Owner.**
  - Módulo 4 — Resultado y publicación: **aprobado por el Product Owner.**
  - Módulo 5 — Panel de administración y autenticación: **aprobado por el Product Owner.**
  - Módulo 6 — Seguridad y endurecimiento: implementado y validado técnicamente (límite de intentos de login con bloqueo temporal, límite de solicitudes en participación pública, protección de rutas extendida a las APIs administrativas, validaciones finales, casos límite de sesión vencida y doble clic probados contra el servidor real — ver checklist y deuda técnica en `README.md`). Pendiente la aprobación final del Product Owner antes de avanzar al Módulo 7.

## 25. Metodología de Sprints

De acá en adelante, el proyecto avanza en Sprints. Ningún Sprint comienza sin que el anterior haya sido validado y aprobado por el Product Owner.

Cada Sprint define:
- **Objetivo:** qué problema resuelve este Sprint.
- **Alcance:** qué incluye y qué explícitamente no incluye.
- **Entregables:** qué se presenta al finalizar.
- **Validación:** cómo se aprueba (siempre por el Product Owner).
- **Próximo Sprint:** qué sigue después, sujeto a aprobación.

**Sprint 0 (arquitectura y visión):** entregable: este PCS. **Estado: aprobado** (2026-07-08).

**Sprint 1 (especificación funcional):** entregable: `SPRINT-1-FUNCIONAL.md`, incluido su capítulo permanente de Psicología del usuario y conversión. **Estado: aprobado** (2026-07-08).

**Sprint 2 (wireframes):** entregable: `SPRINT-2-WIREFRAMES.md` + wireframes navegables en escala de grises de las 16 pantallas — navegación, ubicación de Peggie, responsive, componentes. **Estado: aprobado** (2026-07-08) — base oficial de estructura, flujo y arquitectura de pantallas para todo el trabajo visual posterior.

**Sprint 3 (en curso) — Diseño visual premium + Design System:**
- **Objetivo:** definir la identidad visual definitiva del producto sobre la base ya aprobada del Sprint 2, sin modificar pantallas, pasos ni arquitectura.
- **Alcance, primera etapa (entregada):** tres direcciones visuales completamente distintas — A) Minimalismo Premium (Apple/Notion/Linear), B) Tech Startup (Stripe/Arc/Vercel), C) Producto Emocional (Duolingo sin infantilizar/Mercado Pago/Headspace) — cada una con moodboard, filosofía, paleta, tipografía, radios/sombras/espaciado, componentes, animación, tratamiento de Peggie, referencias, ventajas, desventajas y justificación profesional.
- **Alcance, segunda etapa (pendiente de que el Product Owner elija una dirección):** Design System completo, biblioteca de componentes, sistema de colores y tipográfico definitivos, las 16 pantallas finales, prototipo navegable premium, especificaciones listas para desarrollo.
- **Entregables:** artifact interactivo con las tres direcciones (comparables una a una).
- **Validación:** el Product Owner elige una dirección (o pide ajustes) antes de construir el Design System completo.
- **Próximo Sprint:** a definir una vez aprobado el Design System completo — previsiblemente, inicio del desarrollo técnico.

## 26. Estado de aprobación

- [x] Misión y Visión aprobadas
- [x] Principio fundamental y Filosofía de producto aprobados
- [x] Ubicación del proyecto aprobada
- [x] Arquitectura general aprobada
- [x] Tecnologías aprobadas
- [x] Identidad visual y Peggie aprobados
- [x] Experiencia de usuario (UX) aprobada
- [x] Regla de reclamo de premios aprobada
- [x] Flujo de usuario aprobado
- [x] Flujo de administrador aprobado
- [x] Módulos futuros y métricas aprobados
- [x] Documento PCS v0.2 aprobado en su totalidad

**PCS v0.2 aprobado el 2026-07-08.** El Sprint 1 (especificación funcional) se documenta en `SPRINT-1-FUNCIONAL.md` y tiene su propio estado de aprobación. No se escribirá código ni se diseñará la interfaz hasta que ese documento esté aprobado en su totalidad por el Product Owner.
