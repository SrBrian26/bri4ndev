/** Opciones del desplegable "motivo". El orden es el que se ve en pantalla. */
export const MOTIVOS = [
  { value: "consulta", label: "Consulta general" },
  { value: "cotizacion", label: "Cotización" },
  { value: "trabajo", label: "Oferta de trabajo" },
  { value: "otro", label: "Otro" },
] as const;

export type Motivo = (typeof MOTIVOS)[number]["value"];

/** El motivo empieza vacío: no hay opción preseleccionada. */
export type ContactForm = {
  nombre: string;
  correo: string;
  motivo: Motivo | "";
  mensaje: string;
};

export type Campo = keyof ContactForm;

/** Los campos en el orden en que aparecen en pantalla. */
export const CAMPOS: readonly Campo[] = ["nombre", "correo", "motivo", "mensaje"];

/** Un mensaje por campo con problema. Sin claves = formulario válido. */
export type Problemas = Partial<Record<Campo, string>>;

export const LIMITES = {
  nombre: { min: 2, max: 80 },
  correo: { max: 120 },
  mensaje: { min: 10, max: 1000 },
} as const;

export const FORM_VACIO: ContactForm = {
  nombre: "",
  correo: "",
  motivo: "",
  mensaje: "",
};

/**
 * Comprobación deliberadamente laxa: algo@algo.tld sin espacios. Validar
 * correos con una regex estricta descarta direcciones legítimas, y quien manda
 * un correo falso no lo hace por equivocarse de formato. La comprobación de
 * verdad es que llegue el correo.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const MOTIVOS_VALIDOS: readonly string[] = MOTIVOS.map((m) => m.value);

export function esMotivo(value: string): value is Motivo {
  return MOTIVOS_VALIDOS.includes(value);
}

/**
 * Valida el formulario entero y devuelve un mensaje por campo con problema.
 *
 * Los mensajes van en minúscula y nombran el campo entre comillas, para que
 * lean como la salida de un linter dentro del panel "Problems".
 */
export function validar(form: ContactForm): Problemas {
  const problemas: Problemas = {};

  const nombre = form.nombre.trim();
  if (!nombre) {
    problemas.nombre = '"nombre" es obligatorio';
  } else if (nombre.length < LIMITES.nombre.min) {
    problemas.nombre = '"nombre" es demasiado corto';
  } else if (nombre.length > LIMITES.nombre.max) {
    problemas.nombre = `"nombre" no puede pasar de ${LIMITES.nombre.max} caracteres`;
  }

  const correo = form.correo.trim();
  if (!correo) {
    problemas.correo = '"correo" es obligatorio';
  } else if (correo.length > LIMITES.correo.max) {
    problemas.correo = `"correo" no puede pasar de ${LIMITES.correo.max} caracteres`;
  } else if (!EMAIL.test(correo)) {
    problemas.correo = '"correo" no es una dirección válida';
  }

  if (!form.motivo) {
    problemas.motivo = '"motivo" es obligatorio';
  } else if (!esMotivo(form.motivo)) {
    problemas.motivo = '"motivo" no es una de las opciones';
  }

  const mensaje = form.mensaje.trim();
  if (!mensaje) {
    problemas.mensaje = '"mensaje" es obligatorio';
  } else if (mensaje.length < LIMITES.mensaje.min) {
    problemas.mensaje = `"mensaje" necesita al menos ${LIMITES.mensaje.min} caracteres`;
  } else if (mensaje.length > LIMITES.mensaje.max) {
    problemas.mensaje = `"mensaje" no puede pasar de ${LIMITES.mensaje.max} caracteres`;
  }

  return problemas;
}

export function hayProblemas(problemas: Problemas): boolean {
  return Object.keys(problemas).length > 0;
}
