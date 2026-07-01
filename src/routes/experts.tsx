import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PlaceholderNote } from "@/components/PageHeader";

export const Route = createFileRoute("/experts")({
  head: () => ({
    meta: [
      { title: "Meet the Experts · Nirvana Wellness" },
      {
        name: "description",
        content:
          "Licensed psychologists, therapists, and somatic practitioners at Nirvana Wellness. Filter by focus area, modality, or language.",
      },
      { property: "og:title", content: "Meet the Experts · Nirvana Wellness" },
      {
        property: "og:description",
        content: "Licensed clinicians for individuals, couples, and teams.",
      },
    ],
  }),
  component: ExpertsPage,
});

function ExpertsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Experts"
        title="The people behind the practice."
        lede="Every clinician here is licensed, actively practicing, and picked for their ability to hold real conversations — not just deliver protocols."
      />
      <PlaceholderNote>
        Filterable directory + individual expert templates (with booking) arrive in Phase 2.
      </PlaceholderNote>
    </div>
  );
}
