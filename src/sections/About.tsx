import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { scrollToSection } from "../lib/scroll";
import { getTechnologies } from "../services/api";
import TechChip from "../components/TechChip";
import type { Technology } from "../components/TechChip";
import TitleSection from "../components/TitleSection";

const CV_URL = "/cv/CV-Brian-Muñoz.pdf";

const EXPERIENCIA = [
  {
    rol: "Cofundador y Desarrollador de Software",
    empresa: "TMC Soluciones Digitales",
    actual: true,
    descripcion:
      "Desarrollo sistemas y sitios web a medida, nos hacemos cargo de además de programar, gestionar el despliegue, el hosting y los dominios donde los proyectos corren hoy en producción.",
  },
  {
    rol: "Desarrollador Full-Stack",
    empresa: "Codari",
    actual: false,
    descripcion:
      "Mi primera experiencia profesional en desarrollo. Trabajé con Laravel/PHP, principalmente sobre el stack TALL con Filament, sacando adelante alrededor de una docena de proyectos entre sistemas de gestión, sitios web y una aplicación móvil, tanto en equipo como de forma individual.",
  },
];

export default function About() {
  const [skills, setSkills] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const experienciaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getTechnologies()
      .then(setSkills)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Entrada escalonada de la experiencia, igual que en la sección de TMC
  useLayoutEffect(() => {
    const root = experienciaRef.current;
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
      { threshold: 0.15 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="flex min-h-screen items-start">
      <div className="max-w-5xl mx-auto px-6 py-26">
        <TitleSection title="Sobre mí" />
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <p className="text-zinc-300 leading-relaxed mb-4">
              Soy desarrollador web full-stack, titulado como Analista
              Programador en el Instituto Profesional Virginio Gómez
              (Concepción, Chile), con experiencia en la construcción de páginas
              y sistemas web escalables. Me gusta crear experiencias digitales
              que sean tanto funcionales como estéticamente agradables.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              Trabajo principalmente con el ecosistema Laravel/PHP en backend y
              React con Tailwind en el frontend. Siempre buscando aprender
              nuevas tecnologías y mejorar mis habilidades.
            </p>
            <p className="text-zinc-400 leading-relaxed mt-4">
              Soy co-fundador de{" "}
              <a
                href="#tmc"
                onClick={scrollToSection}
                className="text-zinc-300 hover:text-white underline underline-offset-2 decoration-zinc-600 hover:decoration-zinc-400 transition-colors"
              >
                TMC Soluciones Digitales
              </a>
              , un emprendimiento de desarrollo de software que fundé junto a
              dos colegas.
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-4 uppercase tracking-widest font-medium">
              Tecnologías Principales
            </p>
            {loading && (
              <p className="text-zinc-500 text-sm">Cargando tecnologías...</p>
            )}

            {error && (
              <p className="text-zinc-500 text-sm">
                No se pudieron cargar las tecnologías.
              </p>
            )}

            {!loading && !error && (
              <div className="flex flex-wrap gap-2">
                {skills.map((t) => (
                  <TechChip key={t.id} tech={t} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Experiencia concreta + acceso al CV */}
        <div
          ref={experienciaRef}
          className="mt-6 border-t border-zinc-800/70 pt-10"
        >
          <div
            data-reveal
            className="flex flex-wrap items-center justify-between gap-4 opacity-0"
          >
            <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase">
              Experiencia
            </p>

            <a
              href={CV_URL}
              download="CV-Brian-Muñoz.pdf"
              className="group/cv inline-flex items-center gap-2.5 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-400/60 hover:bg-violet-500/15 hover:text-white hover:shadow-lg hover:shadow-violet-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 active:translate-y-0"
            >
              <i
                className="fa-solid fa-file-arrow-down text-zinc-400 transition-all duration-200 group-hover/cv:scale-110 group-hover/cv:text-violet-300"
                aria-hidden="true"
              />
              Descargar CV
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 transition-colors duration-200 group-hover/cv:bg-violet-500/25 group-hover/cv:text-violet-200">
                PDF
              </span>
            </a>
          </div>

          <ol className="mt-8 flex flex-col gap-8 border-l border-zinc-800/80 pl-6">
            {EXPERIENCIA.map((puesto) => (
              <li
                key={puesto.empresa}
                data-reveal
                className="relative opacity-0"
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-2 -left-6.75 h-1.5 w-1.5 rounded-full ${
                    puesto.actual ? "bg-violet-400" : "bg-violet-500/50"
                  }`}
                />

                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-base font-semibold text-white">
                    {puesto.rol}
                  </h3>
                  {puesto.actual && (
                    <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-violet-300 uppercase">
                      Actualmente
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-sm text-zinc-500">{puesto.empresa}</p>

                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {puesto.descripcion}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
