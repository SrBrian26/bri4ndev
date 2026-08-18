export type SectionBox = {
  id: string;
  /** Distancia del borde superior de la sección al borde superior de la ventana */
  top: number;
  /** Ídem para el borde inferior */
  bottom: number;
};

/**
 * Altura de la ventana, en tanto por uno, donde vive la línea de referencia.
 * La sección activa es la que cruza esa línea.
 */
export const ACTIVE_LINE = 0.4;

/**
 * Decide qué sección está activa a partir de la geometría de todas ellas.
 *
 * La regla es una línea imaginaria al 40% de la altura de la ventana: manda la
 * sección que la cruza. Es una decisión sobre el estado completo, no sobre lo
 * que acaba de cambiar, así que no depende del orden de los eventos ni puede
 * quedarse en un valor viejo.
 *
 * @param boxes  Rects de las secciones, en coordenadas de ventana. El orden da
 *               igual: se ordenan por posición.
 * @param viewportHeight  Alto de la ventana en px.
 * @param atBottom  true si el scroll ya llegó al final del documento.
 */
export function pickActiveSection(
  boxes: SectionBox[],
  viewportHeight: number,
  { atBottom = false }: { atBottom?: boolean } = {},
): string | null {
  if (boxes.length === 0) return null;

  const ordered = [...boxes].sort((a, b) => a.top - b.top);

  // Al final del documento gana la última sección siempre. Si no, una sección
  // corta al cierre (o un footer alto) haría que nunca llegue a cruzar la
  // línea y quedaría marcada la anterior con el scroll ya tope abajo.
  if (atBottom) return ordered[ordered.length - 1].id;

  const line = viewportHeight * ACTIVE_LINE;

  // Caso normal: exactamente una sección cruza la línea.
  const crossing = ordered.filter((box) => box.top <= line && box.bottom > line);
  if (crossing.length > 0) {
    // Si se solapan, gana la que empieza más abajo: es la que está entrando.
    return crossing[crossing.length - 1].id;
  }

  // Hueco entre secciones: se mantiene la última que ya pasó la línea.
  const passed = ordered.filter((box) => box.top <= line);
  if (passed.length > 0) return passed[passed.length - 1].id;

  // Nada ha llegado aún a la línea (scroll arriba del todo).
  return ordered[0].id;
}
