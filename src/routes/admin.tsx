import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { LayoutDashboard, BarChart3, Settings, LogOut, Menu, X } from "lucide-react";
import { toast } from "sonner";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user);
      } else {
        setLoading(false);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
    // Check force-password-reset flag
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

  return (
    <div className="flex min-h-screen bg-[#0B1B3A] font-sans text-[#F5F1EA]">
      {/* Sidebar */}
      <aside className={[
        "fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-white/10 bg-[#0B1B3A] transition-transform duration-200",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      ].join(" ")}>
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <div className="h-7 w-7 rounded-sm bg-gradient-to-br from-[#B8862E] to-[#E8C878]" />
          <span className="font-display text-lg text-[#E8C878]">Nirvana</span>
          <span className="font-eyebrow text-[10px] text-[#8A8272]">Admin</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          <NavLink to="/admin" label="Submissions" icon={<LayoutDashboard className="h-4 w-4" />} exact />
          <NavLink to="/admin/analytics" label="Analytics" icon={<BarChart3 className="h-4 w-4" />} />
          <NavLink to="/admin/settings" label="Settings" icon={<Settings className="h-4 w-4" />} />
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-md bg-white/5 px-3 py-2">
            <p className="text-xs text-[#8A8272]">Signed in as</p>
            <p className="truncate text-xs font-medium text-[#F5F1EA]">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[#8A8272] transition-colors hover:bg-white/5 hover:text-[#F5F1EA]"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-white/10 bg-[#0B1B3A]/95 px-6 backdrop-blur">
          <button onClick={() => setSidebarOpen((v) => !v)} className="rounded-md p-1.5 text-[#8A8272] hover:text-[#F5F1EA] lg:hidden">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <h1 className="font-display text-lg text-[#F5F1EA]">Admin Panel</h1>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavLink({ to, label, icon, exact }: { to: string; label: string; icon: React.ReactNode; exact?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = exact ? pathname === to : pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={[
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
        isActive
          ? "bg-[#C9A05C]/20 text-[#C9A05C] font-medium"
          : "text-[#8A8272] hover:bg-white/5 hover:text-[#F5F1EA]",
      ].join(" ")}
    >
      {icon} {label}
    </Link>
  );
}

/* ---- Splash / loading ---- */
function AdminSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1B3A]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C9A05C] border-t-transparent" />
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
    const cleanEmail = email.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "").trim().toLowerCase();
    const cleanPassword = password.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "").trim();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPassword });
    setLoading(false);
    if (signInError) setError(signInError.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F1EA] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#B8862E] to-[#E8C878] shadow-lg">
            <span className="font-display text-2xl text-[#0B1B3A]">N</span>
          </div>
          <h1 className="font-display text-3xl text-[#0B1B3A]">Admin Access</h1>
          <p className="mt-2 text-sm text-[#8A8272]">Nirvana Wellness · Internal only</p>
        </div>
        <form onSubmit={onSubmit} className="rounded-xl border border-[#D9D2C4] bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm text-[#0B1B3A]">Email</span>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-[#D9D2C4] bg-[#F5F1EA] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#B8862E]"
                placeholder="sumaia@gmail.com"
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-[#0B1B3A]">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-[#D9D2C4] bg-[#F5F1EA] px-3 py-2.5 pr-10 text-sm outline-none transition-colors focus:border-[#B8862E]"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8A8272] hover:text-[#0B1B3A]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>
          </div>
          <button
            type="submit" disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#B8862E] to-[#D4A94A] py-3 text-sm font-medium text-[#0B1B3A] shadow-md transition-opacity disabled:opacity-60"
          >
            {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0B1B3A] border-t-transparent" /> : "Sign in"}
          </button>
        </form>
      </div>
    </div>
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
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
      data: { reset_required: false },
    });
    setLoading(false);
    if (updateError) { setError(updateError.message); return; }
    toast.success("Password updated. Welcome to the admin panel.");
    onDone();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F1EA] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#B8862E] to-[#E8C878]">
            <span className="font-display text-2xl text-[#0B1B3A]">N</span>
          </div>
          <h1 className="font-display text-2xl text-[#0B1B3A]">Set a new password</h1>
          <p className="mt-2 text-sm text-[#8A8272]">
            Hi {user.email} — please set a permanent password before continuing.
          </p>
        </div>
        <form onSubmit={onSubmit} className="rounded-xl border border-[#D9D2C4] bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm text-[#0B1B3A]">New password</span>
              <input
                type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-md border border-[#D9D2C4] bg-[#F5F1EA] px-3 py-2.5 text-sm outline-none focus:border-[#B8862E]"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-[#0B1B3A]">Confirm password</span>
              <input
                type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-md border border-[#D9D2C4] bg-[#F5F1EA] px-3 py-2.5 text-sm outline-none focus:border-[#B8862E]"
              />
            </label>
          </div>
          <button
            type="submit" disabled={loading}
            className="mt-6 flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#B8862E] to-[#D4A94A] py-3 text-sm font-medium text-[#0B1B3A] disabled:opacity-60"
          >
            {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0B1B3A] border-t-transparent" /> : "Set password & continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---- Access denied ---- */
function AccessDenied({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F5F1EA] px-4 text-center">
      <div className="font-display text-5xl text-[#0B1B3A]">Access denied.</div>
      <p className="text-[#8A8272]">Your account does not have admin privileges.</p>
      <button onClick={onSignOut} className="mt-2 rounded-full bg-[#0B1B3A] px-6 py-2.5 text-sm text-[#F5F1EA] hover:opacity-90">
        Sign out
      </button>
    </div>
  );
}
