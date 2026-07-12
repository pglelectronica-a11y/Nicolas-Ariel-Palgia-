# Sprint 1 — Especificación funcional (Módulo Sorteos)

**Versión:** 1.2 (aprobado)
**Depende de:** [PCS.md](./PCS.md) v0.2 (aprobado — única fuente de verdad del proyecto)
**Estado:** Aprobado por el Product Owner

Este documento define **cómo funciona** PGL Club — Módulo Sorteos, de punta a punta, desde el punto de vista del usuario y del administrador. Está escrito para que cualquier persona lo lea y entienda perfectamente el producto sin ver una sola línea de código. No define diseño gráfico, wireframes, colores, tipografías ni tecnología: eso corresponde al Sprint 2.

**Contenido de este documento:**
1. Especificación funcional completa (pantallas)
2. Recorrido completo del usuario
3. Recorrido completo del administrador
4. Participación de Peggie
5. Estados del sistema
6. Reglas funcionales
7. Casos especiales
8. Psicología del usuario y conversión
9. Validación final del Sprint

---

## 1. Especificación funcional completa

Cada pantalla se describe con: **Objetivo**, **Contenido**, **Botones y qué hace cada uno**, **Estados posibles**, **Errores posibles** y **Participación de Peggie**.

### 1.1 Inventario de pantallas

**Lado usuario:** U1 Principal (sorteo activo) · U2 Sin sorteo activo · U3 Datos de contacto · U4 Elegir número · U5 Confirmación · U6 Resultado del sorteo.

**Lado administrador:** A1 Login · A2 Panel principal · A3 Crear sorteo · A4 Editar sorteo · A5 Listado de participantes · A6 Confirmar acción · A7 Obtener resultado · A8 Publicar resultado · A9 Verificar y confirmar premio · A10 Duplicar sorteo.

### 1.2 Pantallas — Lado usuario

**U1. Pantalla Principal (Sorteo Activo)**
- **Objetivo:** mostrar el sorteo de la semana y llevar al usuario a participar en el menor tiempo posible.
- **Contenido:** nombre del premio, imagen, fecha y hora de cierre, números disponibles restantes, saludo de Peggie.
- **Botones:** "Participar" → U3 (o "Ver mi número" → U5 si el usuario ya participó). "Sumate a nuestro WhatsApp" (siempre visible) → abre el canal.
- **Estados:** activo con cupos / activo sin cupos (botón deshabilitado) / usuario ya participó.
- **Errores:** falla al cargar el sorteo → disculpa de Peggie + "Reintentar".

**U2. Sin sorteo activo**
- **Objetivo:** no dejar al usuario ante una pantalla vacía; mantenerlo enganchado con la marca.
- **Contenido:** mensaje de Peggie explicando que no hay sorteo esta semana, el último resultado publicado si existe, invitación a WhatsApp.
- **Botones:** "Sumate a nuestro WhatsApp" (única acción).
- **Estados:** sin sorteo creado / sorteo recién cerrado, próximo aún no creado / sorteo creado pero programado para empezar más adelante.
- **Errores:** no aplica.

**U3. Participar — Paso 1: Datos de contacto**
- **Objetivo:** capturar nombre y teléfono.
- **Contenido:** campo Nombre, campo Teléfono, texto de Peggie explicando el uso de estos datos y la condición del premio.
- **Botones:** "Continuar" → valida y avanza a U4. "Volver" → U1 sin guardar.
- **Estados:** vacío / con errores / válido.
- **Errores:** nombre vacío; teléfono con formato inválido; teléfono que ya participó en este sorteo (bloquea, ofrece "Ver mi participación" → U5).

