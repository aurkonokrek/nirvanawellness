// PLACEHOLDER JOURNAL ENTRIES — not real published articles.
// We don't yet have verified long-form content. These entries exist to
// build the /resources index (The Journal + Creative Creations tracks)
// and the /resources/$slug flexible content-block template. Everything
// below is clearly labeled illustrative — do not publish as real
// editorial. Replace with real articles when ready.

export type ContentBlock =
  | { type: "prose"; html: string }
  | { type: "callout"; tone: "quote" | "note"; body: string }
  // The following block types are wired into the renderer but not used at
  // launch. They exist so future articles can add audio/video/downloads
  // without touching the template.
  | { type: "audio"; src: string; title: string }
  | { type: "video"; src: string; poster?: string }
  | { type: "download"; href: string; label: string; sizeKb: number };

export type ResourceTrack = "Journal" | "Creative Creations";

export type Resource = {
  slug: string;
  track: ResourceTrack;
  title: string;
  dek: string;
  readingMinutes?: number;
  authorSlug?: string; // maps to /experts/$slug when the author is a practitioner
  authorName?: string; // used only when there is no matching expert
  blocks: ContentBlock[];
};

const placeholderProse: ContentBlock[] = [
  {
    type: "callout",
    tone: "note",
    body: "Illustrative placeholder. This is not real editorial. The article template exists so real writing can drop in without rework.",
  },
  {
    type: "prose",
    html: `<p>Placeholder prose. This paragraph exists so the reading typography, measure, and rhythm can be reviewed at approximately the length of a real short essay.</p>`,
  },
  {
    type: "prose",
    html: `<p>Placeholder prose. When real content lands, prose blocks will carry the essay body, and the callout, audio, video, and download block types will layer in only where they belong. Nothing on this page describes a real published piece.</p>`,
  },
];

export const RESOURCES: Resource[] = [
  {
    slug: "sample-journal-note",
    track: "Journal",
    title: "Sample journal note — content pending",
    dek: "Placeholder entry. Real essays and practice notes will be published here.",
    readingMinutes: 4,
    authorSlug: "sumaia-azmi",
    blocks: placeholderProse,
  },
  {
    slug: "sample-clinical-reflection",
    track: "Journal",
    title: "Sample clinical reflection — content pending",
    dek: "Placeholder entry. Real reflection pieces from our clinicians will live here.",
    readingMinutes: 6,
    authorSlug: "dr-richard-castle",
    blocks: placeholderProse,
  },
  {
    slug: "sample-practice-guide",
    track: "Journal",
    title: "Sample practice guide — content pending",
    dek: "Placeholder entry. Practice guides and how-to pieces will live here.",
    readingMinutes: 5,
    authorSlug: "stanislas-ll",
    blocks: placeholderProse,
  },
  {
    slug: "sample-visual-piece",
    track: "Creative Creations",
    title: "Sample visual piece — content pending",
    dek: "Placeholder entry. Creative work by practitioners and collaborators will live here.",
    readingMinutes: 3,
    authorSlug: "aparazita-rahman",
    blocks: placeholderProse,
  },
  {
    slug: "sample-sound-piece",
    track: "Creative Creations",
    title: "Sample sound piece — content pending",
    dek: "Placeholder entry. Audio and sound work by practitioners and collaborators will live here.",
    readingMinutes: 3,
    authorSlug: "shadin-haque",
    blocks: placeholderProse,
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
