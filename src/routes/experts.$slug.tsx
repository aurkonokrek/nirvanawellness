import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Award, Facebook, Instagram, Languages, MapPin, Youtube } from "lucide-react";
import { getExpert, EXPERTS, type Expert } from "@/data/experts";
import { FlowerMark } from "@/components/FlowerMark";

const SOCIALS = {
  facebook: "https://www.facebook.com/nirvanawellness.org",
  instagram: "https://www.instagram.com/nirvana_wellnessofwholeness/",
  youtube: "https://www.youtube.com/watch?v=E4IcahhE0UM",
};

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
    <div className="bg-[color:var(--navy)] text-[color:var(--cream)]">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-6 pt-10 lg:px-10 lg:pt-14">
        <Link
          to="/experts"
          className="font-eyebrow text-xs tracking-[0.22em] text-[color:var(--sand)] hover:text-[color:var(--gold)]"
        >
          ← All experts
        </Link>
      </div>

      {/* Split hero */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[35fr_65fr] lg:gap-14">
          {/* LEFT COLUMN */}
          <aside className="space-y-6">
            {/* Portrait */}
            <div
              className="relative flex aspect-square items-center justify-center overflow-hidden bg-[color:var(--navy-elevated)]"
              style={{ border: "1px solid rgba(201, 160, 92, 0.3)" }}
            >
              <FlowerMark className="pointer-events-none absolute -right-16 -bottom-16 h-80 w-80 text-[color:var(--gold)] opacity-[0.05]" />
              <span className="relative font-display text-[7rem] leading-none tracking-[0.1em] text-gold-gradient">
                {initials(expert.name)}
              </span>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3">
              <span className="font-eyebrow text-[10px] tracking-[0.22em] text-[color:var(--sand)]">
                Follow
              </span>
              <span className="h-px flex-1 bg-white/10" />
              <SocialIcon href={SOCIALS.facebook} label="Facebook"><Facebook className="h-4 w-4" /></SocialIcon>
              <SocialIcon href={SOCIALS.instagram} label="Instagram"><Instagram className="h-4 w-4" /></SocialIcon>
              <SocialIcon href={SOCIALS.youtube} label="YouTube"><Youtube className="h-4 w-4" /></SocialIcon>
            </div>

            {/* Booking card */}
            <BookingWidget expertName={expert.name} />
          </aside>

          {/* RIGHT COLUMN */}
          <div>
            <p className="font-eyebrow text-xs tracking-[0.24em] text-[color:var(--gold-soft)]">
              Expert
            </p>
            <h1 className="mt-3 font-display text-5xl leading-[1.05] md:text-6xl">
              {expert.name}
            </h1>
            <p className="mt-4 text-lg text-[color:var(--sand)]">{expert.role}</p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[color:var(--sand)]">
              {expert.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[color:var(--gold-soft)]" />
                  {expert.location}
                </span>
              )}
              {expert.languages && expert.languages.length > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Languages className="h-4 w-4 text-[color:var(--gold-soft)]" />
                  {expert.languages.join(", ")}
                </span>
              )}
            </div>

            {expert.quote && (
              <blockquote className="mt-8 border-l-2 border-[color:var(--gold)] pl-5 font-display text-2xl italic text-[color:var(--cream)]">
                "{expert.quote}"
              </blockquote>
            )}

            <div className="mt-10 space-y-5 text-[15px] leading-relaxed text-[color:var(--cream)]/85">
              {expert.bio.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Quick Facts grid */}
            <QuickFacts expert={expert} />

            {/* Approach (optional) */}
            {expert.approach && expert.approach.length > 0 && (
              <div className="mt-14">
                <p className="font-eyebrow text-xs tracking-[0.24em] text-[color:var(--gold-soft)]">
                  Approach
                </p>
                <h2 className="mt-3 font-display text-3xl">How they actually work with clients</h2>
                <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-[color:var(--cream)]/85">
                  {expert.approach.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Credentials */}
            <div className="mt-14">
              <p className="font-eyebrow text-xs tracking-[0.24em] text-[color:var(--gold-soft)]">
                Credentials
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {expert.credentials.map((c) => (
                  <li key={c} className="flex gap-3 text-sm text-[color:var(--sand)]">
                    <Award className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gold-soft)]" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <p className="font-eyebrow text-xs tracking-[0.24em] text-[color:var(--gold-soft)]">
              Also on the {expert.pillars.join(" / ")} side
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to="/experts/$slug"
                  params={{ slug: r.slug }}
                  className="group flex flex-col border border-white/10 p-6 transition-colors hover:border-[color:var(--gold)]"
                >
                  <div className="flex h-20 w-20 items-center justify-center bg-[color:var(--navy-elevated)] font-display text-2xl text-gold-gradient">
                    {initials(r.name)}
                  </div>
                  <p className="mt-4 font-display text-xl group-hover:text-[color:var(--gold-soft)]">
                    {r.name}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--sand)]">{r.role}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center border border-white/15 text-[color:var(--sand)] transition-colors hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
    >
      {children}
    </a>
  );
}

