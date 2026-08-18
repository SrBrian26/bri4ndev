import { useEffect, useState } from "react";

type LogoBadgeProps = {
  /** Lado del badge en px. */
  size?: number;
  className?: string;
};

/** Logo animado "B4": las letras entran, el círculo se traza y el ciclo se repite. */
export default function LogoBadge({
  size = 40,
  className = "",
}: LogoBadgeProps) {
  const [step, setStep] = useState(0); // 0 vacío · 1 B · 2 B4 · 3 círculo

  useEffect(() => {
    let alive = true;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const run = async () => {
      await wait(400);
      while (alive) {
        setStep(1); // B aparece
        await wait(300);
        setStep(2); // 4 aparece
        await wait(320);
        setStep(3); // círculo se traza
        await wait(9000);
        if (!alive) break;
        setStep(2); // círculo se borra
        await wait(620);
        setStep(1); // 4 se va
        await wait(300);
        setStep(0); // B se va
        await wait(900);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, []);

  const sw = 2;
  const r = (size - sw) / 2 - 1;
  const c = 2 * Math.PI * r;
  const ease = "cubic-bezier(.2,.7,.3,1)";

  const charStyle = (color: string, on: boolean): React.CSSProperties => ({
    color,
    opacity: on ? 1 : 0,
    transform: on ? "translateY(0) scale(1)" : "translateY(3px) scale(0.8)",
    transition: `opacity 0.25s ease, transform 0.3s ${ease}`,
    display: "inline-block",
  });

  return (
    <span
      aria-label="bri4n.dev"
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute left-0 top-0"
        style={{ transform: "rotate(-90deg)", overflow: "visible" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#a1a1aa"
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={step >= 3 ? 0 : c}
          style={{ transition: `stroke-dashoffset 0.6s ${ease}` }}
        />
      </svg>
      <span
        className="relative inline-flex items-baseline text-lg leading-none"
        style={{
          fontFamily: "'Gelasio', Georgia, serif",
          fontStyle: "italic",
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
      >
        <span style={charStyle("#fafafa", step >= 1)}>B</span>
        <span style={charStyle("#8b5cf6", step >= 2)}>4</span>
      </span>
    </span>
  );
}
