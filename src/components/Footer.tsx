import { scrollToSection } from "../lib/scroll";

function Wordmark() {
  return (
    <span className="font-serif text-lg leading-none font-bold tracking-[-0.01em] text-zinc-50 italic">
      Bri4n<span className="text-violet-500">.</span>
      <span className="text-zinc-400">dev</span>
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="mt-auto py-5">
      <div className="mx-auto grid max-w-5xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 px-6 sm:grid-cols-3 sm:gap-4">
        <div className="col-start-1 row-start-1 flex flex-col gap-1">
          <Wordmark />
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Brian Muñoz.
          </p>
        </div>

        <p className="col-start-1 row-start-2 text-xs leading-relaxed text-zinc-600 sm:col-start-2 sm:row-start-1 sm:text-center">
          <span className="hidden sm:block">
            Hecho con React, Tailwind y GSAP.
            <br />
          </span>
          <a
            href="https://tmcsolucionesdigitales.cl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 no-underline hidden sm:block transition-colors duration-200 hover:text-zinc-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            TMC Soluciones Digitales
          </a>
        </p>

        <a
          href="#hero"
          onClick={scrollToSection}
          aria-label="Volver arriba"
          className="group relative col-start-2 row-span-2 row-start-1 flex h-10 w-10 items-center justify-center justify-self-end rounded-xl text-zinc-500 no-underline transition-colors duration-200 hover:bg-zinc-800/60 hover:text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 sm:col-start-3 sm:row-span-1"
        >
          <i
            className="fa-solid fa-arrow-up text-[15px] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:text-secundario"
            aria-hidden="true"
          />

          {/* Tooltip arriba: el footer no tiene sitio por debajo. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-full left-[40%] mb-2 -translate-x-1/2 translate-y-1 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-zinc-100 opacity-0 shadow-lg shadow-black/40 transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
          >
            <span
              aria-hidden="true"
              className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-zinc-800 bg-zinc-900"
            />
            Volver arriba
          </span>
        </a>
      </div>
    </footer>
  );
}
