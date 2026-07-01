import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, Clock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  TESTS,
  TEST_TYPES,
  TEST_THEMES,
  type TestItem,
  type TestType,
  type TestTheme,
} from "@/data/tests";

export const Route = createFileRoute("/resources/tests/")({
  head: () => ({
    meta: [
      { title: "Tests & Games · Nirvana Wellness" },
      {
        name: "description",
        content:
          "Short reflections and grounding games from Nirvana Wellness. Not diagnostic tools — starting points for a conversation with a real clinician.",
      },
      { property: "og:title", content: "Tests & Games · Nirvana Wellness" },
      {
        property: "og:description",
        content:
          "Short reflections and grounding games — starting points, not diagnoses.",
      },
    ],
  }),
  component: TestsIndexPage,
});

function TestsIndexPage() {
  const [type, setType] = useState<(typeof TEST_TYPES)[number]>("All");
  const [theme, setTheme] = useState<(typeof TEST_THEMES)[number]>("All");

  const filtered = useMemo(
    () =>
      TESTS.filter(
        (t) =>
          (type === "All" || t.type === type) &&
          (theme === "All" || t.theme === theme),
      ),
    [type, theme],
  );

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Resources", to: "/resources" },
          { label: "Tests & Games" },
        ]}
        eyebrow="Tests & Games"
        title={
          <>
            Short reflections. Small{" "}
            <span className="italic text-gold-gradient">grounding games.</span>
          </>
        }
        lede="These are not diagnostic tools — they're starting points for a conversation with a real clinician. Use them as a mirror, not a verdict."
      />

      <section className="mx-auto max-w-7xl px-6 pt-2 lg:px-10">
        <div className="rounded-md border border-[color:var(--gold-deep)]/40 bg-[color:var(--gold-soft)]/15 px-4 py-3 text-sm text-foreground/80">
          <strong className="font-medium text-[color:var(--navy)]">
            Illustrative catalog.
          </strong>{" "}
          The entries below are sample tests and games. Real question sets and
          game concepts are being finalized and will replace these without
          changes to the structure.
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-4 px-6 py-8 lg:px-10">
        <FilterRow
          label="Type"
          options={TEST_TYPES}
          value={type}
          onChange={(v) => setType(v as TestType | "All")}
        />
        <FilterRow
          label="Theme"
          options={TEST_THEMES}
          value={theme}
          onChange={(v) => setTheme(v as TestTheme | "All")}
        />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10 lg:pb-32">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TestCard key={t.slug} item={t} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="mt-16 text-center text-muted-foreground">
            Nothing matches that combination yet.
          </p>
        )}
      </section>
    </div>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-2 font-eyebrow text-muted-foreground">{label}</span>
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={
              active
                ? "rounded-full bg-gold-gradient px-4 py-2 text-sm text-[color:var(--navy)]"
                : "rounded-full border border-border px-4 py-2 text-sm text-foreground/80 hover:bg-muted"
            }
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function TestCard({ item }: { item: TestItem }) {
  return (
    <Link
      to="/resources/tests/$slug"
      params={{ slug: item.slug }}
      className="group flex h-full flex-col rounded-none border border-[color:var(--gold)]/30 bg-[#FAFAFA] p-6 transition-colors hover:border-[color:var(--gold-deep)]"
    >
      <div className="flex items-center justify-between">
        <span className="font-eyebrow text-[10px] tracking-[0.22em] text-[color:var(--gold-deep)]">
          {item.type} · {item.theme}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" /> {item.minutes} min
        </span>
      </div>
      <p className="mt-5 font-display text-2xl leading-tight text-[color:var(--navy)] transition-colors group-hover:text-[color:var(--gold-deep)]">
        {item.title}
      </p>
      <p className="mt-3 text-sm text-foreground/80">{item.dek}</p>
      <p className="mt-4 text-xs uppercase tracking-wider text-[color:var(--gold-deep)]">
        Illustrative · sample content
      </p>
      <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm text-[color:var(--navy)]">
        Begin
        <ArrowUpRight className="h-4 w-4 text-[color:var(--gold-deep)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
