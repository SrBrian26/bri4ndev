import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { LimiteError, postContact, ValidacionError } from "../services/api";
import { CAMPOS, FORM_VACIO, LIMITES, hayProblemas, validar } from "../lib/contact";
import type { Campo, ContactForm as Form, Motivo, Problemas } from "../lib/contact";
import MotivoSelect from "./MotivoSelect";
import CorreoTexto from "./CorreoTexto";
import { propsCorreo } from "../lib/email";

type Estado = "idle" | "enviando" | "ok" | "error" | "limite";

/** Dónde vive cada campo dentro del "archivo", para el panel de problemas. */
const LINEAS: Record<Campo, number> = { nombre: 2, correo: 3, motivo: 4, mensaje: 6 };
const COLUMNAS: Record<Campo, number> = { nombre: 14, correo: 14, motivo: 14, mensaje: 5 };

/** La línea donde arranca el textarea y cuántas ocupa. */
const MENSAJE_LINEA = 6;
const MENSAJE_FILAS = 4;

/** Icono del botón de enviar según en qué anda el formulario. */
const ICONO_BOTON: Record<Estado, string> = {
  idle: "fa-paper-plane",
  enviando: "fa-spinner fa-spin",
  ok: "fa-paper-plane",
  error: "fa-paper-plane",
  limite: "fa-hourglass-half",
};

/* Una fila del editor: número de línea en el gutter + contenido. */
function Linea({ n, children }: { n: number; children?: React.ReactNode }) {
  return (
    <div className="flex">
      <span
        aria-hidden="true"
        className="w-9 shrink-0 border-r border-zinc-800/80 pr-3 text-right leading-7 text-zinc-600 select-none sm:w-11"
      >
        {n}
      </span>
      <div className="min-w-0 flex-1 px-3 leading-7 sm:px-4">{children}</div>
    </div>
  );
}

/** Puntuación JSON: llaves, comillas, dos puntos, comas. */
function P({ children }: { children: React.ReactNode }) {
  return <span className="text-zinc-600">{children}</span>;
}

