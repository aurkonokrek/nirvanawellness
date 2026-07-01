import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PlaceholderNote } from "@/components/PageHeader";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Journal & Creative Creations · Nirvana Wellness" },
      {
        name: "description",
        content:
          "Essays, practices, and creative work from the Nirvana Wellness team — writing on mental health, expat life, and integrated care.",
      },
      { property: "og:title", content: "Journal · Nirvana Wellness" },
      { property: "og:description", content: "Essays, practices, and creative work." },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Journal"
        title="Reading, practices, and creative work."
        lede="Everything here is written or curated by our team. Long-form at launch — audio, video, and downloadable practices coming soon."
      />
      <PlaceholderNote>
        Index (with category filters) and article template with flexible content blocks arrive in Phase 3.
      </PlaceholderNote>
    </div>
  );
}
