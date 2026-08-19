import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { getProjects, proyectosEnCache } from "../services/api";
import type { Project } from "../components/ProjectCard";
import ProjectCard from "../components/ProjectCard";
import ProjectCardSkeleton from "../components/ProjectCardSkeleton";
import TitleSection from "../components/TitleSection";

const PAGE_SIZE = 3;

export default function Projects() {
  // Si la petición de main.tsx ya volvió, se parte con los datos puestos y no
  // se ve el esqueleto ni por un frame.
  const cache = proyectosEnCache();
  const [projects, setProjects] = useState<Project[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(projects.length / PAGE_SIZE);
  const visible = projects.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Salida escalonada de las cards; la entrada la anima cada ProjectCard
  const goTo = (next: number) => {
    if (next === page || !listRef.current) return;

    // Al paginar desde el final de la lista la nueva página entraría fuera de
    // vista: se sube al inicio de la sección en paralelo con la salida de las
    // cards. Sin argumentos hereda el `scroll-behavior: smooth` de index.css.
    sectionRef.current?.scrollIntoView();

    gsap.to(listRef.current.children, {
      opacity: 0,
      y: 10,
      duration: 0.22,
      stagger: 0.06,
      ease: "power2.in",
      onComplete: () => setPage(next),
    });
  };

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="flex min-h-screen items-start"
    >
      <div className="max-w-5xl mx-auto px-6 py-26">
        <TitleSection title="Proyectos" />

        {error && (
          <p className="text-zinc-500 text-sm">
            No se pudieron cargar los proyectos.
          </p>
        )}

        {/* La bajada es texto estático: no tiene por qué esperar a la API */}
        {!error && (
          <p className="text-zinc-400 leading-relaxed pb-0 sm:pb-6">
            Revisa algunos de los proyectos en los que he trabajado.
          </p>
        )}

        {loading && !error && (
          <>
            <div className="flex flex-col gap-4" aria-hidden="true">
              {Array.from({ length: PAGE_SIZE }, (_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
            <span role="status" className="sr-only">
              Cargando proyectos
            </span>
          </>
        )}

        {!loading && !error && (
          <>
            <div ref={listRef} className="flex flex-col gap-4">
              {visible.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={page * PAGE_SIZE + i}
                  order={i}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-6 mt-8">
                <button
                  onClick={() => goTo((page - 1 + totalPages) % totalPages)}
                  className="w-9 h-9 rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors flex items-center justify-center text-lg cursor-pointer"
                  aria-label="Página anterior"
                >
                  <i className="fa-solid fa-chevron-left text-sm"></i>
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors cursor-pointer ${
                        i === page
                          ? "bg-indigo-400"
                          : "bg-zinc-700 hover:bg-zinc-500"
                      }`}
                      aria-label={`Ir a página ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => goTo((page + 1) % totalPages)}
                  className="w-9 h-9 rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors flex items-center justify-center text-lg cursor-pointer"
                  aria-label="Página siguiente"
                >
                  <i className="fa-solid fa-chevron-right text-sm"></i>
                </button>

                <span className="text-xs text-zinc-500 ml-auto">
                  {page * PAGE_SIZE + 1}–
                  {Math.min((page + 1) * PAGE_SIZE, projects.length)} /{" "}
                  {projects.length}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
