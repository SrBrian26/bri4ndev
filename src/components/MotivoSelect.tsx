import { useEffect, useId, useRef, useState } from "react";
import { MOTIVOS } from "../lib/contact";
import type { Motivo } from "../lib/contact";

type Props = {
  value: Motivo | "";
  /** Id del `<span>` que hace de etiqueta ("motivo" en el JSON). */
  labelId: string;
  invalido: boolean;
  describedBy?: string;
  onChange: (motivo: Motivo) => void;
  onBlur: () => void;
  botonRef?: (el: HTMLButtonElement | null) => void;
};

/**
 * Desplegable con forma de autocompletado de editor.
 *
 * Un `<select>` nativo rompe la ilusión al abrirse porque lo pinta el sistema
 * operativo, así que se replica el patrón combobox de la APG: el foco no sale
 * nunca del botón y la opción activa se anuncia con `aria-activedescendant`.
 */
export default function MotivoSelect({
  value,
  labelId,
  invalido,
  describedBy,
  onChange,
  onBlur,
  botonRef,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);

  const rootRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const listId = useId();
  const btnId = useId();

  const seleccionado = MOTIVOS.findIndex((m) => m.value === value);
  const etiqueta = seleccionado >= 0 ? MOTIVOS[seleccionado].label : null;

  // Clic fuera: cierra sin devolver el foco, que ya se lo lleva el clic
  useEffect(() => {
    if (!abierto) return;

    const fuera = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
  }, [abierto]);

  function abrir() {
    setActivo(seleccionado >= 0 ? seleccionado : 0);
    setAbierto(true);
  }

  function cerrar({ devolverFoco = true } = {}) {
    setAbierto(false);
    if (devolverFoco) btnRef.current?.focus();
  }

  function elegir(indice: number) {
    onChange(MOTIVOS[indice].value);
    cerrar();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (!abierto) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        abrir();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActivo((i) => (i + 1) % MOTIVOS.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActivo((i) => (i - 1 + MOTIVOS.length) % MOTIVOS.length);
        break;
      case "Home":
        e.preventDefault();
        setActivo(0);
        break;
      case "End":
        e.preventDefault();
        setActivo(MOTIVOS.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        elegir(activo);
        break;
      case "Escape":
        e.preventDefault();
        cerrar();
        break;
      case "Tab":
        // Tab sigue su curso: solo se cierra el popup
        cerrar({ devolverFoco: false });
        break;
    }
  }

  return (
    <span ref={rootRef} className="relative inline-flex min-w-0 flex-1 items-center">
      <button
        type="button"
        id={btnId}
        ref={(el) => {
          btnRef.current = el;
          botonRef?.(el);
        }}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={abierto ? listId : undefined}
        // El nombre accesible se compone de la clave JSON + el valor actual
        aria-labelledby={`${labelId} ${btnId}`}
        aria-activedescendant={abierto ? `${listId}-${activo}` : undefined}
        aria-invalid={invalido || undefined}
        aria-describedby={describedBy}
        onClick={() => (abierto ? cerrar() : abrir())}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        className={`flex min-w-0 flex-1 cursor-pointer items-center gap-1 rounded-sm bg-transparent px-1 text-left outline-none transition-colors hover:bg-white/3 focus:bg-violet-500/10 focus:ring-1 focus:ring-inset focus:ring-violet-500/40 ${
          invalido ? "underline decoration-rose-400 decoration-wavy underline-offset-4" : ""
        }`}
      >
        <span aria-hidden="true" className="text-zinc-600">
          "
        </span>
        {etiqueta ? (
          <span className="truncate text-emerald-300">{etiqueta}</span>
        ) : (
          <span className="truncate text-zinc-600 italic">elige un motivo</span>
        )}
        <span aria-hidden="true" className="text-zinc-600">
          "
        </span>
        <i
          className={`fa-solid fa-chevron-down ml-auto shrink-0 text-[9px] text-zinc-500 transition-transform duration-200 ${
            abierto ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {abierto && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          // Evita que el clic saque el foco del botón antes de elegir
          onMouseDown={(e) => e.preventDefault()}
          className="absolute top-full left-0 z-20 mt-1 w-max overflow-hidden rounded-lg border border-principal/45 bg-[#0F1420]/95 py-1 shadow-xl shadow-black/40 backdrop-blur-md"
        >
          {MOTIVOS.map((motivo, i) => {
            const esActivo = i === activo;
            const esElegido = motivo.value === value;
            return (
              <li
                key={motivo.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={esElegido}
                onClick={() => elegir(i)}
                onMouseEnter={() => setActivo(i)}
                className={`flex cursor-pointer items-center gap-2 px-3 py-1.5 font-mono text-xs whitespace-nowrap transition-colors ${
                  esActivo ? "bg-violet-500/10 text-violet-300" : "text-zinc-400"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={esActivo ? "text-violet-400" : "text-zinc-600"}
                >
                  {"{}"}
                </span>
                {motivo.label}
                <i
                  className={`fa-solid fa-check ml-auto pl-3 text-[10px] text-emerald-400 ${
                    esElegido ? "" : "invisible"
                  }`}
                  aria-hidden="true"
                />
              </li>
            );
          })}
        </ul>
      )}
    </span>
  );
}
