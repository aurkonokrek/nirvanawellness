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
  duration: string;
  cadence: string;
  lede: string;
  who: string;
  expertSlug?: string;
  retreatSlug?: string;
  // link target: internal /experts/$slug or /retreats/$slug, else /book
};

export const ACTIVITIES: Activity[] = [
  // ---- 1:1 / Couples sessions ----
  {
    slug: "individual-counseling",
    title: "1:1 counseling",
    format: "1:1 / Couples session",
    pillar: "Mind",
    duration: "50 min",
    cadence: "Weekly or fortnightly",
    lede: "Integrative talk therapy with a licensed clinician — matched to your context.",
    who: "Anyone. First sessions are gentle; you don't need to arrive with a diagnosis.",
    expertSlug: "sumaia-azmi",
  },
  {
    slug: "couples-session",
    title: "Couples session",
    format: "1:1 / Couples session",
    pillar: "Mind",
    duration: "75 min",
    cadence: "Weekly or fortnightly",
    lede: "Structured space for two people to say the thing that's been going unsaid.",
    who: "Couples in early friction, long-standing patterns, or a difficult transition.",
    expertSlug: "sanjida-afroz",
  },
  {
    slug: "trauma-online",
    title: "Trauma work — online, English",
    format: "1:1 / Couples session",
    pillar: "Mind",
    duration: "60 min",
    cadence: "Weekly",
    lede: "DBT-led trauma work with a UK-registered consultant psychologist, delivered online worldwide.",
    who: "Adults navigating PTSD, BPD, or the after-effects of humanitarian and crisis contexts.",
    expertSlug: "dr-richard-castle",
  },
  {
    slug: "reiki-energy-session",
    title: "Reiki & energy session",
    format: "1:1 / Couples session",
    pillar: "Body",
    duration: "60 min",
    cadence: "As needed",
    lede: "Reiki, sound, and chakra work for stress held in the body. In person or at distance.",
    who: "People carrying tension, burnout, or emotional fatigue.",
    expertSlug: "shadin-haque",
  },
  {
    slug: "art-therapy-1to1",
    title: "Art therapy · individual",
    format: "1:1 / Couples session",
    pillar: "Soul",
    duration: "75 min",
    cadence: "Weekly or fortnightly",
    lede: "For feelings that don't yet have words. No art background required.",
    who: "Adolescents and adults processing grief, transition, or a story that keeps flattening in speech.",
    expertSlug: "aparazita-rahman",
  },
  {
    slug: "fitness-nutrition-coaching",
    title: "Fitness & nutrition coaching",
    format: "1:1 / Couples session",
    pillar: "Body",
    duration: "45 min",
    cadence: "Weekly",
    lede: "Body-weight training and honest nutrition that fits a real work week.",
    who: "Desk-bound professionals rebuilding a sustainable relationship with their body.",
    expertSlug: "abhijeet-vaishnav",
  },

  // ---- Workshops ----
  {
    slug: "stress-reset-workshop",
    title: "Stress reset — a half-day workshop",
    format: "Workshop",
    pillar: "Mind",
    duration: "3 hrs",
    cadence: "Monthly",
    lede: "Practical tools for the nervous system, in a small group setting.",
    who: "Anyone in a heavy season, or teams looking for a shared reset.",
    expertSlug: "sumaia-azmi",
  },
  {
    slug: "art-therapy-group",
    title: "Art therapy · group",
    format: "Workshop",
    pillar: "Soul",
    duration: "3 hrs",
    cadence: "Monthly",
    lede: "Guided group session working with paint, paper, and quiet.",
    who: "Small groups processing a shared experience or seeking creative space.",
    expertSlug: "aparazita-rahman",
  },
  {
    slug: "couples-communication-lab",
    title: "Couples communication lab",
    format: "Workshop",
    pillar: "Mind",
    duration: "4 hrs",
    cadence: "Quarterly",
    lede: "A half-day for couples to learn — and practise — a shared vocabulary for conflict.",
    who: "Couples in any phase who want to build better tools before they need them.",
    expertSlug: "sanjida-afroz",
  },

  // ---- Courses ----
  {
    slug: "meditation-8-week",
    title: "Heartfulness meditation · 8-week course",
    format: "Course",
    pillar: "Soul",
    duration: "60 min / week",
    cadence: "8 weeks",
    lede: "A structured introduction to Heartfulness practice — from first sit to sustained daily habit.",
    who: "Beginners and returners. No prior meditation experience needed.",
    expertSlug: "stanislas-ll",
  },
  {
    slug: "resilience-6-week",
    title: "Resilience & burnout recovery · 6-week course",
    format: "Course",
    pillar: "Mind",
    duration: "75 min / week",
    cadence: "6 weeks",
    lede: "A small-cohort course for people rebuilding capacity after a long stretch of overload.",
    who: "Adults recovering from burnout, chronic stress, or a hard year.",
    expertSlug: "sumaia-azmi",
  },
  {
    slug: "fitness-foundations-4-week",
    title: "Fitness foundations · 4-week course",
    format: "Course",
    pillar: "Body",
    duration: "45 min · 3× / week",
    cadence: "4 weeks",
    lede: "Body-weight movement, recovery basics, and a nutrition framework you can keep.",
    who: "Returning to movement after a long pause, or starting for the first time.",
    expertSlug: "abhijeet-vaishnav",
  },

  // ---- Retreats (link through to /retreats) ----
  {
    slug: "team-reset-retreat",
    title: "Team Reset · 2-day off-site",
    format: "Retreat",
    pillar: "Body",
    duration: "2 days",
    cadence: "Booked per team",
    lede: "A calm reset for teams who've been running hard for too long.",
    who: "Small and mid-sized teams (8–30 people).",
    retreatSlug: "team-reset",
  },
  {
    slug: "leadership-retreat",
    title: "Leadership retreat · 3-day",
    format: "Retreat",
    pillar: "Mind",
    duration: "3 days",
    cadence: "Booked per team",
    lede: "For leadership groups working through strategy and the human load underneath it.",
    who: "Founder groups, exec teams, and leadership cohorts.",
    retreatSlug: "leadership-off-site",
  },

  // ---- Corporate ----
  {
    slug: "confidential-1to1-access",
    title: "Confidential 1:1 access · organisation-wide",
    format: "Corporate",
    pillar: "Mind",
    duration: "Ongoing",
    cadence: "Per-employee",
    lede: "Every employee gets private access to a matched clinician, with usage anonymised for the employer.",
    who: "Organisations 50–500+, in any sector.",
  },
  {
    slug: "manager-training",
    title: "Manager training · psychological safety",
    format: "Corporate",
    pillar: "Mind",
    duration: "Half-day or full-day",
    cadence: "Booked per cohort",
    lede: "For managers who want to hold better one-to-ones and spot the signs earlier.",
    who: "People-manager cohorts of 8–20.",
  },
  {
    slug: "corporate-mindfulness",
    title: "Corporate mindfulness program",
    format: "Corporate",
    pillar: "Soul",
    duration: "8 weeks",
    cadence: "Weekly session",
    lede: "A structured meditation program embedded into the working week.",
    who: "Teams and full organisations.",
    expertSlug: "stanislas-ll",
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
