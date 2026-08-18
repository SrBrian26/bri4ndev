import { describe, it, expect } from "vitest";
import { pickActiveSection, type SectionBox } from "../lib/sections";

const VIEWPORT = 800;

type Section = { id: string; height: number };

/** El layout real: cinco secciones `min-h-screen` y el footer. */
const PAGE: Section[] = [
  { id: "hero", height: VIEWPORT },
  { id: "about", height: VIEWPORT },
  { id: "projects", height: VIEWPORT },
  { id: "tmc", height: VIEWPORT },
  { id: "contact", height: VIEWPORT },
];
const FOOTER = 85;
const MAX_SCROLL = PAGE.length * VIEWPORT + FOOTER - VIEWPORT;

/** Rects como los devolvería getBoundingClientRect() con ese scroll. */
function boxesAt(sections: Section[], scrollY: number): SectionBox[] {
  let top = 0;
  return sections.map((section) => {
    const box = {
      id: section.id,
      top: top - scrollY,
      bottom: top + section.height - scrollY,
    };
    top += section.height;
    return box;
  });
}

function activeAt(scrollY: number, sections = PAGE, atBottom = false) {
  return pickActiveSection(boxesAt(sections, scrollY), VIEWPORT, { atBottom });
}

function range(from: number, to: number, step: number) {
  const out: number[] = [];
  if (step > 0) for (let i = from; i <= to; i += step) out.push(i);
  else for (let i = from; i >= to; i += step) out.push(i);
  return out;
}

describe("pickActiveSection · casos base", () => {
  it("sin secciones devuelve null", () => {
    expect(pickActiveSection([], VIEWPORT)).toBeNull();
  });

  it("arriba del todo marca la primera sección", () => {
    expect(activeAt(0)).toBe("hero");
  });

  it("marca la sección que cruza la línea de referencia", () => {
    // scroll 900 → about ocupa de -100 a 700, la línea (320) cae dentro
    expect(activeAt(900)).toBe("about");
  });

  it("no depende del orden en que lleguen los rects", () => {
    const boxes = boxesAt(PAGE, 900);
    const revueltos = [boxes[3], boxes[0], boxes[4], boxes[1], boxes[2]];
    expect(pickActiveSection(revueltos, VIEWPORT)).toBe("about");
  });

  it("una sola sección siempre gana", () => {
    const una = [{ id: "hero", height: VIEWPORT }];
    expect(activeAt(0, una)).toBe("hero");
    expect(activeAt(400, una)).toBe("hero");
  });
});

describe("pickActiveSection · transiciones", () => {
  // about empieza en 800, cruza la línea (0.4 · 800 = 320) con scroll 480
  const CAMBIO = 800 - VIEWPORT * 0.4;

  it("no se adelanta: la sección entrante aún no manda", () => {
    expect(activeAt(CAMBIO - 1)).toBe("hero");
  });

  it("cambia justo cuando la nueva sección cruza la línea", () => {
    expect(activeAt(CAMBIO)).toBe("about");
  });

  it("el cambio ocurre cuando la nueva sección ya ocupa la mayor parte", () => {
    // En el punto de cambio, about ocupa de 320 a 1120: el 60% de la ventana
    const about = boxesAt(PAGE, CAMBIO)[1];
    const visible = Math.min(about.bottom, VIEWPORT) - Math.max(about.top, 0);
    expect(visible / VIEWPORT).toBeGreaterThanOrEqual(0.6);
  });

  it("es simétrico al subir y al bajar", () => {
    // La misma posición da el mismo resultado sin importar de dónde se venga:
    // la función no tiene memoria.
    expect(activeAt(CAMBIO)).toBe(activeAt(CAMBIO));
    expect(activeAt(CAMBIO - 1)).toBe("hero");
    expect(activeAt(CAMBIO + 1)).toBe("about");
  });
});

describe("pickActiveSection · alturas dispares", () => {
  it("una sección corta no gana solo por ser corta", () => {
    // El bug de intersectionRatio: una sección baja metida entera en la banda
    // daba ratio 1 y se llevaba el foco aunque ocupara poco de la pantalla.
    const conSeccionCorta: Section[] = [
      { id: "hero", height: VIEWPORT },
      { id: "about", height: 60 },
      { id: "projects", height: VIEWPORT },
    ];
    // scroll 420 → about ocupa de 380 a 440, solo el 7,5% de la ventana,
    // mientras hero llena de 0 a 380 y projects de 440 abajo
    expect(activeAt(420, conSeccionCorta)).toBe("hero");
  });

  it("una sección corta sí manda cuando cruza la línea", () => {
    const conSeccionCorta: Section[] = [
      { id: "hero", height: VIEWPORT },
      { id: "about", height: 60 },
      { id: "projects", height: VIEWPORT },
    ];
    // scroll 500 → about ocupa de 300 a 360 y cruza la línea (320)
    expect(activeAt(500, conSeccionCorta)).toBe("about");
  });

  it("aguanta secciones mucho más altas que la ventana", () => {
    const alta: Section[] = [
      { id: "hero", height: VIEWPORT },
      { id: "projects", height: VIEWPORT * 6 },
      { id: "contact", height: VIEWPORT },
    ];
    for (const scrollY of range(800, 5000, 100)) {
      expect(activeAt(scrollY, alta)).toBe("projects");
    }
  });
});

