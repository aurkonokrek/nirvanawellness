// PLACEHOLDER RETREATS — not real Nirvana programs.
// We don't yet have verified retreat itineraries, dates, pricing, or
// locations. These entries exist to build out the /retreats index and
// /retreats/$slug detail template with the correct information
// architecture. Every specific field below is illustrative — do not
// publish as a real offering. Replace with verified content when ready.

export type RetreatDay = {
  label: string; // e.g. "Day 1"
  title: string;
  items: string[]; // bullet-style illustrative agenda
};

export type Retreat = {
  slug: string;
  title: string;
  tagline: string; // one-line
  overview: string[]; // paragraphs
  whoItsFor: string[]; // bullets — always corporate/team framing at launch
  logistics: {
    duration: string; // e.g. "2–3 days"
    location: string; // e.g. "Off-site — location tailored to your team"
    format: string; // e.g. "Fully residential"
    included: string[]; // bullets
  };
  itinerary: RetreatDay[];
  facilitatorSlugs: string[]; // cross-link to /experts/$slug
};

export const RETREATS: Retreat[] = [
  {
    slug: "sample-team-reset",
    title: "Sample retreat — team reset",
    tagline:
      "Illustrative program shape. Real retreats are designed to your team's specific context.",
    overview: [
      "Placeholder overview. This template shows how a corporate retreat page will be structured — a short prose introduction to the intent of the program, without pretending to describe a specific bookable offering.",
      "Real retreats are scoped in a discovery call. Duration, location, format, and facilitators are chosen from that conversation, not selected off a fixed menu.",
    ],
    whoItsFor: [
      "Leadership teams navigating a period of change or reset",
      "Cross-functional groups where trust and communication need rebuilding",
      "Teams whose people have quietly been running on empty for too long",
    ],
    logistics: {
      duration: "Illustrative — typically 2 or 3 days",
      location: "Illustrative — off-site venue selected with you",
      format: "Illustrative — residential, fully facilitated end-to-end",
      included: [
        "Program design and end-to-end facilitation",
        "Venue coordination and on-site logistics",
        "Pre-retreat context calls with team leads",
        "Post-retreat integration touchpoint",
      ],
    },
    itinerary: [
      {
        label: "Day 1",
        title: "Arrival & landing",
        items: [
          "Illustrative — opening circle and intent-setting",
          "Illustrative — first facilitated session",
          "Illustrative — shared dinner, unstructured evening",
        ],
      },
      {
        label: "Day 2",
        title: "Core work",
        items: [
          "Illustrative — morning practice (movement / meditation)",
          "Illustrative — deeper facilitated block",
          "Illustrative — afternoon rest and pair work",
        ],
      },
      {
        label: "Day 3",
        title: "Integration & close",
        items: [
          "Illustrative — team-level integration session",
          "Illustrative — commitments to carry back",
          "Illustrative — closing circle",
        ],
      },
    ],
    facilitatorSlugs: ["sumaia-azmi", "stanislas-ll"],
  },
  {
    slug: "sample-leadership-off-site",
    title: "Sample retreat — leadership off-site",
    tagline:
      "Illustrative program shape for senior leadership groups. Real details set with you.",
    overview: [
      "Placeholder overview. This template shows how a leadership-focused off-site would be structured on the site — quieter, smaller cohort, more one-to-one time with facilitators.",
      "Real programs are shaped in a discovery call. Nothing on this page is a fixed offering.",
    ],
    whoItsFor: [
      "Founders, C-level, and senior leadership groups",
      "Boards or partnership groups holding significant shared load",
    ],
    logistics: {
      duration: "Illustrative — typically 2 days",
      location: "Illustrative — quiet off-site venue",
      format: "Illustrative — residential, small cohort",
      included: [
        "Program design and facilitation",
        "Optional 1:1 sessions with facilitators during the retreat",
        "Pre-retreat individual intake calls",
      ],
    },
    itinerary: [
      {
        label: "Day 1",
        title: "Arrival & individual work",
        items: [
          "Illustrative — arrival, individual check-ins",
          "Illustrative — opening facilitated session",
        ],
      },
      {
        label: "Day 2",
        title: "Collective work & close",
        items: [
          "Illustrative — group facilitation on shared themes",
          "Illustrative — commitments and close",
        ],
      },
    ],
    facilitatorSlugs: ["dr-richard-castle", "sumaia-azmi"],
  },
];

export function getRetreat(slug: string) {
  return RETREATS.find((r) => r.slug === slug);
}
