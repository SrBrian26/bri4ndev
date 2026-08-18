import { useState } from "react";

export interface Technology {
  id: number;
  name: string;
  image: string | null;
}

/** Chip de tecnología; si el logo falla, queda solo el nombre. */
export default function TechChip({ tech }: { tech: Technology }) {
  const [showImage, setShowImage] = useState(Boolean(tech.image));

  return (
    <article className="inline-flex items-center rounded-md border group border-zinc-800 bg-zinc-900/80 text-xs text-zinc-400 transition-colors duration-200 hover:border-zinc-700 hover:text-zinc-200">
      {showImage && tech.image && (
        <img
          src={tech.image}
          alt=""
          aria-hidden="true"
          onError={() => setShowImage(false)}
          className="h-6 w-6 shrink-0 object-contain pl-2 grayscale group-hover:grayscale-0 transform transition-all duration-100"
        />
      )}
      <label className="px-2 py-1">{tech.name}</label>
    </article>
  );
}