export default function ContactForm() {
  const [reducido] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const [form, setForm] = useState<Form>(FORM_VACIO);
  const [tocados, setTocados] = useState<Partial<Record<Campo, boolean>>>({});
  const [intentado, setIntentado] = useState(false);
  const [servidor, setServidor] = useState<Problemas>({});
  const [estado, setEstado] = useState<Estado>("idle");
  const [pos, setPos] = useState({ ln: 1, col: 1 });
  const [trampa, setTrampa] = useState("");

  // Del límite de envíos se guarda el instante en que se puede reintentar, no
  // los segundos que quedan: si la pestaña pasa a segundo plano el navegador
  // ralentiza los temporizadores y una cuenta atrás propia se desfasaría.
  const [reintentoEn, setReintentoEn] = useState(0);
  const [espera, setEspera] = useState(0);

  const rootRef = useRef<HTMLFormElement>(null);
  const campoRefs = useRef<Partial<Record<Campo, HTMLElement | null>>>({});

  // Entrada del panel, igual que las cards de proyectos
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (reducido) {
        gsap.set(rootRef.current, { opacity: 1 });
        return;
      }
      gsap.fromTo(
        rootRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      );
    }, rootRef);

    return () => ctx.revert();
  }, [reducido]);

  // Cuenta atrás del límite: refresca los segundos que faltan y devuelve el
  // formulario a "idle" cuando se cumple el plazo.
  useEffect(() => {
    if (estado !== "limite") return;

    const tic = () => {
      const faltan = Math.ceil((reintentoEn - Date.now()) / 1000);
      if (faltan > 0) return setEspera(faltan);
      setEspera(0);
      setEstado("idle");
    };

    tic();
    const id = setInterval(tic, 500);
    return () => clearInterval(id);
  }, [estado, reintentoEn]);

  const problemas = useMemo<Problemas>(
    () => ({ ...validar(form), ...servidor }),
    [form, servidor],
  );

  // Un campo solo se queja después de haberlo tocado o de intentar enviar
  const visibles = useMemo<Problemas>(() => {
    const out: Problemas = {};
    for (const campo of CAMPOS) {
      const problema = problemas[campo];
      if (problema && (intentado || tocados[campo])) out[campo] = problema;
    }
    return out;
  }, [problemas, tocados, intentado]);

  const listaProblemas = CAMPOS.filter((campo) => visibles[campo]);
  const sucio = CAMPOS.some((campo) => form[campo] !== "");

  const idProblema = (campo: Campo) => `contacto-problema-${campo}`;

  function escribir<K extends Campo>(campo: K, valor: Form[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    // Lo que diga el servidor deja de valer en cuanto se edita el campo
    if (servidor[campo]) setServidor(({ [campo]: _, ...resto }) => resto);
    if (estado === "ok" || estado === "error") setEstado("idle");
  }

  const marcarTocado = (campo: Campo) =>
    setTocados((prev) => ({ ...prev, [campo]: true }));

  /** Ln/Col de la barra de estado, siguiendo al cursor. */
  function seguirCursor(
    campo: Campo,
    el: HTMLInputElement | HTMLTextAreaElement | null,
  ) {
    if (!el) return setPos({ ln: LINEAS[campo], col: COLUMNAS[campo] });

    const hasta = el.value.slice(0, el.selectionStart ?? 0);
    if (campo === "mensaje") {
      const filas = hasta.split("\n");
      setPos({
        ln: MENSAJE_LINEA + filas.length - 1,
        col: COLUMNAS.mensaje + filas[filas.length - 1].length,
      });
    } else {
      setPos({ ln: LINEAS[campo], col: COLUMNAS[campo] + hasta.length });
    }
  }

  function enfocar(campo: Campo) {
    campoRefs.current[campo]?.focus();
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (estado === "enviando" || estado === "limite") return;
    setIntentado(true);

    // Honeypot: los bots rellenan el campo oculto. Se finge éxito y no se envía.
    if (trampa) {
      setEstado("ok");
      return;
    }

    const encontrados = validar(form);
    if (hayProblemas(encontrados)) {
      const primero = CAMPOS.find((campo) => encontrados[campo]);
      if (primero) enfocar(primero);
      return;
    }

    setEstado("enviando");
    try {
      await postContact({
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        motivo: form.motivo as Motivo,
        mensaje: form.mensaje.trim(),
      });
      setForm(FORM_VACIO);
      setTocados({});
      setIntentado(false);
      setServidor({});
      setEstado("ok");
    } catch (err) {
      if (err instanceof ValidacionError) {
        setServidor(err.problemas);
        setEstado("idle");
        const primero = CAMPOS.find((campo) => err.problemas[campo]);
        if (primero) enfocar(primero);
      } else if (err instanceof LimiteError) {
        setReintentoEn(Date.now() + err.segundos * 1000);
        setEstado("limite");
      } else {
        setEstado("error");
      }
    }
  }

  /* Estilos compartidos por los valores editables */
  const valorBase =
    "min-w-0 flex-1 rounded-sm bg-transparent px-1 text-emerald-300 caret-violet-400 outline-none transition-colors placeholder:text-zinc-600 placeholder:italic hover:bg-white/3 focus:bg-violet-500/10 focus:ring-1 focus:ring-inset focus:ring-violet-500/40";

  const conError = (campo: Campo) =>
    visibles[campo]
      ? " underline decoration-rose-400 decoration-wavy underline-offset-4"
      : "";

  const aria = (campo: Campo) => ({
    "aria-invalid": visibles[campo] ? (true as const) : undefined,
    "aria-describedby": visibles[campo] ? idProblema(campo) : undefined,
  });

  return (
    <form
      onSubmit={enviar}
      noValidate
      ref={rootRef}
      className="overflow-hidden rounded-xl border border-principal/45 bg-[#0F1420]/40 opacity-0 shadow-xl backdrop-blur-md"
    >
      {/* Pestaña del archivo */}
      <div className="flex items-center justify-between border-b border-zinc-700/50 px-4 py-2">
        <span className="flex items-center gap-2 font-mono text-xs text-zinc-500 select-none">
          <i className="fa-solid fa-code text-[11px] text-violet-400" aria-hidden="true" />
          contacto.json
          {sucio && (
            <span
              className="text-[8px] text-zinc-400"
              title="Sin guardar"
              aria-hidden="true"
            >
              ●
            </span>
          )}
        </span>
        <span
          aria-hidden="true"
          className="font-mono text-xs leading-none text-zinc-600 select-none"
        >
          ✕
        </span>
      </div>

      {/* Cuerpo del editor */}
      <div className="py-3 font-mono text-[13px] sm:text-sm">
        <Linea n={1}>
          <P>{"{"}</P>
        </Linea>

        <Linea n={2}>
          <div className="flex items-center pl-4">
            <P>"</P>
            <label htmlFor="contacto-nombre" className="cursor-pointer text-violet-300">
              nombre
            </label>
            <P>":&nbsp;</P>
            <P>"</P>
            <input
              id="contacto-nombre"
              ref={(el) => {
                campoRefs.current.nombre = el;
              }}
              type="text"
              value={form.nombre}
              maxLength={LIMITES.nombre.max}
              autoComplete="name"
              placeholder="tu nombre"
              className={valorBase + conError("nombre")}
              onChange={(e) => escribir("nombre", e.target.value)}
              onBlur={() => marcarTocado("nombre")}
              onFocus={(e) => seguirCursor("nombre", e.target)}
              onKeyUp={(e) => seguirCursor("nombre", e.currentTarget)}
              onClick={(e) => seguirCursor("nombre", e.currentTarget)}
              {...aria("nombre")}
            />
            <P>",</P>
          </div>
        </Linea>

        <Linea n={3}>
          <div className="flex items-center pl-4">
            <P>"</P>
            <label htmlFor="contacto-correo" className="cursor-pointer text-violet-300">
              correo
            </label>
            <P>":&nbsp;</P>
            <P>"</P>
            <input
              id="contacto-correo"
              ref={(el) => {
                campoRefs.current.correo = el;
              }}
              type="email"
              value={form.correo}
              maxLength={LIMITES.correo.max}
              autoComplete="email"
              placeholder="tu@correo.com"
              className={valorBase + conError("correo")}
              onChange={(e) => escribir("correo", e.target.value)}
              onBlur={() => marcarTocado("correo")}
              onFocus={(e) => seguirCursor("correo", e.target)}
              onKeyUp={(e) => seguirCursor("correo", e.currentTarget)}
              onClick={(e) => seguirCursor("correo", e.currentTarget)}
              {...aria("correo")}
            />
            <P>",</P>
          </div>
        </Linea>

        <Linea n={4}>
          <div className="flex items-center pl-4">
            <P>"</P>
            <span id="contacto-motivo-label" className="text-violet-300">
              motivo
            </span>
            <P>":&nbsp;</P>
            <MotivoSelect
              value={form.motivo}
              labelId="contacto-motivo-label"
              invalido={Boolean(visibles.motivo)}
              describedBy={visibles.motivo ? idProblema("motivo") : undefined}
              botonRef={(el) => {
                campoRefs.current.motivo = el;
              }}
              onChange={(motivo) => {
                escribir("motivo", motivo);
                marcarTocado("motivo");
                setPos({ ln: LINEAS.motivo, col: COLUMNAS.motivo });
              }}
              onBlur={() => marcarTocado("motivo")}
            />
            <P>,</P>
          </div>
        </Linea>

        <Linea n={5}>
          <div className="flex items-center pl-4">
            <P>"</P>
            <label htmlFor="contacto-mensaje" className="cursor-pointer text-violet-300">
              mensaje
            </label>
            <P>":&nbsp;`</P>
          </div>
        </Linea>

        {/* El textarea ocupa varias líneas: su gutter va aparte */}
        <div className="flex">
          <span
            aria-hidden="true"
            className="flex w-9 shrink-0 flex-col border-r border-zinc-800/80 pr-3 text-right text-zinc-600 select-none sm:w-11"
          >
            {Array.from({ length: MENSAJE_FILAS }, (_, i) => (
              <span key={i} className="leading-7">
                {MENSAJE_LINEA + i}
              </span>
            ))}
          </span>
          {/* pl-4 extra: alinea el texto con los valores de las líneas de arriba */}
          <div className="min-w-0 flex-1 px-3 pl-7 sm:px-4 sm:pl-8">
            <textarea
              id="contacto-mensaje"
              ref={(el) => {
                campoRefs.current.mensaje = el;
              }}
              rows={MENSAJE_FILAS}
              value={form.mensaje}
              maxLength={LIMITES.mensaje.max}
              placeholder="cuéntame en qué puedo ayudarte…"
              className={`${valorBase} block w-full resize-none py-0 leading-7${conError("mensaje")}`}
              onChange={(e) => escribir("mensaje", e.target.value)}
              onBlur={() => marcarTocado("mensaje")}
              onFocus={(e) => seguirCursor("mensaje", e.target)}
              onKeyUp={(e) => seguirCursor("mensaje", e.currentTarget)}
              onClick={(e) => seguirCursor("mensaje", e.currentTarget)}
              {...aria("mensaje")}
            />
          </div>
        </div>

        <Linea n={MENSAJE_LINEA + MENSAJE_FILAS}>
          <div className="pl-4">
            <P>`</P>
          </div>
        </Linea>

        <Linea n={MENSAJE_LINEA + MENSAJE_FILAS + 1}>
          <P>{"}"}</P>
        </Linea>
      </div>

      {/* Honeypot: fuera de pantalla, sin foco y oculto a los lectores */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={trampa}
        onChange={(e) => setTrampa(e.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {/* Panel inferior: problemas del linter o resultado del envío */}
      <div aria-live="polite">
        {listaProblemas.length > 0 && (
          <div className="border-t border-zinc-700/50 bg-rose-950/10">
            <p className="flex items-center gap-2 px-4 pt-2 pb-1 font-mono text-[11px] tracking-wide text-zinc-500 uppercase select-none">
              Problemas
              <span className="rounded bg-rose-500/15 px-1.5 text-rose-300">
                {listaProblemas.length}
              </span>
            </p>
            <ul className="pb-2">
              {listaProblemas.map((campo) => (
                <li key={campo}>
                  <button
                    type="button"
                    id={idProblema(campo)}
                    onClick={() => enfocar(campo)}
                    className="flex w-full cursor-pointer items-baseline gap-2 px-4 py-1 text-left font-mono text-xs text-zinc-400 transition-colors hover:bg-white/3 hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500"
                  >
                    <i
                      className="fa-solid fa-circle-xmark mt-0.5 shrink-0 text-[11px] text-rose-400"
                      aria-hidden="true"
                    />
                    <span className="shrink-0 text-zinc-600">
                      contacto.json:{LINEAS[campo]}:{COLUMNAS[campo]}
                    </span>
                    <span>{visibles[campo]}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {estado === "ok" && listaProblemas.length === 0 && (
          <p className="flex items-center gap-2 border-t border-zinc-700/50 bg-emerald-950/15 px-4 py-2.5 font-mono text-xs text-emerald-300">
            <i className="fa-solid fa-check" aria-hidden="true" />
            Guardado · gracias, te responderé pronto
          </p>
        )}

        {/* 429: no es un fallo del formulario, solo hay que esperar. Los
            segundos van ocultos al lector de pantalla para no repetir el
            aviso en cada tic. */}
        {estado === "limite" && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-zinc-700/50 bg-amber-950/15 px-4 py-2.5 font-mono text-xs text-amber-300">
            <i className="fa-solid fa-hourglass-half" aria-hidden="true" />
            <span>
              Demasiados envíos seguidos · espera{" "}
              <span aria-hidden="true">{espera} s</span>
              <span className="sr-only">un momento</span> y vuelve a intentarlo
            </span>
          </p>
        )}

        {estado === "error" && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-zinc-700/50 bg-rose-950/15 px-4 py-2.5 font-mono text-xs text-rose-300">
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
            No se pudo enviar. Escríbeme a
            <a
              {...propsCorreo}
              className="text-rose-200 underline underline-offset-2 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <CorreoTexto />
            </a>
          </p>
        )}
      </div>

      {/* Barra de estado */}
      <div className="flex items-center justify-between gap-3 border-t border-zinc-700/50 px-3 py-2">
        <button
          type="submit"
          disabled={estado === "enviando" || estado === "limite"}
          className="group/btn inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-1.5 font-mono text-xs font-medium text-zinc-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400/60 hover:bg-indigo-500/15 hover:text-white hover:shadow-lg hover:shadow-indigo-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:translate-y-0 disabled:pointer-events-none disabled:opacity-40"
        >
          <i className={`fa-solid ${ICONO_BOTON[estado]} text-[11px]`} aria-hidden="true" />
          {estado === "enviando"
            ? "Guardando…"
            : estado === "limite"
              ? `Espera ${espera} s`
              : "Enviar"}
        </button>

        <span
          aria-hidden="true"
          className="truncate font-mono text-[11px] text-zinc-600 select-none"
        >
          UTF-8 · JSON · Ln {pos.ln}, Col {pos.col}
        </span>
      </div>
    </form>
  );
}
