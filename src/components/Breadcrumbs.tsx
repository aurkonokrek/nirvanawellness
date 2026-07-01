import { Link } from "@tanstack/react-router";
import { Fragment } from "react";

export type Crumb = {
  label: string;
  /** Absolute path. Omit on the final (current) crumb. */
  to?: string;
  params?: Record<string, string>;
};

/**
 * Site-wide breadcrumbs. Sits directly below the sticky nav, above the hero /
 * page heading. Small, muted, warm-neutral — consistent across every template.
 *
 * Pass `tone="dark"` when placing on a navy hero so the text stays legible.
 */
export function Breadcrumbs({
  items,
  tone = "light",
}: {
  items: Crumb[];
  tone?: "light" | "dark";
}) {
  const full: Crumb[] = [{ label: "Home", to: "/" }, ...items];
  const base =
    tone === "dark"
      ? "text-[color:var(--sand)]/70"
      : "text-muted-foreground";
  const hover =
    tone === "dark"
      ? "hover:text-[color:var(--gold-soft)]"
      : "hover:text-[color:var(--gold-deep)]";
  const current =
    tone === "dark" ? "text-[color:var(--cream)]" : "text-foreground";

  return (
    <nav
      aria-label="Breadcrumb"
      className={"mx-auto max-w-7xl px-6 pt-6 lg:px-10 " + base}
    >
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-eyebrow text-[10px] tracking-[0.22em]">
        {full.map((c, i) => {
          const isLast = i === full.length - 1;
          return (
            <Fragment key={`${c.label}-${i}`}>
              {i > 0 && (
                <li aria-hidden="true" className="opacity-60">
                  /
                </li>
              )}
              <li>
                {isLast || !c.to ? (
                  <span className={current}>{c.label}</span>
                ) : (
                  <Link
                    to={c.to}
                    params={c.params}
                    className={"transition-colors " + hover}
                  >
                    {c.label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
