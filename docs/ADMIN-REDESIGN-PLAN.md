# Nirvana Admin — Rebuild Plan

Status: proposed, 2026-07-26. Grounded in the live DB (`etixzwoqvuolnofnfshm`) and the current
code, not assumptions.

---

## 1. What's actually there

Three routes exist, and that's the whole admin:

| Route       | File                                                                | State                                                      |
| ----------- | ------------------------------------------------------------------- | ---------------------------------------------------------- |
| Submissions | [src/routes/admin/index.tsx](../src/routes/admin/index.tsx)         | Accordion list, 10 filter pills, no search/sort/pagination |
| Analytics   | [src/routes/admin.analytics.tsx](../src/routes/admin.analytics.tsx) | 4 stat cards + 1 area chart + 2 lists                      |
| Settings    | [src/routes/admin.settings.tsx](../src/routes/admin.settings.tsx)   | 2 fields                                                   |

**Booking calendar and CRM were never built.** Live `public` schema holds exactly:
`session_requests`, `corporate_inquiries`, `contact_messages`, `notification_outbox`,
`analytics_events`, `site_settings`, `profiles`, `user_roles`, `kit_meta`. There is no
`bookings`, no `availability`, no `contacts`.

The `booking-crm-kit` at `d:\EXPERIUS\Websites\Booking_CRM.kit` — which XenDev and Angel
Foundation both run — _does_ ship all of it (`contract/migrations/0004_core_tables.sql`,
`reference/admin/pages/{Bookings,Availability,CRM}.tsx`, a 484-line `TimeGridCalendar`).
Nirvana was built on a reduced, hand-rolled schema instead, so none of that came along.
`rules.md` in the repo root still describes the full kit build — it was never followed.

**Every table has 0 rows.** Including `analytics_events`. So every screen is currently
rendering an unstyled empty state, which is a large part of why the panel feels dead.

---

## 2. Bugs found while reading (fix regardless of redesign)

