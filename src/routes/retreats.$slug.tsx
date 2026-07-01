import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PlaceholderNote } from "@/components/PageHeader";

export const Route = createFileRoute("/retreats/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${prettify(params.slug)} · Retreat · Nirvana Wellness` },
      {
        name: "description",
        content: `Program details for the ${prettify(params.slug)} corporate retreat by Nirvana Wellness.`,
      },
      { property: "og:title", content: `${prettify(params.slug)} · Retreat · Nirvana Wellness` },
    ],
  }),
  component: RetreatDetailPage,
});

function prettify(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function RetreatDetailPage() {
  const { slug } = Route.useParams();
  return (
    <div>
      <PageHeader
        eyebrow="Retreat"
        title={prettify(slug)}
        lede="Itinerary, facilitators, and inquiry CTA (corporate framing) will live here."
      />
      <PlaceholderNote>Detail template arrives in Phase 3 with a corporate inquiry CTA.</PlaceholderNote>
    </div>
  );
}
