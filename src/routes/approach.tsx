import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import mindfulYouAsset from "@/assets/mindful-you.jpg.asset.json";

export const Route = createFileRoute("/approach")({
  head: () => ({
    meta: [
      { title: "Our Approach — Mind, Body & Soul · Nirvana Wellness" },
      {
        name: "description",
        content:
          "How Nirvana Wellness integrates psychological, somatic, and contemplative care into one coherent approach — anchored in the Mindful You framework.",
      },
      { property: "og:title", content: "Our Approach — Nirvana Wellness" },
      {
        property: "og:description",
        content:
          "Psychological, somatic, and contemplative care — integrated across eight everyday dimensions.",
      },
    ],
  }),
  component: ApproachPage,
});

type Pillar = {
  num: string;
  name: "Mind" | "Body" | "Soul";
  lede: string;
  body: string;
  modalities: string[];
  dimensions: { name: string; note: string }[];
};

const PILLARS: Pillar[] = [
  {
    num: "I",
    name: "Mind",
    lede: "How you think, relate, and communicate — the daily architecture of a life.",
    body:
      "Evidence-based psychological care that takes the time to actually listen. We work across CBT, DBT, EMDR, ACT, IFS, TA, and integrative talk therapy — matched to the clinician and the moment, not to a protocol.",
    modalities: ["CBT · DBT · EMDR", "ACT · IFS · Transactional Analysis", "NLP · Family & couples work"],
    dimensions: [
      {
        name: "Habits",
        note: "The small daily patterns that quietly compound — sleep, screens, mornings, boundaries.",
      },
      {
        name: "Relationships",
        note: "Partners, family, friends, colleagues — the people your nervous system already knows by heart.",
      },
      {
        name: "Communication",
        note: "How you ask, how you refuse, how you say the difficult thing — and what happens when you don't.",
      },
    ],
  },
  {
    num: "II",
    name: "Body",
    lede: "What the body has been holding while the mind kept talking.",
    body:
      "Somatic practices, breathwork, movement, and energy work for what sits below the neck. Healing that lives in tissue and rhythm — not only in language.",
    modalities: ["Somatic & breathwork", "Reiki, sound & chakra work", "Fitness, nutrition, recovery"],
    dimensions: [
      {
        name: "Exercise",
        note: "Movement that fits an actual work week — sustainable strength, not punishment.",
      },
      {
        name: "Environment",
        note: "The rooms you live and work in, the light, the noise, the air — the setting of your day.",
      },
      {
        name: "Mind–Body Connection",
        note: "Learning to read the body's signals before they become symptoms.",
      },
    ],
  },
  {
    num: "III",
    name: "Soul",
    lede: "The longer question underneath the immediate one.",
    body:
      "Contemplative and expressive work — meditation, art therapy, journaling, ritual — for meaning, purpose, and the parts of a life that don't reduce to problem-solving.",
    modalities: ["Heartfulness & mindfulness meditation", "Art therapy · expressive practice", "Ritual & reflection"],
    dimensions: [
      {
        name: "Spirituality",
        note: "Whatever grounds you beyond the immediate — practice, faith, awe, contemplation.",
      },
      {
        name: "Self-development",
        note: "Curiosity, learning, and the ongoing project of becoming more of who you are.",
      },
    ],
  },
];

function ApproachPage() {
  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Approach" }]}

        eyebrow="Our approach"
        title={
          <>
            One person, <span className="italic text-gold-gradient">three doorways.</span>
          </>
        }
        lede="Mind, Body, and Soul is not a slogan — it is how we organise care so that no part of you is left out of the conversation. Underneath it sits a more granular map: eight everyday dimensions of a life worth tending."
      />

      {/* Pillars */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <div className="grid gap-16 lg:grid-cols-3 lg:gap-12">
          {PILLARS.map((p, i) => (
            <div key={p.name} className="flex flex-col">
              <span
                className="font-display text-7xl leading-none text-gold-gradient"
                style={{ opacity: 1 - i * 0.18 }}
              >
                {p.num}
              </span>
              <h2 className="mt-6 font-display text-3xl">{p.name}</h2>
              <p className="mt-3 text-sm italic text-muted-foreground">{p.lede}</p>
              <p className="mt-5 text-foreground/85">{p.body}</p>
              <ul className="mt-6 space-y-1.5 text-sm text-muted-foreground">
                {p.modalities.map((m) => (
                  <li key={m}>· {m}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Mindful You — 8 dimensions */}
      <section className="border-y border-border bg-[color:var(--sand)]/40">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <div>
              <p className="font-eyebrow text-muted-foreground">Mindful You</p>
              <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
                Eight dimensions, orbiting one centre.
              </h2>
              <p className="mt-5 text-muted-foreground">
                Beneath the three pillars sits our working map for everyday life — eight dimensions
                we return to across sessions, courses, and corporate programs. Each pillar
                stewards a few of them.
              </p>
              <div
                aria-hidden="true"
                className="mt-10 overflow-hidden rounded-3xl border border-border/60 bg-background"
              >
                <img
                  src={mindfulYouAsset.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-4 text-center font-eyebrow text-muted-foreground">
                Mindful You · at the centre
              </p>
            </div>
            <div className="grid gap-10 md:grid-cols-2">
              {PILLARS.flatMap((p) =>
                p.dimensions.map((d) => ({ pillar: p.name, ...d })),
              ).map((d) => (
                <div key={d.name} className="border-t border-border pt-6">
                  <p className="font-eyebrow text-[color:var(--gold-deep)]">Under {d.pillar}</p>
                  <h3 className="mt-2 font-display text-2xl">{d.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{d.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* First session */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[2fr_3fr] lg:gap-16">
          <div>
            <p className="font-eyebrow text-muted-foreground">A first session</p>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
              What actually happens.
            </h2>
          </div>
          <ol className="space-y-8">
            {[
              {
                t: "You tell us where you are — not where you should be.",
                b: "We ask a small handful of questions to match you to the right clinician. There is no long intake form.",
              },
              {
                t: "The first session is unhurried.",
                b: "Your clinician spends most of the hour listening. Together, you decide what a useful path forward looks like.",
              },
              {
                t: "You leave with something concrete.",
                b: "Not homework — a small experiment for the week, or a name for the pattern you've been living inside.",
              },
              {
                t: "Care continues at your pace.",
                b: "Weekly, fortnightly, or seasonal. You choose the cadence; nothing is auto-renewed.",
              },
            ].map((s, i) => (
              <li key={s.t} className="grid grid-cols-[auto_1fr] gap-6">
                <span className="font-display text-3xl text-gold-gradient">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-display text-2xl">{s.t}</p>
                  <p className="mt-2 text-muted-foreground">{s.b}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-[color:var(--navy)] text-[color:var(--cream)]">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-6 py-20 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <h2 className="max-w-2xl font-display text-3xl md:text-4xl">
            Ready to begin? A first conversation is the whole first step.
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/book"
              className="rounded-full bg-gold-gradient px-6 py-3 text-sm font-medium text-[color:var(--navy)]"
            >
              Book a session
            </Link>
            <Link
              to="/experts"
              className="rounded-full border border-white/20 px-6 py-3 text-sm text-[color:var(--cream)] hover:bg-white/5"
            >
              Meet the experts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
