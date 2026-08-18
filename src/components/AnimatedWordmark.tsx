import { useEffect, useState } from "react";

type Phase = "typing" | "erasing" | "hold";

export default function AnimatedWordmark({
  className = "",
}: {
  className?: string;
}) {
  const [reduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const [text, setText] = useState(reduced ? "Bri4n.dev" : "");
  const [variant, setVariant] = useState<"A" | "B">(reduced ? "B" : "A");
  const [phase, setPhase] = useState<Phase>("hold");
  const [caretOn, setCaretOn] = useState(true);

  // Parpadeo del cursor
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setCaretOn((c) => !c), 520);
    return () => clearInterval(id);
  }, [reduced]);

  // Bucle de tecleo
  useEffect(() => {
    if (reduced) return;

    let alive = true;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const type = async (str: string, cps: number) => {
      setPhase("typing");
      for (let i = 1; i <= str.length; i++) {
        if (!alive) return;
        setText(str.slice(0, i));
        await wait(cps);
      }
    };

    const erase = async (str: string, cps: number) => {
      setPhase("erasing");
      for (let i = str.length - 1; i >= 0; i--) {
        if (!alive) return;
        setText(str.slice(0, i));
        await wait(cps);
      }
    };

    const run = async () => {
      await wait(600);
      while (alive) {
        // 1 — Bri4n_
        setVariant("A");
        await type("Bri4n", 150);
        setPhase("hold");
        await wait(1500);
        await erase("Bri4n", 70);
        await wait(500);

        // 2 — Bri4n.dev (estado en reposo)
        setVariant("B");
        await type("Bri4n.dev", 145);
        setPhase("hold");
        await wait(7000);
        if (!alive) break;
        await erase("Bri4n.dev", 70);
        await wait(2000);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [reduced]);

  const blinking = phase === "hold";
  const showCaret = !(variant === "B" && text === "Bri4n.dev");

  return (
    <span
      className={`flex min-h-[1.15em] items-baseline leading-none select-none ${className}`}
      style={{
        fontFamily: "'Gelasio', Georgia, serif",
        fontStyle: "italic",
        fontWeight: 700,
        letterSpacing: "-0.01em",
      }}
    >
      <span className="sr-only">bri4n.dev</span>

      <span aria-hidden="true" className="inline-flex items-baseline">
        {text.split("").map((ch, i) => {
          let color = "#fafafa"; // zinc-50
          if (variant === "B") {
            if (ch === ".") color = "#8b5cf6"; // violet-500
            else if (i >= 6) color = "#a1a1aa"; // zinc-400 → "dev"
          }
          return (
            <span key={i} style={{ color }}>
              {ch}
            </span>
          );
        })}
        {showCaret && (
          <span
            style={{
              color: "#8b5cf6",
              marginLeft: "0.02em",
              opacity: blinking && !caretOn ? 0 : 1,
              transition: "opacity 0.06s linear",
            }}
          >
            _
          </span>
        )}
      </span>
    </span>
  );
}
