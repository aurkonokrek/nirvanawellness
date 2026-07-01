// Tests & Games — sample content, clearly illustrative.
// Question sets and game concepts aren't finalized yet; these three exist so the
// index + detail routing scales without rework when real content lands.

export type TestType = "Test" | "Game";
export type TestTheme =
  | "Stress & burnout"
  | "Sleep"
  | "Relationships"
  | "Grounding";

export type Choice = {
  label: string;
  /** Reflective score contribution. Not a diagnosis. */
  score: number;
  /** If true, answer indicates possible crisis — interrupts flow. */
  crisis?: boolean;
};

export type Question = {
  prompt: string;
  choices: Choice[];
};

export type ResultBand = {
  /** Inclusive lower bound on total score. */
  min: number;
  title: string;
  /** Reflective prompt only — never diagnosis or clinical label. */
  reflection: string;
};

export type TestItem = {
  slug: string;
  type: TestType;
  theme: TestTheme;
  title: string;
  dek: string;
  minutes: number;
  /** Optional expert specialty to cross-link at the end. */
  recommendedExpertSlug?: string;
  isPlaceholder: true;
  questions: Question[];
  bands: ResultBand[];
};

const CRISIS = {
  label: "Yes — often, and it feels heavy to carry",
  score: 3,
  crisis: true as const,
};

