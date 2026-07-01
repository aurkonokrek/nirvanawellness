import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, Clock, Repeat } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ACTIVITIES, ACTIVITY_FILTERS, type Activity } from "@/data/activities";
import { getExpert } from "@/data/experts";

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

function ActivitiesPage() {
  const [filter, setFilter] = useState<(typeof ACTIVITY_FILTERS)[number]>("All");

  const filtered = useMemo(() => {
    if (filter === "All") return ACTIVITIES;
    return ACTIVITIES.filter((a) => a.format === filter);
  }, [filter]);

  return (
    <div>
      <PageHeader
        eyebrow="Activities"
        title="Sessions, workshops, courses & retreats."
        lede="Filter by format. Every activity is designed to work as a one-off or as a doorway into deeper care."
      />
      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_FILTERS.map((f) => {
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

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10 lg:pb-32">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <ActivityCard key={a.slug} activity={a} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const expert = activity.expertSlug ? getExpert(activity.expertSlug) : null;

  const cardCls =
    "group flex h-full flex-col rounded-lg border border-border bg-card p-6 transition-colors hover:border-[color:var(--gold-deep)]";

  const Body = (
    <>
      <div className="flex items-center justify-between">
        <span className="font-eyebrow text-[color:var(--gold-deep)]">{activity.format}</span>
        <span className="font-eyebrow text-muted-foreground">{activity.pillar}</span>
      </div>
      <p className="mt-5 font-display text-2xl transition-colors group-hover:text-[color:var(--gold-deep)]">
        {activity.title}
      </p>
      <p className="mt-2 text-sm text-foreground/85">{activity.lede}</p>
      <p className="mt-4 text-xs text-muted-foreground">{activity.who}</p>
      <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{activity.duration}</span>
        <span className="inline-flex items-center gap-1.5"><Repeat className="h-3.5 w-3.5" />{activity.cadence}</span>
      </div>
      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="text-xs text-muted-foreground">
          {expert ? `With ${expert.name}` : activity.format === "Retreat" ? "Full detail on Retreats" : "Team-wide"}
        </span>
        <span className="inline-flex items-center gap-1 text-sm text-[color:var(--gold-deep)]">
          {activity.format === "Retreat" ? "See retreat" : expert ? "Book" : "Inquire"}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </>
  );

  // Route through /retreats for retreat entries (avoid duplicating content)
  if (activity.format === "Retreat" && activity.retreatSlug) {
    return (
      <Link
        to="/retreats/$slug"
        params={{ slug: activity.retreatSlug }}
        className={cardCls}
      >
        {Body}
      </Link>
    );
  }
  // Corporate items route to /book with corporate path (single entry point)
  if (activity.format === "Corporate") {
    return (
      <Link to="/book" className={cardCls}>
        {Body}
      </Link>
    );
  }
  // Everything else routes to the expert profile (booking lives there)
  if (expert) {
    return (
      <Link to="/experts/$slug" params={{ slug: expert.slug }} className={cardCls}>
        {Body}
      </Link>
    );
  }
  return (
    <Link to="/book" className={cardCls}>
      {Body}
    </Link>
  );
}
