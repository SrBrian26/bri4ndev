import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { propsCorreo } from "../lib/email";
import CorreoTexto from "./CorreoTexto";

type Enlace = {
  /** El correo no lleva label ni `mailto:`: los pone el navegador. */
  label?: string;
  href: string;
  icon: string;
  correo?: true;
};

const ENLACES: Enlace[] = [
  {
    href: "#contact",
    icon: "fa-solid fa-envelope",
    correo: true,
  },
  {
    label: "GitHub",
    href: "https://github.com/SrBrian26",
    icon: "fa-brands fa-github",
  },
  // {
  //   label: "LinkedIn",
  //   href: "https://linkedin.com/in/",
  //   icon: "fa-brands fa-linkedin-in",
  // },
];

const PASOS = [
  {
    titulo: "Te respondo por correo",
    detalle: "Suelo contestar en 1 o 2 días.",
  },
  {
    titulo: "Aterrizamos la idea",
    detalle: "Una llamada corta para ver alcance, plazos y presupuesto.",
  },
  {
    titulo: "Te paso una propuesta",
    detalle: "Que contendría en cuánto tiempo conlleva y cuál es el valor del proyecto, por escrito.",
  },
];

export default function ContactAside() {
  const [reducido] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const rootRef = useRef<HTMLElement>(null);

  // Entra justo detrás del formulario
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (reducido) {
        gsap.set(rootRef.current, { opacity: 1 });
        return;
      }
      gsap.fromTo(
        rootRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.12 },
      );
    }, rootRef);

    return () => ctx.revert();
  }, [reducido]);

  return (
    <aside ref={rootRef} className="flex flex-col gap-9 opacity-0">
      <div className="flex flex-col gap-3 text-start items-start">
        {/* <p className="text-xs font-medium tracking-widest text-zinc-400 uppercase">
          O directamente
        </p> */}
        {ENLACES.map((enlace) => {
          const externo = enlace.href.startsWith("http");
          return (
            <a
              key={enlace.href}
              href={enlace.href}
              {...(enlace.correo ? propsCorreo : null)}
              target={externo ? "_blank" : undefined}
              rel={externo ? "noopener noreferrer" : undefined}
              className="flex items-start gap-3 text-sm mx-1 text-zinc-400 no-underline transition-colors hover:text-white focus:outline-none"
            >
              <span className="w-5 text-center font-medium text-secundario">
                <i className={`${enlace.icon} text-[15px]`} aria-hidden="true" />
              </span>
              {enlace.correo ? (
                <CorreoTexto className="truncate" />
              ) : (
                <span className="truncate">{enlace.label}</span>
              )}
            </a>
          );
        })}
      </div>

      <div>
        <p className="mb-5 text-xs font-medium tracking-widest text-zinc-400 uppercase">
          Qué pasa después
        </p>

        <ol className="flex flex-col gap-5 border-l border-zinc-800/80 pl-5">
          {PASOS.map((paso, i) => (
            <li key={paso.titulo} className="relative max-w-sm">
              <span
                aria-hidden="true"
                className="absolute top-2 -left-5.75 h-1.5 w-1.5 rounded-full bg-secundario/80"
              />
              <p className="text-sm text-zinc-250">
                <span
                  aria-hidden="true"
                  className="mr-2 font-mono text-[11px] text-titulo/80"
                >
                  0{i + 1}
                </span>
                {paso.titulo}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                {paso.detalle}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
