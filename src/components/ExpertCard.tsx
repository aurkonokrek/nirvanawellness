import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { FlowerMark } from "@/components/FlowerMark";
import type { Expert } from "@/data/experts";

function initials(name: string) {
  return name
    .split(" ")
    .filter((s) => !/^(dr\.?|mr\.?|ms\.?|mrs\.?)$/i.test(s))
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
}

type Variant = "default" | "compact";

/**
 * Editorial expert card — the ONE canonical style for practitioner cards
 * across the site. Use anywhere an expert appears as a card (directory,
 * facilitator references on retreats, author bio on articles, related
 * experts, etc). Do not reintroduce the old generic card style.
 */
export function ExpertCard({
  expert,
  variant = "default",
  eyebrow,
}: {
  expert: Expert;
  variant?: Variant;
  /** Optional context eyebrow, e.g. "Facilitator" or "Author". */
  eyebrow?: string;
}) {
  const compact = variant === "compact";
  return (
    <Link
      to="/experts/$slug"
      params={{ slug: expert.slug }}
      className="group flex flex-col overflow-hidden rounded-none border border-[color:var(--gold)]/30 bg-[#FAFAFA] shadow-none transition-colors hover:border-[color:var(--gold-deep)]"
    >
      <div
        className={
          "relative flex items-center justify-center overflow-hidden bg-[color:var(--navy)] text-[color:var(--cream)] " +
          (compact ? "aspect-[5/4]" : "aspect-[4/5]")
        }
      >
        <FlowerMark className="pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 text-[color:var(--gold)] opacity-[0.06]" />
        <span
          className={
            "relative font-display tracking-[0.15em] text-gold-gradient " +
            (compact ? "text-3xl" : "text-4xl")
          }
        >
          {initials(expert.name)}
        </span>
        {!compact && (
          <div className="absolute right-3 top-3 flex gap-1">
            {expert.pillars.map((p) => (
              <span
                key={p}
                className="border border-white/25 px-2 py-0.5 font-eyebrow text-[10px] tracking-[0.18em] text-[color:var(--sand)]"
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className={"flex flex-1 flex-col " + (compact ? "px-4 py-4" : "px-5 py-5")}>
        {eyebrow && (
          <p className="font-eyebrow text-[10px] tracking-[0.22em] text-[color:var(--gold-deep)]">
            {eyebrow}
          </p>
        )}
        <p
          className={
            "font-display leading-tight text-[color:var(--navy)] transition-colors group-hover:text-[color:var(--gold-deep)] " +
            (compact ? "mt-1 text-xl" : "text-[26px]")
          }
        >
          {expert.name}
        </p>
        <p className="mt-1.5 text-xs italic text-muted-foreground">{expert.role}</p>
        {!compact && (
          <p className="mt-3 text-sm leading-relaxed text-foreground/80">{expert.short}</p>
        )}
        {!compact && expert.focus.length > 0 && (
          <p className="mt-4 font-eyebrow text-[10px] tracking-[0.22em] text-[color:var(--gold-deep)]">
            {expert.focus.slice(0, 4).join(" · ")}
          </p>
        )}
        <span
          className={
            "inline-flex items-center gap-1 text-sm text-[color:var(--navy)] transition-colors group-hover:text-transparent group-hover:bg-gold-gradient group-hover:bg-clip-text " +
            (compact ? "mt-3" : "mt-4")
          }
        >
          View profile
          <ArrowUpRight className="h-4 w-4 text-[color:var(--gold-deep)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
