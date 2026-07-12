# Sprint 3 — Diseño visual definitivo + Design System

**Versión:** 2.0 (Fase 2 — Design System sobre la dirección elegida)
**Depende de:** [PCS.md](./PCS.md) v0.2, [SPRINT-1-FUNCIONAL.md](./SPRINT-1-FUNCIONAL.md) v1.2, [SPRINT-2-WIREFRAMES.md](./SPRINT-2-WIREFRAMES.md) v1.0 (todos aprobados)
**Estado:** Pendiente de aprobación del Product Owner
**Entregable interactivo:** Design System + prototipo navegable con modo claro/oscuro, de las 16 pantallas ya aprobadas en el Sprint 2, con el nuevo lenguaje visual.

## 1. Dirección elegida

Base: **Dirección A — Minimalismo Premium** (Apple / Notion / Linear), combinada con:
- La **personalidad de Peggie** propuesta en la Dirección C (cercana, simpática, optimista) — expresada en tono de voz, no en un segundo color de marca.
- La **calidad de movimiento** de la Dirección B — curvas de easing más expresivas en momentos clave, sin rebote ni excesos.

**Decisión de diseño y su justificación:** Peggie no incorpora un color propio (por ejemplo, el coral de la Dirección C). Se mantiene el sistema monocromático con un único acento (índigo) reservado para la acción principal. Justificación: el brief pide explícitamente que la presencia de Peggie sea "siempre discreta" y "nunca compita con la acción principal" — agregar un segundo color de marca sería la forma más común de romper esa regla sin darse cuenta. Su calidez se logra con copywriting y con una animación de entrada propia (fade + traslado sutil), no con color.

## 2. Colores

| Token | Valor (claro) | Valor (oscuro) | Uso |
|---|---|---|---|
| Primario | `#3B4BDB` | `#6B78EA` | Única acción protagonista, focos, información |
| Tinta (secundario) | `#131316` | `#F2F2F4` | Texto, botones secundarios |
| Fondo | `#FAFAFA` | `#0D0D10` | Base de pantalla |
| Tarjeta | `#FFFFFF` | `#17171B` | Cards, inputs, modales |
| Neutro 100 | `#F2F2F4` | `#1E1E23` | Fondos de tabs, chips |
| Neutro 400 | `#9A9AA1` | `#6C6C74` | Texto secundario |
| Éxito | `#1F8A5F` | `#3FBF83` | Confirmaciones, estado activo |
| Error | `#C9463D` | `#E2665D` | Errores, acciones destructivas |
| Advertencia | `#B8842A` | `#D9A13F` | Avisos, confirmaciones sensibles |
| Información | = Primario | = Primario | Mensajes informativos |

El modo oscuro no es un plan a futuro: **ya está implementado** en el prototipo (botón "Modo oscuro") mediante el mismo set de tokens remapeados — no requiere rediseñar componentes cuando se decida activarlo en producción.

## 3. Tipografía

Fuente nativa del sistema operativo (SF Pro / Segoe UI vía `-apple-system` / `system-ui`) — carga instantánea, cero peso adicional, siempre nítida. Jerarquía por peso y tracking, no por variedad de familias. Los labels usan monoespaciada como firma discreta de marca (mismo recurso que Linear).

| Estilo | Tamaño/interlineado | Peso | Uso |
|---|---|---|---|
| H1 | 32/40, -2% tracking | 650 | Nombre del premio, títulos principales |
| H2 | 22/28, -2% tracking | 650 | Títulos de pantalla |
| H3 | 18/24 | 600 | Subtítulos de sección |
| Body | 16/26 | 400 | Texto general |
| Caption | 13/18 | 400 | Metadatos, ayudas |
| Label | 12/16, mono, versalitas | 600 | Etiquetas de campo, badges |
| Botón | 15/20 | 600 | Texto de botones |

## 4. Grid y espaciado

Sistema de 8px (4px como paso mínimo excepcional): 4 · 8 · 16 · 24 · 32 · 48 · 64. Mobile: columna única, 16px de margen de pantalla. Desktop (panel administrador): grilla de contenido con navegación fija y densidad mayor de información, sin romper el mismo ritmo de 8px.

