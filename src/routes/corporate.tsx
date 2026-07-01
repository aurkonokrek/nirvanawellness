import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { ArrowRight, Shield, Users, Building, Sparkles } from "lucide-react";

export const Route = createFileRoute("/corporate")({
  head: () => ({
    meta: [
      { title: "Corporate Wellbeing Programs · Nirvana Wellness" },
      {
        name: "description",
        content:
          "Mental-health and wellbeing programs for organisations — confidential 1:1 access, workshops, manager training, and off-site retreats. Designed for real use.",
      },
      { property: "og:title", content: "Corporate Wellbeing · Nirvana Wellness" },
      { property: "og:description", content: "Programs your people will actually use." },
    ],
  }),
  component: CorporatePage,
});

function CorporatePage() {
  return (
    <div>
      <PageHeader
        eyebrow="For teams"
        title={
          <>
            Wellbeing programs that <span className="italic text-gold-gradient">don't feel corporate.</span>
          </>
        }
        lede="We design and deliver mental-health infrastructure for organisations — from confidential 1:1 access to workshops, manager training, and off-site retreats. Built for real use, not just compliance."
      >
        <div className="flex flex-wrap gap-3">
          <Link
            to="/book"
            className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-medium text-[color:var(--navy)]"
          >
            Start a conversation <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#programs"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-6 py-3 text-sm text-foreground hover:bg-foreground/5"
          >
            See what we offer
          </a>
        </div>
      </PageHeader>

      {/* Business case */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[2fr_3fr] lg:gap-16">
          <div>
            <p className="font-eyebrow text-muted-foreground">The business case</p>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
              Wellbeing is not a perk. It is infrastructure.
            </h2>
            <p className="mt-5 text-muted-foreground">
              Untreated stress, burnout, and unaddressed conflict are among the most expensive
              hidden costs an organisation carries — paid in turnover, absenteeism, quiet
              disengagement, and the leadership hours spent absorbing what a program could have
              held.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                h: "Retention & turnover cost",
                b: "The single largest hidden cost of poor mental-health support is attrition — and the months of ramp behind every replacement.",
              },
              {
                h: "Absenteeism & presenteeism",
                b: "People show up physically long before they stop showing up entirely. Early support prevents the harder version of the same problem later.",
              },
              {
                h: "Leadership bandwidth",
                b: "Managers absorb an enormous amount of unpaid emotional labour. A program takes that weight and redirects it into skill.",
              },
              {
                h: "Employer brand",
                b: "The organisations that treat wellbeing seriously are, increasingly, the ones talented people want to stay at.",
              },
            ].map((c) => (
              <div key={c.h} className="rounded-lg border border-border bg-card p-6">
                <p className="font-display text-xl">{c.h}</p>
                <p className="mt-2 text-sm text-muted-foreground">{c.b}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-lg border border-dashed border-border bg-muted/40 p-5 text-sm text-muted-foreground">
          Impact metrics (retention lift, utilisation rates, engagement scores) will populate here
          as we finalise reporting from live programs. We publish only real numbers.
        </div>
      </section>

      {/* What we offer */}
      <section id="programs" className="border-y border-border bg-[color:var(--sand)]/40">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <p className="font-eyebrow text-muted-foreground">What we offer</p>
          <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            Four building blocks. Combine as needed.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              {
                icon: Users,
                h: "Confidential 1:1 access",
                b: "Every employee can book a private session with a matched clinician. Usage is anonymised in employer reporting.",
              },
              {
                icon: Sparkles,
                h: "Workshops & training",
                b: "Half- and full-day workshops on stress, sleep, burnout, communication, and psychological safety.",
              },
              {
                icon: Building,
                h: "Manager training",
                b: "Structured cohorts for people-managers — how to hold better one-to-ones, spot early signs, and refer appropriately.",
              },
              {
                icon: Shield,
                h: "Off-site retreats",
                b: "Two- and three-day retreats for teams and leadership groups. We handle the whole program end-to-end.",
              },
            ].map(({ icon: Icon, h, b }) => (
              <div key={h} className="rounded-lg border border-border bg-background p-8">
                <Icon className="h-6 w-6 text-[color:var(--gold-deep)]" strokeWidth={1.5} />
                <p className="mt-4 font-display text-2xl">{h}</p>
                <p className="mt-2 text-muted-foreground">{b}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Retreats are covered in full detail on the <Link to="/retreats" className="underline underline-offset-4">retreats page</Link>.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[2fr_3fr] lg:gap-16">
          <div>
            <p className="font-eyebrow text-muted-foreground">How it works</p>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
              From first call to a program your people trust.
            </h2>
          </div>
          <ol className="space-y-10">
            {[
              {
                t: "Discovery",
                b: "A 45-minute conversation with your HR or leadership team. We map where the team actually is — not where a survey says they are.",
              },
              {
                t: "Design",
                b: "We propose a shape: which building blocks, at what cadence, over how many months. Everything is modular.",
              },
              {
                t: "Launch",
                b: "We handle rollout comms with your team, run onboarding sessions, and set up private booking channels for every employee.",
              },
              {
                t: "Steward",
                b: "Quarterly reviews with your HR/leadership contact. Aggregate, anonymised reporting. We adjust as the team changes.",
              },
            ].map((s, i) => (
              <li key={s.t} className="grid grid-cols-[auto_1fr] gap-6">
                <span className="font-display text-4xl text-gold-gradient">
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

      {/* Confidentiality */}
      <section className="border-t border-border bg-[color:var(--navy)] text-[color:var(--cream)]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <div>
              <p className="font-eyebrow text-[color:var(--gold-soft)]">Confidentiality</p>
              <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
                What employers see. What we never share.
              </h2>
            </div>
            <div className="space-y-5 text-[color:var(--sand)]">
              <p>
                A wellbeing program only works if employees genuinely trust that their sessions
                are private. That trust is not a marketing line — it is the foundation of
                clinical practice, and it is written into every program we run.
              </p>
              <ul className="space-y-4 border-t border-white/10 pt-6">
                <li>
                  <span className="font-display text-lg text-[color:var(--cream)]">Employers receive</span>
                  <p className="mt-1 text-sm">
                    Aggregate, anonymised utilisation — how many sessions the program funded in a
                    quarter, and program-level themes (e.g. "burnout is high in Q3"). Never names.
                    Never session content. Never diagnoses.
                  </p>
                </li>
                <li>
                  <span className="font-display text-lg text-[color:var(--cream)]">Employers never receive</span>
                  <p className="mt-1 text-sm">
                    Who booked. What was discussed. Which team the person is on. Employees are
                    identified in our systems only to their clinician.
                  </p>
                </li>
                <li>
                  <span className="font-display text-lg text-[color:var(--cream)]">Clinical duty of care</span>
                  <p className="mt-1 text-sm">
                    Our clinicians hold the same duty-of-care and confidentiality obligations they
                    would in any private practice, aligned to international clinical standards.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-10 lg:py-32">
        <p className="font-eyebrow text-muted-foreground">Start a conversation</p>
        <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl leading-tight md:text-5xl">
          If you've read this far, the next step is a 45-minute call.
        </h2>
        <div className="mt-8">
          <Link
            to="/book"
            className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-medium text-[color:var(--navy)]"
          >
            Request a discovery call <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
