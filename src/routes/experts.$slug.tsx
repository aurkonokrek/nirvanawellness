import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Facebook, Instagram, Youtube, Award } from "lucide-react";
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

const SOCIALS = {
  facebook: "https://www.facebook.com/nirvanawellness.org",
  instagram: "https://www.instagram.com/nirvana_wellnessofwholeness/",
  youtube: "https://www.youtube.com/watch?v=E4IcahhE0UM",
};

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
  const { expert } = Route.useLoaderData() as { expert: import("@/data/experts").Expert };
  const related = EXPERTS.filter(
    (e) => e.slug !== expert.slug && e.pillars.some((p) => expert.pillars.includes(p)),
  ).slice(0, 3);

  return (
    <div className="bg-[color:var(--navy)] text-[color:var(--cream)]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <Link
          to="/experts"
          className="font-eyebrow text-xs text-[color:var(--sand)] hover:text-[color:var(--gold-soft)]"
        >
          ← All experts
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-[35fr_65fr] lg:gap-16">
          {/* LEFT COLUMN — sticky sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            {/* Portrait */}
            <div className="aspect-[4/5] w-full overflow-hidden border border-[rgba(201,160,92,0.3)] bg-[color:var(--navy-elevated)]">
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-display text-8xl text-gold-gradient">
                  {initials(expert.name)}
                </span>
              </div>
            </div>

            {/* Socials */}
            <div className="mt-5 flex items-center gap-5">
              <a
                href={SOCIALS.facebook}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Facebook"
                className="text-[color:var(--cream)] transition-colors hover:text-[color:var(--gold-soft)]"
              >
                <Facebook className="h-5 w-5" strokeWidth={1.5} />
              </a>
              <a
                href={SOCIALS.instagram}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Instagram"
                className="text-[color:var(--cream)] transition-colors hover:text-[color:var(--gold-soft)]"
              >
                <Instagram className="h-5 w-5" strokeWidth={1.5} />
              </a>
              <a
                href={SOCIALS.youtube}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="YouTube"
                className="text-[color:var(--cream)] transition-colors hover:text-[color:var(--gold-soft)]"
              >
                <Youtube className="h-5 w-5" strokeWidth={1.5} />
              </a>
            </div>

            {/* Booking widget */}
            <BookingWidget expertName={expert.name} />
          </aside>

          {/* RIGHT COLUMN — clinical details */}
          <div>
            <p className="font-eyebrow text-[color:var(--gold-soft)]">Expert profile</p>
            <h1 className="mt-3 font-display text-5xl leading-[1.05] text-[color:var(--cream)] md:text-6xl">
              {expert.name}
            </h1>
            <p className="mt-4 text-lg text-[color:var(--sand)]">{expert.role}</p>

            {expert.quote && (
              <blockquote className="mt-8 border-l-2 border-[color:var(--gold)] pl-5 font-display text-2xl italic text-[color:var(--cream)]">
                "{expert.quote}"
              </blockquote>
            )}

            <div className="mt-10 space-y-5 text-[color:#FAFAFA]/85 leading-relaxed">
              {expert.bio.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {expert.approach && expert.approach.length > 0 && (
              <div className="mt-12">
                <p className="font-eyebrow text-[color:var(--gold-soft)]">Approach</p>
                <h2 className="mt-3 font-display text-3xl">How they work with clients</h2>
                <div className="mt-5 space-y-4 text-[color:#FAFAFA]/85 leading-relaxed">
                  {expert.approach.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Quick facts grid — credentials */}
            {expert.credentials.length > 0 && (
              <div className="mt-14">
                <p className="font-eyebrow text-[color:var(--gold-soft)]">Credentials & Experience</p>
                <dl className="mt-5 grid gap-x-10 gap-y-0 sm:grid-cols-2">
                  {expert.credentials.map((c) => (
                    <div
                      key={c}
                      className="flex gap-3 border-b border-[rgba(255,255,255,0.1)] py-4"
                    >
                      <Award
                        className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gold-soft)]"
                        strokeWidth={1.5}
                      />
                      <dd className="text-sm text-[color:#FAFAFA]/85">{c}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {expert.specialties && expert.specialties.length > 0 && (
              <div className="mt-12">
                <p className="font-eyebrow text-[color:var(--gold-soft)]">Specialties</p>
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[color:#FAFAFA]/85">
                  {expert.specialties.map((s) => (
                    <li key={s} className="font-eyebrow uppercase tracking-[0.15em] text-xs">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(expert.location || (expert.languages && expert.languages.length > 0)) && (
              <div className="mt-12 flex flex-wrap gap-x-10 gap-y-3 text-sm text-[color:var(--sand)]">
                {expert.location && (
                  <div>
                    <p className="font-eyebrow text-xs text-[color:var(--gold-soft)]">Location</p>
                    <p className="mt-1">{expert.location}</p>
                  </div>
                )}
                {expert.languages && expert.languages.length > 0 && (
                  <div>
                    <p className="font-eyebrow text-xs text-[color:var(--gold-soft)]">Languages</p>
                    <p className="mt-1">{expert.languages.join(", ")}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-24 border-t border-white/10 pt-16">
            <p className="font-eyebrow text-[color:var(--gold-soft)]">
              Also on the {expert.pillars.join(" / ")} side of the practice
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to="/experts/$slug"
                  params={{ slug: r.slug }}
                  className="group flex flex-col border border-white/10 bg-[color:var(--navy-elevated)] p-6 transition-colors hover:border-[color:var(--gold-deep)]"
                >
                  <div className="flex h-16 w-16 items-center justify-center border border-[rgba(201,160,92,0.3)] font-display text-xl text-gold-gradient">
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
        )}
      </div>
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
    "w-full rounded-sm border border-white/15 bg-[color:var(--navy)]/60 px-3 py-2.5 text-sm text-[color:var(--cream)] outline-none focus:border-[color:var(--gold-soft)]";
  const label = "mb-1.5 block font-eyebrow text-[10px] tracking-[0.18em] text-[color:var(--sand)]";

  return (
    <div className="mt-6 rounded-sm border border-white/10 bg-[#132550] p-6">
      <p className="font-display text-xl text-[color:var(--cream)]">
        Check Availability / Book a Session
      </p>
      <p className="mt-1 text-xs text-[color:var(--sand)]">
        Request a slot with {expertName.split(" ")[0]}. Confirmed within one business day.
      </p>

      <form onSubmit={(e) => e.preventDefault()} className="mt-6 space-y-4">
        <div>
          <label className={label}>Type of Service</label>
          <select className={field} defaultValue="1-1">
            <option value="1-1">1:1 Session</option>
            <option value="couples">Couples</option>
            <option value="workshop">Workshop</option>
            <option value="corporate">Corporate</option>
          </select>
        </div>

        <div>
          <label className={label}>Online or In-person</label>
          <select className={field} defaultValue="either">
            <option value="online">Online</option>
            <option value="in-person">In person</option>
            <option value="either">Either</option>
          </select>
        </div>

        <div>
          <label className={label}>Preferred Date</label>
          <input type="date" className={field} />
        </div>

        <div>
          <label className={label}>Timezone</label>
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
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-gold-gradient px-6 py-3 text-sm font-medium text-[color:var(--navy)] transition-transform hover:-translate-y-0.5"
        >
          Book Now! <ArrowRight className="h-4 w-4" />
        </button>

        <p className="text-[11px] text-[color:var(--sand)]/70">
          Form wiring lands in Phase 4. Submissions are not yet stored or sent.
        </p>
      </form>
    </div>
  );
}
