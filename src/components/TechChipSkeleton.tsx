/**
 * Anchos fijos: los nombres de las tecnologías no son todos iguales, y variar
 * el ancho hace que el bloque se lea como una lista y no como una grilla. Al
 * ser constantes, además, los chips no cambian de tamaño entre renders.
 */
const ANCHOS = [72, 96, 64, 88, 56, 104, 76, 68];

/**
 * Chips de relleno con el mismo alto que TechChip (24px + borde), pensados para
 * ir dentro del mismo contenedor `flex flex-wrap` que los reales.
 */
export default function TechChipSkeleton({ count = ANCHOS.length }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{ width: ANCHOS[i % ANCHOS.length] }}
          className="h-6 animate-pulse rounded-md border border-zinc-800 bg-zinc-900/80 motion-reduce:animate-none"
        />
      ))}
    </>
  );
}
