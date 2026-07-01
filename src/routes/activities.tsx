import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PlaceholderNote } from "@/components/PageHeader";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "Activities — Sessions, Workshops & Courses · Nirvana Wellness" },
      {
        name: "description",
        content:
          "One-off and ongoing offerings at Nirvana Wellness — 1:1 and couples sessions, workshops, courses, retreats, and corporate programs.",
      },
      { property: "og:title", content: "Activities · Nirvana Wellness" },
      {
        property: "og:description",
        content: "Sessions, workshops, courses, retreats, and corporate programs.",
      },
    ],
  }),
  component: ActivitiesPage,
});

const FILTERS = ["All", "1:1 / Couples session", "Workshop", "Course", "Retreat", "Corporate"] as const;

function ActivitiesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Activities"
        title="Sessions, workshops, courses & retreats."
        lede="Filter by format below. Every activity is designed to work as a one-off or as a doorway into deeper care."
      />
      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f, i) => (
            <button
              key={f}
              type="button"
              className={
                i === 0
                  ? "rounded-full bg-gold-gradient px-4 py-2 text-sm text-[color:var(--navy)]"
                  : "rounded-full border border-border px-4 py-2 text-sm text-foreground/80 hover:bg-muted"
              }
            >
              {f}
            </button>
          ))}
        </div>
      </section>
      <PlaceholderNote>
        Full activity catalogue (with filter behaviour) arrives in Phase 2.
      </PlaceholderNote>
    </div>
  );
}
