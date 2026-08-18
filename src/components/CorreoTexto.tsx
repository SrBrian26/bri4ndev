import { correoPartes } from "../lib/email";

/**
 * Un trozo de texto que se cuela entre las partes de la dirección.
 *
 * `display: none` no se pinta, no entra en lo que copia el usuario y los
 * lectores de pantalla lo saltan, pero sí aparece en el `textContent` del DOM:
 * quien raspe la página ya renderizada se lleva la dirección con basura y
 * espacios en medio, que no pasa ninguna regex de correo. Va en `style` y no en
 * una clase para que no dependa de que la hoja de estilos llegue a cargar.
 */
function Cebo() {
  return (
    <span aria-hidden="true" style={{ display: "none" }}>
      {" no-spam "}
    </span>
  );
}

/**
 * La dirección de contacto: legible y copiable para una persona, rota para un
 * extractor. Ver `lib/email.ts` para el resto del planteamiento.
 */
export default function CorreoTexto({ className }: { className?: string }) {
  const { usuario, dominio } = correoPartes();

  return (
    <span className={className}>
      {usuario}
      <Cebo />
      {String.fromCharCode(64)}
      <Cebo />
      {dominio}
    </span>
  );
}
