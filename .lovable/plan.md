
# Nirvana Wellness — Redesign Plan (Locked, ready for Phase 1)

## Locked design system

**Palette — navy + gold + warm neutrals only (no teal)**
- Base navy: `#0B1B3A`
- Elevated surface: `#132550`
- Gold gradient: `#B8862E → #D4A94A → #E8C878` (brand mark, headline accents, primary CTA fill)
- Warm neutrals: `#F5F1EA` (light bg), `#D9D2C4` (chip border / meta on navy), `#8A8272` (muted meta)
- All colors defined as semantic tokens in `src/styles.css` via `oklch`. Components consume tokens only.

**Typography**
- Display: *Fraunces* (serif)
- Body/UI: *Inter*
- Eyebrow/tagline: *Josefin Sans* (uppercase, tracked)
- Installed via `@fontsource/*` and imported from `src/main.tsx` (or the project's client entry).

**Functional UI rules**
- Filter chips: unselected = transparent + warm-neutral border/text; selected = gold-gradient fill on navy text.
- Tags/meta: warm-neutral text on faint navy-elevated background.
- Mind/Body/Soul differentiated by typographic weight and gold numerals (I, II, III) at varying opacity — never by color.
- Gold reserved for brand mark, headline accents, and primary CTAs only.

## Locked product decisions

1. **Retreats — corporate-only at launch.** `/retreats` and `/retreats/$slug` speak to HR buyers. Single CTA ("Inquire for your team") routing into the same inquiry flow as `/corporate`. Individual retreats deferred.
2. **Creative Creations — flexible content-blocks template, prose-only at launch.** `/resources/$slug` renders a `contentBlocks` array via a block switch. Audio player, video wrapper, and download card components are built but unused until real content ships. No refactor needed later to unlock rich media.
3. **"Get matched" routing — deferred to Phase 4.** No UI impact. Form ships visually complete and non-submitting.
4. **Timezone auto-detect — in Phase 1 booking scaffold.** `Intl.DateTimeFormat().resolvedOptions().timeZone`, editable via a select, with a "Detected: {tz} — change" affordance.
5. **Sumaia Azmi homepage band — founder/mission framing, not a bookable-expert card.** Portrait + founder note + link to her `/experts/$slug` where booking lives. No inline "Book with Sumaia" CTA on the home band.
6. **`/activities` filter set — five options:** `1:1 / Couples session`, `Workshop`, `Course`, `Retreat`, `Corporate`. Expert Session booking is a first-class activity, not an orphan.
7. **Single `/book` entry point.** Three paths inside one route: `Book a session`, `Corporate inquiry`, `General contact`. Expat reassurance is a section inside `/book`, not a standalone page. No separate `/contact` route.

## Information architecture

```text
/                    Home (8 bands, founder framing for Sumaia band)
/approach            Mind / Body / Soul framework
/experts             Directory (filterable)
/experts/$slug       Individual expert profile (booking lives here)
/activities          Sessions, workshops, courses, retreats, corporate (5-filter)
/retreats            Corporate retreats index
/retreats/$slug      Individual retreat detail (corporate CTA)
/corporate           B2B programs overview + inquiry entry point
/resources           Journal + Creative Creations index
/resources/$slug     Article template (flexible content blocks)
/book                Unified entry: session / corporate inquiry / general contact + expat reassurance section
```

Every route defines its own `head()` with route-specific `title`, `description`, `og:title`, `og:description`. `og:image` only on leaf routes with a real hero.

## Home composition (8 bands)

1. Hero — atmospheric imagery, serif headline, single primary CTA.
2. Mind / Body / Soul triad — gold numerals I/II/III, weight-differentiated.
3. **Founder band** — Sumaia Azmi portrait + founder/mission note + link to her expert profile (booking lives there, not here).
4. Corporate wellness band.
5. Expat reassurance strip.
6. Retreats preview (corporate framing).
7. Journal preview (3 latest resources).
8. Closing + footer sitemap.

## Build sequence

**Phase 1 (this approval)**
- Install `@fontsource/fraunces`, `@fontsource/inter`, `@fontsource/josefin-sans`; import in client entry.
- Author `src/styles.css` tokens (navy, gold gradient, warm neutrals, semantic aliases). No teal tokens.
- Update `src/routes/__root.tsx`: real site-wide `head()` (title, description, og, twitter), header/nav, footer shell — preserve `<Outlet />`.
- Build `/` home with all 8 bands, founder framing on the Sumaia band, generated imagery via `imagegen`.
- Stub every route in the IA above with correct `createFileRoute` path + route-specific `head()` + minimal placeholder body.
- Build `/book` scaffold: three-path selector (session / corporate inquiry / general contact), timezone auto-detect on the session path, expat reassurance section, non-submitting.

**Phase 2**
- Flesh out `/approach`, `/corporate`, `/experts` directory + `/experts/$slug` template (booking widget lives here), `/activities` with the 5-filter set.

**Phase 3**
- Flesh out `/retreats` + `/retreats/$slug` (corporate CTA), `/resources` index + `/resources/$slug` flexible-block template (prose-only content at launch).

**Phase 4 (later)**
- Wire forms to Lovable Cloud. Decide "Get matched" destination here. No frontend changes required to unlock.

## Technical notes

- TanStack Start file-based routing under `src/routes/`. Dot-separated filenames. Every `createFileRoute("...")` string matches its filename exactly.
- No teal tokens anywhere in `src/styles.css`.
- Content block type:
  ```ts
  type ContentBlock =
    | { type: 'prose'; html: string }
    | { type: 'audio'; src: string; title: string }
    | { type: 'video'; src: string; poster?: string }
    | { type: 'download'; href: string; label: string; sizeKb: number }
    | { type: 'callout'; tone: 'quote' | 'note'; body: string };
  ```
  Renderer is a switch; unused variants ship but carry no content at launch.
- Timezone: read once on mount in `/book` session path; store in form state; editable via select.
- All imagery generated with `imagegen` (photographic, calm, natural light). No stock placeholders.
- Placeholder-but-realistic copy adapted from the current nirvanawellness.org site.
