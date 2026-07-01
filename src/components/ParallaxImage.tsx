import { useEffect, useRef, useState } from "react";

/**
 * Subtle background parallax for hero sections. The image moves at ~60% of
 * scroll speed while the section is on-screen. Respects
 * `prefers-reduced-motion`. Use inside a relative/overflow-hidden container
 * (typically the hero wrapper).
 */
export function ParallaxImage({
  src,
  alt,
  className = "",
  strength = 0.35,
}: {
  src: string;
  alt: string;
  className?: string;
  /** 0 = static, 0.5 = strong parallax. Keep subtle. */
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    setEnabled(true);

    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Only animate while section is roughly visible
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      // Distance from viewport center — gives a symmetrical parallax feel
      const fromTop = rect.top;
      setOffset(-fromTop * strength);
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <div
      ref={ref}
      className={"absolute inset-0 overflow-hidden " + className}
      aria-hidden={alt ? undefined : true}
    >
      <img
        src={src}
        alt={alt}
        className="h-[130%] w-full object-cover will-change-transform"
        style={
          enabled
            ? { transform: `translate3d(0, ${offset}px, 0)` }
            : undefined
        }
      />
    </div>
  );
}
