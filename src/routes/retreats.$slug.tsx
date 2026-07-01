import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, MapPin, Clock, Users, Check } from "lucide-react";
import { FlowerMark } from "@/components/FlowerMark";
import { ExpertCard } from "@/components/ExpertCard";
import { getRetreat } from "@/data/retreats";
import { getExpert } from "@/data/experts";

export const Route = createFileRoute("/retreats/$slug")({
  loader: ({ params }) => {
    const retreat = getRetreat(params.slug);
    if (!retreat) throw notFound();
    return { retreat };
  },
  head: ({ loaderData }) => {
    const r = loaderData?.retreat;
    const title = r ? `${r.title} · Nirvana Wellness` : "Retreat · Nirvana Wellness";
    const description = r
      ? `${r.tagline}`
      : "Retreat program details from Nirvana Wellness.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: RetreatDetailPage,
});

function RetreatDetailPage() {
  const { retreat } = Route.useLoaderData() as {
    retreat: import("@/data/retreats").Retreat;
  };
  const facilitators = retreat.facilitatorSlugs
    .map((s) => getExpert(s))
    .filter((e): e is NonNullable<ReturnType<typeof getExpert>> => Boolean(e));

  return (
    <div>
      {/* Hero (mandala placeholder — real photography drops in later) */}
      <section className="relative overflow-hidden bg-[color:var(--navy)] text-[color:var(--cream)]">
        <FlowerMark className="pointer-events-none absolute -right-24 -bottom-24 h-[520px] w-[520px] text-[color:var(--gold)] opacity-[0.05]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <p className="font-eyebrow text-[color:var(--gold-soft)]">
            Retreat{retreat.isPlaceholder ? " · Illustrative" : ""}
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[1.05] md:text-6xl">
            {retreat.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg italic text-[color:var(--sand)]">
            {retreat.tagline}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-medium text-[color:var(--navy)]"
            >
              Inquire for your team <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/retreats"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm text-[color:var(--cream)] hover:bg-white/5"
            >
              All retreats
            </Link>
          </div>
        </div>
      </section>

      {/* Placeholder flag — only for entries whose content is still pending */}
      {retreat.isPlaceholder && (
        <section className="mx-auto max-w-7xl px-6 pt-10 lg:px-10">
          <div className="rounded-md border border-[color:var(--gold-deep)]/40 bg-[color:var(--gold-soft)]/15 px-4 py-3 text-sm text-foreground/80">
            <strong className="font-medium text-[color:var(--navy)]">
              Illustrative content.
            </strong>{" "}
            Real program details are pending. Nothing on this page describes a
            specific bookable offering yet.
          </div>
        </section>
      )}


      {/* Overview + logistics sidebar */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[2fr_1fr] lg:gap-20">
          <div>
            <p className="font-eyebrow text-muted-foreground">Overview</p>
            <h2 className="mt-3 font-display text-3xl">The shape of the program</h2>
            <div className="mt-6 space-y-5 text-foreground/85">
              {retreat.overview.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          <aside className="space-y-8 border-t border-[color:var(--gold)]/30 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <div>
              <p className="font-eyebrow text-muted-foreground">Logistics</p>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gold-deep)]" />
                  <span>
                    <span className="block font-medium text-[color:var(--navy)]">Duration</span>
                    <span className="text-muted-foreground">{retreat.logistics.duration}</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gold-deep)]" />
                  <span>
                    <span className="block font-medium text-[color:var(--navy)]">Location</span>
                    <span className="text-muted-foreground">{retreat.logistics.location}</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gold-deep)]" />
                  <span>
                    <span className="block font-medium text-[color:var(--navy)]">Format</span>
                    <span className="text-muted-foreground">{retreat.logistics.format}</span>
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-eyebrow text-muted-foreground">Included</p>
              <ul className="mt-5 space-y-3 text-sm">
                {retreat.logistics.included.map((item) => (
                  <li key={item} className="flex gap-3 text-foreground/80">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gold-deep)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Itinerary */}
      <section className="border-y border-border bg-[color:var(--sand)]/30">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <p className="font-eyebrow text-muted-foreground">Itinerary</p>
          <h2 className="mt-3 font-display text-3xl">Day by day, in outline</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {retreat.itinerary.map((d) => (
              <div
                key={d.label}
                className="flex flex-col border border-[color:var(--gold)]/30 bg-background p-6"
              >
                <p className="font-eyebrow text-[10px] tracking-[0.22em] text-[color:var(--gold-deep)]">
                  {d.label}
                </p>
                <p className="mt-3 font-display text-2xl text-[color:var(--navy)]">{d.title}</p>
                <ul className="mt-5 space-y-2.5 text-sm text-foreground/80">
                  {d.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[color:var(--gold-deep)]" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div>
            <p className="font-eyebrow text-muted-foreground">Who it's for</p>
            <h2 className="mt-3 font-display text-3xl">Built for teams, not tourists.</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              At launch, our retreats are corporate — designed for organisations
              and leadership groups. Individual retreats will follow when the
              format is ready.
            </p>
          </div>
          <ul className="space-y-4">
            {retreat.whoItsFor.map((w) => (
              <li key={w} className="flex gap-3 border-t border-[color:var(--gold)]/25 pt-4 text-foreground/85">
                <Check className="mt-1 h-4 w-4 shrink-0 text-[color:var(--gold-deep)]" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Facilitators */}
      {(facilitators.length > 0 || retreat.facilitatorsNote) && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
            <p className="font-eyebrow text-muted-foreground">Facilitators</p>
            <h2 className="mt-3 font-display text-3xl">Who leads the room</h2>
            {retreat.facilitatorsNote && (
              <p className="mt-4 max-w-2xl text-foreground/80">{retreat.facilitatorsNote}</p>
            )}
            {facilitators.length > 0 && (
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {facilitators.map((f) => (
                  <ExpertCard key={f.slug} expert={f} eyebrow="Facilitator" />
                ))}
              </div>
            )}
          </div>
        </section>
      )}


      {/* CTA — routes to the same corporate inquiry flow as /corporate */}
      <section className="border-t border-border bg-[color:var(--navy)] text-[color:var(--cream)]">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-10 lg:py-28">
          <p className="font-eyebrow text-[color:var(--gold-soft)]">Next step</p>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl md:text-4xl">
            Inquire for your team — we'll come back within one business day.
          </h2>
          <div className="mt-8">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-medium text-[color:var(--navy)]"
            >
              Start the conversation <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
