import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import heroSanctuary from "@/assets/hero-sanctuary.jpg";
import founderSumaia from "@/assets/founder-sumaia.jpg";
import retreatLake from "@/assets/retreat-lake.jpg";
import journalFlatlay from "@/assets/journal-flatlay.jpg";
import corporateCircle from "@/assets/corporate-circle.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div>
      <Hero />
      <PillarsTriad />
      <FounderBand />
      <CorporateBand />
      <ExpatStrip />
      <RetreatsPreview />
      <JournalPreview />
      <ClosingBand />
    </div>
  );
}

/* ---------- 1. Hero ---------- */
function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[color:var(--navy)] text-[color:var(--cream)]">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroSanctuary}
          alt="Morning light through sheer curtains in a still meditation space"
          width={1600}
          height={1024}
          className="h-full w-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--navy)]/70 via-[color:var(--navy)]/40 to-[color:var(--navy)]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-28 pt-28 lg:px-10 lg:pb-40 lg:pt-40">
        <p className="font-eyebrow text-[color:var(--gold-soft)]">Mind · Body · Soul</p>
        <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
          Care that meets you <span className="text-gold-gradient italic">where you are.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-[color:var(--sand)]">
          Nirvana Wellness is a Dhaka-based practice offering psychological, somatic, and
          contemplative care — for individuals, expats, and teams navigating real life.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            to="/book"
            className="group inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-medium text-[color:var(--navy)] shadow-[0_10px_40px_-15px_rgba(212,169,74,0.7)] transition-transform hover:-translate-y-0.5"
          >
            Book a session
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/approach"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm text-[color:var(--cream)] transition-colors hover:bg-white/5"
          >
            How we work
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- 2. Mind / Body / Soul triad ---------- */
const PILLARS = [
  {
    num: "I",
    name: "Mind",
    body:
      "Evidence-based psychological care — CBT, DBT, EMDR, and integrative talk therapy with licensed clinicians who take the time to listen.",
  },
  {
    num: "II",
    name: "Body",
    body:
      "Somatic practices, breathwork, and movement to release what talk alone cannot reach. Healing that lives below the neck.",
  },
  {
    num: "III",
    name: "Soul",
    body:
      "Contemplative and expressive work — journaling, ritual, creative expression — for meaning, purpose, and the deeper questions.",
  },
];
function PillarsTriad() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
      <div className="grid gap-16 lg:grid-cols-[1fr_2fr] lg:gap-24">
        <div>
          <p className="font-eyebrow text-muted-foreground">Our framework</p>
          <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            One person, three doorways.
          </h2>
          <p className="mt-5 max-w-md text-muted-foreground">
            Real wellbeing rarely lives in one place. We work across all three — with you,
            not around you.
          </p>
        </div>
        <div className="space-y-10">
          {PILLARS.map((p, i) => (
            <div
              key={p.name}
              className="grid grid-cols-[auto_1fr] gap-8 border-t border-border pt-10 first:border-t-0 first:pt-0"
            >
              <span
                className="font-display text-6xl leading-none text-gold-gradient"
                style={{ opacity: 1 - i * 0.18 }}
              >
                {p.num}
              </span>
              <div>
                <h3 className="font-display text-3xl">{p.name}</h3>
                <p className="mt-3 max-w-lg text-muted-foreground">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. Founder band (Sumaia — mission, not booking) ---------- */
function FounderBand() {
  return (
    <section className="bg-[color:var(--navy)] text-[color:var(--cream)]">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-32">
        <div className="relative aspect-[4/5] overflow-hidden lg:aspect-auto">
          <img
            src={founderSumaia}
            alt="Sumaia Azmi, founder of Nirvana Wellness"
            width={1024}
            height={1280}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <p className="font-eyebrow text-[color:var(--gold-soft)]">Founder's note</p>
          <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            "Care shouldn't feel like a favour."
          </h2>
          <p className="mt-6 text-lg text-[color:var(--sand)]">
            Nirvana began with a simple frustration: psychological support in this part of the world
            is still treated as a luxury or a last resort. I wanted a place where it feels ordinary
            to walk in — for a hard week, a difficult season, or a longer question you've been
            carrying quietly.
          </p>
          <p className="mt-4 text-[color:var(--sand)]">
            — Sumaia Azmi, Founder & Clinical Director
          </p>
          <div className="mt-8">
            <Link
              to="/experts"
              className="group inline-flex items-center gap-2 text-sm text-[color:var(--gold-soft)] hover:text-[color:var(--gold)]"
            >
              Read Sumaia's full profile & book with her
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 4. Corporate band ---------- */
function CorporateBand() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
        <div>
          <p className="font-eyebrow text-muted-foreground">For teams</p>
          <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            Wellbeing programs that don't feel corporate.
          </h2>
          <p className="mt-5 max-w-xl text-muted-foreground">
            We design and deliver mental-health programs for organisations that want their people
            to actually use them — from confidential 1:1 access to workshops, manager training,
            and off-site retreats.
          </p>
          <div className="mt-8">
            <Link
              to="/corporate"
              className="group inline-flex items-center gap-2 rounded-full border border-foreground/20 px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-foreground/5"
            >
              Explore corporate programs
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={corporateCircle}
            alt="A quiet corporate lounge repurposed for wellbeing sessions"
            width={1400}
            height={960}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

/* ---------- 5. Expat reassurance strip ---------- */
function ExpatStrip() {
  return (
    <section className="border-y border-border bg-[color:var(--sand)]/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1fr_2fr] lg:gap-16 lg:px-10">
        <div>
          <p className="font-eyebrow text-muted-foreground">For expats</p>
          <h3 className="mt-3 font-display text-3xl">Familiar frameworks, local warmth.</h3>
        </div>
        <div className="text-muted-foreground">
          <p>
            Our clinicians are trained in international modalities and work fluently in English.
            We understand relocation, cultural friction, third-culture families, and the specific
            weight of being far from home.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- 6. Retreats preview (corporate framing) ---------- */
function RetreatsPreview() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[2fr_3fr] lg:gap-16 lg:px-10 lg:py-32">
        <div className="flex flex-col justify-center">
          <p className="font-eyebrow text-muted-foreground">Retreats for teams</p>
          <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            Take your team somewhere quieter.
          </h2>
          <p className="mt-5 text-muted-foreground">
            Two- and three-day off-sites designed for teams that need to reset — combining rest,
            reflection, and light structured work. We handle the whole program end-to-end.
          </p>
          <div className="mt-8">
            <Link
              to="/retreats"
              className="group inline-flex items-center gap-2 text-sm text-foreground hover:text-[color:var(--gold-deep)]"
            >
              See retreat programs
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={retreatLake}
            alt="Wooden pavilion at the edge of a still lake at dawn"
            width={1600}
            height={960}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

/* ---------- 7. Journal preview ---------- */
const JOURNAL = [
  { tag: "Essay", title: "What talk therapy can't reach — and what can.", read: "6 min" },
  { tag: "Practice", title: "A five-minute practice for the middle of a hard week.", read: "3 min" },
  { tag: "Field notes", title: "Notes on returning: expats, homecoming, and grief.", read: "8 min" },
];
function JournalPreview() {
  return (
    <section className="bg-[color:var(--navy)] text-[color:var(--cream)]">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-eyebrow text-[color:var(--gold-soft)]">Journal</p>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">Recent reading.</h2>
          </div>
          <Link
            to="/resources"
            className="group inline-flex items-center gap-2 text-sm text-[color:var(--sand)] hover:text-[color:var(--gold-soft)]"
          >
            All resources <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={journalFlatlay}
                alt="Open journal with fountain pen and tea"
                width={1400}
                height={960}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <ul className="divide-y divide-white/10 lg:col-span-2">
            {JOURNAL.map((post) => (
              <li key={post.title}>
                <Link
                  to="/resources"
                  className="group flex flex-col gap-2 py-6 first:pt-0 md:flex-row md:items-center md:justify-between md:gap-8"
                >
                  <div>
                    <span className="font-eyebrow text-[color:var(--gold-soft)]">{post.tag}</span>
                    <p className="mt-2 font-display text-2xl leading-snug transition-colors group-hover:text-[color:var(--gold-soft)]">
                      {post.title}
                    </p>
                  </div>
                  <span className="text-xs text-[color:var(--sand)]/70 md:whitespace-nowrap">
                    {post.read} read
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- 8. Closing band ---------- */
function ClosingBand() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-28 text-center lg:px-10 lg:py-40">
      <p className="font-eyebrow text-muted-foreground">Begin</p>
      <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl leading-[1.1] md:text-6xl">
        Whatever you're carrying,{" "}
        <span className="italic text-gold-gradient">you don't have to carry it alone.</span>
      </h2>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/book"
          className="rounded-full bg-gold-gradient px-6 py-3 text-sm font-medium text-[color:var(--navy)] shadow-[0_10px_40px_-15px_rgba(212,169,74,0.7)]"
        >
          Book a session
        </Link>
        <Link
          to="/experts"
          className="rounded-full border border-foreground/20 px-6 py-3 text-sm text-foreground hover:bg-foreground/5"
        >
          Meet our experts
        </Link>
      </div>
    </section>
  );
}
