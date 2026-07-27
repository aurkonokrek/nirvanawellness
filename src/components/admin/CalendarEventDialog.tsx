import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ExternalLink, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { CalendarEntry } from "@/hooks/useCalendar";

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CalendarEventDialog({
  entry,
  onOpenChange,
  onSave,
  onUnschedule,
}: {
  entry: CalendarEntry | null;
  onOpenChange: (open: boolean) => void;
  onSave: (args: { scheduledAt: string; assignedExpert: string }) => void;
  onUnschedule: () => void;
}) {
  const navigate = useNavigate();
  const [when, setWhen] = useState("");
  const [assignedExpert, setAssignedExpert] = useState("");

  useEffect(() => {
    if (entry) {
      setWhen(toLocalInputValue(entry.scheduled_at));
      setAssignedExpert(entry.assigned_expert ?? "");
    }
  }, [entry]);

  return (
    <Dialog open={!!entry} onOpenChange={onOpenChange}>
      <DialogContent>
        {entry && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {entry.name}
                <StatusBadge status={entry.status} />
              </DialogTitle>
              <DialogDescription>
                Move this appointment or remove it from the calendar.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm text-foreground">Date &amp; time</span>
                <input
                  type="datetime-local"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                  className="w-full rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-gold-deep"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm text-foreground">Assigned to</span>
                <input
                  type="text"
                  value={assignedExpert}
                  onChange={(e) => setAssignedExpert(e.target.value)}
                  className="w-full rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-gold-deep"
                />
              </label>
            </div>

            <DialogFooter className="flex-row items-center justify-between sm:justify-between">
              <div className="flex gap-2">
                <button
                  onClick={onUnschedule}
                  className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700 hover:bg-red-100"
                >
                  <X className="h-3.5 w-3.5" /> Unschedule
                </button>
                <button
                  onClick={() => {
                    onOpenChange(false);
                    // /admin/inbox's validateSearch fills q/type/status/sort/dir/page
                    // defaults — only `open` needs to be passed explicitly here.
                    navigate({ to: "/admin/inbox", search: { open: `${entry.type}:${entry.id}` } });
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View in Inbox
                </button>
              </div>
              <button
                onClick={() =>
                  onSave({ scheduledAt: new Date(when).toISOString(), assignedExpert })
                }
                className="rounded-full bg-gold-gradient px-5 py-2 text-sm font-medium text-navy"
              >
                Save
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