export const TESTS: TestItem[] = [
  {
    slug: "stress-check-in",
    type: "Test",
    theme: "Stress & burnout",
    title: "A five-minute stress check-in",
    dek: "A short reflection on how the last two weeks have actually felt — not a diagnosis, a starting point.",
    minutes: 5,
    recommendedExpertSlug: "sumaia-azmi",
    isPlaceholder: true,
    questions: [
      {
        prompt: "In the last two weeks, how often have you felt on edge or unable to switch off?",
        choices: [
          { label: "Rarely", score: 0 },
          { label: "A few days", score: 1 },
          { label: "More than half the days", score: 2 },
          { label: "Nearly every day", score: 3 },
        ],
      },
      {
        prompt: "How often have small things felt disproportionately hard?",
        choices: [
          { label: "Not really", score: 0 },
          { label: "Occasionally", score: 1 },
          { label: "Often", score: 2 },
          { label: "Most days", score: 3 },
        ],
      },
      {
        prompt: "How is your sleep landing lately?",
        choices: [
          { label: "Mostly restorative", score: 0 },
          { label: "Uneven but okay", score: 1 },
          { label: "Frequently disrupted", score: 2 },
          { label: "Barely sleeping", score: 3 },
        ],
      },
      {
        prompt: "Do you have thoughts of harming yourself, or feel like you don't want to be here?",
        choices: [
          { label: "No, not at all", score: 0 },
          { label: "Passing thoughts, not persistent", score: 1 },
          CRISIS,
        ],
      },
    ],
    bands: [
      {
        min: 0,
        title: "Steady, with edges",
        reflection:
          "The last two weeks sound manageable. If anything from the questions surfaced something you'd like to talk through, a single session can be a useful mirror — not a commitment to ongoing care.",
      },
      {
        min: 4,
        title: "Carrying more than usual",
        reflection:
          "There's a real weight showing up. Naming it with someone trained to hold it — even once — often shifts how the next week lands.",
      },
      {
        min: 7,
        title: "Running on reserves",
        reflection:
          "It sounds like a lot has been stacking up. This is exactly the moment care exists for. A first conversation doesn't have to be a big step; it's just a start.",
      },
    ],
  },
  {
    slug: "sleep-signals",
    type: "Test",
    theme: "Sleep",
    title: "Sleep signals — what your nights are telling you",
    dek: "A short reflection on the shape of your sleep — not a diagnosis, a nudge to notice patterns.",
    minutes: 4,
    recommendedExpertSlug: "stanislas-ll",
    isPlaceholder: true,
    questions: [
      {
        prompt: "How long does it usually take you to fall asleep?",
        choices: [
          { label: "Under 20 minutes", score: 0 },
          { label: "20–45 minutes", score: 1 },
          { label: "Often over an hour", score: 2 },
        ],
      },
      {
        prompt: "Do you wake in the night and struggle to return to sleep?",
        choices: [
          { label: "Rarely", score: 0 },
          { label: "A few nights a week", score: 1 },
          { label: "Most nights", score: 2 },
        ],
      },
      {
        prompt: "How do you feel on waking?",
        choices: [
          { label: "Reasonably rested", score: 0 },
          { label: "Groggy but functional", score: 1 },
          { label: "Exhausted before the day starts", score: 2 },
        ],
      },
      {
        prompt: "Are you using anything to sleep (medication, alcohol) more often than you'd like?",
        choices: [
          { label: "No", score: 0 },
          { label: "Occasionally", score: 1 },
          { label: "Regularly, and it worries me", score: 3, crisis: true },
        ],
      },
    ],
    bands: [
      {
        min: 0,
        title: "Mostly restorative",
        reflection:
          "Your nights sound relatively steady. If a specific pattern keeps recurring, a single sleep-focused conversation is often enough to name it.",
      },
      {
        min: 3,
        title: "Interrupted",
        reflection:
          "Sleep is doing some of the work, but not enough. A body-based practice or a short block of focused sessions is often where this softens.",
      },
      {
        min: 6,
        title: "Depleting",
        reflection:
          "This much disruption compounds. Care that includes the body — breath, somatics — alongside conversation tends to move this fastest.",
      },
    ],
  },
  {
    slug: "grounding-game",
    type: "Game",
    theme: "Grounding",
    title: "A grounding game for the middle of a hard moment",
    dek: "A guided five-step sequence borrowed from somatic practice. Not a diagnosis — a pocket tool.",
    minutes: 3,
    recommendedExpertSlug: "sanjida-afroz",
    isPlaceholder: true,
    questions: [
      {
        prompt: "Name five things you can see right now.",
        choices: [
          { label: "Done — moving on", score: 0 },
          { label: "Skip this step", score: 0 },
        ],
      },
      {
        prompt: "Name four things you can physically feel — the chair, your feet, fabric.",
        choices: [
          { label: "Done", score: 0 },
          { label: "Skip", score: 0 },
        ],
      },
      {
        prompt: "Name three things you can hear.",
        choices: [
          { label: "Done", score: 0 },
          { label: "Skip", score: 0 },
        ],
      },
      {
        prompt: "Name two things you can smell — or two smells you like.",
        choices: [
          { label: "Done", score: 0 },
          { label: "Skip", score: 0 },
        ],
      },
      {
        prompt: "Name one thing you can taste — or one taste you'd like right now.",
        choices: [
          { label: "Done", score: 0 },
          { label: "Skip", score: 0 },
        ],
      },
      {
        prompt: "Right now, in this moment, are you safe?",
        choices: [
          { label: "Yes", score: 0 },
          { label: "I'm not sure — I need support", score: 3, crisis: true },
        ],
      },
    ],
    bands: [
      {
        min: 0,
        title: "You made it through the sequence.",
        reflection:
          "Grounding practices are small on their own and cumulative over time. If moments like this are recurring, working with a practitioner on a wider toolkit is often the next step.",
      },
    ],
  },
];

export const TEST_TYPES: ("All" | TestType)[] = ["All", "Test", "Game"];
export const TEST_THEMES: ("All" | TestTheme)[] = [
  "All",
  "Stress & burnout",
  "Sleep",
  "Relationships",
  "Grounding",
];

export function getTest(slug: string) {
  return TESTS.find((t) => t.slug === slug);
}

export function bandForScore(item: TestItem, score: number): ResultBand {
  const sorted = [...item.bands].sort((a, b) => b.min - a.min);
  return sorted.find((b) => score >= b.min) ?? item.bands[0];
}
