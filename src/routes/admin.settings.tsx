import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Loader2, Globe, Bell } from "lucide-react";

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
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#C9A05C]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="font-display text-2xl text-[#F5F1EA]">Practice Settings</h2>
        <p className="text-sm text-[#8A8272]">Manage operational timezone and notification parameters</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <div className="space-y-4">
          <label className="block">
            <span className="flex items-center gap-2 text-sm text-[#F5F1EA]">
              <Globe className="h-4 w-4 text-[#C9A05C]" /> Practice Timezone
            </span>
            <span className="mt-1 block text-xs text-[#8A8272]">
              Used for daily reporting and notification scheduling
            </span>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="mt-2 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#F5F1EA] outline-none focus:border-[#C9A05C]"
            >
              <option value="Asia/Dhaka" className="bg-[#0B1B3A]">Asia/Dhaka (GMT+6)</option>
              <option value="Asia/Kolkata" className="bg-[#0B1B3A]">Asia/Kolkata (GMT+5:30)</option>
              <option value="Asia/Singapore" className="bg-[#0B1B3A]">Asia/Singapore (GMT+8)</option>
              <option value="Asia/Dubai" className="bg-[#0B1B3A]">Asia/Dubai (GMT+4)</option>
              <option value="Europe/London" className="bg-[#0B1B3A]">Europe/London (GMT+0)</option>
              <option value="America/New_York" className="bg-[#0B1B3A]">America/New_York (GMT-5)</option>
            </select>
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-sm text-[#F5F1EA]">
              <Bell className="h-4 w-4 text-[#C9A05C]" /> Staff Notification Contact Phone
            </span>
            <span className="mt-1 block text-xs text-[#8A8272]">
              Optional phone number for automated SMS or WhatsApp dispatch alerts
            </span>
            <input
              type="text"
              value={notifyStaffPhone}
              onChange={(e) => setNotifyStaffPhone(e.target.value)}
              placeholder="+880 1700 000000"
              className="mt-2 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#F5F1EA] outline-none focus:border-[#C9A05C]"
            />
          </label>
        </div>

        <div className="border-t border-white/10 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#B8862E] to-[#D4A94A] px-6 py-2.5 text-sm font-medium text-[#0B1B3A] transition-opacity disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
