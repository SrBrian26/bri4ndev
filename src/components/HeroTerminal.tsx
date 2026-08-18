import { useEffect, useState } from "react";
import { scrollToSection } from "../lib/scroll";

type Section = { id: string; dir: string; label: string };

const sections: Section[] = [
  // { id: "about", dir: "about", label: "sobre mí" },
  { id: "projects", dir: "projects", label: "proyectos" },
  { id: "contact", dir: "contact", label: "contacto" },
];

const ROOT = "C:\\bri4n.dev";

type Line = { path: string; cmd: string };
type Phase = "typing" | "hold";

function Prompt({ path, cmd }: Line) {
  return (
    <>
      <span className="text-zinc-500">{path}</span>
      <span className="text-violet-400">&gt;</span>
      <span className="text-zinc-100">{cmd}</span>
    </>
  );
}

export default function HeroTerminal({
  className = "",
}: {
  className?: string;
}) {
  const [reduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const [lines, setLines] = useState<Line[]>([]);
  const [path, setPath] = useState(ROOT);
  const [cmd, setCmd] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("hold");
  const [caretOn, setCaretOn] = useState(true);

  // Parpadeo del cursor
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setCaretOn((c) => !c), 520);
    return () => clearInterval(id);
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;

    let alive = true;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const type = async (str: string) => {
      setPhase("typing");
      for (let i = 1; i <= str.length; i++) {
        if (!alive) return;
        setCmd(str.slice(0, i));
        await wait(95);
      }
      setPhase("hold");
    };

    const commit = (from: string, command: string, to: string) => {
      setLines((prev) => [...prev, { path: from, cmd: command }].slice(-8));
      setCmd("");
      setPath(to);
    };

    const run = async () => {
      await wait(800);
      while (alive) {
        for (const s of sections) {
          await wait(1100); // reposo en la raíz
          if (!alive) return;

          await type(`cd ${s.dir}`);
          await wait(450);
          if (!alive) return;

          commit(ROOT, `cd ${s.dir}`, `${ROOT}\\${s.dir}`);
          setActive(s.id);
          await wait(2600); // dentro de la carpeta se enciende el botón

          if (!alive) return;
          await type("cd..");
          await wait(450);
          if (!alive) return;

          commit(`${ROOT}\\${s.dir}`, "cd..", ROOT);
          setActive(null);
        }
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [reduced]);

  const visible = lines.slice(-4);

  return (
    <div
      className={`overflow-hidden rounded-xl border border-principal/45 bg-[#0F1420]/40 shadow-xl backdrop-blur-md ${className}`}
    >
      {/* Barra superior */}
      <div className="flex items-center justify-between border-b border-zinc-700/50 px-4 py-2">
        <span className="font-mono text-xs text-zinc-500 select-none">
          C:\bri4n.dev — cmd
        </span>
        <span
          aria-hidden="true"
          className="flex items-center gap-3 font-mono text-xs leading-none text-zinc-600 select-none"
        >
          <span>—</span>
          <span>□</span>
          <span>✕</span>
        </span>
      </div>

      {/* Terminal */}
      <div
        aria-hidden="true"
        className="h-34 overflow-hidden p-4 font-mono text-sm select-none"
      >
        {visible.map((line, i) => (
          <div key={i} className="leading-6 whitespace-nowrap">
            <Prompt {...line} />
          </div>
        ))}
        <div className="leading-6 whitespace-nowrap">
          <Prompt path={path} cmd={cmd} />
          <span
            className="ml-px text-violet-400"
            style={{
              opacity: phase === "hold" && !caretOn ? 0 : 1,
              transition: "opacity 0.06s linear",
            }}
          >
            _
          </span>
        </div>
      </div>

      {/* Botones */}
      <nav className="flex border-t border-zinc-700/50">
        {sections.map((s) => {
          const isActive = active === s.id;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={scrollToSection}
              className={`flex flex-1 items-center justify-center gap-2 px-3 py-3 font-mono text-xs no-underline transition-colors duration-200 not-last:border-r not-last:border-zinc-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500 ${
                isActive
                  ? "bg-violet-500/10 text-violet-300"
                  : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
              }`}
            >
              <i
                className={`fa-regular ${isActive ? "fa-folder-open" : "fa-folder"} text-[13px]`}
                aria-hidden="true"
              />
              {s.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
