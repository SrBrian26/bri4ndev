import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { correo, correoPartes, propsCorreo } from "../lib/email";
import CorreoTexto from "../components/CorreoTexto";

const { dominio } = correoPartes();

/** La misma comprobación laxa que usa el formulario. */
const FORMA = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Lo que buscaría un extractor: cualquier dirección en este dominio. */
const DIRECCION = new RegExp(`[\\w.+-]+@${dominio.replace(/\./g, "\\.")}`);

describe("correo()", () => {
  it("rearma una dirección con forma válida", () => {
    expect(correo()).toMatch(FORMA);
  });

  it("junta las dos mitades por la arroba", () => {
    const { usuario } = correoPartes();
    expect(correo()).toBe(`${usuario}@${dominio}`);
  });
});

describe("propsCorreo", () => {
  it("el href nunca lleva la dirección", () => {
    // Un extractor que recorra los atributos de la página no debe encontrar
    // nada: el `mailto:` se arma dentro del clic y no llega a tocar el DOM.
    expect(propsCorreo.href).not.toMatch(DIRECCION);
    expect(propsCorreo.href).not.toContain("mailto");
  });
});

const sinEtiquetas = (marcado: string) => marcado.replace(/<[^>]+>/g, "");

/** Lo que ve —y copia— una persona: el navegador no pinta los cebos. */
const comoSeVe = (marcado: string) =>
  sinEtiquetas(marcado.replace(/<span[^>]*display:none[^>]*>.*?<\/span>/g, ""));

describe("CorreoTexto", () => {
  const marcado = renderToStaticMarkup(createElement(CorreoTexto));

  it("una persona lee la dirección entera y sin cambios", () => {
    expect(comoSeVe(marcado)).toBe(correo());
  });

  it("el marcado no trae la dirección seguida", () => {
    expect(marcado).not.toMatch(DIRECCION);
  });

  it("quien raspa el textContent se lleva una dirección rota", () => {
    // Con los cebos dentro, que es como los ve un extractor que ignora el CSS.
    const raspado = sinEtiquetas(marcado);
    expect(raspado).toContain("no-spam");
    expect(raspado).not.toMatch(DIRECCION);
  });
});

/**
 * El código tal cual se escribe, que es lo que acaba en el bundle. Se leen en
 * crudo con `?raw` en vez de con `node:fs` porque el tsconfig de la app solo
 * conoce los tipos de Vite.
 */
const FUENTES: Record<string, string> = {
  ...import.meta.glob("../**/*.{ts,tsx,js,jsx,css}", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  ...import.meta.glob("../../index.html", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
};

/**
 * El punto de todo el montaje: que un extractor no encuentre una dirección
 * buscándola tal cual en lo que se descarga. Si alguien la vuelve a escribir en
 * un componente, este test lo dice.
 *
 * Se busca «algo@el-dominio» y no el dominio suelto, porque bri4n.dev es además
 * la marca del sitio y aparece a la vista en el logo, la navegación y el hero.
 * Los propios tests quedan fuera: usan direcciones escritas a mano como datos
 * de prueba y no se publican.
 */
describe("ninguna dirección viaja en texto plano", () => {
  // Las rutas que empiezan por "./" son los otros archivos de tests/
  const archivos = Object.keys(FUENTES).filter((ruta) => !ruta.startsWith("./"));

  it("hay fuentes que revisar", () => {
    expect(archivos.length).toBeGreaterThan(10);
  });

  for (const archivo of archivos) {
    it(archivo, () => {
      expect(FUENTES[archivo]).not.toMatch(DIRECCION);
    });
  }
});
