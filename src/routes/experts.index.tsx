import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ExpertCard } from "@/components/ExpertCard";
import { EXPERTS, EXPERT_FILTERS } from "@/data/experts";

export const Route = createFileRoute("/experts/")({
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
        crumbs={[{ label: "Experts" }]}
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

// ExpertCard lives in src/components/ExpertCard.tsx and is used site-wide.