**U4. Participar — Paso 2: Elegir número**
- **Objetivo:** que el usuario reserve un número disponible.
- **Contenido:** grilla de números disponibles/ocupados; el tocado queda "seleccionado" (todavía no reservado).
- **Botones:** tocar un número disponible → lo selecciona. "Confirmar número [X]" → reserva en firme, éxito → U5. "Volver" → U3 conservando los datos.
- **Estados:** sin selección / seleccionado / confirmando.
- **Errores:** número tomado por otra persona al confirmar; sorteo cerrado mientras elegía; error de conexión al confirmar (sin perder la selección).
- **Decisión funcional:** elegir un número no lo reserva — la reserva ocurre recién al confirmar, para evitar números "en espera" indefinidos.

**U5. Confirmación de participación**
- **Objetivo:** confirmar el número reservado y motivar hacia WhatsApp.
- **Contenido:** número reservado, premio y fecha, recordatorio de la condición del premio.
- **Botones:** "Compartir" (selector nativo). "Sumate a nuestro WhatsApp" (destacado). "Ver el sorteo" → U1.
- **Estados:** recién confirmado / visita posterior.
- **Errores:** no aplica — pantalla de solo lectura.

**U6. Resultado del sorteo**
- **Objetivo:** comunicar el resultado una vez publicado.
- **Contenido:** número ganador, premio, fecha, si hubo participante con ese número (mensaje personalizado si es el propio usuario).
- **Botones:** "Sumate a nuestro WhatsApp"; "Ver el próximo sorteo" o vuelve a U2.
- **Estados:** con ganador / sin ganador (desierto, se informa igual el número que salió).
- **Errores:** no aplica.

### 1.3 Pantallas — Lado administrador

**A1. Login administrador** — Usuario y contraseña. "Ingresar" → A2. Error: "Usuario o contraseña incorrectos"; bloqueo temporal tras varios intentos fallidos (detalle exacto en Sprint técnico).

**A2. Panel principal** — Resumen del sorteo activo (premio, participantes, números disponibles, tiempo restante) e historial de sorteos anteriores. Accesos: "Crear sorteo" → A3, "Ver participantes" → A5, "Obtener resultado" (si cerró) → A7, "Duplicar" → A10.

**A3. Crear sorteo** — Premio, Imagen, Fecha y hora de cierre, Cantidad de números. "Guardar y activar" → crea en estado Activo. Errores: campos vacíos, fecha en el pasado, ya existe un sorteo activo.

**A4. Editar sorteo** — Mismos campos que A3, precargados. "Guardar cambios". Errores: bajar la cantidad de números por debajo de los ya reservados (bloqueado); sorteo ya cerrado (no editable).

**A5. Listado de participantes** — Tabla (nombre, teléfono, número, fecha/hora) con buscador. "Liberar número" → A6. "Eliminar participante" → A6. "Exportar a Excel".

**A6. Confirmar acción sobre un participante** — Diálogo de confirmación antes de liberar/eliminar (son acciones irreversibles). "Confirmar" / "Cancelar".

**A7. Obtener resultado** — "Obtener resultado" consulta la Quiniela Nacional Vespertina y cruza automáticamente con los participantes. "Cargar número manualmente" como plan de contingencia si la fuente externa no responde a tiempo.

**A8. Publicar resultado** — Vista previa del resultado tal como lo verán los usuarios en U6. "Publicar" (hace visible el resultado) / "Volver".

**A9. Verificar y confirmar entrega del premio** — Aplica la regla permanente del PCS: el ganador debe seguir en el canal de WhatsApp. "Marcar como verificado" → habilita "Confirmar entrega". Estado alternativo: "no reclamado" si el ganador ya no está en el canal.

**A10. Duplicar sorteo** — Copia premio, imagen y cantidad de números; fecha en blanco. Crea el nuevo sorteo en estado **borrador** y lleva a A4 para completar la fecha antes de activarlo.

---

## 2. Recorrido completo del usuario

**Cómo llega:** por una convocatoria en el canal de WhatsApp, en redes sociales, o recomendado por otra persona (boca en boca / botón compartir de otro participante).

**Qué ve primero:** si hay un sorteo activo, entra directo a **U1**; si no hay ninguno, ve **U2**.

