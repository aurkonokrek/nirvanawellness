import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react";

/**
 * Scroll-triggered fade-up reveal. Uses IntersectionObserver so it fires
 * when the wrapped content enters the viewport (unlike the mount-based
 * `animate-fade-up` utility, which plays once at initial render and is
 * useless for sections deep in the page).
 *
 * Respects `prefers-reduced-motion`. Idempotent — animates once.
 */
export function Reveal({
  as: Tag = "div",
  delay = 0,
  className = "",
  children,
}: {
  as?: ElementType;
  /** ms — stagger children with 0/120/260/400 etc. */
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    // If already in view at mount, show immediately.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
      setShown(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            obs.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const style = {
    transitionDelay: shown ? `${delay}ms` : "0ms",
  } as const;

  return (
    <Tag
      ref={ref as never}
      data-reveal={shown ? "shown" : mounted ? "hidden" : "ssr"}
      style={style}
      className={
        "transition-[opacity,transform] duration-[900ms] ease-out will-change-transform " +
        (shown
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6") +
        " " +
        className
      }
    >
      {children}
    </Tag>
  );
}
