// PLACEHOLDER CATALOG — not real Nirvana offerings.
// The live site does not currently publish structured bookable programs, so
// this file exists only to keep the /activities route and 5-filter set wired
// up. Every entry below is clearly labeled as a sample. Do not publish this
// data as real offerings. Replace with verified programs when available.

export type ActivityFormat =
  | "1:1 / Couples session"
  | "Workshop"
  | "Course"
  | "Retreat"
  | "Corporate";

export type Activity = {
  slug: string;
  title: string;
  format: ActivityFormat;
  pillar: "Mind" | "Body" | "Soul";
  lede: string;
  expertSlug?: string;
  retreatSlug?: string;
};

export const ACTIVITIES: Activity[] = [
  {
    slug: "sample-1to1",
    title: "Sample 1:1 session — content pending",
    format: "1:1 / Couples session",
    pillar: "Mind",
    lede: "Placeholder entry. Real session details will be published once confirmed.",
  },
  {
    slug: "sample-workshop",
    title: "Sample workshop — content pending",
    format: "Workshop",
    pillar: "Mind",
    lede: "Placeholder entry. Real workshop details will be published once confirmed.",
  },
  {
    slug: "sample-course",
    title: "Sample course — content pending",
    format: "Course",
    pillar: "Soul",
    lede: "Placeholder entry. Real course details will be published once confirmed.",
  },
  {
    slug: "sample-retreat",
    title: "Sample retreat — content pending",
    format: "Retreat",
    pillar: "Body",
    lede: "Placeholder entry. Retreat detail pages are being built in Phase 3.",
  },
  {
    slug: "sample-corporate",
    title: "Sample corporate program — content pending",
    format: "Corporate",
    pillar: "Mind",
    lede: "Placeholder entry. Real corporate program details will be published once confirmed.",
  },
];

export const ACTIVITY_FILTERS = [
  "All",
  "1:1 / Couples session",
  "Workshop",
  "Course",
  "Retreat",
  "Corporate",
] as const;
