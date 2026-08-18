import { describe, it, expect } from "vitest";
import { segundosDeEspera } from "../services/api";

describe("segundosDeEspera", () => {
  it("usa los segundos que manda el servidor", () => {
    expect(segundosDeEspera("42")).toBe(42);
    expect(segundosDeEspera("1")).toBe(1);
  });

  it("redondea hacia arriba para no reintentar antes de tiempo", () => {
    expect(segundosDeEspera("3.2")).toBe(4);
  });

  it("cae en un minuto si la cabecera no llega o no sirve", () => {
    // Sin `Access-Control-Expose-Headers` el navegador la esconde: null.
    expect(segundosDeEspera(null)).toBe(60);
    expect(segundosDeEspera("")).toBe(60);
    expect(segundosDeEspera("0")).toBe(60);
    expect(segundosDeEspera("-5")).toBe(60);
    // Formato de fecha HTTP: válido según el RFC, pero no lo usa la API.
    expect(segundosDeEspera("Wed, 21 Oct 2026 07:28:00 GMT")).toBe(60);
  });

  it("no deja al usuario esperando más de una hora", () => {
    expect(segundosDeEspera("99999")).toBe(3600);
  });
});
