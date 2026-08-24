import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import ProjectGallery from "./ProjectGallery";
import TechChip from "./TechChip";
import type { Technology } from "./TechChip";

export interface Collaborator {
  id: number;
  name: string;
  url: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  url: string;
  images: string[];
  collaborators: Collaborator[];
  technologies: Technology[];
}

interface Props {
  project: Project;
  /** Número global del proyecto, se muestra en la card */
  index: number;
  /** Posición dentro de la página visible, ordena la entrada escalonada */
  order?: number;
}

export default function ProjectCard({ project, index, order = 0 }: Props) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const hasImages = project.images.length > 0;
  const [expanded, setExpanded] = useState(false);

  // Entrada escalonada de la card
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          delay: order * 0.09,
        },
      );
    }, cardRef);

    return () => ctx.revert();
  }, [order]);

  return (
    <>
      <article
        ref={cardRef}
        className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 opacity-0 transition-colors duration-300 hover:border-zinc-700 hover:bg-zinc-900/70"
      >
        {/* Halo al pasar el cursor */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-52 w-52 rounded-full bg-secundario/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        />

        <div className="relative flex flex-col gap-5 p-6">
          {/* Encabezado */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3.5">
              <span
                aria-hidden="true"
                className="mt-1 shrink-0 select-none font-mono text-xs tabular-nums text-zinc-600 transition-colors duration-300 group-hover:text-indigo-400/70"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-white">
                  {project.name}
                </h3>
                {project.collaborators.length > 0 && (
                  <p className="mt-1 text-xs text-zinc-500">
                    En colaboración con{" "}
                    {project.collaborators.map((c, i) => (
                      <span key={c.id}>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-400 transition-colors hover:text-zinc-200"
                        >
                          {c.name}
                        </a>
                        {i < project.collaborators.length - 1 && ", "}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </div>

            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex shrink-0 items-center gap-2 rounded-lg border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 no-underline transition-all duration-200 hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Ver sitio
              <i
                className="fa-solid fa-arrow-right text-xs transition-transform duration-200 group-hover/link:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
          </div>

          {/* Descripción + tecnologías */}
          <div className="grid gap-6 border-t border-zinc-800/70 pt-5 md:grid-cols-[1.6fr_1fr] md:gap-10">
            <p className="text-sm leading-relaxed text-zinc-400">
              {expanded
                ? project.description
                : project.description.length > 290
                  ? `${project.description.slice(0, 290)}...`
                  : project.description}

              {project.description.length > 290 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="ml-2 text-titulo hover:underline cursor-pointer"
                >
                  {expanded ? "Ver menos" : "Ver más"}
                </button>
              )}
            </p>

            {project.technologies.length > 0 && (
              <div>
                <p className="mb-2.5 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                  Tecnologías
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map((t) => (
                    <TechChip key={t.id} tech={t} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap items-center gap-3 border-t border-zinc-800/70 pt-5">
            <button
              onClick={() => setGalleryOpen(true)}
              disabled={!hasImages}
              className="group/btn inline-flex items-center gap-2.5 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400/60 hover:bg-indigo-500/15 hover:text-white hover:shadow-lg hover:shadow-indigo-500/10 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
            >
              <i
                className="fa-regular fa-images text-zinc-400 transition-all duration-200 group-hover/btn:scale-110 group-hover/btn:text-indigo-300"
                aria-hidden="true"
              />
              Ver galería
              {hasImages && (
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-zinc-400 transition-colors duration-200 group-hover/btn:bg-indigo-500/25 group-hover/btn:text-indigo-200">
                  {project.images.length}
                </span>
              )}
            </button>

            <span className="text-xs text-zinc-600">
              {hasImages
                ? `${project.images.length} ${
                    project.images.length === 1 ? "captura" : "capturas"
                  } del proyecto`
                : "Sin capturas disponibles"}
            </span>
          </div>
        </div>
      </article>

      {galleryOpen && hasImages && (
        <ProjectGallery
          name={project.name}
          images={project.images}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </>
  );
}
