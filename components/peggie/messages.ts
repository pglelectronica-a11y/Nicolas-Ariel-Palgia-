/**
 * Catálogo de mensajes de Peggie (Sprint 1, sección 4 y 6; Sprint 3, sección
 * 8.6: "no repite siempre exactamente el mismo mensaje"). Cada momento tiene
 * más de una variante — Sprint 4 v1.1 eligió no usar un color propio para
 * Peggie, así que toda su calidez vive acá, en el tono de voz.
 *
 * La elección de variante es determinística (a partir de una semilla), no
 * aleatoria en cada render: así el servidor y el cliente siempre coinciden
 * en la primera pintada (evita el mismo problema de hidratación que el
 * hook de tema — hooks/use-theme.ts) y aun así se ve distinta según el
 * sorteo o el teléfono.
 */

function indiceDeterministico(semilla: string, cantidadOpciones: number): number {
  let hash = 0;
  for (let i = 0; i < semilla.length; i++) {
    hash = (hash * 31 + semilla.charCodeAt(i)) >>> 0;
  }
  return hash % cantidadOpciones;
}

export function elegirVariante(variantes: string[], semilla: string): string {
  return variantes[indiceDeterministico(semilla, variantes.length)] ?? variantes[0]!;
}

export const MENSAJES = {
  bienvenida: (premio: string) => [
    `¡Hola! Soy Peggie 👋 Esta semana sorteamos ${premio}. ¿Vamos a por tu número de la suerte?`,
    `¡Llegaste justo a tiempo! Esta semana hay ${premio} en juego. Soy Peggie, te acompaño.`,
    `Hola, ¿qué tal? Esta semana el premio es ${premio}. Vení que te muestro cómo participar.`,
  ],
  /**
   * Sprint 1, sección 8.7: alguien que ya participó en un sorteo anterior
   * (una semana distinta) tiene que sentir que vuelve a una comunidad
   * conocida — sin exponer ningún dato personal en el mensaje, solo el tono.
   */
  bienvenidaDeVuelta: (premio: string) => [
    `¡Qué bueno tenerte de vuelta! 👋 Esta semana el premio es ${premio}. ¿Vamos por otro número de la suerte?`,
    `Volviste — se nota que te gusta esto. Esta semana sorteamos ${premio}.`,
    `Hola de nuevo. Esta semana el premio es ${premio}, ya sabés cómo sigue.`,
  ],
  comoParticipar: () => [
    "Dejame tu nombre y tu celu, elegís tu número, ¡y listo! Menos de un minuto.",
    "Es simple: nombre, celular, elegís tu número favorito y confirmás. Ya está.",
  ],
  elegirNumero: () => [
    "Elegí el número que más te guste de esta grilla.",
    "Dale, ¿cuál es tu número de la suerte hoy?",
  ],
  numeroOcupado: () => [
    "Uy, justo lo tomó otra persona. Elegí otro, todavía quedan varios libres.",
    "Ese ya no está — probá con otro, hay bastantes disponibles.",
  ],
  confirmacion: (numero: number) => [
    `¡Ya sos parte del sorteo! Tu número es el ${numero}.`,
    `Listo, quedaste anotado con el número ${numero}. ¡Mucha suerte!`,
  ],
  condicionPremio: () => [
    "No te olvides: para poder cobrar el premio tenés que seguir en nuestro canal de WhatsApp.",
    "Un detalle importante: el premio se cobra solo si seguís en nuestro WhatsApp cuando salga el resultado.",
  ],
  invitacionWhatsapp: () => [
    "Recibí los sorteos antes que nadie.",
    "Enterate primero de los nuevos premios.",
    "Accedé a beneficios exclusivos.",
    "No te pierdas el próximo sorteo.",
  ],
  sinSorteoActivo: () => [
    "Todavía no arrancamos el sorteo de esta semana. Quedate acá que avisamos primero.",
    "Por ahora no hay sorteo abierto — pero ya viene el próximo.",
  ],
  yaParticipaste: (numero: number) => [
    `Ya estás anotado en este sorteo con el número ${numero}.`,
    `Tranquilo, ya tenés tu lugar: el número ${numero} es tuyo.`,
  ],
  errorConexion: () => [
    "Se ve que se cortó la conexión. Probemos de nuevo.",
    "Parece que hubo un problema de conexión. Intentá otra vez.",
  ],
  errorInesperado: () => [
    "Uy, algo no salió como esperaba. Volvamos al inicio e intentemos de nuevo.",
    "Ups, se cruzó algo. Probemos de nuevo en un segundo.",
  ],
  resultadoPropio: (numero: number, premio: string) => [
    `¡GANASTE! Tu número ${numero} se llevó ${premio}. 🎉`,
    `¡Sos vos! El número ${numero} es el ganador de ${premio}. ¡Felicitaciones!`,
  ],
  resultadoConGanador: (numero: number, premio: string) => [
    `¡Tenemos ganador! El número ${numero} se llevó ${premio}. ¿Fuiste vos?`,
    `Ya salió el resultado: el número ${numero} ganó ${premio}.`,
  ],
  resultadoSinGanador: (numero: number) => [
    `Esta vez el número ${numero} no estaba en juego. ¡Nos vemos en el próximo sorteo!`,
    `El número ${numero} salió, pero nadie lo tenía anotado. ¡A por el que viene!`,
  ],
};