**Qué hace Peggie:** lo saluda por su nombre de marca (Peggie, no "el sistema"), presenta el premio de la semana en una frase, y explica en pocas palabras cómo participar — sin bloquear la pantalla ni obligarlo a cerrar un mensaje antes de poder actuar.

**Qué información aparece:** el premio, su imagen, la fecha y hora exacta de cierre, y cuántos números quedan disponibles (para transmitir urgencia real, no artificial).

**Qué botones existen:** "Participar" (o "Ver mi número" si ya participó) y "Sumate a nuestro WhatsApp", siempre visible como acción secundaria.

**Qué ocurre al tocar cada botón:** "Participar" lo lleva a pedirle nombre y teléfono (**U3**); "Sumate a nuestro WhatsApp" abre el canal en una pestaña nueva sin sacarlo del flujo de participación si todavía no terminó.

**Cómo participa:** completa nombre y teléfono (**U3**), continúa a la grilla de números (**U4**), toca el número que quiere —queda seleccionado, no reservado todavía— y toca "Confirmar". Recién ahí el número queda reservado a su nombre.

**Cómo recibe la confirmación:** pasa a **U5**, donde ve su número reservado, el premio y la fecha, y el recordatorio de que debe seguir en WhatsApp para poder cobrar si gana.

**Cómo comparte el sorteo:** desde U5 (y también desde U1), un botón "Compartir" abre el selector nativo del celular para enviar el enlace del sorteo por cualquier app instalada.

**Cómo se informa el ganador:** cuando el administrador publica el resultado, cualquier usuario que entre a la web ve **U6** con el número ganador y el premio; si el usuario que entra es quien ganó, el mensaje se personaliza para él.

**Qué ocurre después del sorteo:** si ya existe un nuevo sorteo activo, el usuario que vuelve entra directo a él (**U1**); si todavía no fue creado, ve **U2** con el resultado del sorteo anterior a modo de cierre, y la invitación a sumarse a WhatsApp para enterarse apenas se abra el próximo.

---

## 3. Recorrido completo del administrador

**Qué pantallas existen:** Login (A1), Panel principal (A2), Crear sorteo (A3), Editar sorteo (A4), Listado de participantes (A5), Confirmar acción (A6), Obtener resultado (A7), Publicar resultado (A8), Verificar y confirmar premio (A9), Duplicar sorteo (A10).

**Qué función tiene cada una:** A1 protege el acceso; A2 es el punto de partida y da visión general; A3 y A4 controlan los datos del sorteo (premio, imagen, fecha, cupos); A5 y A6 gestionan a los participantes uno por uno; A7, A8 y A9 forman el cierre del ciclo (obtener resultado → publicarlo → confirmar el premio); A10 arranca el ciclo siguiente sin volver a cargar todo desde cero.

**Qué botones existen y qué acciones puede realizar:** crear un sorteo nuevo, editarlo mientras esté activo, ver y buscar participantes, liberar un número puntual, eliminar un participante, exportar el listado completo a Excel, obtener el resultado de la Quiniela (o cargarlo a mano si la fuente externa falla), publicar ese resultado, marcar al ganador como verificado en WhatsApp y confirmar la entrega del premio, y duplicar el sorteo para la semana siguiente.

**Qué validaciones existen:** no se puede crear un segundo sorteo mientras uno ya está activo; no se puede cerrar la fecha de un sorteo en el pasado; no se puede bajar la cantidad de números por debajo de los ya reservados; no se puede publicar un resultado que todavía no fue obtenido; un sorteo cerrado ya no admite cambios de premio, imagen o fecha.

**Qué confirmaciones existen:** liberar un número y eliminar un participante piden confirmación explícita antes de ejecutarse (A6), porque son acciones irreversibles; publicar el resultado muestra una vista previa antes de hacerlo visible a todos los usuarios (A8).

---

## 4. Participación de Peggie

Peggie acompaña toda la experiencia del usuario **sin interrumpirla**: nunca aparece en un mensaje que bloquee la pantalla y obligue a cerrarlo antes de poder seguir. Es presencia y guía, no un obstáculo.

