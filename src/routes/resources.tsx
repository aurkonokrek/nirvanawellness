import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { RESOURCES, RESOURCE_TRACKS, type Resource } from "@/data/resources";
import { getExpert } from "@/data/experts";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Journal & Creative Creations · Nirvana Wellness" },
      {
        name: "description",
        content:
          "Essays, practice notes, and creative work from the Nirvana Wellness team — writing on mental health, expat life, and integrated care.",
      },
      { property: "og:title", content: "Journal · Nirvana Wellness" },
      { property: "og:description", content: "Essays, practices, and creative work." },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const [track, setTrack] = useState<(typeof RESOURCE_TRACKS)[number]>("All");
  const filtered = useMemo(
    () => (track === "All" ? RESOURCES : RESOURCES.filter((r) => r.track === track)),
    [track],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Journal"
        title={
          <>
            Reading, practice, and{" "}
            <span className="italic text-gold-gradient">creative work.</span>
          </>
        }
        lede="Two tracks. The Journal is essays and practice notes from our clinicians. Creative Creations is visual, sound, and other creative work from practitioners and collaborators."
      />

      <section className="mx-auto max-w-7xl px-6 pt-2 lg:px-10">
        <div className="rounded-md border border-[color:var(--gold-deep)]/40 bg-[color:var(--gold-soft)]/15 px-4 py-3 text-sm text-foreground/80">
          <strong className="font-medium text-[color:var(--navy)]">Creative Creations</strong>{" "}
          entries are still placeholders — real visual and sound work will
          land there separately. The Journal is live.
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <div className="flex flex-wrap gap-2">
          {RESOURCE_TRACKS.map((t) => {
            const active = t === track;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTrack(t)}
                className={
                  active
                    ? "rounded-full bg-gold-gradient px-4 py-2 text-sm text-[color:var(--navy)]"
                    : "rounded-full border border-border px-4 py-2 text-sm text-foreground/80 hover:bg-muted"
                }
              >
                {t}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10 lg:pb-32">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <ArticleCard key={r.slug} resource={r} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ArticleCard({ resource }: { resource: Resource }) {
  const author = resource.authorSlug ? getExpert(resource.authorSlug) : null;
  const authorLabel = author?.name ?? resource.authorName ?? "Nirvana Wellness";
  return (
    <Link
      to="/resources/$slug"
      params={{ slug: resource.slug }}
      className="group flex flex-col overflow-hidden rounded-none border border-[color:var(--gold)]/30 bg-[#FAFAFA] p-6 transition-colors hover:border-[color:var(--gold-deep)]"
    >
      <p className="font-eyebrow text-[10px] tracking-[0.22em] text-[color:var(--gold-deep)]">
        {resource.track}
        {resource.category ? ` · ${resource.category}` : ""}
        {resource.isPlaceholder ? " · Illustrative" : ""}
      </p>
      <p className="mt-4 font-display text-2xl leading-tight text-[color:var(--navy)] transition-colors group-hover:text-[color:var(--gold-deep)]">
        {resource.title}
      </p>
      <p className="mt-3 text-sm text-foreground/80">{resource.dek}</p>
      <div className="mt-6 flex items-center justify-between border-t border-[color:var(--gold)]/25 pt-4 text-xs text-muted-foreground">
        <span>By {authorLabel}</span>
        {resource.readingMinutes && <span>{resource.readingMinutes} min read</span>}
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-sm text-[color:var(--navy)] transition-colors group-hover:text-transparent group-hover:bg-gold-gradient group-hover:bg-clip-text">
        Read
        <ArrowUpRight className="h-4 w-4 text-[color:var(--gold-deep)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
