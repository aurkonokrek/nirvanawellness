// Tests & Games — titles, types, and themes are final and align with the
// Mind / Body / Soul + 8-dimension framework. The actual question sets and
// game mechanics below are illustrative placeholders — real content will
// replace them without changes to the routing or index structure.

export type TestType = "Test" | "Game";
export type TestTheme = "Mind" | "Mind / Body" | "Communication";

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
    theme: "Mind",
    title: "Stress Check-In",
    dek: "A short screener on your current stress load. Not a diagnosis — a starting point for a conversation with a real clinician.",
    minutes: 3,
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
          "The last two weeks sound manageable. If anything surfaced that you'd like to talk through, a single session can be a useful mirror — not a commitment to ongoing care.",
      },
      {
        min: 4,
        title: "Carrying more than usual",
        reflection:
          "There's real weight showing up. Naming it with someone trained to hold it — even once — often shifts how the next week lands.",
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
    slug: "burnout-signals",
    type: "Test",
    theme: "Mind / Body",
    title: "Burnout Signals",
    dek: "A closer look at early burnout patterns — energy, cynicism, detachment. Not a diagnosis, a nudge to notice what's been building.",
    minutes: 5,
    recommendedExpertSlug: "sumaia-azmi",
    isPlaceholder: true,
    questions: [
      {
        prompt: "How often do you wake up already tired?",
        choices: [
          { label: "Rarely", score: 0 },
          { label: "A few mornings a week", score: 1 },
          { label: "Most mornings", score: 2 },
          { label: "Every morning", score: 3 },
        ],
      },
      {
        prompt: "How connected do you feel to the work or role you're in?",
        choices: [
          { label: "Still meaningful", score: 0 },
          { label: "Going through the motions some days", score: 1 },
          { label: "Detached more often than not", score: 2 },
          { label: "It feels hollow", score: 3 },
        ],
      },
      {
        prompt: "How often are you cynical or short with people you usually care about?",
        choices: [
          { label: "Not really", score: 0 },
          { label: "Sometimes", score: 1 },
          { label: "Frequently", score: 2 },
          { label: "Nearly always", score: 3 },
        ],
      },
      {
        prompt: "What happens in your body at the end of a normal day?",
        choices: [
          { label: "Tired but okay", score: 0 },
          { label: "Tension I can shake off", score: 1 },
          { label: "Tension I carry into the next day", score: 2 },
          { label: "Fully depleted, physically", score: 3 },
        ],
      },
      {
        prompt: "Are you having thoughts of harming yourself, or that you don't want to be here?",
        choices: [
          { label: "No", score: 0 },
          { label: "Occasional passing thoughts", score: 1 },
          CRISIS,
        ],
      },
    ],
    bands: [
      {
        min: 0,
        title: "Not burnout — but worth watching",
        reflection:
          "Signals are mild. Small recalibrations — sleep, boundaries, a single check-in — often keep it from progressing.",
      },
      {
        min: 5,
        title: "Warning lights are on",
        reflection:
          "The pattern points to real strain. Working with someone on both the mind and body sides — talk plus somatic — tends to be more effective than either alone at this stage.",
      },
      {
        min: 9,
        title: "Deep in it",
        reflection:
          "This much depletion doesn't reverse on willpower. A structured stretch of care is often what actually shifts it. A first conversation is a small first step.",
      },
    ],
  },
  {
    slug: "are-you-listening",
    type: "Game",
    theme: "Communication",
    title: "Are You Listening?",
    dek: "A scenario-based exercise on how you actually respond when someone opens up. Not a diagnosis — a mirror for communication patterns.",
    minutes: 4,
    recommendedExpertSlug: "sanjida-afroz",
    isPlaceholder: true,
    questions: [
      {
        prompt:
          "A partner or friend says, \"I had a really hard day.\" What's your first move?",
        choices: [
          { label: "Ask what happened, then listen", score: 0 },
          { label: "Offer a solution to fix the situation", score: 2 },
          { label: "Share a similar story from your own day", score: 1 },
          { label: "Change the subject to lighten the mood", score: 3 },
        ],
      },
      {
        prompt:
          "They keep talking, and it's clear they don't want advice. You notice yourself:",
        choices: [
          { label: "Staying with them, quiet, present", score: 0 },
          { label: "Planning what to say next", score: 2 },
          { label: "Getting slightly impatient", score: 3 },
          { label: "Reflecting back what you heard", score: 0 },
        ],
      },
      {
        prompt: "They start to cry. Your instinct is to:",
        choices: [
          { label: "Sit with them without rushing to soothe", score: 0 },
          { label: "Immediately reassure them it'll be fine", score: 2 },
          { label: "Look for something practical to do", score: 2 },
          { label: "Feel awkward and want to change the topic", score: 3 },
        ],
      },
      {
        prompt: "When the conversation ends, you notice:",
        choices: [
          { label: "They seem lighter than when it started", score: 0 },
          { label: "You gave good advice but they still seem heavy", score: 2 },
          { label: "You're not sure what they actually needed", score: 2 },
          { label: "You feel relief that it's over", score: 3 },
        ],
      },
      {
        prompt:
          "Something they said suggests they might be a danger to themselves. What do you do?",
        choices: [
          { label: "Ask directly and stay with them", score: 0 },
          { label: "I'm not sure — I need support with this", score: 3, crisis: true },
        ],
      },
    ],
    bands: [
      {
        min: 0,
        title: "Present, and it shows",
        reflection:
          "Your instincts skew toward staying with people rather than fixing them. That's the harder part of listening. Small refinements — pacing, silence, reflecting back — are where couples and communication work often go next.",
      },
      {
        min: 4,
        title: "Kind, but reaching for fixes",
        reflection:
          "You care, and it shows up as solutions. That's not wrong — it's just a different skill than listening. A short block of communication-focused work often changes how much heavier conversations land.",
      },
      {
        min: 8,
        title: "Discomfort with hard moments",
        reflection:
          "Hard conversations pull you toward exits — advice, subject changes, relief when it's over. That's very common and very workable. Communication-focused sessions, individually or as a couple, are the direct route.",
      },
    ],
  },
];

export const TEST_TYPES: ("All" | TestType)[] = ["All", "Test", "Game"];
export const TEST_THEMES: ("All" | TestTheme)[] = [
  "All",
  "Mind",
  "Mind / Body",
  "Communication",
];

export function getTest(slug: string) {
  return TESTS.find((t) => t.slug === slug);
}

export function bandForScore(item: TestItem, score: number): ResultBand {
  const sorted = [...item.bands].sort((a, b) => b.min - a.min);
  return sorted.find((b) => score >= b.min) ?? item.bands[0];
}
