import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PlaceholderNote } from "@/components/PageHeader";

export const Route = createFileRoute("/corporate")({
  head: () => ({
    meta: [
      { title: "Corporate Wellbeing Programs · Nirvana Wellness" },
      {
        name: "description",
        content:
          "Mental-health and wellbeing programs for organisations — confidential 1:1 access, workshops, manager training, and off-site retreats.",
      },
      { property: "og:title", content: "Corporate Wellbeing · Nirvana Wellness" },
      {
        property: "og:description",
        content: "Programs your people will actually use.",
      },
    ],
  }),
  component: CorporatePage,
});

function CorporatePage() {
  return (
    <div>
      <PageHeader
        eyebrow="For teams"
        title="Wellbeing programs that don't feel corporate."
        lede="We build long-term mental-health infrastructure for organisations — confidential access, workshops, and off-sites — designed for real use, not just compliance."
      />
      <PlaceholderNote>
        Program tiers, case snapshots, and inquiry form arrive in Phase 2.
      </PlaceholderNote>
    </div>
  );
}
