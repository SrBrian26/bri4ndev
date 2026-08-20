import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import TitleSection from "../components/TitleSection";

const servicios = [
  {
    icon: "fa-solid fa-code",
    label: "Desarrollo de aplicaciones web a medida",
  },
  {
    icon: "fa-solid fa-search",
    label: "Optimización para motores de búsqueda (SEO)",
  },
  { icon: "fa-solid fa-gears", label: "Sistemas de gestión y administración" },
  { icon: "fa-solid fa-cart-shopping", label: "Plataformas e-commerce" },
  {
    icon: "fa-solid fa-mobile-screen-button",
    label: "Diseño responsive y mobile-first",
  },
  {
    icon: "fa-solid fa-shield-halved",
    label: "Seguridad y optimización de rendimiento",
  },
];

export default function TMC() {
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = panelRef.current;
    if (!root) return;

    const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]", root);
    const reducido = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducido || !("IntersectionObserver" in window)) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.09,
          ease: "power2.out",
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="tmc"
      className="flex min-h-screen items-start backdrop:blur-md bg-tmc"
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-26">
        <TitleSection title="Mi emprendimiento" />

        <div
          ref={panelRef}
          className="group relative overflow-hidden"
        >
          {/* Halo al pasar el cursor */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-20 h-52 w-52"
          />

          <div className="relative flex flex-col gap-8 p-4 sm:p-6">
            {/* Encabezado: logo + nombre */}
            <div data-reveal className="flex items-center gap-5 opacity-0">
              <div className="relative shrink-0">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-xl  blur-xl"
                />
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <img
                    src="/img/tmc-mono-sin-fondo.png"
                    alt="Logo TMC"
                    className="h-9 w-9 object-contain brightness-0 invert"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-lg leading-tight font-semibold text-white sm:text-2xl">
                  TMC Soluciones Digitales
                </h2>
                <p className="mt-0.5 text-sm text-zinc-500">Co-fundador</p>
              </div>
            </div>

            {/* Descripción + servicios */}
            <div className="grid gap-6 pt-8 md:grid-cols-[1.1fr_1fr] md:gap-8">
              <div data-reveal className="flex flex-col gap-4 opacity-0">
                <p className="leading-relaxed text-zinc-300">
                  TMC Soluciones Digitales es una emprendimiento de desarrollo
                  de software fundada junto a dos colegas. Nos especializamos en
                  la construcción de aplicaciones web a medida, con foco en
                  calidad, rendimiento y experiencia de usuario.
                </p>
                <p className="leading-relaxed text-zinc-400">
                  Trabajamos con empresas y emprendedores que necesitan
                  soluciones digitales sólidas: desde plataformas e-commerce
                  hasta sistemas de gestión internos.
                </p>
                <a
                  href="https://tmcsolucionesdigitales.cl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link mt-2 inline-flex w-fit items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400/60 hover:bg-indigo-500/15 hover:text-white hover:shadow-lg hover:shadow-indigo-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:translate-y-0"
                >
                  Visitar sitio
                  <i
                    className="fa-solid fa-arrow-up-right-from-square text-xs transition-transform duration-200 group-hover/link:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
              </div>

              <div data-reveal className="opacity-0">
                <p className="mb-3 text-[10px] font-medium tracking-widest text-zinc-400 uppercase">
                  Qué hacemos
                </p>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                  {servicios.map((servicio) => (
                    <li
                      key={servicio.label}
                      className="group/svc flex items-start gap-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 transition-colors duration-200 hover:border-zinc-700 hover:bg-zinc-900/70"
                    >
                      <i
                        className={`${servicio.icon} mt-0.5 w-4 shrink-0 text-center text-[13px] text-zinc-500 transition-colors duration-200 group-hover/svc:text-indigo-300`}
                        aria-hidden="true"
                      />
                      <span className="text-sm leading-snug text-zinc-400 transition-colors duration-200 group-hover/svc:text-zinc-200">
                        {servicio.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
