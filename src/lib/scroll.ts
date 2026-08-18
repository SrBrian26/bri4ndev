import type { MouseEvent } from "react";

/**
 * Margen, en ms, durante el que se reajusta la sección de llegada mientras la
 * página termina de crecer.
 */
const SETTLE_MS = 1200;

/** Gestos con los que el usuario reclama el control del scroll. */
const GESTURES = ["wheel", "touchstart", "keydown"] as const;

/** Corta el reajuste en curso, si lo hay. */
let stopSettling: (() => void) | null = null;

/**
 * Navega a una sección interna sin dejar el `#hash` en la URL.
 *
 * El `<a href="#id">` se mantiene tal cual: sigue sirviendo como fallback sin
 * JS, para abrir en otra pestaña con ctrl/cmd + clic y para que los lectores
 * de pantalla lo anuncien como enlace. Aquí solo se cancela el salto nativo.
 */
export function scrollToSection(event: MouseEvent<HTMLAnchorElement>) {
  // Deja pasar los clics con modificador (nueva pestaña, nueva ventana…)
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  const href = event.currentTarget.getAttribute("href");
  if (!href?.startsWith("#")) return;

  const target = document.getElementById(href.slice(1));
  if (!target) return;

  event.preventDefault();

  // Sin argumentos hereda el `scroll-behavior: smooth` de index.css
  target.scrollIntoView();

  // Al cancelar el salto nativo se pierde el movimiento de foco: lo repone,
  // para que el tabulador continúe desde la sección y no desde el enlace.
  focusSection(target);
}

/**
 * Atiende el `#hash` con el que se abre la página: lleva la vista a esa sección
 * y deja la URL limpia. Devuelve la función que deja de escuchar.
 *
 * El salto nativo del navegador no sirve aquí: cuando lee el hash la app aún no
 * ha pintado nada, así que no hay ningún `id` al que ir. Por eso lo hace la app
 * en cuanto monta, y de paso el hash desaparece de la URL igual que en los
 * clics de `scrollToSection`.
 */
export function startHashNavigation(): () => void {
  // También al vuelo: cambiar el hash a mano en la barra de direcciones no
  // recarga la página, solo dispara este evento.
  window.addEventListener("hashchange", openHashSection);
  openHashSection();

  return () => window.removeEventListener("hashchange", openHashSection);
}

function openHashSection() {
  const id = window.location.hash.slice(1);
  if (!id) return;

  // La URL se limpia siempre, incluso si el hash no apunta a ninguna sección.
  history.replaceState(null, "", location.pathname + location.search);

  const target = document.getElementById(id);
  if (!target) return;

  // Instantáneo a propósito: al abrir la página no hay nada de donde "venir" y
  // el desplazamiento suave de index.css tardaría en recorrer todo el documento.
  const align = () =>
    target.scrollIntoView({ behavior: "instant", block: "start" });

  align();
  focusSection(target);
  settle(align);
}

/**
 * Mantiene la sección en su sitio mientras el contenido sigue llegando.
 *
 * Al abrir la página quedan cosas por cargar —los proyectos y las tecnologías
 * vienen por fetch, más las imágenes y las fuentes— y cada una cambia el alto
 * del documento, lo que desplaza las secciones de abajo. Un único scroll al
 * montar dejaría la vista en el sitio equivocado.
 */
function settle(align: () => void) {
  stopSettling?.();

  const observer = new ResizeObserver(align);
  observer.observe(document.body);

  const stop = () => {
    observer.disconnect();
    clearTimeout(timer);
    for (const gesture of GESTURES) window.removeEventListener(gesture, stop);
    if (stopSettling === stop) stopSettling = null;
  };

  const timer = setTimeout(stop, SETTLE_MS);

  // Manda el usuario: en cuanto mueve el scroll, se deja de reajustar.
  for (const gesture of GESTURES) {
    window.addEventListener(gesture, stop, { passive: true });
  }

  stopSettling = stop;
}

function focusSection(target: HTMLElement) {
  target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}
