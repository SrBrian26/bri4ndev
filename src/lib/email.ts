import type { MouseEvent } from "react";

/**
 * El correo de contacto, fuera del alcance de los extractores.
 *
 * Los rastreadores que recogen direcciones para spam casi siempre hacen lo
 * mismo: descargan el HTML (y a veces el JS), pasan una regex buscando algo con
 * forma de correo y se llevan lo que encuentren. Por eso la dirección no existe
 * como texto en ninguna parte de lo que se descarga: se guarda partida y con
 * los caracteres desplazados, y solo se rearma en memoria cuando el navegador
 * la necesita de verdad.
 *
 * No es infalible —un rastreador que ejecute JavaScript, pinte la página e
 * imite un gesto humano puede llegar a ella— pero deja fuera a la inmensa
 * mayoría, que no pasan de un fetch y una regex.
 */

/** Lo que se le suma a cada carácter al guardarlo. */
const SALTO = 9;

/**
 * Las dos mitades de la dirección, desplazadas.
 *
 * Para cambiar el correo, genera los códigos nuevos con:
 *   [..."usuario"].map((c) => c.charCodeAt(0) + 9)
 */
const USUARIO = [108, 120, 119, 125, 106, 108, 125, 120];
const DOMINIO = [107, 123, 114, 61, 119, 55, 109, 110, 127];

const descifrar = (codigos: readonly number[]) =>
  String.fromCharCode(...codigos.map((codigo) => codigo - SALTO));

/** Las dos mitades por separado, para pintar la dirección troceada. */
export const correoPartes = () => ({
  usuario: descifrar(USUARIO),
  dominio: descifrar(DOMINIO),
});

/**
 * La dirección completa.
 *
 * Es una función y no una constante a propósito: como cadena solo existe
 * mientras alguien la usa. La arroba también va por código, para que ni
 * siquiera el patrón «algo@algo» aparezca escrito en el fuente.
 */
export function correo() {
  const { usuario, dominio } = correoPartes();
  return usuario + String.fromCharCode(64) + dominio;
}

const enlaceCorreo = () => `mailto:${correo()}`;

/** Adónde apunta el enlace. Nunca a un `mailto:`. */
const RESPALDO = "#contact";

/**
 * Props para un `<a>` que se comporta como un mailto sin llegar a serlo.
 *
 * El href se queda siempre en la sección de contacto: la dirección se arma
 * dentro del propio clic y se le entrega al navegador sin pasar por el DOM. Una
 * versión anterior la escribía en el href al primer hover, para que funcionara
 * el «copiar dirección de enlace» del menú contextual; duraba lo que tardaba en
 * pasar el ratón por encima, y a partir de ahí cualquier extractor que recorra
 * los atributos de la página —que es lo que hacen las extensiones— la
 * encontraba. No compensa.
 *
 * Sin JS el enlace sigue llevando a la sección de contacto, con su formulario.
 */
export const propsCorreo = {
  href: RESPALDO,
  onClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    window.location.href = enlaceCorreo();
  },
};
