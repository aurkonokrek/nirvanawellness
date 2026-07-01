import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { RETREATS } from "@/data/retreats";

export const Route = createFileRoute("/retreats")({
  head: () => ({
    meta: [
      { title: "Retreats for Teams · Nirvana Wellness" },
      {
        name: "description",
        content:
          "Two- and three-day off-site wellbeing retreats designed and delivered end-to-end for organisations and leadership groups.",
      },
      { property: "og:title", content: "Retreats for Teams · Nirvana Wellness" },
      {
        property: "og:description",
        content: "Designed and delivered end-to-end for teams and leadership groups.",
      },
    ],
  }),
  component: RetreatsPage,
});

function RetreatsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Retreats"
        title={
          <>
            Take your team{" "}
            <span className="italic text-gold-gradient">somewhere quieter.</span>
          </>
        }
        lede="At launch, our retreats are built for organisations — leadership off-sites, team resets, and full-team programs. Every retreat is designed and delivered end-to-end."
      />

      <section className="mx-auto max-w-7xl px-6 pt-2 lg:px-10">
        <div className="rounded-md border border-[color:var(--gold-deep)]/40 bg-[color:var(--gold-soft)]/15 px-4 py-3 text-sm text-foreground/80">
          <strong className="font-medium text-[color:var(--navy)]">
            Illustrative program shapes.
          </strong>{" "}
          Specific dates, locations, itineraries, and pricing are set with you
          in a discovery call — the sample retreats below exist to show how a
          real program page will read.
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          {RETREATS.map((r) => (
            <Link
              key={r.slug}
              to="/retreats/$slug"
              params={{ slug: r.slug }}
              className="group flex flex-col overflow-hidden rounded-none border border-[color:var(--gold)]/30 bg-[#FAFAFA] p-8 transition-colors hover:border-[color:var(--gold-deep)]"
            >
              <p className="font-eyebrow text-[10px] tracking-[0.22em] text-[color:var(--gold-deep)]">
                Retreat · Illustrative
              </p>
              <p className="mt-4 font-display text-3xl leading-tight text-[color:var(--navy)] transition-colors group-hover:text-[color:var(--gold-deep)]">
                {r.title}
              </p>
              <p className="mt-3 text-sm italic text-muted-foreground">{r.tagline}</p>
              <p className="mt-6 text-sm text-foreground/80">{r.overview[0]}</p>
              <span className="mt-8 inline-flex items-center gap-1 text-sm text-[color:var(--navy)] transition-colors group-hover:text-transparent group-hover:bg-gold-gradient group-hover:bg-clip-text">
                View program shape
                <ArrowUpRight className="h-4 w-4 text-[color:var(--gold-deep)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-[color:var(--sand)]/40">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center lg:px-10">
          <p className="font-eyebrow text-muted-foreground">Next step</p>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl md:text-4xl">
            Every real retreat starts with a 45-minute conversation.
          </h2>
          <div className="mt-8">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-medium text-[color:var(--navy)]"
            >
              Inquire for your team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
