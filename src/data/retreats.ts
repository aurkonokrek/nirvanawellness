// Retreats — real content where provided, illustrative placeholders elsewhere.
// "Team Reset · 2-Day Off-Site" is verbatim from user-supplied copy.
// Additional entries (e.g. Leadership Retreat · 3-Day) remain clearly
// labeled placeholders until real content is provided.

export type RetreatDay = {
  label: string;
  title: string;
  items: string[];
};

export type Retreat = {
  slug: string;
  title: string;
  tagline: string;
  isPlaceholder?: boolean;
  overview: string[];
  whoItsFor: string[];
  logistics: {
    duration: string;
    location: string;
    format: string;
    included: string[];
  };
  itinerary: RetreatDay[];
  facilitatorSlugs: string[];
  facilitatorsNote?: string;
};

export const RETREATS: Retreat[] = [
  {
    slug: "team-reset-2-day",
    title: "Team Reset · 2-Day Off-Site",
    tagline:
      "A structured pause for teams that have been running hard for too long.",
    overview: [
      "A structured pause for teams that have been running hard for too long. Two days away from the office — not to \"team-build\" in the icebreaker sense, but to actually rest, reconnect, and name what's been going unsaid. Held at a quiet property outside Dhaka, small enough that every participant is seen.",
    ],
    whoItsFor: [
      "Teams of 8–30 who've been through a hard stretch — a heavy project cycle, a reorg, sustained overtime — and need a genuine reset rather than another agenda-packed offsite.",
    ],
    logistics: {
      duration: "2 days",
      location: "Quiet property outside Dhaka",
      format: "Residential, small cohort (8–30)",
      included: [
        "Accommodation",
        "Meals",
        "All facilitated sessions",
        "A Nirvana clinician on-site throughout",
      ],
    },
    itinerary: [
      {
        label: "Day 1",
        title: "Arrival & unwind",
        items: [
          "Afternoon arrival, no agenda",
          "Evening: guided group reflection session (facilitated by a Nirvana clinician) on where the team actually is right now",
        ],
      },
      {
        label: "Day 2",
        title: "Reset & return",
        items: [
          "Morning movement / breathwork session",
          "Midday: structured but informal conversation on what \"good\" looks like going forward",
          "Afternoon: closing circle, departure",
        ],
      },
    ],
    facilitatorSlugs: ["sumaia-azmi"],
    facilitatorsNote:
      "Led by a Nirvana clinician matched to your team's context — often Sumaia Azmi or another Mind-focused practitioner from our team.",
  },
  {
    slug: "leadership-off-site-3-day",
    title: "Leadership Retreat · 3-Day",
    tagline:
      "Placeholder entry — real program content pending.",
    isPlaceholder: true,
    overview: [
      "Placeholder overview. A 3-day leadership retreat will live here once real program content is provided. Nothing on this page describes a specific bookable offering yet.",
    ],
    whoItsFor: [
      "Placeholder — real fit criteria will be published once content is provided.",
    ],
    logistics: {
      duration: "Illustrative — typically 3 days",
      location: "Illustrative — off-site venue selected with you",
      format: "Illustrative — residential, small cohort",
      included: ["Placeholder — real inclusions pending"],
    },
    itinerary: [
      {
        label: "Day 1",
        title: "Placeholder",
        items: ["Illustrative — real itinerary pending"],
      },
      {
        label: "Day 2",
        title: "Placeholder",
        items: ["Illustrative — real itinerary pending"],
      },
      {
        label: "Day 3",
        title: "Placeholder",
        items: ["Illustrative — real itinerary pending"],
      },
    ],
    facilitatorSlugs: [],
  },
];

export function getRetreat(slug: string) {
  return RETREATS.find((r) => r.slug === slug);
}
