# Sprint 2 — Wireframes (Módulo Sorteos)

**Versión:** 1.0 (borrador para aprobación)
**Depende de:** [PCS.md](./PCS.md) v0.2 y [SPRINT-1-FUNCIONAL.md](./SPRINT-1-FUNCIONAL.md) v1.2 (ambos aprobados)
**Estado:** Pendiente de aprobación del Product Owner
**Entregable interactivo:** wireframes navegables en escala de grises de las 16 pantallas (U1–U6, A1–A10), construidos sobre el contenido ya aprobado en el Sprint 1.

Formato elegido por el Product Owner: wireframes en escala de grises, sin paleta de color ni tipografía final — estructura y jerarquía únicamente. La definición del estilo visual (colores y tipografías, tomando como referencia sin copiar la identidad de `pglelectronica.com.ar`) queda para una iteración posterior dentro de este mismo Sprint, una vez aprobada esta estructura.

## 1. Referencia de marca revisada

Se revisó `pglelectronica.com.ar` como referencia (PCS, sección 10). Hallazgos relevantes para las decisiones de este Sprint:
- Tono de comunicación: cercano pero profesional ("Tecnología que inspira", "sin spam, solo lo mejor").
- Estética general: minimalista, moderna, tecnológica.
- Mensajes de confianza recurrentes: garantía oficial, envío rápido, soporte permanente.

No se copia el diseño; se usa como calibración de tono para las decisiones de contenido y jerarquía tomadas en este documento.

## 2. Sistema de navegación

**Lado usuario:** flujo lineal guiado — U1 → U3 → U4 → U5, con U6 al publicarse el resultado. No existe un menú de navegación libre: cada pantalla ofrece un único paso hacia adelante y un único "Volver", para no introducir fricción durante la participación (principio de UX ya aprobado en el PCS). U2 reemplaza a U1 cuando no hay sorteo activo.

**Lado administrador:** navegación por pestañas fijas (Panel · Participantes · Historial) más acciones contextuales dentro del sorteo activo (Crear, Editar, Obtener resultado, Publicar, Duplicar). Es una herramienta de trabajo, no un recorrido lineal.

## 3. Ubicación definitiva de Peggie

Peggie ocupa siempre la misma zona en las seis pantallas de usuario: inmediatamente debajo del encabezado, antes del contenido principal, con su avatar a la izquierda y el mensaje en una burbuja de texto — nunca como ventana emergente que bloquee la pantalla. **No aparece en ninguna pantalla del administrador.**

## 4. Responsive / Mobile-first

La base de diseño es el marco mobile (375px de ancho). En desktop, el mismo contenido se reorganiza sin romper la jerarquía ya validada en el Sprint 1:
- La grilla de números pasa de 8 a 14 columnas.
- Las tablas de administración ganan ancho en vez de generar scroll horizontal.
- Los formularios mantienen el mismo orden vertical de campos en ambos tamaños.

## 5. Componentes principales

Botón primario, botón secundario, campo de formulario, bloque de imagen, burbuja de Peggie, celda de número (disponible / ocupada / seleccionada), mensaje de error, chip de acción sobre fila de tabla. El detalle visual de cada uno está en el wireframe interactivo.

## 6. Jerarquía y distribución por pantalla

Cada una de las 16 pantallas (U1–U6, A1–A10) sigue el mismo orden de bloques: encabezado → contenido principal (con Peggie primero, del lado usuario) → acciones. Esta estructura es intencionalmente repetitiva entre pantallas para que la app se sienta predecible y fácil de aprender, en línea con la regla de UX "la navegación es extremadamente intuitiva" del PCS.

## 7. Estado de aprobación

- [ ] Sistema de navegación (usuario y administrador) aprobado
- [ ] Ubicación de Peggie aprobada
- [ ] Comportamiento responsive / mobile-first aprobado
- [ ] Componentes principales aprobados
- [ ] Distribución y jerarquía de las 16 pantallas aprobada
- [ ] Documento Sprint 2 — Wireframes aprobado en su totalidad

**Pendiente, no parte de este documento:** la definición final de paleta de color y tipografía. Se aborda en una iteración siguiente del Sprint 2, ya con la estructura aprobada.

**No se escribirá código hasta que este documento (y la definición de estilo visual que lo sigue) estén aprobados por el Product Owner.**
