import type { Project } from "../components/ProjectCard";
import type { Technology } from "../components/TechChip";
import { CAMPOS } from "../lib/contact";
import type { Motivo, Problemas } from "../lib/contact";

const BASE_URL = import.meta.env.VITE_API_URL;

/** GET a la API, devolviendo el `data` del sobre que arma Laravel. */
async function pedir<T>(ruta: string, error: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${ruta}`);
  if (!res.ok) throw new Error(error);
  const json = await res.json();
  return json.data;
}

/**
 * Recurso de solo lectura cacheado a nivel de módulo.
 *
 * Guarda la promesa en vuelo, así que da lo mismo cuántas veces se pida: la
 * petición sale una sola vez y puede lanzarse antes de que React monte (ver
 * `prefetch`). Guarda además el valor ya resuelto, para que la sección arranque
 * con datos en el primer render —visita con la respuesta todavía en la caché
 * del navegador— y se salte el esqueleto.
 */
function recurso<T>(ruta: string, error: string) {
  let promesa: Promise<T> | null = null;
  let datos: T | null = null;

  function obtener(): Promise<T> {
    promesa ??= pedir<T>(ruta, error)
      .then((valor) => {
        datos = valor;
        return valor;
      })
      .catch((e: unknown) => {
        // El fallo no se cachea: la siguiente llamada vuelve a intentarlo.
        promesa = null;
        throw e;
      });
    return promesa;
  }

  return { obtener, cache: () => datos };
}

const proyectos = recurso<Project[]>("/projects", "Error al cargar proyectos");
const tecnologias = recurso<Technology[]>(
  "/technologies",
  "Error al cargar tecnologías",
);

export const getProjects = proyectos.obtener;
export const getTechnologies = tecnologias.obtener;

/** Datos ya en memoria, o `null` si la petición sigue en curso. */
export const proyectosEnCache = proyectos.cache;
export const tecnologiasEnCache = tecnologias.cache;

/**
 * Lanza las dos peticiones sin esperarlas. Se llama desde main.tsx antes de
 * montar React: así la ida y vuelta a la API se solapa con el arranque de la
 * app, en vez de empezar recién cuando corren los efectos de las secciones
 * —que encima están bajo el fold—.
 */
export function prefetch(): void {
  // Los errores los pinta cada sección; acá solo se marcan como manejados para
  // que no salten como "unhandled rejection" si la API falla antes de montar.
  void getProjects().catch(() => {});
  void getTechnologies().catch(() => {});
}

export type ContactPayload = {
  nombre: string;
  correo: string;
  motivo: Motivo;
  mensaje: string;
};

/**
 * Error de validación del servidor (422). Trae los problemas ya mapeados a los
 * campos del formulario para que se pinten en el mismo panel que los del
 * cliente.
 */
export class ValidacionError extends Error {
  problemas: Problemas;

  constructor(problemas: Problemas) {
    super("El servidor rechazó los datos");
    this.name = "ValidacionError";
    this.problemas = problemas;
  }
}

/**
 * Demasiados envíos (429). El servidor limita los envíos por IP y por minuto,
 * así que esto no es un fallo del formulario: solo hay que esperar.
 */
export class LimiteError extends Error {
  segundos: number;

  constructor(segundos: number) {
    super("Demasiados envíos");
    this.name = "LimiteError";
    this.segundos = segundos;
  }
}

/** Cuánto esperar cuando el servidor no dice cuánto falta. */
const ESPERA_POR_DEFECTO = 60;

/**
 * Segundos que faltan según `Retry-After`.
 *
 * La cabecera puede llegar vacía: al ser una petición entre orígenes, el
 * navegador solo la deja leer si la API la publica en
 * `Access-Control-Expose-Headers`. En ese caso se asume un minuto, que es la
 * ventana del limitador.
 */
export function segundosDeEspera(header: string | null): number {
  const segundos = Number(header);
  if (!Number.isFinite(segundos) || segundos <= 0) return ESPERA_POR_DEFECTO;
  return Math.min(Math.ceil(segundos), 3600);
}

/**
 * Sobre de validación de Laravel: { message, errors: { campo: ["..."] } }.
 * Solo se leen los campos del formulario; lo que venga de más se ignora.
 */
function leerErrores(json: unknown): Problemas {
  const errors = (json as { errors?: Record<string, unknown> })?.errors;
  if (!errors) return {};

  const problemas: Problemas = {};
  for (const campo of CAMPOS) {
    const mensajes = errors[campo];
    if (Array.isArray(mensajes) && typeof mensajes[0] === "string") {
      problemas[campo] = mensajes[0];
    }
  }
  return problemas;
}

export async function postContact(payload: ContactPayload): Promise<void> {
  const res = await fetch(`${BASE_URL}/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.ok) return;

  if (res.status === 429) {
    throw new LimiteError(segundosDeEspera(res.headers.get("Retry-After")));
  }

  if (res.status === 422) {
    // Si el cuerpo no es el JSON esperado se cae al error genérico de abajo.
    const problemas = await res
      .json()
      .then(leerErrores)
      .catch(() => ({}));
    if (Object.keys(problemas).length > 0) throw new ValidacionError(problemas);
  }

  throw new Error("Error al enviar el mensaje");
}
