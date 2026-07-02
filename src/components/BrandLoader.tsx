import { useEffect, useRef, useState } from "react";
import markAsset from "@/assets/nirvana-mark.gif.asset.json";

const SESSION_KEY = "nirvana:loader-seen";
const DURATION_MS = 2600;

export function BrandLoader() {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hiding, setHiding] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      sessionStorage.setItem(SESSION_KEY, "1");
      return;
    }
    setMounted(true);
    sessionStorage.setItem(SESSION_KEY, "1");

    const start = performance.now();
    const tick = (now: number) => {
      const pct = Math.min(100, Math.round(((now - start) / DURATION_MS) * 100));
      setProgress(pct);
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setHiding(true);
        setTimeout(() => setMounted(false), 500);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (!mounted) {
      document.documentElement.style.overflow = "";
      return;
    }
    document.documentElement.style.overflow = "hidden";
  }, [mounted]);

  if (!mounted) return null;

  const skip = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setProgress(100);
    setHiding(true);
    setTimeout(() => setMounted(false), 400);
  };

  return (
    <div
      role="presentation"
      onClick={skip}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Escape") skip();
      }}
      className={
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[color:var(--navy)] transition-opacity duration-500 " +
        (hiding ? "pointer-events-none opacity-0" : "opacity-100")
      }
      style={{ cursor: "pointer" }}
    >
      <div className="flex flex-col items-center gap-8">
        <img
          src={markAsset.url}
          alt=""
          width={160}
          height={160}
          className="h-40 w-40 object-contain animate-[nirvana-pulse_2.2s_ease-in-out_infinite]"
          draggable={false}
        />
        <div className="flex flex-col items-center gap-3">
          <div
            className="font-display text-4xl tabular-nums text-gold-gradient"
            aria-live="polite"
          >
            {String(progress).padStart(2, "0")}
          </div>
          <div className="h-px w-24 bg-[color:var(--gold-soft)]/40" />
          <p className="font-eyebrow text-[10px] tracking-[0.28em] text-[color:var(--sand)]/70">
            Tap to enter
          </p>
        </div>
      </div>
      <style>{`
        @keyframes nirvana-pulse {
          0%, 100% { transform: scale(1); opacity: 0.92; filter: drop-shadow(0 0 0 rgba(212,175,111,0)); }
          50% { transform: scale(1.06); opacity: 1; filter: drop-shadow(0 0 24px rgba(212,175,111,0.35)); }
        }
      `}</style>
    </div>
  );
}
