import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Loader2, Globe, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings · Nirvana Admin" }] }),
  component: AdminSettingsPage,
});

export function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timezone, setTimezone] = useState("Asia/Dhaka");
  const [notifyStaffPhone, setNotifyStaffPhone] = useState("");

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      const { data } = await supabase.from("site_settings").select("key, value");
      if (data) {
        data.forEach((row) => {
          if (row.key === "timezone") setTimezone(row.value);
          if (row.key === "notify_staff_phone") setNotifyStaffPhone(row.value);
        });
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updates = [
        { key: "timezone", value: timezone },
        { key: "notify_staff_phone", value: notifyStaffPhone },
      ];
      const { error } = await supabase.from("site_settings").upsert(updates);
      if (error) throw error;
      toast.success("Settings saved successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <p className="text-sm text-muted-foreground">
        Operational timezone and notification parameters.
      </p>

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="space-y-5">
          <label className="block">
            <span className="flex items-center gap-2 text-sm text-foreground">
              <Globe className="h-4 w-4 text-gold-deep" /> Practice Timezone
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              Used for daily reporting and notification scheduling
            </span>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="mt-2 w-full rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-gold-deep"
            >
              <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
              <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
              <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
              <option value="Europe/London">Europe/London (GMT+0)</option>
              <option value="America/New_York">America/New_York (GMT-5)</option>
            </select>
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-sm text-foreground">
              <Bell className="h-4 w-4 text-gold-deep" /> Staff Notification Contact Phone
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              Optional phone number for automated SMS or WhatsApp dispatch alerts
            </span>
            <input
              type="text"
              value={notifyStaffPhone}
              onChange={(e) => setNotifyStaffPhone(e.target.value)}
              placeholder="+880 1700 000000"
              className="mt-2 w-full rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-gold-deep"
            />
          </label>
        </div>

        <div className="border-t border-border pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-2.5 text-sm font-medium text-navy transition-opacity hover:opacity-95 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