**Peggie no participa del lado del administrador.** El panel de administración es una herramienta de trabajo profesional; Peggie es un personaje de cara al público, no un asistente interno. Esto se aclara para no dejarlo ambiguo.

| Pantalla | Función que cumple | Emoción que transmite | Cuándo ayuda | Cuándo se retira |
|---|---|---|---|---|
| U1 — Principal | Recibe al usuario y presenta el sorteo. | Entusiasta, cálida. | Explica en una frase cómo participar. | Pasa a segundo plano en cuanto el usuario toca "Participar" — no lo sigue interrumpiendo. |
| U2 — Sin sorteo activo | Sostiene el vínculo con la marca en el momento "vacío". | Paciente, optimista. | Ofrece la alternativa concreta de sumarse a WhatsApp. | Es la protagonista de esta pantalla; no se retira. |
| U3 — Datos de contacto | Explica por qué se piden esos datos. | Cercana, genera confianza. | Aclara la condición del premio antes de que el usuario dude en dar su teléfono. | Se achica a un costado mientras el usuario completa el formulario, para no distraer. |
| U4 — Elegir número | Acompaña la elección con humor. | Divertida, alentadora. | Solo interviene si hay un error (número ocupado). | Se mantiene discreta mientras el usuario elige. |
| U5 — Confirmación | Felicita por la participación. | Alegre, orgullosa. | Recuerda el número reservado y la condición del premio. | Permanece visible, es parte del mensaje de confirmación. |
| U6 — Resultado | Anuncia el resultado. | Eufórica si hay ganador; comprensiva y alentadora si no lo hay. | Dirige al siguiente paso (WhatsApp o próximo sorteo). | Es la protagonista del anuncio. |
| Errores (transversal) | Explica qué pasó sin culpar al usuario. | Calma, nunca genera ansiedad. | Siempre ofrece una acción concreta: reintentar o volver. | No desaparece ante un error — es quien lo comunica. |

**Mensajes de referencia** (el tono se ajusta en Sprint 2, el contenido ya queda fijado):

| Momento | Mensaje |
|---|---|
| Bienvenida (U1) | "¡Hola! Soy Peggie 👋 Esta semana sorteamos [premio]. ¿Vamos a por tu número de la suerte?" |
| Cómo participar | "Dejame tu nombre y tu celu, elegís tu número, ¡y listo! Menos de un minuto." |
| Elegir número (U4) | "Elegí el número que más te guste de esta grilla." |
| Número ocupado | "Uy, justo lo tomó otra persona. Elegí otro, todavía quedan varios libres." |
| Confirmación (U5) | "¡Ya sos parte del sorteo! Tu número es el [X]. No te olvides: para poder cobrar el premio tenés que seguir en nuestro canal de WhatsApp." |
| Invitación a WhatsApp | "Sumate a nuestro canal para enterarte primero de cada sorteo." |
| Sin sorteo activo (U2) | "Todavía no arrancamos el sorteo de esta semana. Quedate en nuestro WhatsApp que ahí lo anunciamos primero." |
| Resultado con ganador | "¡Tenemos ganador! El número [X] se llevó [premio]. ¿Fuiste vos?" |
| Resultado sin ganador | "Esta vez el número [X] no estaba en juego. ¡Nos vemos en el próximo sorteo!" |
| Ya participaste (U3) | "Ya estás anotado en este sorteo con el número [X]." |
| Error de conexión | "Se ve que se cortó la conexión. Probemos de nuevo." |
| Error inesperado | "Uy, algo no salió como esperaba. Volvamos al inicio e intentemos de nuevo." |

---

## 5. Estados del sistema

Todo escenario que el sistema puede encontrarse, contemplado uno por uno:

