import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PlaceholderNote } from "@/components/PageHeader";

export const Route = createFileRoute("/resources/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${prettify(params.slug)} · Journal · Nirvana Wellness` },
      {
        name: "description",
        content: `${prettify(params.slug)} — writing and practice from the Nirvana Wellness team.`,
      },
      { property: "og:title", content: `${prettify(params.slug)} · Nirvana Wellness` },
    ],
  }),
  component: ResourceArticlePage,
});

function prettify(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Flexible content-block shape (Phase 3 will feed real data through this).
export type ContentBlock =
  | { type: "prose"; html: string }
  | { type: "audio"; src: string; title: string }
  | { type: "video"; src: string; poster?: string }
  | { type: "download"; href: string; label: string; sizeKb: number }
  | { type: "callout"; tone: "quote" | "note"; body: string };

function ResourceArticlePage() {
  const { slug } = Route.useParams();
  return (
    <div>
      <PageHeader eyebrow="Journal" title={prettify(slug)} />
      <PlaceholderNote>
        Flexible content-block renderer (prose · audio · video · download · callout) ships in Phase 3.
        Prose-only at launch; the other block types render but stay dormant until content exists.
      </PlaceholderNote>
    </div>
  );
}
