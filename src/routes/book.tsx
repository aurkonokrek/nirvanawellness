import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { toast } from "sonner";


export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Session · Nirvana Wellness" },
      {
        name: "description",
        content:
          "Book a 1:1 or couples session, request a corporate program, or send a general message. One entry point for everything at Nirvana Wellness.",
      },
      { property: "og:title", content: "Book with Nirvana Wellness" },
      {
        property: "og:description",
        content: "Sessions, corporate inquiries, and general contact — one entry point.",
      },
    ],
  }),
  component: BookPage,
});

type Path = "session" | "corporate" | "contact";

const PATHS: { id: Path; label: string; note: string }[] = [
  { id: "session", label: "Book a session", note: "1:1 or couples — pick a time." },
  { id: "corporate", label: "Corporate inquiry", note: "Programs, workshops, or retreats for your team." },
  { id: "contact", label: "General contact", note: "Anything else — media, partnerships, or a quiet question." },
];

function BookPage() {
  const [active, setActive] = useState<Path>("session");
  return (
    <div>
      <section className="border-b border-border">
        <Breadcrumbs items={[{ label: "Book & Contact" }]} />
        <div className="mx-auto max-w-7xl px-6 pb-12 pt-8 lg:px-10 lg:pt-12">
          <p className="animate-fade-up font-eyebrow text-muted-foreground">Reach us</p>
          <h1 className="animate-fade-up animate-fade-up-delay-1 mt-5 max-w-3xl font-display text-5xl leading-[1.05] md:text-6xl">
            One doorway <span className="italic text-gold-gradient">for everything.</span>
          </h1>
          <p className="animate-fade-up animate-fade-up-delay-2 mt-6 max-w-2xl text-lg text-muted-foreground">
            Whether you're booking your first session, planning a program for your team, or just
            saying hello — start here.
          </p>
        </div>
      </section>


      <section className="mx-auto max-w-7xl px-6 pt-12 lg:px-10">
        <div className="grid gap-3 md:grid-cols-3">
          {PATHS.map((p) => {
            const isActive = active === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActive(p.id)}
                className={[
                  "group rounded-lg border p-6 text-left transition-all",
                  isActive
                    ? "border-transparent bg-[color:var(--navy)] text-[color:var(--cream)] shadow-[0_20px_60px_-30px_rgba(11,27,58,0.5)]"
                    : "border-border bg-card text-foreground hover:border-foreground/30",
                ].join(" ")}
              >
                <div className="flex items-start justify-between">
                  <p className={isActive ? "font-eyebrow text-[color:var(--gold-soft)]" : "font-eyebrow text-muted-foreground"}>
                    {String(PATHS.indexOf(p) + 1).padStart(2, "0")}
                  </p>
                  <ArrowRight
                    className={[
                      "h-4 w-4 transition-transform",
                      isActive ? "translate-x-0.5 text-[color:var(--gold-soft)]" : "text-muted-foreground group-hover:translate-x-0.5",
                    ].join(" ")}
                  />
                </div>
                <p className="mt-4 font-display text-2xl">{p.label}</p>
                <p className={isActive ? "mt-2 text-sm text-[color:var(--sand)]" : "mt-2 text-sm text-muted-foreground"}>
                  {p.note}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        {active === "session" && <SessionForm />}
        {active === "corporate" && <CorporateForm />}
        {active === "contact" && <ContactForm />}
      </section>

      <ExpatSection />
    </div>
  );
}

/* ---------- Success panel ---------- */
function SuccessPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-[color:var(--gold)]/40 bg-[color:var(--sand)]/40 p-8">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-gradient text-[color:var(--navy)]">
          <Check className="h-5 w-5" />
        </span>
        <h3 className="font-display text-2xl">{title}</h3>
      </div>
      <p className="mt-3 text-muted-foreground">{body}</p>
    </div>
  );
}

