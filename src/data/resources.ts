// Resources — Journal articles are real, user-supplied verbatim.
// Creative Creations entries remain clearly labeled placeholders.

export type ContentBlock =
  | { type: "prose"; html: string }
  | { type: "callout"; tone: "quote" | "note"; body: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  // Wired but dormant at launch — real content can add these later without
  // template changes.
  | { type: "audio"; src: string; title: string }
  | { type: "video"; src: string; poster?: string }
  | { type: "download"; href: string; label: string; sizeKb: number };

export type ResourceTrack = "Journal" | "Creative Creations";

export type Resource = {
  slug: string;
  track: ResourceTrack;
  category?: string; // e.g. "Essay", "Practice", "Field notes"
  title: string;
  dek: string;
  readingMinutes?: number;
  authorSlug?: string;
  authorName?: string;
  isPlaceholder?: boolean;
  blocks: ContentBlock[];
};

const placeholderBlocks: ContentBlock[] = [
  {
    type: "callout",
    tone: "note",
    body: "Placeholder entry. Real Creative Creations content will land here — visual, sound, and other creative work from practitioners and collaborators.",
  },
];

export const RESOURCES: Resource[] = [
  {
    slug: "what-talk-therapy-cant-reach",
    track: "Journal",
    category: "Essay",
    title: "What Talk Therapy Can't Reach — and What Can",
    dek: "Some things don't live in language. On why somatic work is not an alternative to talk therapy, but its natural continuation.",
    readingMinutes: 6,
    authorSlug: "sumaia-azmi",
    blocks: [
      {
        type: "prose",
        html: `<p>Talk therapy is extraordinary at what it does — it gives shape to feelings, untangles patterns, and creates a witnessed space for things that have gone unsaid. But some things don't live in language. A tight chest that won't explain itself. A body that flinches before the mind knows why. Grief that sits in the shoulders long after the mind has "processed" it.</p>`,
      },
      {
        type: "prose",
        html: `<p>This is where somatic work — breath, movement, touch-based practices like Reiki — becomes not an alternative to talk therapy, but its natural continuation. The two aren't in competition. A client might spend months in talk therapy building insight, and still need a body-based practice to actually release what the insight named.</p>`,
      },
      {
        type: "prose",
        html: `<p>At Nirvana, we don't ask clients to choose between Mind and Body work. We ask what the moment actually calls for — sometimes that's an hour of careful conversation, sometimes it's twenty minutes of breathwork before either of you says a word.</p>`,
      },
    ],
  },
  {
    slug: "five-minute-practice-hard-week",
    track: "Journal",
    category: "Practice",
    title: "A Five-Minute Practice for the Middle of a Hard Week",
    dek: "A five-minute practice drawn from Heartfulness meditation, adapted for the middle of an ordinary, overwhelmed Tuesday.",
    readingMinutes: 3,
    authorSlug: "stanislas-ll",
    blocks: [
      {
        type: "prose",
        html: `<p>You don't need a retreat or an hour-long session to interrupt a spiraling week. Here's a five-minute practice drawn from Heartfulness meditation, adapted for the middle of an ordinary, overwhelmed Tuesday.</p>`,
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Sit, and let your eyes soften closed. No perfect posture required — just somewhere you won't be interrupted for five minutes.",
          "Bring attention to the center of your chest. Not your breath — your chest, as a physical space.",
          "Imagine a gentle light there, growing softly. Don't force a feeling. Just hold the image lightly.",
          "When your mind wanders — and it will — return to the light, without judgment.",
          "After five minutes, open your eyes slowly. Notice, without analyzing, whether anything shifted.",
        ],
      },
      {
        type: "prose",
        html: `<p>This isn't about achieving a state. It's about giving your nervous system five minutes of a different signal than the one it's been running on all week.</p>`,
      },
    ],
  },
  {
    slug: "notes-on-returning",
    track: "Journal",
    category: "Field notes",
    title: "Notes on Returning: Expats, Homecoming, and Grief",
    dek: "\"I thought coming home would feel like relief. Instead it feels like grief.\" On reverse culture shock and the legitimacy of mourning a chapter.",
    readingMinutes: 8,
    authorSlug: "sanjida-afroz",
    blocks: [
      {
        type: "prose",
        html: `<p>Something we hear often from clients who've lived abroad and returned: "I thought coming home would feel like relief. Instead it feels like grief."</p>`,
      },
      {
        type: "prose",
        html: `<p>This isn't dysfunction — it's a real and under-named experience. Reverse culture shock is often harder than the original move, because no one expects to need support for going home. You've changed. The place has changed. The version of "home" you were homesick for doesn't quite exist anymore, and grieving that is legitimate, even if it looks like ingratitude from the outside.</p>`,
      },
      {
        type: "prose",
        html: `<p>A few things we tell clients navigating this:</p>`,
      },
      {
        type: "list",
        items: [
          "You're allowed to grieve a chapter, not just a place. The friendships, the pace of life, the person you were there — all of it can be mourned without it meaning you regret coming back.",
          "Reintegration has its own timeline, often longer than people expect — sometimes six months to a year before \"home\" feels settled again.",
          "You don't have to perform gratitude. Feeling lost in a place you're supposed to know is disorienting, not ungrateful.",
        ],
      },
      {
        type: "prose",
        html: `<p>If this is where you are right now — recently returned, quietly unmoored — it's a legitimate reason to seek support, not a sign you're overreacting.</p>`,
      },
    ],
  },
  {
    slug: "sample-visual-piece",
    track: "Creative Creations",
    category: "Placeholder",
    title: "Sample visual piece — content pending",
    dek: "Placeholder entry. Creative work by practitioners and collaborators will live here.",
    readingMinutes: 3,
    authorSlug: "aparazita-rahman",
    isPlaceholder: true,
    blocks: placeholderBlocks,
  },
  {
    slug: "sample-sound-piece",
    track: "Creative Creations",
    category: "Placeholder",
    title: "Sample sound piece — content pending",
    dek: "Placeholder entry. Audio and sound work by practitioners and collaborators will live here.",
    readingMinutes: 3,
    authorSlug: "shadin-haque",
    isPlaceholder: true,
    blocks: placeholderBlocks,
  },
];

export function getResource(slug: string) {
  return RESOURCES.find((r) => r.slug === slug);
}

export const RESOURCE_TRACKS: ("All" | ResourceTrack)[] = [
  "All",
  "Journal",
  "Creative Creations",
];