function QuickFacts({ expert }: { expert: Expert }) {
  const items: { label: string; value: React.ReactNode }[] = [];
  if (expert.experience) items.push({ label: "Experience", value: expert.experience });
  if (expert.education && expert.education.length > 0) {
    items.push({
      label: "Education",
      value: (
        <ul className="space-y-1">
          {expert.education.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ),
    });
  }
  if (expert.location) items.push({ label: "Format", value: expert.location });
  if (expert.languages && expert.languages.length > 0)
    items.push({ label: "Languages", value: expert.languages.join(", ") });

  if (items.length === 0) return null;

  return (
    <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2">
      {items.map((f) => (
        <div key={f.label} className="bg-[color:var(--navy)] p-5">
          <p className="font-eyebrow text-[10px] tracking-[0.24em] text-[color:var(--gold-soft)]">
            {f.label}
          </p>
          <div className="mt-2 text-sm text-[color:var(--cream)]/90">{f.value}</div>
        </div>
      ))}
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

  const field =
    "w-full rounded-none border border-white/15 bg-[color:var(--navy)] px-3 py-2.5 text-sm text-[color:var(--cream)] outline-none focus:border-[color:var(--gold)]";
  const label = "mb-1.5 block font-eyebrow text-[10px] tracking-[0.22em] text-[color:var(--sand)]";

  return (
    <div
      id="book"
      className="border p-6"
      style={{
        background: "#132550",
        borderColor: "rgba(201, 160, 92, 0.3)",
      }}
    >
      <p className="font-eyebrow text-[10px] tracking-[0.24em] text-[color:var(--gold-soft)]">
        Book a session
      </p>
      <h3 className="mt-2 font-display text-2xl text-[color:var(--cream)]">
        With {expertName.split(" ")[0]}
      </h3>
      <p className="mt-1 text-xs text-[color:var(--sand)]">
        Requests are matched and confirmed within one business day.
      </p>

      <form onSubmit={(e) => e.preventDefault()} className="mt-5 space-y-4">
        <div>
          <span className={label}>Type of service</span>
          <select className={field} defaultValue="individual">
            <option value="individual">1:1 session</option>
            <option value="couples">Couples</option>
            <option value="corporate">Corporate</option>
          </select>
        </div>
        <div>
          <span className={label}>Format</span>
          <select className={field} defaultValue="either">
            <option value="online">Online</option>
            <option value="in-person">In person</option>
            <option value="either">Either</option>
          </select>
        </div>
        <div>
          <span className={label}>Preferred date</span>
          <input type="date" className={field} />
        </div>
        <div>
          <span className={label}>Timezone</span>
          <select className={field} value={tz} onChange={(e) => setTz(e.target.value)}>
            {zoneOptions.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-none bg-gold-gradient px-6 py-3 text-sm font-medium text-[color:var(--navy)]"
        >
          Book now <ArrowRight className="h-4 w-4" />
        </button>
        <p className="text-[11px] text-[color:var(--sand)]/70">
          Form wiring lands in Phase 4. Submissions are not yet stored or sent.
        </p>
      </form>
    </div>
  );
}
