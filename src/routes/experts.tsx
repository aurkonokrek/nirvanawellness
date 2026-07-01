import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EXPERTS, EXPERT_FILTERS, type Expert } from "@/data/experts";

export const Route = createFileRoute("/experts")({
  head: () => ({
    meta: [
      { title: "Meet the Experts · Nirvana Wellness" },
      {
        name: "description",
        content:
          "Licensed psychologists, therapists, meditation guides, and somatic practitioners at Nirvana Wellness. Filter by focus area, language, or format.",
      },
      { property: "og:title", content: "Meet the Experts · Nirvana Wellness" },
      {
        property: "og:description",
        content: "Licensed clinicians and practitioners for individuals, couples, and teams.",
      },
    ],
  }),
  component: ExpertsPage,
});

function ExpertsPage() {
  const [filter, setFilter] = useState<(typeof EXPERT_FILTERS)[number]>("All");

  const filtered = useMemo(() => {
    if (filter === "All") return EXPERTS;
    return EXPERTS.filter((e) => e.focus.includes(filter));
  }, [filter]);

  return (
    <div>
      <PageHeader
        eyebrow="Experts"
        title="The people behind the practice."
        lede="Bios and credentials below are sourced from nirvanawellness.org. Additional detail is pending direct confirmation from each practitioner."
      />

      {/* Filters */}
      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <div className="flex flex-wrap gap-2">
          {EXPERT_FILTERS.map((f) => {
            const active = f === filter;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={
                  active
                    ? "rounded-full bg-gold-gradient px-4 py-2 text-sm text-[color:var(--navy)]"
                    : "rounded-full border border-border px-4 py-2 text-sm text-foreground/80 hover:bg-muted"
                }
              >
                {f}
              </button>
            );
          })}
        </div>
      </section>

      {/* Directory */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10 lg:pb-32">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <ExpertCard key={e.slug} expert={e} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="mt-16 text-center text-muted-foreground">
            No practitioners match that filter yet.
          </p>
        )}
      </section>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter((s) => !/^(dr\.?|mr\.?|ms\.?|mrs\.?)$/i.test(s))
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
}

function ExpertCard({ expert }: { expert: Expert }) {
  return (
    <Link
      to="/experts/$slug"
      params={{ slug: expert.slug }}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-[color:var(--gold-deep)]"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center bg-[color:var(--navy)] text-[color:var(--cream)]">
        <span className="font-display text-6xl text-gold-gradient">{initials(expert.name)}</span>
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs text-[color:var(--sand)]/80">
          <MapPin className="h-3 w-3" /> {expert.location}
        </div>
        <div className="absolute right-3 top-3 flex gap-1">
          {expert.pillars.map((p) => (
            <span
              key={p}
              className="rounded-full border border-white/20 bg-black/20 px-2 py-0.5 font-eyebrow text-[10px] text-[color:var(--sand)]"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="font-display text-2xl transition-colors group-hover:text-[color:var(--gold-deep)]">
          {expert.name}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{expert.role}</p>
        <p className="mt-4 text-sm text-foreground/85">{expert.short}</p>
        <div className="mt-6 flex flex-wrap gap-1.5">
          {expert.focus.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="mt-6 inline-flex items-center gap-1 text-sm text-[color:var(--gold-deep)]">
          View profile
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