## 5. Bordes y sombras

Radio oficial: **6px** en controles (botones, inputs), **10px** en tarjetas, **18px** en modales y superficies grandes — consistente en las 16 pantallas. Sombras en tres niveles, siempre suaves: nivel 1 para tarjetas en reposo, nivel 2 para popovers, nivel 3 solo para modales. Bordes de 1px al 10% de opacidad de la tinta — la separación entre bloques la da el espacio, no la línea.

## 6. Iconografía

Un único lenguaje: trazo (outline) de 1.75px, esquinas redondeadas, grilla de 20×20, siempre en `currentColor` para heredar el color del contexto. No se mezcla con íconos rellenos salvo los indicadores de estado (punto sólido). Set base: volver, cerrar, check, compartir, mensaje, reloj, usuarios, descargar, buscar, editar, eliminar, alerta.

## 7. Animación

| Token | Valor | Uso |
|---|---|---|
| duration-instant | 100ms | Checkbox, toggles |
| duration-fast | 160ms | Hover, botones, foco |
| duration-base | 220ms | Cambio de pantalla, aparición de tarjetas |
| duration-slow | 320ms | Modal, aparición de Peggie |
| ease-standard | `cubic-bezier(.2,.7,.3,1)` | Casi todo — frenado seguro, sin rebote |
| ease-emphasis | `cubic-bezier(.16,1,.3,1)` | Selección de número, resultado del sorteo |

Microinteracciones definidas: cambio de pantalla (fade + 6px, duration-base), selección de número (escala 1.05 + anillo de foco, duration-fast), participación confirmada (botón entra en estado de carga y luego una alerta de éxito con fade-in, duration-slow), aparición de Peggie (fade + traslado 4px, duration-slow), hover (elevación sutil, duration-fast), foco (anillo de 3px del color primario al 10%, accesible). Se descartó deliberadamente el confeti de la Dirección C en el resultado del sorteo, a favor de un tratamiento más contenido (número grande con color primario) — coherente con la disciplina de "elegante, nunca exagerado" pedida para este Sprint; si más adelante se quiere recuperar ese momento de celebración, es un agregado aislado que no rompe el sistema.

## 8. Biblioteca de componentes

Botón (primario / secundario / destructivo / deshabilitado / cargando), Card, Input (default / foco / error), Checkbox, Badge (neutro / éxito / error), Tabs, Alerta (éxito / error / advertencia / información), Modal (vista previa), Indicador de estado (con pulso), Contador / stat, Mensaje de Peggie, Estado vacío, Skeleton loading, Tooltip. Todos construidos sobre los mismos tokens de color, radio, sombra y tipografía — cambiar un token actualiza toda la biblioteca a la vez.

## 9. Dashboard administrador

Rediseñado con jerarquía tipo Linear/Stripe/GitHub: métricas clave (participantes, números disponibles, tiempo restante) como tarjetas de estadística en la parte superior — entendibles en menos de cinco segundos — seguidas del sorteo activo y las acciones principales. Misma navegación por pestañas y las mismas 10 pantallas ya aprobadas en el Sprint 2; ningún cambio de funcionalidad.

## 10. Accesibilidad

Contraste de texto verificado contra fondo en ambos modos (claro/oscuro); botones con área táctil de 44px de alto mínimo; foco visible en todo elemento interactivo; jerarquía tipográfica que no depende únicamente del color (siempre acompañada de forma o texto). Diseño mobile-first: el flujo de participación se opera cómodo con una mano.

## 11. Estado de aprobación

- [ ] Paleta definitiva (claro + preparación oscuro) aprobada
- [ ] Sistema tipográfico aprobado
- [ ] Grid, espaciado, bordes y sombras aprobados
- [ ] Iconografía aprobada
- [ ] Animaciones y microinteracciones aprobadas
- [ ] Biblioteca de componentes aprobada
- [ ] Dashboard administrador rediseñado aprobado
- [ ] Prototipo navegable de las 16 pantallas aprobado
- [ ] Documento Sprint 3 — Diseño Visual aprobado en su totalidad

**No se escribirá código de producción hasta que este documento esté aprobado por el Product Owner.**
