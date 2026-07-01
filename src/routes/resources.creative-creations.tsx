import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { RESOURCES } from "@/data/resources";
import { getExpert } from "@/data/experts";

export const Route = createFileRoute("/resources/creative-creations")({
  head: () => ({
    meta: [
      { title: "Creative Creations · Nirvana Wellness" },
      {
        name: "description",
        content:
          "Placeholder space for visual, sound, and creative wellbeing work from Nirvana Wellness practitioners and collaborators.",
      },
      { property: "og:title", content: "Creative Creations · Nirvana Wellness" },
      {
        property: "og:description",
        content: "Visual, sound, and creative wellbeing work — content pending.",
      },
    ],
  }),
  component: CreativeCreationsPage,
});

function CreativeCreationsPage() {
  const entries = RESOURCES.filter((r) => r.track === "Creative Creations");

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Resources", to: "/resources" },
          { label: "Creative Creations" },
        ]}
        eyebrow="Creative Creations"
        title={
          <>
            Visual, sound, and <span className="italic text-gold-gradient">creative work.</span>
          </>
        }
        lede="This track is wired as its own Resources subsection. The entries below are placeholders until real creative work is finalized."
      />

      <section className="mx-auto max-w-7xl px-6 pt-2 lg:px-10">
        <div className="rounded-md border border-[color:var(--gold-deep)]/40 bg-[color:var(--gold-soft)]/15 px-4 py-3 text-sm text-foreground/80">
          <strong className="font-medium text-[color:var(--navy)]">Content pending.</strong>{" "}
          These cards are illustrative placeholders only.
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:pb-32">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((resource) => {
            const author = resource.authorSlug ? getExpert(resource.authorSlug) : null;
            const authorLabel = author?.name ?? resource.authorName ?? "Nirvana Wellness";
            return (
              <Link
                key={resource.slug}
                to="/resources/$slug"
                params={{ slug: resource.slug }}
                className="group flex flex-col overflow-hidden rounded-none border border-[color:var(--gold)]/30 bg-[#FAFAFA] p-6 transition-colors hover:border-[color:var(--gold-deep)]"
              >
                <p className="font-eyebrow text-[10px] tracking-[0.22em] text-[color:var(--gold-deep)]">
                  Creative Creations · Illustrative
                </p>
                <p className="mt-4 font-display text-2xl leading-tight text-[color:var(--navy)] transition-colors group-hover:text-[color:var(--gold-deep)]">
                  {resource.title}
                </p>
                <p className="mt-3 text-sm text-foreground/80">{resource.dek}</p>
                <div className="mt-6 flex items-center justify-between border-t border-[color:var(--gold)]/25 pt-4 text-xs text-muted-foreground">
                  <span>By {authorLabel}</span>
                  {resource.readingMinutes && <span>{resource.readingMinutes} min</span>}
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-[color:var(--navy)] transition-colors group-hover:text-transparent group-hover:bg-gold-gradient group-hover:bg-clip-text">
                  View placeholder
                  <ArrowUpRight className="h-4 w-4 text-[color:var(--gold-deep)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}