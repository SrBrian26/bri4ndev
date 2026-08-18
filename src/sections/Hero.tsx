import HeroTerminal from "../components/HeroTerminal";

export default function Hero() {
  return (
    <section
      id="hero"
      className="min-h-screen flex"
    >
      <article className="max-w-5xl mx-auto px-6 py-26 w-full justify-between flex flex-col">
        <div>
          <p className="text-sm font-medium mb-4 tracking-widest uppercase">
            Hola, soy
          </p>
          <h1 className="text-5xl md:text-8xl font-bold mb-5 leading-none tracking-tight">
            Brian <span className="text-titulo">Muñoz</span>
          </h1>
          <p className="text-md sm:text-xl text-zinc-400 max-w-xl mb-10 leading-relaxed">
            Desarrollador web full-stack enfocado en construir productos
            digitales limpios y funcionales.
          </p>
        </div>

        <div className="sm:flex sm:justify-end pb-[30%] sm:pb-0">
          <HeroTerminal className="max-w-xl sm:w-xl" />
        </div>
      </article>
    </section>
  );
}