1. **"Close" silently does nothing on sessions and corporate inquiries.**
   [admin/index.tsx:131-137](../src/routes/admin/index.tsx#L131-L137) — both branches of the
   `if` call the same `updateContactStatus`, and that RPC only touches
   `public.contact_messages`. Closing a session request updates zero rows.

2. **Every admin mutation can no-op while showing a success toast.**
   The RPCs return `jsonb_build_object('status','forbidden'|'not_found')` instead of raising.
   [useSubmissions.ts](../src/hooks/useSubmissions.ts) only checks `error`, never the returned
   payload — so a non-admin, or a wrong-table id, gets a green "Confirmed." and no change.
   Same failure family as the `void supabase.rpc()` bug in the ContentOps log.

3. **Actions vanish after first use.** [admin/index.tsx:205](../src/routes/admin/index.tsx#L205)
   gates the whole action bar on `s.status === "new"`. Once something is confirmed it can
   never be rescheduled, cancelled, reopened, or annotated.

4. **`confirm_session_request(p_notes)` is a dead parameter** — the UI never passes notes, and
   there is nowhere to write an internal note about a client.

5. **`cancelled` is a real status** (it's in `STATUS_PALETTE`) but is not reachable from the UI
   and not in the filter list.

6. **Analytics may be dead in production.** `/api/collect` returns 204 and logs nothing when
   `SUPABASE_SERVICE_ROLE_KEY` / `ANALYTICS_SALT` are missing. They're set in `.env.local`;
   whether the deploy host has them is unverified, and `analytics_events` is empty.

---

## 3. Why the UI feels bad — specifics, not vibes

- **It ignores the design system it ships with.** The site defines oklch tokens
  (`--navy --gold --cream --sand --stone`, Fraunces/Inter/Josefin) in
  [src/styles.css](../src/styles.css), and 44 shadcn components sit unused in
  [src/components/ui/](../src/components/ui/). The admin hardcodes `#0B1B3A`, `#C9A05C`,
  `#8A8272` in every className and hand-rolls every control.
- **One flat navy slab.** Every surface is `bg-white/5` on `#0B1B3A` with a `border-white/10`.
  No elevation scale, so nothing reads as more or less important than anything else.
- **The filter row is a wall of 10 pills** that wraps to three lines on a phone, and it's the
  only way to narrow the list. No search box at all — you cannot find a person by name.
- **Detail is an inline accordion**, so opening a record pushes everything below it down and
  loses your place in the list.
- **Mobile navigation is a hamburger drawer** for five destinations, and the header only ever
  says "Admin Panel" — no indication of which page you're on.
- **Filters live in React state, not the URL.** Refresh or back button = everything resets.
- **A bare spinner** for loading, and a one-line grey sentence for empty.
- **Analytics on a phone**: `h-72` recharts with date ticks that overlap into mush, and a
  `max-w-[240px]` path column that overflows a 360px screen.

---

## 4. Design direction (decided)

**"Paper" admin — light, on the brand's own tokens.** Cream `--cream` field, white cards with
a real elevation scale, navy reserved for the nav rail and primary buttons, gold as the single
accent for active/selected state. Fraunces for numbers and page titles, Inter for data,
Josefin for the small caps labels.

Why this over keeping the dark slab: the current dark panel is what makes it read as a
bolted-on template — it shares nothing with the site it administers, it forces every colour to
be hardcoded, and it makes shadcn unusable without overrides. Clinic admin work happens in
daylight across long sessions; a paper surface with a real elevation scale is where hierarchy
comes from. Dark mode stays available via the existing token system, it just stops being the
only option.

**Information architecture** — five destinations, in work order:

|              | Desktop rail                        | Mobile       |
| ------------ | ----------------------------------- | ------------ |
| **Today**    | overview: what needs action now     | bottom tab   |
| **Calendar** | week/month schedule                 | bottom tab   |
| **Inbox**    | all submissions                     | bottom tab   |
| **Contacts** | CRM                                 | bottom tab   |
| **Insights** | analytics                           | bottom tab   |
| Settings     | rail footer, under the account menu | account menu |

Bottom tab bar on mobile, not a hamburger — five items is exactly the Material limit, they're
in thumb reach, and the active destination is always visible. Sidebar collapses to icons on
desktop. Header carries the real page title plus breadcrumb.

**Interaction decisions:**

- **⌘K command palette** (`cmdk` is already installed) — jump to any person, any page, or run
  an action. This is the single biggest navigation win and the panel's signature moment.
- **Detail opens in a Sheet**, not an accordion. List keeps its scroll and filter state; the
  panel gets room for full detail, internal notes, an activity timeline, and every action.
- **All filters live in URL search params** — linkable, back-button-safe, survives refresh.
- **Desktop = real `Table`** with sticky header, sortable columns (`aria-sort`), tabular
  numerals, row selection + bulk actions, keyboard `j`/`k`/`Enter`. **Mobile = card list** with
  the three fields that matter and an action Drawer.
- **Skeletons, not spinners.** Designed empty states that say what to do next.
- **Undo toasts** on status changes; confirm dialog only for genuinely destructive actions.
- **Entrance choreography**: staggered 40ms row reveals, sheet slides from its trigger side,
  `cubic-bezier(0.16,1,0.3,1)`, all wrapped in `prefers-reduced-motion`.

---

## 5. Phases

### Phase 0 — Truth pass (no UI work)

- Fix bugs 1–5 above.
- Replace the jsonb-status RPCs with ones that `raise exception`, plus a shared
  `assertRpcOk()` helper so a failure can never render as success.
- Verify `/api/collect` on the live host; add an "Analytics not configured" banner in the panel
  when the pipeline is silent, instead of an empty chart that looks like zero traffic.
- Seed a handful of realistic records so the redesign is judged with data in it.

### Phase 1 — Shell + design system

- `src/components/admin/` — `AdminShell`, `AdminSidebar`, `AdminBottomNav`, `AdminHeader`,
  `CommandPalette`, `DataTable`, `MobileCardList`, `DetailSheet`, `StatTile`, `EmptyState`,
  `Skeletons`, `StatusBadge`.
- Rewrite [admin.tsx](../src/routes/admin.tsx) to use them; delete every hardcoded hex in the
  admin tree in favour of tokens.
- Rebuild the login / force-reset / access-denied screens on the same system.

### Phase 2 — Inbox (submissions, done properly)

Search, type segments, status select, date range, sort, pagination, bulk actions, sheet detail
with notes + timeline, full action set at every status, URL-synced state, mobile card list.

### Phase 3 — Calendar

Additive migration: `scheduled_at timestamptz`, `assigned_expert text`, `admin_notes text` on
`session_requests` and `corporate_inquiries`; an `admin_calendar(p_from, p_to)` RPC returning a
unified schedule. Week and month views, click a slot to schedule/assign, today's agenda on the
Today screen. Ports the layout ideas from the kit's `TimeGridCalendar` onto Nirvana's schema.

_This works with the current funnel: clients request a date, staff confirm an actual time._
Self-serve slot booking on the public site is a separate, bigger decision — see §6.

### Phase 4 — Contacts (CRM)

New `contacts` table deduped on lowercased email/phone, `contact_notes` for the activity
timeline, `contact_id` FK added to the three submission tables, and a trigger that upserts a
contact on every new submission. Contact detail = one person, every submission they've ever
sent, every note, current stage. Backfill included (trivial today at 0 rows, but written to be
correct).

### Phase 5 — Today + Insights

Today: new-since-last-login, today's and tomorrow's confirmed sessions, anything unanswered
over 24h, week-at-a-glance. Insights: rebuilt on the shadcn `chart` wrapper with responsive
tick density, mobile-legible axes, a real funnel (views → book page → request → confirmed), and
CSV export.

### Phase 6 — Verify

Browser check at 375px and desktop, reduced-motion pass, contrast pass, keyboard-only pass,
`tsc -p tsconfig.app.json` (plain `tsc --noEmit` checks zero files in this repo).

---

## 6. Scope decisions (locked 2026-07-26)

- **Booking: admin-side scheduling only.** Clients keep requesting a date; staff assign the
  real time in the calendar. No public-site funnel change. The misleading "pick a time" copy at
  [book.tsx:30](../src/routes/book.tsx#L30) gets corrected to match what the form does. The
  Phase 3 schema is shaped so self-serve slots could be added later without a rewrite, but
  `availability` and slot generation are **out of scope**.
- **CRM: contact records auto-built from submissions.** One person = one record, deduped on
  lowercased email/phone, showing every submission they've sent, internal notes, and an
  activity timeline. **No** pipeline stages, owner assignment, tasks, or reminders.
- **Hosting: Vercel.**

## 7. Production analytics — blocked on access, not on work

Confirmed the site is **not** on Majedul's Vercel account (`team_GW48ePyIkC2gweRcwxo22l1y`
holds 19 projects, none of them Nirvana). The git remote is `github.com/aurkonokrek/nirvanawellness`,
so it's deployed from Aurko's own Vercel. The two server-only env vars can't be read or set
from here.

Someone with access to that Vercel project needs to check **Settings → Environment Variables**
for:

| Variable                    | Value                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` (project `etixzwoqvuolnofnfshm`) |
| `ANALYTICS_SALT`            | any long random string, set once and never changed                                  |

Both must be scoped to **Production** _and_ **Preview** — Production-only is the exact mistake
that broke AaaP's preview builds. Redeploy after adding; env changes don't apply to existing
deployments. Without them `/api/collect` returns 204 and writes nothing, which is consistent
with `analytics_events` sitting at 0 rows.

Phase 0 adds a banner in the panel so this state announces itself instead of looking like
"nobody visited the site."
