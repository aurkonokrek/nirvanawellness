import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MapPin, Languages, Award } from "lucide-react";
import { getExpert, EXPERTS } from "@/data/experts";

export const Route = createFileRoute("/experts/$slug")({
  loader: ({ params }) => {
    const expert = getExpert(params.slug);
    if (!expert) throw notFound();
    return { expert };
  },
  head: ({ loaderData }) => {
    const e = loaderData?.expert;
    const title = e ? `${e.name} · Nirvana Wellness` : "Expert · Nirvana Wellness";
    const description = e
      ? `${e.role}. ${e.short}`
      : "Meet a Nirvana Wellness practitioner.";
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
  const { expert } = Route.useLoaderData();
  const related = EXPERTS.filter(
    (e) => e.slug !== expert.slug && e.pillars.some((p) => expert.pillars.includes(p)),
  ).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-[color:var(--navy)] text-[color:var(--cream)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[2fr_3fr] lg:gap-16 lg:px-10 lg:py-28">
          <div className="flex aspect-[4/5] items-center justify-center rounded-lg border border-white/10 bg-[color:var(--navy-elevated)]">
            <span className="font-display text-9xl text-gold-gradient">{initials(expert.name)}</span>
          </div>
          <div className="flex flex-col justify-center">
            <p className="font-eyebrow text-[color:var(--gold-soft)]">Expert</p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] md:text-6xl">{expert.name}</h1>
            <p className="mt-4 text-lg text-[color:var(--sand)]">{expert.role}</p>
            {expert.quote && (
              <blockquote className="mt-8 border-l-2 border-[color:var(--gold)] pl-5 font-display text-2xl italic text-[color:var(--cream)]">
                "{expert.quote}"
              </blockquote>
            )}
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-[color:var(--sand)]">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{expert.location}</span>
              <span className="inline-flex items-center gap-1.5"><Languages className="h-4 w-4" />{expert.languages.join(", ")}</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#book"
                className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-medium text-[color:var(--navy)]"
              >
                Book with {expert.name.split(" ")[0]} <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/experts"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm text-[color:var(--cream)] hover:bg-white/5"
              >
                All experts
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Body: bio + approach + credentials/specialties */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-16 lg:grid-cols-[2fr_1fr] lg:gap-20">
          <div>
            <p className="font-eyebrow text-muted-foreground">Background</p>
            <h2 className="mt-3 font-display text-3xl">In their own words</h2>
            <div className="mt-6 space-y-5 text-foreground/85">
              {expert.bio.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="mt-16">
              <p className="font-eyebrow text-[color:var(--gold-deep)]">Approach</p>
              <h2 className="mt-3 font-display text-3xl">How they actually work with clients</h2>
              <div className="mt-6 space-y-5 text-foreground/85">
                {expert.approach.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-10">
            <div>
              <p className="font-eyebrow text-muted-foreground">Specialties</p>
              <ul className="mt-4 space-y-2">
                {expert.specialties.map((s) => (
                  <li key={s} className="border-t border-border pt-2 text-sm">{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-eyebrow text-muted-foreground">Credentials</p>
              <ul className="mt-4 space-y-3">
                {expert.credentials.map((c) => (
                  <li key={c} className="flex gap-3 text-sm text-muted-foreground">
                    <Award className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gold-deep)]" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Booking widget (Phase 2 placeholder) */}
      <section id="book" className="border-y border-border bg-[color:var(--sand)]/40">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <div>
              <p className="font-eyebrow text-muted-foreground">Book</p>
              <h2 className="mt-3 font-display text-4xl">Session with {expert.name.split(" ")[0]}</h2>
              <p className="mt-4 text-muted-foreground">
                Requests are matched and confirmed within one business day. Availability varies
                week to week — first sessions are unhurried, 50 minutes.
              </p>
            </div>
            <BookingWidget expertName={expert.name} />
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <p className="font-eyebrow text-muted-foreground">Also on the {expert.pillars.join(" / ")} side of the practice</p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                to="/experts/$slug"
                params={{ slug: r.slug }}
                className="group flex flex-col rounded-lg border border-border bg-card p-6 transition-colors hover:border-[color:var(--gold-deep)]"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--navy)] font-display text-2xl text-gold-gradient">
                  {initials(r.name)}
                </div>
                <p className="mt-4 font-display text-xl group-hover:text-[color:var(--gold-deep)]">{r.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.role}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BookingWidget({ expertName }: { expertName: string }) {
  const [tz, setTz] = useState("");
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
  const input =
    "w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-[color:var(--gold-deep)]";

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm">Your name</span>
          <input className={input} required />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm">Email</span>
          <input type="email" className={input} required />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm">Session type</span>
          <select className={input} defaultValue="individual">
            <option value="individual">1:1</option>
            <option value="couples">Couples</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm">Format</span>
          <select className={input} defaultValue="either">
            <option value="in-person">In person</option>
            <option value="online">Online</option>
            <option value="either">Either</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm">Timezone</span>
        <select className={input} value={tz} onChange={(e) => setTz(e.target.value)}>
          {zoneOptions.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
        {tz && <span className="mt-1 block text-xs text-muted-foreground">Detected: {tz} — change if needed</span>}
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm">Anything you'd like {expertName.split(" ")[0]} to know</span>
        <textarea rows={4} className={input} />
      </label>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-medium text-[color:var(--navy)]"
      >
        Request booking <ArrowRight className="h-4 w-4" />
      </button>
      <p className="text-xs text-muted-foreground">
        Form wiring lands in Phase 4. Submissions are not yet stored or sent.
      </p>
    </form>
  );
}
