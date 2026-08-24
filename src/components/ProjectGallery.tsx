import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

interface Props {
  name: string;
  images: string[];
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  Galería en popup: backdrop con blur, panel grande con la imagen,   */
/*  flechas, contador y miniaturas. Entra y sale animada con GSAP.     */
/* ------------------------------------------------------------------ */

export default function ProjectGallery({ name, images, onClose }: Props) {
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const animating = useRef(false);
  const closing = useRef(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  // Entrada: backdrop → panel → contenido en cascada
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power1.out" }
      )
        .fromTo(
          panelRef.current,
          { opacity: 0, y: 28, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" },
          "-=0.1"
        )
        .fromTo(
          ".gallery-item",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: "power2.out" },
          "-=0.25"
        )
        .fromTo(
          ".gallery-fade",
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: "power1.out" },
          "<0.1"
        );
    }, rootRef);

    // Mueve el foco al diálogo y lo devuelve al cerrar
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.focus({ preventScroll: true });

    return () => {
      ctx.revert();
      opener?.focus({ preventScroll: true });
    };
  }, []);

  // Salida animada antes de desmontar
  const requestClose = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(panelRef.current, {
      opacity: 0,
      y: 20,
      scale: 0.97,
      duration: 0.28,
      ease: "power2.in",
    }).to(backdropRef.current, { opacity: 0, duration: 0.22 }, "-=0.1");
  }, [onClose]);

  const goTo = useCallback(
    (next: number, dir?: 1 | -1) => {
      const total = images.length;
      const target = (next + total) % total;
      if (target === currentRef.current || animating.current) return;
      const direction = dir ?? (target > currentRef.current ? 1 : -1);
      animating.current = true;

      gsap.to(imgRef.current, {
        opacity: 0,
        x: -36 * direction,
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => {
          currentRef.current = target;
          setCurrent(target);
          gsap.fromTo(
            imgRef.current,
            { opacity: 0, x: 36 * direction },
            {
              opacity: 1,
              x: 0,
              duration: 0.3,
              ease: "power2.out",
              onComplete: () => {
                animating.current = false;
              },
            }
          );
        },
      });
    },
    [images.length]
  );

  // Teclado: Escape cierra, flechas navegan
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
      else if (e.key === "ArrowRight") goTo(currentRef.current + 1, 1);
      else if (e.key === "ArrowLeft") goTo(currentRef.current - 1, -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, requestClose]);

  // Bloquea el scroll del fondo y precarga las imágenes
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    return () => {
      document.body.style.overflow = prev;
    };
  }, [images]);

  // Mantiene la miniatura activa a la vista
  useEffect(() => {
    const thumb = thumbsRef.current?.children[current] as HTMLElement | undefined;
    thumb?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [current]);

  return createPortal(
    <div
      ref={rootRef}
      className="fixed inset-0 z-100 flex items-center justify-center sm:p-4"
    >
      <div
        ref={backdropRef}
        onClick={requestClose}
        className="absolute inset-0 opacity-0 backdrop-blur-md"
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Galería de ${name}`}
        tabIndex={-1}
        className="relative flex max-h-screen w-full max-w-7xl flex-col overflow-hidden sm:rounded-2xl border border-zinc-800 bg-zinc-950 opacity-0 shadow-2xl shadow-black/60 focus:outline-none sm:h-full"
      >
        {/* Encabezado */}
        <div className="gallery-item flex items-center justify-between gap-4 border-b border-zinc-800 px-5 py-2 opacity-0">
          <div className="flex min-w-0 items-baseline gap-3">
            <h3 className="truncate text-sm font-semibold text-white">{name}</h3>
            <span
              className="shrink-0 text-xs tabular-nums text-zinc-500"
              aria-live="polite"
            >
              {current + 1} / {images.length}
            </span>
          </div>
          <button
            onClick={requestClose}
            aria-label="Cerrar galería"
            className="group flex h-9 w-9 shrink-0 items-center justify-center cursor-pointer rounded-lg text-zinc-400 transition-colors duration-200 hover:bg-zinc-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <i
              className="fa-solid fa-xmark text-lg transition-transform duration-300 group-hover:rotate-90"
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Imagen principal */}
        <div className="relative flex min-h-[30vh] flex-1 items-center justify-center overflow-hidden sm:p-3 sm:min-h-0">
          <img
            ref={imgRef}
            src={images[current]}
            alt={`${name} — imagen ${current + 1} de ${images.length}`}
            draggable={false}
            className="gallery-item max-h-full max-w-full select-none sm:rounded-lg object-contain opacity-0"
          />

          {images.length > 1 && (
            <>
              <div className="gallery-fade absolute left-3 top-1/2 -translate-y-1/2 opacity-0 sm:left-5">
                <button
                  onClick={() => goTo(currentRef.current - 1, -1)}
                  aria-label="Imagen anterior"
                  className="flex h-10 w-10 items-center justify-center cursor-pointer rounded-full border border-zinc-700 bg-zinc-900/80 text-zinc-300 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:border-indigo-400/60 hover:bg-indigo-500/15 hover:text-white active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:h-11 sm:w-11"
                >
                  <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                </button>
              </div>
              <div className="gallery-fade absolute right-3 top-1/2 -translate-y-1/2 opacity-0 sm:right-5">
                <button
                  onClick={() => goTo(currentRef.current + 1, 1)}
                  aria-label="Imagen siguiente"
                  className="flex h-10 w-10 items-center justify-center cursor-pointer rounded-full border border-zinc-700 bg-zinc-900/80 text-zinc-300 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:border-indigo-400/60 hover:bg-indigo-500/15 hover:text-white active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:h-11 sm:w-11"
                >
                  <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Miniaturas */}
        {images.length > 1 && (
          <div className="gallery-item overflow-x-auto bg-principal/10 border-t border-zinc-800/50 px-4 py-3 opacity-0 fixed bottom-0 inset-x-0">
            <div ref={thumbsRef} className="mx-auto flex w-max gap-2">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  aria-current={i === current ? "true" : undefined}
                  className={`h-12 w-16 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:h-14 sm:w-20 ${
                    i === current
                      ? "border-indigo-400 opacity-100"
                      : "border-transparent opacity-40 hover:border-zinc-600 hover:opacity-90"
                  }`}
                >
                  <img
                    src={src}
                    alt={name}
                    draggable={false}
                    className="h-full w-full select-none object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