| Estado | Qué significa | Qué ve el usuario / administrador |
|---|---|---|
| **Usuario nuevo** | Es la primera vez que este teléfono se ve en el sorteo activo. | U1 con botón "Participar". |
| **Usuario que ya participó** | El teléfono ingresado ya tiene un número reservado en el sorteo activo. | U1 muestra "Ver mi número" en lugar de "Participar"; en U3 se bloquea un segundo intento y se ofrece ver su participación existente. |
| **Número ocupado** | El número elegido ya tiene dueño, o fue tomado por otra persona en el instante de confirmar. | En la grilla (U4) se ve como no disponible; si la colisión ocurre al confirmar, mensaje de error y se pide elegir otro. |
| **Sorteo sin comenzar** | El administrador creó o duplicó un sorteo, pero todavía no lo activó (queda en borrador) o tiene fecha de inicio futura. | El usuario ve U2, igual que si no hubiera ningún sorteo — no se expone un sorteo a medio configurar. |
| **Sin sorteos activos** | No existe ningún sorteo en curso (ni siquiera en borrador). | U2, con el último resultado si existe. |
| **Sorteo finalizado (con resultado publicado)** | El ciclo del sorteo llegó a su fin y el resultado ya es público. | U6 para cualquier usuario que entre. |
| **Sorteo finalizado (desierto)** | El número ganador no fue reservado por nadie. | U6 informa el número que salió, sin ganador. |
| **Error de conexión** | Falla de red al cargar una pantalla o al confirmar una acción. | Mensaje de reintento; los datos ya ingresados no se pierden. |
| **Error inesperado** | Cualquier falla del sistema no prevista en los casos anteriores. | Mensaje genérico de disculpa + acción de volver al inicio; nunca se muestran detalles técnicos al usuario. |
| **Premio entregado** | El administrador confirmó la entrega tras verificar que el ganador sigue en WhatsApp. | Cierra el ciclo de ese sorteo (A9); no cambia lo que ve el usuario en U6. |
| **Premio no reclamado** | El ganador ya no integra el canal de WhatsApp al momento de verificar. | El administrador lo marca así en A9; qué se hace en ese caso (repetir entre el resto de los participantes, declararlo vacante, etc.) es una política a definir si el caso llega a ocurrir en la práctica — no se resuelve automáticamente por el sistema. |
| **Participación cancelada** | Un número reservado vuelve a quedar disponible porque el administrador lo liberó (A5/A6). | El participante deja de figurar en el listado; ese número vuelve a aparecer disponible en U4. |

---

## 6. Reglas funcionales

Reglas de negocio que gobiernan el producto, explicadas sin lenguaje técnico:

1. **Un usuario, un número por sorteo.** El mismo teléfono no puede reservar más de un número dentro de un mismo sorteo.
2. **Un número, un dueño.** Dentro de un mismo sorteo, un número no puede pertenecer a dos participantes al mismo tiempo.
3. **Elegir no es reservar.** El número queda reservado recién cuando el usuario confirma, no al tocarlo en la grilla.
4. **El cierre es automático.** Al llegar la fecha y hora de cierre, el sorteo deja de aceptar participaciones sin que nadie tenga que hacerlo manualmente.
5. **El ganador surge de un cruce, no de una elección.** El número ganador sale exclusivamente de la Quiniela Nacional Vespertina; nadie dentro de PGL Club elige al ganador.
6. **Sin reserva, no hay premio.** Si el número ganador no fue reservado por nadie, el sorteo queda desierto.
7. **Seguir en WhatsApp es condición para cobrar.** El ganador debe continuar siendo miembro del canal oficial al momento de determinarse el resultado. No hace falta haber entrado desde el canal para participar, solo permanecer suscripto para poder cobrar.
8. **Un solo sorteo activo a la vez.** No puede haber dos sorteos recibiendo participaciones al mismo tiempo.
9. **Lo publicado no se reabre.** Una vez publicado el resultado, ese sorteo no vuelve a aceptar cambios ni participaciones.
10. **Las acciones irreversibles piden confirmación.** Liberar un número o eliminar un participante nunca ocurre en un solo toque.
11. **Los cupos no bajan del compromiso ya asumido.** No se puede reducir la cantidad de números de un sorteo por debajo de los que ya están reservados.
12. **Duplicar no activa.** Copiar un sorteo para la semana siguiente crea una base para editar, no lo pone en marcha automáticamente.
13. **Cancelar una participación es, por ahora, una acción exclusiva del administrador.** El usuario no cuenta con un botón propio para darse de baja de un sorteo en el que ya participó.

