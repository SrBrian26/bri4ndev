import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { scrollToSection } from "../lib/scroll";
import { pickActiveSection } from "../lib/sections";
import LogoBadge from "./LogoBadge";

type NavItem = {
  id: string;
  label: string;
  icon?: string;
  img?: string;
};

const items: NavItem[] = [
  { id: "hero", label: "Inicio", icon: "fa-solid fa-house" },
  { id: "about", label: "Sobre mí", icon: "fa-solid fa-address-card" },
  { id: "projects", label: "Proyectos", icon: "fa-solid fa-code-merge" },
  { id: "tmc", label: "TMC", img: "/img/tmc-mono-sin-fondo.png" },
{ id: "contact", label: "Contacto", icon: "fa-solid fa-phone" },
];

function NavIcon({ item, isActive }: { item: NavItem; isActive: boolean }) {
  if (item.img) {
    return (
      <img
        src={item.img}
        alt="Isotipo TMC"
        aria-hidden="true"
        className={`text-xl w-5 h-5 sm:h-4.5 sm:w-4.5 object-contain brightness-0 invert transition-opacity duration-200 ${
          isActive ? "opacity-100" : "opacity-45 group-hover:opacity-100"
        }`}
      />
    );
  }

  return <i className={`${item.icon} text-[17px]`} aria-hidden="true" />;
}

export default function Navbar() {
  const progressRef = useRef<HTMLDivElement>(null);
  const mobileProgressRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("hero");

  // Progreso de scroll y sección activa.
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;

      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? window.scrollY / docHeight : 0;

      if (progressRef.current) {
        gsap.set(progressRef.current, {
          scaleY: progress,
          transformOrigin: "top",
        });
      }

      if (mobileProgressRef.current) {
        gsap.set(mobileProgressRef.current, {
          scaleX: progress,
          transformOrigin: "left",
        });
      }

      const boxes = items
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => el !== null)
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return { id: el.id, top: rect.top, bottom: rect.bottom };
        });

      const next = pickActiveSection(boxes, window.innerHeight, {
        atBottom: docHeight > 0 && window.scrollY >= docHeight - 2,
      });
      if (next) setActive(next);
    };

    // El scroll dispara muchos más eventos que frames pinta el navegador
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    // El contenido puede crecer sin que haya scroll (los proyectos llegan por
    // fetch, las imágenes al cargar), y eso mueve las secciones de sitio.
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.body);

    update();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resizeObserver.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      {/* ---------------- Rail lateral (≥sm) ---------------- */}
      <div className="fixed left-0 top-0 z-50 hidden h-full w-16 items-center justify-center lg:flex sm:w-18">
        <aside className="fixed left-2 place-items-center z-50 flex h-[65vh] w-auto flex-col items-center border border-principal/45 rounded-l-2xl bg-[#0F1420]/40 p-4 backdrop-blur-md sm:w-18 gap-6 shadow-xl">
          <a
            href="#hero"
            onClick={scrollToSection}
            aria-label="bri4n.dev — inicio"
            className="flex items-center no-underline"
          >
            <LogoBadge />
          </a>
  
          <nav className="flex flex-1 items-center">
            <ul className="m-0 flex w-full list-none flex-col gap-2 p-0">
              {items.map((item) => {
                const isActive = active === item.id;
  
                return (
                  <li
                    key={item.id}
                    className="relative flex w-full justify-center"
                  >
                    {/* Indicador de sección activa */}
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 top-1/2 h-6 w-0.75 -translate-y-1/2 rounded-r-full bg-violet-500 transition-opacity duration-200 ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    />
  
                    <a
                      href={`#${item.id}`}
                      onClick={scrollToSection}
                      aria-label={item.label}
                      aria-current={isActive ? "true" : undefined}
                      className={`group relative flex h-11 w-11 items-center justify-center rounded-xl no-underline transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                        isActive
                          ? "bg-violet-500/10 text-violet-300"
                          : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-100"
                      }`}
                    >
                      <NavIcon item={item} isActive={isActive} />
  
                      {/* Tooltip */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-x-1 -translate-y-1/2 whitespace-nowrap rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-100 opacity-0 shadow-lg shadow-black/40 transition duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                      >
                        <span
                          className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-zinc-800 bg-zinc-900"
                          aria-hidden="true"
                        />
                        {item.label}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
  
          {/* Progreso de scroll */}
          <div
            ref={progressRef}
            className="absolute right-0 top-0 h-full w-px origin-top bg-violet-500"
            style={{ transform: "scaleY(0)" }}
          />
        </aside>
      </div>

      {/* ---------------- Barra inferior (mobile) ---------------- */}
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-principal/30 bg-[#0F1420]/30 shadow-xl backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Progreso de scroll */}
        <div
          ref={mobileProgressRef}
          className="absolute inset-x-0 top-0 h-[1.5px] origin-left bg-violet-500"
          style={{ transform: "scaleX(0)" }}
        />

        <ul className="m-0 flex list-none items-stretch justify-around gap-1 px-2 py-1.5">
          {items.map((item) => {
            const isActive = active === item.id;

            return (
              <li key={item.id} className="flex flex-1 justify-center">
                <a
                  href={`#${item.id}`}
                  onClick={scrollToSection}
                  aria-current={isActive ? "true" : undefined}
                  className={`group relative flex w-full flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 no-underline transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    isActive
                      ? "bg-violet-500/10 text-violet-300"
                      : "text-zinc-500 active:bg-zinc-800/60"
                  }`}
                >

                  <NavIcon item={item} isActive={isActive} />

                  <span className="text-[11px] leading-none font-medium">
                    {item.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
