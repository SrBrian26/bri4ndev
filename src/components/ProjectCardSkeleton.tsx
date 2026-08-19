import TechChipSkeleton from "./TechChipSkeleton";

/**
 * Relleno con la misma estructura y alto aproximado que ProjectCard: ocupa el
 * hueco mientras llega la API para que las cards reales no muevan la página al
 * aparecer. Los altos salen de los del componente real (título `text-base`,
 * botones con `py-2`, etc.), no de un ojímetro.
 */
export default function ProjectCardSkeleton() {
  return (
    <article className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/40 motion-reduce:animate-none">
      <div className="flex flex-col gap-5 p-6">
        {/* Encabezado: número + nombre + colaboradores, y el enlace al sitio */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="mt-1 h-4 w-5 shrink-0 rounded bg-zinc-800" />
            <div className="flex min-w-0 flex-col gap-2">
              <div className="h-5 w-44 rounded bg-zinc-800" />
              <div className="h-3 w-32 rounded bg-zinc-800/60" />
            </div>
          </div>
          <div className="h-8.5 w-28 shrink-0 rounded-lg border border-zinc-800" />
        </div>

        {/* Descripción + tecnologías */}
        <div className="grid gap-6 border-t border-zinc-800/70 pt-5 md:grid-cols-[1.6fr_1fr] md:gap-10">
          <div className="flex flex-col gap-2.5">
            <div className="h-3.5 w-full rounded bg-zinc-800" />
            <div className="h-3.5 w-11/12 rounded bg-zinc-800" />
            <div className="h-3.5 w-4/5 rounded bg-zinc-800" />
          </div>

          <div>
            <div className="mb-2.5 h-2.5 w-20 rounded bg-zinc-800/60" />
            <div className="flex flex-wrap gap-1.5">
              <TechChipSkeleton count={4} />
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap items-center gap-3 border-t border-zinc-800/70 pt-5">
          <div className="h-9.5 w-40 rounded-lg border border-zinc-700 bg-zinc-900" />
          <div className="h-3 w-44 rounded bg-zinc-800/60" />
        </div>
      </div>
    </article>
  );
}
