import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MapPin, Languages, Award, Check, Loader2 } from "lucide-react";
import { ExpertCard } from "@/components/ExpertCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FlowerMark } from "@/components/FlowerMark";
import { getExpert, EXPERTS, type Expert } from "@/data/experts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/experts/$slug")({
  loader: ({ params }) => {
    const expert = getExpert(params.slug);
    if (!expert) throw notFound();
    return { expert };
  },
  head: ({ loaderData }) => {
    const e = loaderData?.expert;
    const title = e ? `${e.name} · Nirvana Wellness` : "Expert · Nirvana Wellness";
    const description = e ? `${e.role}. ${e.short}` : "Meet a Nirvana Wellness practitioner.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ExpertProfilePage,
});

function initials(name: string) {
  return name
    .split(" ")
    .filter((s) => !/^(dr\.?|mr\.?|ms\.?|mrs\.?)$/i.test(s))
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
}

function ExpertProfilePage() {
  const { expert } = Route.useLoaderData() as { expert: Expert };
  const related = EXPERTS.filter(
    (e) => e.slug !== expert.slug && e.pillars.some((p) => expert.pillars.includes(p)),
  ).slice(0, 3);

  return (
    <div className="bg-background">
      <Breadcrumbs
        items={[
          { label: "Experts", to: "/experts" },
          { label: expert.name },
        ]}
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-16 lg:px-10 lg:pb-32 lg:pt-10">
        {/* LEFT — sticky portrait + booking widget */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="animate-fade-up">
            <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden border border-[color:var(--gold)]/40 bg-[color:var(--navy)] text-[color:var(--cream)]">
              <FlowerMark className="pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 text-[color:var(--gold)] opacity-[0.07]" />
              <span className="relative font-display text-6xl tracking-[0.15em] text-gold-gradient">
                {initials(expert.name)}
              </span>
              <div className="absolute right-3 top-3 flex gap-1">
                {expert.pillars.map((p) => (
                  <span
                    key={p}
                    className="border border-white/25 px-2 py-0.5 font-eyebrow text-[10px] tracking-[0.18em] text-[color:var(--sand)]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="font-eyebrow text-[10px] tracking-[0.22em] text-[color:var(--gold-deep)]">
                Practitioner
              </p>
              <h1 className="mt-2 font-display text-3xl leading-tight text-[color:var(--navy)]">
                {expert.name}
              </h1>
              <p className="mt-1.5 text-xs italic text-muted-foreground">{expert.role}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {expert.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {expert.location}
                  </span>
                )}
                {expert.languages && expert.languages.length > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Languages className="h-3.5 w-3.5" />
                    {expert.languages.join(", ")}
                  </span>
                )}
              </div>
            </div>

            <BookingWidget expertName={expert.name} expertSlug={expert.slug} />
          </div>
        </aside>

        {/* RIGHT — bio, stats, tags, approach */}
        <div className="min-w-0">
          {expert.quote && (
            <blockquote className="animate-fade-up mb-10 border-l-2 border-[color:var(--gold)] pl-5 font-display text-2xl italic leading-snug text-[color:var(--navy)]">
              "{expert.quote}"
            </blockquote>
          )}

          <section className="animate-fade-up animate-fade-up-delay-1">
            <p className="font-eyebrow text-muted-foreground">Background</p>
            <h2 className="mt-3 font-display text-3xl">In their own words</h2>
            <div className="mt-6 space-y-5 text-foreground/85">
              {expert.bio.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          {/* Stat pair — Education / Experience, gold numerals */}
          <StatPair expert={expert} />

          {/* Focus tags — reuse card tag treatment */}
          {expert.focus.length > 0 && (
            <section className="mt-14">
              <p className="font-eyebrow text-muted-foreground">Focus</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {expert.focus.map((f) => (
                  <span
                    key={f}
                    className="border border-[color:var(--gold-deep)]/40 px-3 py-1.5 font-eyebrow text-[10px] tracking-[0.22em] text-[color:var(--navy)]"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Credentials */}
          <section className="mt-14">
            <p className="font-eyebrow text-muted-foreground">Credentials</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {expert.credentials.map((c) => (
                <li key={c} className="flex gap-3 border-t border-border pt-3 text-sm text-foreground/80">
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gold-deep)]" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Specialties */}
          {expert.specialties && expert.specialties.length > 0 && (
            <section className="mt-14">
              <p className="font-eyebrow text-muted-foreground">Specialties</p>
              <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
                {expert.specialties.map((s) => (
                  <li key={s} className="border-t border-border py-2 text-sm text-foreground/80">
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Approach — real content when present, clearly-labeled placeholder otherwise */}
          <section className="mt-16 border-t border-border pt-10">
            <p className="font-eyebrow text-[color:var(--gold-deep)]">Approach</p>
            <h2 className="mt-3 font-display text-3xl">How they work with clients</h2>
            {expert.approach && expert.approach.length > 0 ? (
              <div className="mt-6 space-y-5 text-foreground/85">
                {expert.approach.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-md border border-dashed border-[color:var(--gold-deep)]/40 bg-[color:var(--gold-soft)]/10 p-6 text-sm text-muted-foreground">
                <strong className="font-medium text-[color:var(--navy)]">
                  Placeholder.
                </strong>{" "}
                A first-person note from {expert.name.split(" ")[0]} on how sessions
                actually unfold — pace, structure, what to expect in the first few weeks — is pending direct confirmation from the practitioner. It will replace this box, unedited.
              </div>
            )}
          </section>

          {related.length > 0 && (
            <section className="mt-16 border-t border-border pt-10">
              <p className="font-eyebrow text-muted-foreground">
                Also on the {expert.pillars.join(" / ")} side of the practice
              </p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {related.map((r) => (
                  <ExpertCard key={r.slug} expert={r} variant="compact" />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Stat pair ---------- */
function StatPair({ expert }: { expert: Expert }) {
  // Derive stats defensively from real credentials — never fabricate numbers.
  const expMatch = expert.bio
    .concat(expert.credentials)
    .join(" ")
    .match(/(\d{1,2})\+?\s*(?:years|yrs)/i);
  const years = expMatch ? expMatch[1] : null;

  const educationLines = expert.credentials.filter((c) =>
    /(doctorate|master|m\.sc|b\.sc|diploma|degree|ph\.?d|certif)/i.test(c),
  );
  const eduCount = educationLines.length;

  if (!years && eduCount === 0) return null;

  return (
    <section className="mt-14 grid gap-8 border-y border-border py-10 sm:grid-cols-2">
      {years && (
        <div>
          <p className="font-eyebrow text-muted-foreground">Experience</p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-6xl leading-none text-gold-gradient">
              {years}
            </span>
            <span className="text-sm text-muted-foreground">
              {years === "1" ? "year" : "years"} in practice
            </span>
          </p>
        </div>
      )}
      {eduCount > 0 && (
        <div>
          <p className="font-eyebrow text-muted-foreground">Education & training</p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-6xl leading-none text-gold-gradient">
              {eduCount.toString().padStart(2, "0")}
            </span>
            <span className="text-sm text-muted-foreground">
              formal qualifications on file
            </span>
          </p>
        </div>
      )}
    </section>
  );
}

/* ---------- Booking widget (sticky) ---------- */
function BookingWidget({
  expertName,
  expertSlug,
}: {
  expertName: string;
  expertSlug: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sessionType, setSessionType] = useState("individual");
  const [format, setFormat] = useState<"online" | "in-person" | "either">("either");
  const [preferredDate, setPreferredDate] = useState("");
  const [tz, setTz] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const zones = useMemo(
    () => [
      "Asia/Dhaka",
      "Asia/Kolkata",
      "Asia/Singapore",
      "Asia/Dubai",
      "Europe/London",
      "Europe/Berlin",
      "America/New_York",
      "America/Los_Angeles",
      "Australia/Sydney",
    ],
    [],
  );
  useEffect(() => {
    try {
      setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dhaka");
    } catch {
      setTz("Asia/Dhaka");
    }
  }, []);
  const zoneOptions = tz && !zones.includes(tz) ? [tz, ...zones] : zones;

  const inputCls =
    "w-full rounded-none border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-[color:var(--gold-deep)]";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("session_requests").insert({
      name,
      email,
      phone: null,
      session_type: sessionType,
      preferred_format: format,
      timezone: tz,
      notes: [
        `Practitioner requested: ${expertName} (${expertSlug})`,
        preferredDate ? `Preferred date: ${preferredDate}` : null,
        notes || null,
      ]
        .filter(Boolean)
        .join("\n\n"),
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't send request. Please try again.");
      return;
    }
    setDone(true);
    toast.success("Request sent. We'll be in touch within one business day.");
  }

  if (done) {
    return (
      <div className="mt-6 border border-[color:var(--gold)]/50 bg-[color:var(--sand)]/40 p-5">
        <div className="flex items-center gap-2 font-display text-lg text-[color:var(--navy)]">
          <Check className="h-4 w-4 text-[color:var(--gold-deep)]" /> Request received
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          We'll confirm with {expertName.split(" ")[0]}'s availability within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 border border-border bg-card p-5">
      <p className="font-eyebrow text-[10px] tracking-[0.22em] text-[color:var(--gold-deep)]">
        Book with {expertName.split(" ")[0]}
      </p>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Your name</span>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Email</span>
          <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Session type</span>
          <select className={inputCls} value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
            <option value="individual">1:1</option>
            <option value="couples">Couples</option>
          </select>
        </label>

        <div>
          <span className="mb-1.5 block text-xs text-muted-foreground">Format</span>
          <div className="grid grid-cols-3 gap-0 border border-input">
            {(["online", "in-person", "either"] as const).map((opt) => {
              const active = format === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFormat(opt)}
                  className={
                    "px-2 py-2 text-xs capitalize transition-colors " +
                    (active
                      ? "bg-[color:var(--navy)] text-[color:var(--cream)]"
                      : "text-foreground/70 hover:bg-muted")
                  }
                >
                  {opt.replace("-", " ")}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Preferred date</span>
          <input
            type="date"
            className={inputCls}
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Timezone</span>
          <select className={inputCls} value={tz} onChange={(e) => setTz(e.target.value)}>
            {zoneOptions.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">
            Anything you'd like {expertName.split(" ")[0]} to know
          </span>
          <textarea
            rows={3}
            className={inputCls}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-5 py-3 text-sm font-medium text-[color:var(--navy)] shadow-[0_10px_30px_-15px_rgba(212,169,74,0.7)] transition-transform hover:-translate-y-0.5 disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending
          </>
        ) : (
          <>
            Book a session <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
      <p className="mt-2 text-center text-[10px] text-muted-foreground">
        Confirmed within one business day.
      </p>
    </form>
  );
}
