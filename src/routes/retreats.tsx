import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PlaceholderNote } from "@/components/PageHeader";

export const Route = createFileRoute("/retreats")({
  head: () => ({
    meta: [
      { title: "Retreats for Teams · Nirvana Wellness" },
      {
        name: "description",
        content:
          "Two- and three-day off-site wellbeing retreats designed and delivered for organisations, end-to-end.",
      },
      { property: "og:title", content: "Retreats for Teams · Nirvana Wellness" },
      { property: "og:description", content: "Designed and delivered end-to-end for teams." },
    ],
  }),
  component: RetreatsPage,
});

function RetreatsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Retreats"
        title={<>Take your team <span className="italic text-gold-gradient">somewhere quieter.</span></>}
        lede="At launch, our retreats are built for organisations. Individual retreats will follow when the format is ready — join the list from any inquiry form."
      />
      <PlaceholderNote>
        Retreat programs, itineraries, pricing framework, and inquiry CTA arrive in Phase 3.
      </PlaceholderNote>
    </div>
  );
}
