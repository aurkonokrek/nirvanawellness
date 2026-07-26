import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, Building2, MessageSquare, ChevronDown, ChevronUp, Check, RefreshCw, Loader2 } from "lucide-react";
import { useSubmissions, type Submission, type SubmissionType } from "@/hooks/useSubmissions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Submissions · Nirvana Admin" }] }),
  component: AdminIndexPage,
});

const TYPE_LABELS: Record<SubmissionType, string> = {
  session_request: "Session",
  corporate_inquiry: "Corporate",
  contact_message: "Contact",
};

const TYPE_ICONS: Record<SubmissionType, React.ReactNode> = {
  session_request: <CalendarDays className="h-4 w-4" />,
  corporate_inquiry: <Building2 className="h-4 w-4" />,
  contact_message: <MessageSquare className="h-4 w-4" />,
};

const STATUS_PALETTE: Record<string, string> = {
  new: "bg-sky-400/20 text-sky-300 border-sky-400/30",
  confirmed: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30",
  rescheduled: "bg-amber-400/20 text-amber-300 border-amber-400/30",
  cancelled: "bg-red-400/20 text-red-300 border-red-400/30",
  contacted: "bg-violet-400/20 text-violet-300 border-violet-400/30",
  closed: "bg-zinc-400/20 text-zinc-400 border-zinc-400/30",
};

