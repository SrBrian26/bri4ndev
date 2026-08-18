import { describe, it, expect } from "vitest";
import {
  validar,
  hayProblemas,
  esMotivo,
  MOTIVOS,
  LIMITES,
  FORM_VACIO,
  type ContactForm,
} from "../lib/contact";

const VALIDO: ContactForm = {
  nombre: "Brian Muñoz",
  correo: "brian@bri4n.dev",
  motivo: "cotizacion",
  mensaje: "Hola, quería consultar por un proyecto web.",
};

/** Un formulario válido con un campo cambiado. */
function con(cambios: Partial<ContactForm>): ContactForm {
  return { ...VALIDO, ...cambios };
}

describe("validar · formulario correcto", () => {
  it("un formulario completo no da problemas", () => {
    expect(validar(VALIDO)).toEqual({});
    expect(hayProblemas(validar(VALIDO))).toBe(false);
  });

  it("acepta los cuatro motivos", () => {
    for (const motivo of MOTIVOS) {
      expect(validar(con({ motivo: motivo.value }))).toEqual({});
    }
  });

  it("no le molestan los espacios de sobra", () => {
    expect(validar(con({ nombre: "  Brian  ", correo: "  b@bri4n.dev  " }))).toEqual({});
  });
});

describe("validar · campos obligatorios", () => {
  it("el formulario vacío señala los cuatro campos", () => {
    const problemas = validar(FORM_VACIO);
    expect(Object.keys(problemas).sort()).toEqual([
      "correo",
      "mensaje",
      "motivo",
      "nombre",
    ]);
  });

  it("solo espacios cuenta como vacío", () => {
    // Sin trim(), "   " pasaría el required y llegaría un mensaje en blanco.
    const problemas = validar(con({ nombre: "   ", mensaje: "      " }));
    expect(problemas.nombre).toBe('"nombre" es obligatorio');
    expect(problemas.mensaje).toBe('"mensaje" es obligatorio');
  });

  it("cada campo se valida por su cuenta", () => {
    // Un campo malo no debe arrastrar a los demás.
    expect(Object.keys(validar(con({ correo: "" })))).toEqual(["correo"]);
    expect(Object.keys(validar(con({ nombre: "" })))).toEqual(["nombre"]);
  });
});

describe("validar · correo", () => {
  it("rechaza direcciones malformadas", () => {
    const malos = [
      "asdf",
      "asdf@",
      "@bri4n.dev",
      "asdf@bri4n",
      "asdf @bri4n.dev",
      "asdf@bri4n.d",
      "dos@arrobas@bri4n.dev",
    ];
    for (const correo of malos) {
      expect(validar(con({ correo })).correo).toBe(
        '"correo" no es una dirección válida',
      );
    }
  });

  it("acepta direcciones reales que una regex estricta se comería", () => {
    const buenos = [
      "brian@bri4n.dev",
      "brian+portfolio@gmail.com",
      "brian.munoz@sub.dominio.co.uk",
      "b_r-i.a+n@tmcsolucionesdigitales.cl",
      "1423@dominio.io",
    ];
    for (const correo of buenos) {
      expect(validar(con({ correo })).correo).toBeUndefined();
    }
  });
});

describe("validar · longitudes", () => {
  it("un nombre de una letra es demasiado corto", () => {
    expect(validar(con({ nombre: "B" })).nombre).toBe('"nombre" es demasiado corto');
  });

  it("dos letras ya valen", () => {
    expect(validar(con({ nombre: "Bo" })).nombre).toBeUndefined();
  });

  it("un mensaje corto pide más caracteres", () => {
    expect(validar(con({ mensaje: "Hola" })).mensaje).toBe(
      '"mensaje" necesita al menos 10 caracteres',
    );
  });

  it("el mínimo del mensaje se mide sin los espacios de los bordes", () => {
    // "Hola" + relleno de espacios no debe colar como mensaje de 10.
    expect(validar(con({ mensaje: "Hola      " })).mensaje).toBe(
      '"mensaje" necesita al menos 10 caracteres',
    );
  });

  it("justo en el límite mínimo pasa", () => {
    expect(validar(con({ mensaje: "a".repeat(LIMITES.mensaje.min) })).mensaje)
      .toBeUndefined();
  });

  it("pasarse del máximo da problema", () => {
    expect(validar(con({ nombre: "a".repeat(LIMITES.nombre.max + 1) })).nombre)
      .toContain("80");
    expect(validar(con({ mensaje: "a".repeat(LIMITES.mensaje.max + 1) })).mensaje)
      .toContain("1000");
    expect(validar(con({ correo: `${"a".repeat(LIMITES.correo.max)}@bri4n.dev` })).correo)
      .toContain("120");
  });

  it("justo en el límite máximo pasa", () => {
    expect(validar(con({ nombre: "a".repeat(LIMITES.nombre.max) })).nombre)
      .toBeUndefined();
    expect(validar(con({ mensaje: "a".repeat(LIMITES.mensaje.max) })).mensaje)
      .toBeUndefined();
  });
});

describe("esMotivo", () => {
  it("reconoce los valores del enum", () => {
    expect(esMotivo("consulta")).toBe(true);
    expect(esMotivo("cotizacion")).toBe(true);
    expect(esMotivo("trabajo")).toBe(true);
    expect(esMotivo("otro")).toBe(true);
  });

  it("rechaza cualquier otra cosa", () => {
    // El motivo viaja al backend como enum: un valor de fuera debe caer aquí.
    expect(esMotivo("")).toBe(false);
    expect(esMotivo("Cotización")).toBe(false); // la etiqueta, no el valor
    expect(esMotivo("spam")).toBe(false);
  });

  it("un motivo fuera del enum se marca como problema", () => {
    const intruso = { ...VALIDO, motivo: "spam" } as unknown as ContactForm;
    expect(validar(intruso).motivo).toBe('"motivo" no es una de las opciones');
  });
});
