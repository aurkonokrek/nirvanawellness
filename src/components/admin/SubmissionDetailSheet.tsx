import { useState } from "react";
import {
  Check,
  RefreshCw,
  X,
  RotateCcw,
  StickyNote,
  CalendarDays,
  Building2,
  MessageSquare,
  History,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Submission, SubmissionType } from "@/hooks/useSubmissions";

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

export function SubmissionDetailSheet({
  submission,
  wasOpen,
  onClose,
  onSetStatus,
  onReschedule,
  onSaveNotes,
}: {
  submission: Submission | null;
  /** True if an `open` id was in the URL but no matching row was found (e.g. deleted, or stale link). */
  wasOpen: boolean;
  onClose: () => void;
  onSetStatus: (status: "confirmed" | "cancelled" | "closed" | "new") => void;
  onReschedule: (d: string) => void;
  onSaveNotes: (notes: string) => void;
}) {
  return (
    <Sheet open={!!submission || wasOpen} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {submission ? (
          <SubmissionDetailBody
            s={submission}
            onSetStatus={onSetStatus}
            onReschedule={onReschedule}
            onSaveNotes={onSaveNotes}
          />
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>Not found</SheetTitle>
              <SheetDescription>
                This submission may have been removed, or the link is out of date.
              </SheetDescription>
            </SheetHeader>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function SubmissionDetailBody({
  s,
  onSetStatus,
  onReschedule,
  onSaveNotes,
}: {
  s: Submission;
  onSetStatus: (status: "confirmed" | "cancelled" | "closed" | "new") => void;
  onReschedule: (d: string) => void;
  onSaveNotes: (notes: string) => void;
}) {
  const [newDate, setNewDate] = useState(s.preferred_date ?? "");
  const [showReschedule, setShowReschedule] = useState(false);
  const [notesDraft, setNotesDraft] = useState(s.admin_notes ?? "");

  const isTerminal = s.status === "closed" || s.status === "cancelled";
  const canReschedule = s.type !== "contact_message";
  const wasUpdated = s.updated_at && s.updated_at !== s.created_at;

  return (
    <div className="flex h-full flex-col">
      <SheetHeader>
        <div className="flex items-center gap-2 text-muted-foreground">
          {TYPE_ICONS[s.type]}
          <span className="text-xs">{TYPE_LABELS[s.type]}</span>
        </div>
        <SheetTitle className="font-display text-2xl">{s.name}</SheetTitle>
        <div className="flex items-center gap-2 pt-1">
          <StatusBadge status={s.status} />
        </div>
        <SheetDescription className="sr-only">Submission detail and actions</SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-6 py-6">
        {/* Fields */}
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
        </div>

        {(s.notes ?? s.message ?? s.context) && (
          <div>
            <Detail label="Message from client" value={s.notes ?? s.message ?? s.context ?? ""} />
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-2 border-t border-border pt-4">
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <History className="h-3 w-3" /> Timeline
          </span>
          <ul className="space-y-1.5 text-sm text-foreground">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-deep" />
              Requested {formatDateTime(s.created_at)}
            </li>
            {wasUpdated && (
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                Last updated {formatDateTime(s.updated_at)}
              </li>
            )}
          </ul>
        </div>

        {/* Internal notes */}
        <div className="border-t border-border pt-4">
          <span className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <StickyNote className="h-3 w-3" /> Internal note (not visible to the client)
          </span>
          <textarea
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-gold-deep"
            placeholder="e.g. Prefers evening slots, flagged for follow-up…"
          />
          {notesDraft !== (s.admin_notes ?? "") && (
            <button
              onClick={() => onSaveNotes(notesDraft)}
              className="mt-2 rounded-full bg-secondary px-3 py-1.5 text-xs text-foreground hover:bg-secondary/70"
            >
              Save note
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
        {isTerminal ? (
          <button
            onClick={() => onSetStatus("new")}
            className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-4 py-2 text-xs text-foreground hover:bg-secondary/70"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reopen
          </button>
        ) : (
          <>
            {s.status !== "confirmed" && (
              <button
                onClick={() => onSetStatus("confirmed")}
                className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
              >
                <Check className="h-3.5 w-3.5" /> Confirm
              </button>
            )}

            {canReschedule && (
              <>
                <button
                  onClick={() => setShowReschedule((v) => !v)}
                  className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-700 hover:bg-amber-100"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Reschedule
                </button>
                {showReschedule && (
                  <div className="flex w-full items-center gap-2">
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="rounded-md border border-border bg-card px-2 py-1.5 text-xs text-foreground outline-none focus:border-gold-deep"
                    />
                    <button
                      onClick={() => {
                        if (newDate) {
                          onReschedule(newDate);
                          setShowReschedule(false);
                        }
                      }}
                      className="rounded-full bg-amber-500 px-3 py-1.5 text-xs text-white"
                    >
                      Set date
                    </button>
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => onSetStatus("cancelled")}
              className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700 hover:bg-red-100"
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </button>

            <button
              onClick={() => onSetStatus("closed")}
              className="rounded-full border border-border bg-secondary/40 px-4 py-2 text-xs text-muted-foreground hover:bg-secondary/70"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm text-foreground">{value}</div>
    </div>
  );
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