function AdminIndexPage() {
  const { submissions, isLoading, confirmSession, rescheduleSession, confirmCorporate, rescheduleCorporate, updateContactStatus } = useSubmissions();
  const [filterType, setFilterType] = useState<SubmissionType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = submissions.filter((s) => {
    if (filterType !== "all" && s.type !== filterType) return false;
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    return true;
  });

  const counts = {
    new: submissions.filter((s) => s.status === "new").length,
    session: submissions.filter((s) => s.type === "session_request").length,
    corporate: submissions.filter((s) => s.type === "corporate_inquiry").length,
    contact: submissions.filter((s) => s.type === "contact_message").length,
  };

  return (
    <div>
      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "New", value: counts.new, accent: "#C9A05C" },
          { label: "Sessions", value: counts.session, accent: "#60A5FA" },
          { label: "Corporate", value: counts.corporate, accent: "#A78BFA" },
          { label: "Contact", value: counts.contact, accent: "#34D399" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="font-display text-3xl" style={{ color: stat.accent }}>{stat.value}</div>
            <div className="mt-1 text-xs text-[#8A8272]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all", "session_request", "corporate_inquiry", "contact_message"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={[
              "rounded-full border px-3 py-1 text-xs transition-colors",
              filterType === t
                ? "border-[#C9A05C] bg-[#C9A05C]/20 text-[#C9A05C]"
                : "border-white/10 text-[#8A8272] hover:border-white/20 hover:text-[#F5F1EA]",
            ].join(" ")}
          >
            {t === "all" ? "All types" : TYPE_LABELS[t as SubmissionType]}
          </button>
        ))}
        <div className="ml-2 h-4 w-px bg-white/10" />
        {(["all", "new", "confirmed", "rescheduled", "contacted", "closed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={[
              "rounded-full border px-3 py-1 text-xs transition-colors capitalize",
              filterStatus === s
                ? "border-[#C9A05C] bg-[#C9A05C]/20 text-[#C9A05C]"
                : "border-white/10 text-[#8A8272] hover:border-white/20 hover:text-[#F5F1EA]",
            ].join(" ")}
          >
            {s === "all" ? "All statuses" : s}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#C9A05C]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/10 py-20 text-center text-[#8A8272]">No submissions match this filter.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <SubmissionRow
              key={s.id + s.type}
              s={s}
              expanded={expanded === s.id}
              onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
              onConfirm={async () => {
                try {
                  if (s.type === "session_request") await confirmSession({ id: s.id });
                  else if (s.type === "corporate_inquiry") await confirmCorporate({ id: s.id });
                  toast.success("Confirmed.");
                } catch { toast.error("Failed."); }
              }}
              onReschedule={async (newDate: string) => {
                try {
                  if (s.type === "session_request") await rescheduleSession({ id: s.id, newDate });
                  else if (s.type === "corporate_inquiry") await rescheduleCorporate({ id: s.id, newDate });
                  toast.success("Rescheduled.");
                } catch { toast.error("Failed."); }
              }}
              onClose={async () => {
                try {
                  if (s.type === "contact_message") await updateContactStatus({ id: s.id, status: "closed" });
                  else await updateContactStatus({ id: s.id, status: "closed" });
                  toast.success("Closed.");
                } catch { toast.error("Failed."); }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionRow({
  s, expanded, onToggle, onConfirm, onReschedule, onClose
}: {
  s: Submission;
  expanded: boolean;
  onToggle: () => void;
  onConfirm: () => void;
  onReschedule: (d: string) => void;
  onClose: () => void;
}) {
  const [newDate, setNewDate] = useState(s.preferred_date ?? "");
  const [showReschedule, setShowReschedule] = useState(false);

  const statusCls = STATUS_PALETTE[s.status] ?? STATUS_PALETTE.new;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] transition-colors hover:bg-white/[0.06]">
      {/* Row header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
      >
        <div className="hidden text-[#8A8272] sm:block">{TYPE_ICONS[s.type]}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-[#F5F1EA]">{s.name}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] ${statusCls}`}>{s.status}</span>
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-[#8A8272]">{TYPE_LABELS[s.type]}</span>
          </div>
          <div className="mt-0.5 truncate text-xs text-[#8A8272]">
            {s.email} · {new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            {s.preferred_date && ` · Pref. ${s.preferred_date}`}
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-[#8A8272]" /> : <ChevronDown className="h-4 w-4 text-[#8A8272]" />}
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-white/10 px-5 py-4">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            {s.email && <Detail label="Email" value={s.email} />}
            {s.phone && <Detail label="Phone" value={s.phone} />}
            {s.organisation && <Detail label="Organisation" value={s.organisation} />}
            {s.session_type && <Detail label="Session type" value={s.session_type} />}
            {s.preferred_format && <Detail label="Format" value={s.preferred_format} />}
            {s.timezone && <Detail label="Timezone" value={s.timezone} />}
            {s.expert_name && <Detail label="Expert requested" value={s.expert_name} />}
            {s.program_interest && <Detail label="Program interest" value={s.program_interest} />}
            {s.preferred_date && <Detail label="Preferred date" value={s.preferred_date} />}
            {(s.notes ?? s.message ?? s.context) && (
              <div className="sm:col-span-2">
                <Detail label="Notes / message" value={s.notes ?? s.message ?? s.context ?? ""} />
              </div>
            )}
          </div>

          {/* Actions */}
          {s.status === "new" && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={onConfirm}
                className="flex items-center gap-1.5 rounded-full bg-emerald-600/80 px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
              >
                <Check className="h-3.5 w-3.5" /> Confirm
              </button>

              {s.type !== "contact_message" && (
                <>
                  <button
                    onClick={() => setShowReschedule((v) => !v)}
                    className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs text-amber-300 hover:bg-amber-400/20"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Reschedule
                  </button>
                  {showReschedule && (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="rounded-md border border-white/20 bg-white/5 px-2 py-1.5 text-xs text-[#F5F1EA] outline-none focus:border-[#C9A05C]"
                      />
                      <button
                        onClick={() => { if (newDate) { onReschedule(newDate); setShowReschedule(false); } }}
                        className="rounded-full bg-amber-500/80 px-3 py-1.5 text-xs text-white"
                      >
                        Set date
                      </button>
                    </div>
                  )}
                </>
              )}

              <button
                onClick={onClose}
                className="rounded-full border border-zinc-500/30 bg-zinc-500/10 px-4 py-2 text-xs text-zinc-400 hover:bg-zinc-500/20"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[#8A8272]">{label}</div>
      <div className="mt-0.5 text-sm text-[#F5F1EA]">{value}</div>
    </div>
  );
}