**Nota para aprobación:** la regla 13 es una decisión propuesta, no asumida. La alternativa sería dar al usuario un botón de "Cancelar mi participación" en U5, autoliberando su número sin intervención del administrador. Se recomienda mantener la regla 13 tal como está por simplicidad (menos pantallas, menos casos de error) y porque no fue parte del pedido original; se deja documentada la alternativa por si se prefiere habilitarla.

---

## 7. Casos especiales

- **El usuario abandona el proceso.** Antes de elegir número: no se guarda nada. Después de elegir pero antes de confirmar: el número sigue disponible para cualquiera. Después de confirmar: su número queda reservado igual, y puede volver cuando quiera a verlo.
- **El sorteo termina mientras alguien participa.** Al llegar la fecha de cierre, el sorteo pasa a "Cerrado" automáticamente, incluso si alguien estaba a mitad del proceso en U3 o U4; se le informa que el sorteo ya cerró.
- **Un número ya está ocupado.** Se ve como no disponible en la grilla; si la colisión ocurre al confirmar, se informa y se pide elegir otro (ver regla funcional 2 y 3).
- **No existen sorteos activos.** Se muestra U2, con el último resultado si existe.
- **Un sorteo queda desierto.** Se comunica igualmente el número que salió sorteado, sin entregar premio (ver regla funcional 6).
- **El ganador ya no está en WhatsApp.** El premio queda "no reclamado"; no hay una resolución automática, es una decisión que toma el administrador caso por caso.

---

## 8. Psicología del usuario y conversión

Este capítulo es permanente: forma parte de la documentación oficial del producto de aquí en adelante, no solo de este Sprint. No modifica el funcionamiento del sistema, la arquitectura ni las reglas de negocio ya definidas — únicamente orienta las decisiones de experiencia hacia dos objetivos: que más personas participen, y que vuelvan cada semana y recomienden PGL Club.

### 8.1 Objetivo

Cada pantalla debe incentivar al usuario a dar el siguiente paso natural. Nunca debe existir un momento en el que el usuario dude qué hacer. Esto refuerza, con foco en conversión, la regla de UX ya aprobada en el PCS de que cada pantalla tiene un único objetivo.

### 8.2 Canal de WhatsApp: beneficio, no membresía

El usuario no debe sentir que se está uniendo a un canal — debe sentir que está obteniendo algo. El concepto "Sumate al canal de WhatsApp" se reemplaza en toda la comunicación por mensajes orientados al beneficio, por ejemplo:

- "Recibí los sorteos antes que nadie."
- "Enterate primero de los nuevos premios."
- "Accedé a beneficios exclusivos."
- "No te pierdas el próximo sorteo."

El botón sigue llevando exactamente al mismo lugar (el canal oficial de WhatsApp) — lo que cambia es cómo se lo comunica, no su función ni su destino. Este criterio reemplaza el texto literal "Sumate a nuestro WhatsApp" usado como referencia en el catálogo de mensajes de Peggie (sección 4): a partir de acá, ese catálogo debe leerse como una familia de variantes posibles orientadas al beneficio, no como un texto fijo.

### 8.3 Urgencia

La pantalla principal (U1) debe transmitir sensación de oportunidad real. Además de la fecha de cierre, se contempla un **contador regresivo** visible junto a los números disponibles. La intención es aumentar la participación mostrando datos concretos (tiempo y cupos), sin recurrir a mensajes agresivos o de presión.

### 8.4 Prueba social

