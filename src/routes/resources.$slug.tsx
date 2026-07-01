import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExpertCard } from "@/components/ExpertCard";
import { getResource, type ContentBlock } from "@/data/resources";
import { getExpert } from "@/data/experts";

export const Route = createFileRoute("/resources/$slug")({
  loader: ({ params }) => {
    const resource = getResource(params.slug);
    if (!resource) throw notFound();
    return { resource };
  },
  head: ({ loaderData }) => {
    const r = loaderData?.resource;
    const title = r ? `${r.title} · Journal · Nirvana Wellness` : "Journal · Nirvana Wellness";
    const description = r ? r.dek : "Writing and practice from the Nirvana Wellness team.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ResourceArticlePage,
});

function ResourceArticlePage() {
  const { resource } = Route.useLoaderData() as {
    resource: import("@/data/resources").Resource;
  };
  const author = resource.authorSlug ? getExpert(resource.authorSlug) : null;

  return (
    <div>
      {/* Article header */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 pb-14 pt-24 lg:pt-32">
          <p className="font-eyebrow text-[color:var(--gold-deep)]">
            {resource.track} · Illustrative
          </p>
          <h1 className="mt-5 font-display text-4xl leading-[1.1] md:text-5xl">
            {resource.title}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">{resource.dek}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>
              By{" "}
              {author ? (
                <Link
                  to="/experts/$slug"
                  params={{ slug: author.slug }}
                  className="text-[color:var(--navy)] underline underline-offset-4 hover:text-[color:var(--gold-deep)]"
                >
                  {author.name}
                </Link>
              ) : (
                resource.authorName ?? "Nirvana Wellness"
              )}
            </span>
            {resource.readingMinutes && <span>· {resource.readingMinutes} min read</span>}
          </div>
        </div>
      </section>

      {/* Body */}
      <article className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
        <div className="space-y-8">
          {resource.blocks.map((b, i) => (
            <BlockRenderer key={i} block={b} />
          ))}
        </div>
      </article>

      {/* Author card — cross-links to /experts/$slug when the author is a practitioner */}
      {author && (
        <section className="border-t border-border bg-[color:var(--sand)]/30">
          <div className="mx-auto max-w-4xl px-6 py-16 lg:py-20">
            <p className="font-eyebrow text-muted-foreground">About the author</p>
            <div className="mt-6 max-w-sm">
              <ExpertCard expert={author} variant="compact" eyebrow="Author" />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Flexible content-block renderer.
 * Prose + callout are used at launch. Audio / video / download block
 * types are wired but dormant — they render when content lands, without
 * template changes.
 */
function BlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "prose":
      return (
        <div
          className="font-sans text-[17px] leading-[1.75] text-foreground/85 [&_a]:text-[color:var(--gold-deep)] [&_a]:underline [&_a]:underline-offset-4"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      );
    case "callout":
      return (
        <aside
          className={
            block.tone === "quote"
              ? "border-l-2 border-[color:var(--gold)] pl-6 font-display text-2xl italic text-[color:var(--navy)]"
              : "rounded-md border border-[color:var(--gold-deep)]/30 bg-[color:var(--gold-soft)]/15 px-5 py-4 text-sm text-foreground/80"
          }
        >
          {block.body}
        </aside>
      );
    case "audio":
      return (
        <figure className="border border-[color:var(--gold)]/30 p-4">
          <figcaption className="mb-3 font-eyebrow text-[10px] tracking-[0.22em] text-[color:var(--gold-deep)]">
            Audio · {block.title}
          </figcaption>
          <audio controls src={block.src} className="w-full" />
        </figure>
      );
    case "video":
      return (
        <figure className="border border-[color:var(--gold)]/30 p-2">
          <video controls src={block.src} poster={block.poster} className="w-full" />
        </figure>
      );
    case "download":
      return (
        <a
          href={block.href}
          className="flex items-center justify-between border border-[color:var(--gold)]/30 px-5 py-4 text-sm text-[color:var(--navy)] transition-colors hover:border-[color:var(--gold-deep)]"
        >
          <span>{block.label}</span>
          <span className="text-xs text-muted-foreground">
            {(block.sizeKb / 1024).toFixed(1)} MB · download
          </span>
        </a>
      );
  }
}
