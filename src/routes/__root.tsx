import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import nirvanaLogo from "@/assets/nirvana-logo.png";

const NAV = [
  { to: "/approach", label: "Approach" },
  { to: "/experts", label: "Experts" },
  { to: "/activities", label: "Activities" },
  { to: "/retreats", label: "Retreats" },
  { to: "/corporate", label: "Corporate" },
  { to: "/resources", label: "Journal" },
] as const;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-eyebrow text-muted-foreground">404</p>
        <h1 className="mt-3 font-display text-5xl text-foreground">Not here.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for has moved or never existed.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl text-foreground">Something interrupted this page.</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again, or return home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full border border-input bg-background px-5 py-2.5 text-sm text-foreground hover:bg-accent/10"
          >
            Return home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nirvana Wellness — Mind, Body & Soul care in Dhaka" },
      {
        name: "description",
        content:
          "Nirvana Wellness offers accessible, holistic psychological care in Dhaka. Sessions with licensed experts, corporate wellbeing programs, and retreats — for individuals, expats, and teams.",
      },
      { name: "author", content: "Nirvana Wellness" },
      { property: "og:title", content: "Nirvana Wellness — Mind, Body & Soul care" },
      {
        property: "og:description",
        content:
          "Accessible, holistic psychological care in Dhaka. Sessions, corporate programs, and retreats.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/nirvana-logo.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Inter:wght@300;400;500;600&family=Josefin+Sans:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)} aria-label="Nirvana Wellness — home">
          <img src={nirvanaLogo} alt="" width={40} height={40} className="h-10 w-10 object-contain" />
          <span className="flex items-baseline gap-2">
            <span className="font-display text-2xl leading-none text-gold-gradient">Nirvana</span>
            <span className="font-eyebrow text-muted-foreground">Wellness</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group relative py-1 text-sm text-foreground/70 transition-colors hover:text-foreground"
              activeProps={{
                className:
                  "text-[color:var(--navy)] font-medium",
              }}
            >
              {item.label}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-[2px] scale-x-0 bg-gold-gradient transition-transform duration-300 origin-left group-hover:scale-x-100 group-data-[status=active]:scale-x-100"
              />
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            to="/book"
            className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Book a session
          </Link>
        </div>
        <button
          type="button"
          className="rounded-md p-2 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-2 py-2 text-sm text-foreground/80 hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/book"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-primary px-5 py-2.5 text-center text-sm text-primary-foreground"
            >
              Book a session
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-[color:var(--navy)] text-[color:var(--cream)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-4 lg:px-10">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <img src={nirvanaLogo} alt="" width={44} height={44} className="h-11 w-11 object-contain" />
            <span className="flex items-baseline gap-2">
              <span className="font-display text-2xl text-gold-gradient">Nirvana</span>
              <span className="font-eyebrow text-[color:var(--sand)]">Wellness</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-[color:var(--sand)]">
            Accessible, holistic psychological care — for mind, body, and soul.
          </p>
        </div>
        <FooterCol title="Care">
          <FooterLink to="/approach">Our approach</FooterLink>
          <FooterLink to="/experts">Meet the experts</FooterLink>
          <FooterLink to="/activities">Sessions & workshops</FooterLink>
          <FooterLink to="/book">Book a session</FooterLink>
        </FooterCol>
        <FooterCol title="Programs">
          <FooterLink to="/corporate">Corporate wellbeing</FooterLink>
          <FooterLink to="/retreats">Retreats for teams</FooterLink>
          <FooterLink to="/resources">Journal</FooterLink>
        </FooterCol>
        <FooterCol title="Reach us">
          <FooterLink to="/book">Contact & booking</FooterLink>
          <p className="text-sm text-[color:var(--sand)]">Dhaka, Bangladesh</p>
          <p className="text-sm text-[color:var(--sand)]">hello@nirvanawellness.org</p>
        </FooterCol>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-6 py-6 text-xs text-[color:var(--sand)]/70 lg:flex-row lg:items-center lg:px-10">
          <p>© {new Date().getFullYear()} Nirvana Wellness. All rights reserved.</p>
          <p>Care with dignity, in every season.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-eyebrow text-[color:var(--gold-soft)]">{title}</p>
      <ul className="mt-4 space-y-2.5">{Array.isArray(children) ? children.map((c, i) => <li key={i}>{c}</li>) : <li>{children}</li>}</ul>
    </div>
  );
}
function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="text-sm text-[color:var(--sand)] transition-colors hover:text-[color:var(--gold-soft)]">
      {children}
    </Link>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
