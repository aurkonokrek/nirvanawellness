import { useEffect, useRef, useState } from "react";
import markAsset from "@/assets/nirvana-mark.gif";
import heroSanctuary from "@/assets/hero-sanctuary.jpg";

const SESSION_KEY = "nirvana:loader-seen";
const DURATION_MS = 2000;

export function BrandLoader() {
  const [mounted, setMounted] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [taglineIn, setTaglineIn] = useState(false);
  const timers = useRef<number[]>([]);

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

    timers.current.push(
      window.setTimeout(() => setTaglineIn(true), 500),
      window.setTimeout(() => setHiding(true), DURATION_MS),
      window.setTimeout(() => setMounted(false), DURATION_MS + 500),
    );

    return () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current = [];
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
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
    setHiding(true);
    window.setTimeout(() => setMounted(false), 400);
  };

  return (
    <div
      role="presentation"
      onClick={skip}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Escape") skip();
      }}
      className={
        "fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[color:var(--navy)] transition-opacity duration-500 " +
        (hiding ? "pointer-events-none opacity-0" : "opacity-100")
      }
      style={{ cursor: "pointer" }}
    >
      {/* Blurred brand imagery background (static asset, not backdrop) */}
      <img
        src={heroSanctuary}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover"
        style={{ filter: "blur(28px) saturate(110%)" }}
        draggable={false}
      />
      {/* Navy tint overlay for legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--navy) 82%, transparent) 0%, color-mix(in oklab, var(--navy) 90%, transparent) 100%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-6">
        <img
          src={markAsset.url}
          alt=""
          width={160}
          height={160}
          className="h-36 w-36 object-contain animate-[nirvana-pulse_2.2s_ease-in-out_infinite]"
          draggable={false}
        />
        <div className="flex flex-col items-center gap-1">
          <span className="font-display text-4xl leading-none text-gold-gradient">
            Nirvana
          </span>
          <span className="font-eyebrow text-[11px] tracking-[0.32em] text-[color:var(--sand)]">
            WELLNESS
          </span>
        </div>
        <p
          className={
            "mt-2 font-[Josefin_Sans,var(--font-sans)] text-sm tracking-[0.12em] text-[color:var(--sand)]/90 transition-opacity duration-700 " +
            (taglineIn ? "opacity-100" : "opacity-0")
          }
          style={{ fontFamily: "'Josefin Sans', ui-sans-serif, system-ui" }}
        >
          Wellness of Wholeness
        </p>
      </div>

      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 font-eyebrow text-[10px] tracking-[0.28em] text-[color:var(--sand)]/60">
        Tap to enter
      </p>

      <style>{`
        @keyframes nirvana-pulse {
          0%, 100% { transform: scale(1); opacity: 0.94; filter: drop-shadow(0 0 0 rgba(212,175,111,0)); }
          50% { transform: scale(1.06); opacity: 1; filter: drop-shadow(0 0 24px rgba(212,175,111,0.4)); }
        }
      `}</style>
    </div>
  );
}