La pantalla principal (U1) debe poder mostrar información que genere confianza: cantidad de participantes actuales, últimos ganadores, historial de premios. No es obligatorio implementarlo en la primera versión — el dato ya existe en el sistema (participantes por sorteo, historial de sorteos anteriores, sección 22 del PCS), así que no requiere cambios de arquitectura, solo decidir si se muestra públicamente. Queda previsto para incorporarse cuando se decida.

### 8.5 Compartir

Cuando el usuario comparte el sorteo (botón "Compartir" en U1 y U5), no comparte únicamente un enlace: comparte un mensaje pensado para invitar, que menciona el premio y motiva a quien lo recibe a participar. La aplicación debe quedar preparada para generar ese mensaje de forma automática junto con el enlace.

### 8.6 Peggie: variedad de frases

Peggie no repite siempre exactamente el mismo mensaje para una misma situación. El sistema debe permitir contar con varias frases posibles para cada momento — saludo inicial, despedida, confirmación, error, anuncio del ganador — y elegir una entre varias cada vez, para que se sienta más natural y cercana. El catálogo de mensajes de la sección 4 pasa a ser, para cada fila, un ejemplo representativo dentro de un conjunto de variantes; la redacción completa de cada familia de frases se desarrolla en Sprint 2 junto al resto del contenido visual.

### 8.7 Usuario recurrente

Cuando alguien que ya participó en un sorteo anterior vuelve a entrar en una semana distinta, la bienvenida de Peggie debe ser distinta a la de alguien que entra por primera vez — sin necesidad de recordar datos personales, solo transmitiendo la sensación de que vuelve a una comunidad conocida. Esto no requiere una funcionalidad nueva: el teléfono ya queda registrado en participaciones anteriores (sección 17 del PCS), así que alcanza con reconocer si ese número ya participó alguna vez, y ajustar el tono del saludo en consecuencia.

### 8.8 Resultado como momento especial

La publicación del ganador (U6) debe sentirse como un momento especial, no como un dato más. La arquitectura debe permitir incorporar, más adelante, elementos como celebración visual, confeti, animaciones o mensajes especiales de Peggie para ese momento puntual. No se implementa todavía — solo se deja prevista la posibilidad, igual que con las métricas (sección 22 del PCS).

### 8.9 Principio permanente de experiencia

> Cada decisión de experiencia deberá aumentar al menos una de estas variables: participación, permanencia, retorno semanal, crecimiento del canal, o recomendación entre usuarios. Si una funcionalidad no mejora ninguna de estas variables, deberá justificarse antes de incorporarse al proyecto.

Este principio es el corolario, aplicado a experiencia de usuario, del principio fundamental ya aprobado en el PCS (sección 4): toda funcionalidad debe aportar valor al usuario y fortalecer la comunidad. De acá en adelante, ambos se usan juntos para evaluar cualquier decisión de producto.

## 9. Validación final del Sprint

Al terminar de leer este documento, cualquier persona —sin ver una sola línea de código— debería poder responder con seguridad:

- Qué pantallas existen y qué se puede hacer en cada una.
- Qué pasa exactamente al tocar cada botón.
- Qué ve el usuario en cada escenario posible, incluyendo los casos límite.
- Qué rol cumple Peggie en cada momento y qué dice.
- Cuáles son las reglas de negocio que nadie puede romper, ni siquiera el administrador.

**Checklist de aprobación:**

- [x] Especificación funcional de las 16 pantallas aprobada
- [x] Recorrido completo del usuario aprobado
- [x] Recorrido completo del administrador aprobado
- [x] Participación de Peggie (función, emoción, mensajes) aprobada
- [x] Estados del sistema aprobados
- [x] Reglas funcionales aprobadas (incluida la decisión pendiente sobre cancelación de participación, sección 6)
- [x] Casos especiales aprobados
- [x] Psicología del usuario y conversión aprobado (capítulo permanente)
- [x] Documento Sprint 1 v1.2 aprobado en su totalidad

**Sprint 1 aprobado el 2026-07-08.** Comienza el Sprint 2 (wireframes y experiencia visual completa) — ver metodología de Sprints en el PCS.
