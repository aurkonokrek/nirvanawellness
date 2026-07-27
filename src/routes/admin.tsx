import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin · Nirvana Wellness" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [forceReset, setForceReset] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user);
      } else {
        setLoading(false);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function checkAdmin(u: User) {
    if (u.user_metadata?.reset_required === true) {
      setForceReset(true);
      setLoading(false);
      return;
    }
    const { data } = await supabase.rpc("has_role", { _user_id: u.id, _role: "admin" });
    setIsAdmin(!!data);
    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out.");
  }

  if (loading) return <AdminSplash />;
  if (!user) return <AdminLogin />;
  if (forceReset) return <ForcePasswordReset user={user} onDone={() => setForceReset(false)} />;
  if (!isAdmin) return <AccessDenied onSignOut={handleSignOut} />;

  return <AdminShell user={user} onSignOut={handleSignOut} />;
}

/* ---- Splash / loading ---- */
function AdminSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-gold-deep" />
    </div>
  );
}

function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gold-gradient shadow-lg">
            <span className="font-display text-2xl text-navy">N</span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">{children}</div>
      </div>
    </div>
  );
}

/* ---- Login form ---- */
function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const cleanEmail = email
      .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "")
      .trim()
      .toLowerCase();
    const cleanPassword = password.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "").trim();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });
    setLoading(false);
    if (signInError) setError(signInError.message);
  }

  return (
    <AuthCard>
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl text-foreground">Admin Access</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Nirvana Wellness · Internal only</p>
      </div>
      <form onSubmit={onSubmit}>
        {error && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm text-foreground">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-secondary/40 px-3 py-2.5 text-sm outline-none transition-colors focus:border-gold-deep"
              placeholder="sumaia@gmail.com"
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-foreground">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-border bg-secondary/40 px-3 py-2.5 pr-10 text-sm outline-none transition-colors focus:border-gold-deep"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient py-3 text-sm font-medium text-navy shadow-md transition-opacity hover:opacity-95 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </button>
      </form>
    </AuthCard>
  );
}

/* ---- Force password reset ---- */
function ForcePasswordReset({ user, onDone }: { user: User; onDone: () => void }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
      data: { reset_required: false },
    });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    toast.success("Password updated. Welcome to the admin panel.");
    onDone();
  }

  return (
    <AuthCard>
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl text-foreground">Set a new password</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Hi {user.email} — please set a permanent password before continuing.
        </p>
      </div>
      <form onSubmit={onSubmit}>
        {error && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm text-foreground">New password</span>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-gold-deep"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-foreground">Confirm password</span>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-md border border-border bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-gold-deep"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center rounded-full bg-gold-gradient py-3 text-sm font-medium text-navy disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set password & continue"}
        </button>
      </form>
    </AuthCard>
  );
}

/* ---- Access denied ---- */
function AccessDenied({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="font-display text-5xl text-foreground">Access denied.</div>
      <p className="text-muted-foreground">Your account does not have admin privileges.</p>
      <button
        onClick={onSignOut}
        className="mt-2 rounded-full bg-navy px-6 py-2.5 text-sm text-cream hover:opacity-90"
      >
        Sign out
      </button>
    </div>
  );
}