describe("pickActiveSection · casos límite", () => {
  it("en un hueco entre secciones mantiene la última que pasó", () => {
    const conHueco: SectionBox[] = [
      { id: "hero", top: -900, bottom: -100 },
      { id: "about", top: 500, bottom: 1300 },
    ];
    // La línea (320) cae en el hueco entre -100 y 500
    expect(pickActiveSection(conHueco, VIEWPORT)).toBe("hero");
  });

  it("al final del documento gana siempre la última sección", () => {
    const cortaAlFinal: Section[] = [
      { id: "hero", height: VIEWPORT },
      { id: "contact", height: 100 },
    ];
    // Sin la regla, contact nunca llegaría a cruzar la línea
    expect(activeAt(100, cortaAlFinal, true)).toBe("contact");
  });

  it("no revienta con una ventana de alto 0", () => {
    expect(activeAt(0, PAGE)).toBeTypeOf("string");
    expect(pickActiveSection(boxesAt(PAGE, 0), 0)).toBe("hero");
  });

  it("si dos secciones se solapan sobre la línea gana la que entra", () => {
    const solapadas: SectionBox[] = [
      { id: "hero", top: -400, bottom: 400 },
      { id: "about", top: 300, bottom: 1100 },
    ];
    expect(pickActiveSection(solapadas, VIEWPORT)).toBe("about");
  });
});

describe("pickActiveSection · recorrido completo de la página", () => {
  const recorrido = range(0, MAX_SCROLL, 10).map((scrollY) => {
    const id = activeAt(scrollY, PAGE, scrollY >= MAX_SCROLL);
    // En ningún punto del recorrido puede quedarse sin sección activa
    if (id === null) throw new Error(`sin sección activa con scroll ${scrollY}`);
    return id;
  });

  it("pasa por las cinco secciones", () => {
    expect([...new Set(recorrido)]).toEqual([
      "hero",
      "about",
      "projects",
      "tmc",
      "contact",
    ]);
  });

  it("nunca retrocede ni se salta una sección", () => {
    const orden = PAGE.map((s) => s.id);
    let anterior = 0;
    for (const id of recorrido) {
      const actual = orden.indexOf(id);
      expect(actual - anterior).toBeGreaterThanOrEqual(0);
      expect(actual - anterior).toBeLessThanOrEqual(1);
      anterior = actual;
    }
  });

  it("cada sección manda durante un tramo continuo", () => {
    const tramos = recorrido.filter((id, i) => id !== recorrido[i - 1]);
    expect(tramos).toHaveLength(5);
  });

  it("termina en contact con el scroll al fondo", () => {
    expect(activeAt(MAX_SCROLL, PAGE, true)).toBe("contact");
  });
});

/* ------------------------------------------------------------------ */
/*  Regresión: por qué se cambió el IntersectionObserver.              */
/*  Reproduce su semántica real —banda central del 45% al 55% y un     */
/*  callback que solo recibe las secciones que CAMBIARON de estado—    */
/*  junto a la lógica que tenía el Navbar.                             */
/* ------------------------------------------------------------------ */

function simularObservadorAnterior(
  sections: Section[],
  scrollPositions: number[],
  viewport = VIEWPORT,
) {
  const bandaTop = viewport * 0.45;
  const bandaBottom = viewport * 0.55;
  const anterior = new Map<string, boolean>();
  let active = sections[0].id;

  for (const scrollY of scrollPositions) {
    const entries: { id: string; isIntersecting: boolean; ratio: number }[] = [];

    for (const box of boxesAt(sections, scrollY)) {
      const isIntersecting = box.top < bandaBottom && box.bottom > bandaTop;

      // El observador solo notifica lo que cambió desde el último aviso
      if (anterior.get(box.id) !== isIntersecting) {
        const solape =
          Math.max(0, Math.min(box.bottom, bandaBottom) - Math.max(box.top, bandaTop));
        entries.push({
          id: box.id,
          isIntersecting,
          // intersectionRatio = área intersectada / área del propio target
          ratio: solape / (box.bottom - box.top),
        });
      }
      anterior.set(box.id, isIntersecting);
    }

    // ── La lógica exacta que tenía el Navbar ──
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.ratio - a.ratio)[0];
    if (visible) active = visible.id;
  }

  return active;
}

describe("regresión · el IntersectionObserver anterior", () => {
  // Con scroll 370 hero ocupa de 0 a 430 (el 54% de la ventana): manda hero
  const POSICION = 370;

  it("se adelantaba: marcaba la siguiente sección con media pantalla de la anterior a la vista", () => {
    const bajando = range(0, POSICION, 10);
    expect(simularObservadorAnterior(PAGE, bajando)).toBe("about");

    // La versión nueva mira la geometría completa y acierta
    expect(activeAt(POSICION)).toBe("hero");
  });

  it("daba un resultado distinto según la dirección del scroll", () => {
    const bajando = range(0, POSICION, 10);
    const subiendo = [...range(0, 800, 10), ...range(800, POSICION, -10)];

    // Misma posición final, dos respuestas distintas: el estado dependía del
    // historial de eventos, no de lo que se estaba viendo.
    expect(simularObservadorAnterior(PAGE, bajando)).toBe("about");
    expect(simularObservadorAnterior(PAGE, subiendo)).toBe("hero");

    // La versión nueva da lo mismo por los dos caminos
    expect(activeAt(POSICION)).toBe("hero");
  });

  it("dejaba de actualizar cuando el aviso no traía ninguna sección visible", () => {
    // Al salir una sección de la banda, la que se queda no cambió de estado y
    // por tanto no viene en el aviso: `entries` llega sin nada intersectando y
    // el Navbar no tocaba el estado. Aquí no hace daño porque el valor ya era
    // el bueno, pero es la razón de que el estado dependa del historial.
    const bajando = range(0, 500, 10);
    expect(simularObservadorAnterior(PAGE, bajando)).toBe("about");

    // Con la sección de destino ya dentro de la banda, el salto no genera
    // ningún aviso útil y el valor se queda como estaba.
    expect(activeAt(500)).toBe("about"); // la nueva coincide aquí
  });
});
