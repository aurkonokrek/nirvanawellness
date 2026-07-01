import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PlaceholderNote } from "@/components/PageHeader";

export const Route = createFileRoute("/experts/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${prettify(params.slug)} · Nirvana Wellness` },
      {
        name: "description",
        content: `Profile, credentials, and booking for ${prettify(params.slug)} at Nirvana Wellness.`,
      },
      { property: "og:title", content: `${prettify(params.slug)} · Nirvana Wellness` },
    ],
  }),
  component: ExpertProfilePage,
});

function prettify(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function ExpertProfilePage() {
  const { slug } = Route.useParams();
  return (
    <div>
      <PageHeader
        eyebrow="Expert"
        title={prettify(slug)}
        lede="Profile, credentials, focus areas, and booking will live here."
      />
      <PlaceholderNote>
        Individual expert template (bio, modalities, availability, booking widget) arrives in Phase 2.
      </PlaceholderNote>
    </div>
  );
}
