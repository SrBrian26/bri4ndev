import type { ReactNode } from "react";

/**
 * Opacidad de cada marca de agua. La de TMC va más alta porque su sección
 * pinta encima un gradiente translúcido (`.bg-tmc`) que la apagaría.
 */
const BRAND_OPACITY = 0.07;
const TMC_OPACITY = 0.13;

/** Copia estática del logo "B4", en SVG para que escale con el contenedor. */
function BrandMark() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full"
      fill="none"
      style={{ opacity: BRAND_OPACITY }}
    >
      <circle cx="50" cy="50" r="47" stroke="#a1a1aa" strokeWidth="1.6" />
      <text
        x="50"
        y="65"
        textAnchor="middle"
        fontFamily="'Gelasio', Georgia, serif"
        fontStyle="italic"
        fontWeight="700"
        fontSize="46"
        letterSpacing="-0.5"
      >
        <tspan fill="#fafafa">B</tspan>
        <tspan fill="#8b5cf6">4</tspan>
      </text>
    </svg>
  );
}

/** El isotipo de TMC, al 86% para que pese lo mismo en pantalla que el B4. */
function TmcMark() {
  return (
    <div className="grid h-full w-full place-items-center">
      <img
        src="/img/tmc-mono-sin-fondo.png"
        alt="Logo TMC"
        className="h-[86%] w-[86%] object-contain brightness-0 invert"
        style={{ opacity: TMC_OPACITY }}
      />
    </div>
  );
}

const MARKS = { brand: BrandMark, tmc: TmcMark };

type BackgroundMarkProps = {
  /** Qué logo manda en este tramo de la página. */
  mark: keyof typeof MARKS;
  /** Las secciones que abarca. Sus bordes son las líneas de corte. */
  children: ReactNode;
};

/**
 * Marca de agua centrada en el fondo, viva solo mientras se ven sus secciones.
 *
 * El logo se queda quieto en el centro de la ventana y son los bordes del
 * tramo los que lo recortan: al llegar a la sección siguiente, la línea que
 * las separa barre la marca y el logo del tramo de al lado ocupa justo lo que
 * el anterior deja libre. Ninguno se mete en el territorio del otro.
 *
 * El corte lo hace el navegador —`overflow: clip` sobre un hijo `sticky`—, no
 * JavaScript. Es la única forma de que vaya clavado al scroll: calcularlo en un
 * `requestAnimationFrame` deja el recorte un frame por detrás de lo que se
 * pinta, y en móvil, donde el scroll va por el compositor y el JS ni siquiera
 * corre a tiempo, el logo saliente se veía montado sobre el nuevo.
 *
 * Dos detalles que sostienen el truco:
 *
 * - `overflow: clip` y no `hidden`: `hidden` haría del tramo un contenedor de
 *   scroll y el `sticky` se pegaría a él en vez de a la ventana.
 * - La caja que contiene al `sticky` sobresale media ventana por arriba y por
 *   abajo. Un `sticky` no puede salirse de su contenedor, así que sin ese
 *   margen el logo dejaría de estar centrado justo al llegar a los bordes: se
 *   iría deslizando hacia fuera en vez de quedarse quieto mientras lo comen.
 */
export default function BackgroundMark({ mark, children }: BackgroundMarkProps) {
  const Mark = MARKS[mark];

  return (
    <div className="relative overflow-clip">
      {/* z-[-1]: por delante del fondo de `body::before` (-2) y por detrás de
          todo el contenido de la página. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-50vh] bottom-[-50vh] z-[-1] select-none"
      >
        <div className="sticky top-[50vh] h-0">
          <div className="absolute top-0 left-1/2 aspect-square w-[min(62vw,22rem)] -translate-x-1/2 -translate-y-1/2 sm:w-[min(38vw,26rem)]">
            <Mark />
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
