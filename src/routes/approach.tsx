import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PlaceholderNote } from "@/components/PageHeader";

export const Route = createFileRoute("/approach")({
  head: () => ({
    meta: [
      { title: "Our Approach — Mind, Body & Soul · Nirvana Wellness" },
      {
        name: "description",
        content:
          "How Nirvana Wellness integrates psychological, somatic, and contemplative care into one coherent approach.",
      },
      { property: "og:title", content: "Our Approach — Nirvana Wellness" },
      { property: "og:description", content: "Psychological, somatic, and contemplative care — integrated." },
    ],
  }),
  component: ApproachPage,
});

function ApproachPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Our approach"
        title={<>One person, <span className="italic text-gold-gradient">three doorways.</span></>}
        lede="Mind, Body, and Soul is not a slogan — it is how we organise care so that no part of you is left out of the conversation."
      />
      <PlaceholderNote>
        Full approach content — pillar deep-dives, modalities, therapeutic frameworks, and what a
        first session looks like — arrives in Phase 2.
      </PlaceholderNote>
    </div>
  );
}