/* ---------- Session form ---------- */
function SessionForm() {
  const [tz, setTz] = useState<string>("");
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
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) setTz(detected);
    } catch {
      setTz("Asia/Dhaka");
    }
  }, []);

  const zoneOptions = tz && !zones.includes(tz) ? [tz, ...zones] : zones;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const f = new FormData(e.currentTarget);
    const payload = {
      name: String(f.get("name") || "").trim(),
      email: String(f.get("email") || "").trim(),
      phone: String(f.get("phone") || "").trim() || null,
      session_type: String(f.get("session_type") || "individual"),
      preferred_format: String(f.get("preferred_format") || "either"),
      timezone: tz || null,
      notes: String(f.get("notes") || "").trim() || null,
    };
    if (!payload.name || !payload.email) {
      toast.error("Please add your name and email.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("session_requests").insert(payload);
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">
        <div>
          <h2 className="font-display text-3xl">Booking request received</h2>
          <p className="mt-3 text-muted-foreground">Thank you for reaching out.</p>
        </div>
        <SuccessPanel
          title="We'll be in touch within one business day."
          body="A member of the Nirvana team will review your request and confirm a time with the clinician best matched to what you shared."
        />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[2fr_3fr]">
      <div>
        <h2 className="font-display text-3xl">Book a session</h2>
        <p className="mt-3 text-muted-foreground">
          We'll match your request to the right clinician and confirm within one business day.
        </p>
      </div>
      <div className="space-y-5">
        <Field label="Your name">
          <input name="name" type="text" required className={inputCls} placeholder="First and last name" />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Email">
            <input name="email" type="email" required className={inputCls} placeholder="you@example.com" />
          </Field>
          <Field label="Phone">
            <input name="phone" type="tel" className={inputCls} placeholder="Optional" />
          </Field>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Session type">
            <select name="session_type" className={inputCls} defaultValue="individual">
              <option value="individual">1:1 individual</option>
              <option value="couples">Couples</option>
              <option value="unsure">Not sure — please match me</option>
            </select>
          </Field>
          <Field label="Preferred format">
            <select name="preferred_format" className={inputCls} defaultValue="either">
              <option value="in-person">In person (Dhaka)</option>
              <option value="online">Online</option>
              <option value="either">Either</option>
            </select>
          </Field>
        </div>
        <Field label="Timezone" hint={tz ? `Detected: ${tz} — change if needed` : "Select your timezone"}>
          <select className={inputCls} value={tz} onChange={(e) => setTz(e.target.value)}>
            {zoneOptions.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </Field>
        <Field label="Anything you'd like us to know">
          <textarea name="notes" rows={4} className={inputCls} placeholder="Optional. As much or as little as you'd like." />
        </Field>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-medium text-[color:var(--navy)] disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {submitting ? "Sending…" : "Request booking"}
        </button>
        <p className="text-xs text-muted-foreground">
          A human on our team will look at every request — no auto-scheduling. We reply within one business day.
        </p>
      </div>
    </form>
  );
}

/* ---------- Corporate inquiry form ---------- */
function CorporateForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const f = new FormData(e.currentTarget);
    const payload = {
      name: String(f.get("name") || "").trim(),
      role: String(f.get("role") || "").trim() || null,
      organisation: String(f.get("organisation") || "").trim(),
      work_email: String(f.get("work_email") || "").trim(),
      team_size: String(f.get("team_size") || "") || null,
      program_interest: String(f.get("program_interest") || "") || null,
      context: String(f.get("context") || "").trim() || null,
    };
    if (!payload.name || !payload.organisation || !payload.work_email) {
      toast.error("Please add your name, organisation, and work email.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("corporate_inquiries").insert(payload);
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">
        <div>
          <h2 className="font-display text-3xl">Inquiry received</h2>
          <p className="mt-3 text-muted-foreground">Thanks for considering Nirvana for your team.</p>
        </div>
        <SuccessPanel
          title="We'll come back with a proposal shortly."
          body="Someone from our corporate team will follow up within one business day to set up a short discovery call and start shaping a program that fits your context."
        />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[2fr_3fr]">
      <div>
        <h2 className="font-display text-3xl">Corporate inquiry</h2>
        <p className="mt-3 text-muted-foreground">
          Tell us a little about your team. We'll come back with a proposal shaped to your context.
        </p>
      </div>
      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Your name"><input name="name" type="text" required className={inputCls} /></Field>
          <Field label="Role"><input name="role" type="text" className={inputCls} placeholder="e.g. Head of People" /></Field>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Organisation"><input name="organisation" type="text" required className={inputCls} /></Field>
          <Field label="Work email"><input name="work_email" type="email" required className={inputCls} /></Field>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Team size">
            <select name="team_size" className={inputCls} defaultValue="50-200">
              <option>1–50</option>
              <option>50–200</option>
              <option>200–500</option>
              <option>500+</option>
            </select>
          </Field>
          <Field label="Program interest">
            <select name="program_interest" className={inputCls} defaultValue="mixed">
              <option value="1to1">Confidential 1:1 access</option>
              <option value="workshops">Workshops & training</option>
              <option value="retreat">Off-site retreat</option>
              <option value="mixed">A mix — help us design it</option>
            </select>
          </Field>
        </div>
        <Field label="Context">
          <textarea name="context" rows={4} className={inputCls} placeholder="Where is your team right now, and what would 'good' look like?" />
        </Field>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {submitting ? "Sending…" : "Send inquiry"}
        </button>
      </div>
    </form>
  );
}

/* ---------- General contact form ---------- */
function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const f = new FormData(e.currentTarget);
    const payload = {
      name: String(f.get("name") || "").trim(),
      email: String(f.get("email") || "").trim(),
      message: String(f.get("message") || "").trim(),
    };
    if (!payload.name || !payload.email || !payload.message) {
      toast.error("Please fill in every field.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert(payload);
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">
        <div>
          <h2 className="font-display text-3xl">Message received</h2>
          <p className="mt-3 text-muted-foreground">Thank you for writing to us.</p>
        </div>
        <SuccessPanel
          title="We'll get back to you soon."
          body="Someone from our team will read your note and reply within one business day."
        />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[2fr_3fr]">
      <div>
        <h2 className="font-display text-3xl">General contact</h2>
        <p className="mt-3 text-muted-foreground">
          For media, partnerships, or anything that doesn't fit the two forms above.
        </p>
      </div>
      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Name"><input name="name" type="text" required className={inputCls} /></Field>
          <Field label="Email"><input name="email" type="email" required className={inputCls} /></Field>
        </div>
        <Field label="Message"><textarea name="message" rows={5} required className={inputCls} /></Field>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {submitting ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}

/* ---------- Expat reassurance ---------- */
function ExpatSection() {
  return (
    <section className="border-t border-border bg-[color:var(--sand)]/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1fr_2fr] lg:gap-16 lg:px-10">
        <div>
          <p className="font-eyebrow text-muted-foreground">For expats</p>
          <h3 className="mt-3 font-display text-3xl">New here? You're in familiar hands.</h3>
        </div>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Our clinicians work fluently in English and are trained in the same modalities you'll
            know from home — CBT, DBT, EMDR, ACT, IFS, and integrative talk therapy.
          </p>
          <p>
            We understand relocation, third-culture families, and the specific weight of being far
            from a support system. First sessions are $-flexible for those still finding their feet.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Field primitives ---------- */
const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-[color:var(--gold-deep)]";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}
