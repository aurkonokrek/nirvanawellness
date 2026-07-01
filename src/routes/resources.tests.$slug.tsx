import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Clock, RotateCcw } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getTest, bandForScore, type TestItem, type Choice } from "@/data/tests";
import { getExpert } from "@/data/experts";

export const Route = createFileRoute("/resources/tests/$slug")({
  loader: ({ params }) => {
    const test = getTest(params.slug);
    if (!test) throw notFound();
    return { test };
  },
  head: ({ loaderData }) => {
    const t = loaderData?.test;
    const title = t
      ? `${t.title} · Tests & Games · Nirvana Wellness`
      : "Tests & Games · Nirvana Wellness";
    const description = t
      ? `${t.dek} Not a diagnostic tool — a starting point.`
      : "Reflective tests and grounding games.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: TestDetailPage,
});

type Stage = "intro" | "playing" | "crisis" | "done";

function TestDetailPage() {
  const { test } = Route.useLoaderData() as { test: TestItem };
  const [stage, setStage] = useState<Stage>("intro");
  const [answers, setAnswers] = useState<number[]>([]);
  const [idx, setIdx] = useState(0);

  const score = useMemo(() => answers.reduce((a, b) => a + b, 0), [answers]);

  function reset() {
    setStage("intro");
    setAnswers([]);
    setIdx(0);
  }

  function handleChoice(c: Choice) {
    if (c.crisis) {
      setStage("crisis");
      return;
    }
    const next = [...answers, c.score];
    setAnswers(next);
    if (idx + 1 >= test.questions.length) {
      setStage("done");
    } else {
      setIdx(idx + 1);
    }
  }

  return (
    <div className="bg-background">
      <section className="border-b border-border">
        <Breadcrumbs
          items={[
            { label: "Resources", to: "/resources" },
            { label: "Tests & Games", to: "/resources/tests" },
            { label: test.title },
          ]}
        />
        <div className="mx-auto max-w-3xl px-6 pb-10 pt-8 lg:pt-12">
          <p className="font-eyebrow text-[color:var(--gold-deep)]">
            {test.type} · {test.theme} · Illustrative
          </p>
          <h1 className="mt-4 font-display text-4xl leading-[1.1] md:text-5xl">
            {test.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{test.dek}</p>
          <p className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> About {test.minutes} minutes
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-14 lg:py-20">
        {stage === "intro" && <Intro test={test} onStart={() => setStage("playing")} />}

        {stage === "playing" && (
          <Playing
            test={test}
            idx={idx}
            onChoose={handleChoice}
          />
        )}

        {stage === "crisis" && <CrisisPanel onRestart={reset} />}

        {stage === "done" && <ResultPanel test={test} score={score} onRestart={reset} />}
      </section>
    </div>
  );
}

function Disclaimer() {
  return (
    <aside className="rounded-md border border-[color:var(--gold-deep)]/40 bg-[color:var(--gold-soft)]/20 px-5 py-4 text-sm text-foreground/85">
      <p className="font-medium text-[color:var(--navy)]">
        This is not a diagnostic tool.
      </p>
      <p className="mt-1">
        It's a starting point for a conversation with a real clinician. Results
        are reflective prompts, not clinical labels.
      </p>
    </aside>
  );
}

function Intro({ test, onStart }: { test: TestItem; onStart: () => void }) {
  return (
    <div className="space-y-8">
      <Disclaimer />
      <div className="rounded-md border border-border bg-card p-6">
        <p className="font-eyebrow text-muted-foreground">Before you begin</p>
        <ul className="mt-4 space-y-2 text-sm text-foreground/85">
          <li>· Answer honestly — this is only for you.</li>
          <li>· You can stop at any point; nothing is saved.</li>
          <li>· If anything comes up that feels heavy, resources appear at the end.</li>
        </ul>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Begin — {test.questions.length} short questions
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function Playing({
  test,
  idx,
  onChoose,
}: {
  test: TestItem;
  idx: number;
  onChoose: (c: Choice) => void;
}) {
  const q = test.questions[idx];
  const progress = ((idx + 1) / test.questions.length) * 100;
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between font-eyebrow text-muted-foreground">
          <span>
            Question {idx + 1} of {test.questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gold-gradient transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <p className="font-display text-2xl leading-snug text-[color:var(--navy)] md:text-3xl">
        {q.prompt}
      </p>

      <div className="grid gap-3">
        {q.choices.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChoose(c)}
            className="group flex items-center justify-between gap-4 rounded-md border border-border bg-card px-5 py-4 text-left text-foreground/90 transition-colors hover:border-[color:var(--gold-deep)] hover:bg-[color:var(--gold-soft)]/10"
          >
            <span>{c.label}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-[color:var(--gold-deep)]" />
          </button>
        ))}
      </div>
    </div>
  );
}

function CrisisPanel({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-md border-l-4 border-[color:var(--gold-deep)] bg-[color:var(--gold-soft)]/25 px-5 py-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-[color:var(--gold-deep)]" />
        <div className="text-sm text-foreground/90">
          <p className="font-medium text-[color:var(--navy)]">
            What you shared matters — please reach out to a real person now.
          </p>
          <p className="mt-1">
            This tool cannot support what you're carrying. A trained human can.
          </p>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-6">
        <p className="font-eyebrow text-[color:var(--gold-deep)]">
          Immediate support
        </p>
        <ul className="mt-4 space-y-3 text-sm text-foreground/85">
          <li>
            <strong className="text-[color:var(--navy)]">
              Kaan Pete Roi (Bangladesh):
            </strong>{" "}
            <a
              href="tel:+8809612119911"
              className="text-[color:var(--gold-deep)] underline underline-offset-4"
            >
              +880 9612-119911
            </a>{" "}
            — emotional support helpline.
          </li>
          <li>
            <strong className="text-[color:var(--navy)]">
              National Emergency Service:
            </strong>{" "}
            <a
              href="tel:999"
              className="text-[color:var(--gold-deep)] underline underline-offset-4"
            >
              999
            </a>
          </li>
          <li>
            <strong className="text-[color:var(--navy)]">
              Reach Nirvana Wellness directly:
            </strong>{" "}
            <a
              href="mailto:nirvanawellness.bd@gmail.com"
              className="text-[color:var(--gold-deep)] underline underline-offset-4"
            >
              nirvanawellness.bd@gmail.com
            </a>
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/book"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Book a session now
          <ArrowRight className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm text-foreground/80 hover:bg-muted"
        >
          <RotateCcw className="h-4 w-4" /> Start over
        </button>
      </div>
    </div>
  );
}

function ResultPanel({
  test,
  score,
  onRestart,
}: {
  test: TestItem;
  score: number;
  onRestart: () => void;
}) {
  const band = bandForScore(test, score);
  const expert = test.recommendedExpertSlug
    ? getExpert(test.recommendedExpertSlug)
    : null;

  return (
    <div className="space-y-8">
      <Disclaimer />

      <div className="rounded-md border border-[color:var(--gold)]/40 bg-[#FAFAFA] p-8">
        <p className="font-eyebrow text-[color:var(--gold-deep)]">A reflection</p>
        <p className="mt-4 font-display text-3xl leading-tight text-[color:var(--navy)] md:text-4xl">
          {band.title}
        </p>
        <p className="mt-5 text-base leading-relaxed text-foreground/85">
          {band.reflection}
        </p>
      </div>

      <div className="rounded-md border border-border bg-card p-6">
        <p className="font-eyebrow text-muted-foreground">A next step</p>
        <p className="mt-3 text-sm text-foreground/85">
          If any of this landed, a first conversation is a small, low-stakes way
          to bring it into a room with someone trained to hold it.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {expert ? (
            <Link
              to="/experts/$slug"
              params={{ slug: expert.slug }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Meet {expert.name.split(" ")[0]}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
          <Link
            to="/book"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--gold-deep)] px-5 py-2.5 text-sm text-[color:var(--navy)] hover:bg-[color:var(--gold-soft)]/20"
          >
            Book a session
          </Link>
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" /> Take it again
          </button>
        </div>
      </div>
    </div>
  );
}
