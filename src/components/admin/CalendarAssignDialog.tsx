import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Submission } from "@/hooks/useSubmissions";

function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CalendarAssignDialog({
  open,
  onOpenChange,
  initialDate,
  candidates,
  onAssign,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate: Date | null;
  /** Unscheduled session_request / corporate_inquiry rows, not cancelled/closed. */
  candidates: Submission[];
  onAssign: (args: {
    type: "session_request" | "corporate_inquiry";
    id: string;
    scheduledAt: string;
    assignedExpert: string;
  }) => void;
}) {
  const [selectedKey, setSelectedKey] = useState("");
  const [when, setWhen] = useState("");
  const [assignedExpert, setAssignedExpert] = useState("");

  useEffect(() => {
    if (open && initialDate) {
      setWhen(toLocalInputValue(initialDate));
      setSelectedKey("");
      setAssignedExpert("");
    }
  }, [open, initialDate]);

  const selected = candidates.find((c) => `${c.type}:${c.id}` === selectedKey);

  useEffect(() => {
    if (selected?.expert_name) setAssignedExpert(selected.expert_name);
  }, [selected]);

  function handleSave() {
    if (!selected || !when) return;
    onAssign({
      type: selected.type as "session_request" | "corporate_inquiry",
      id: selected.id,
      scheduledAt: new Date(when).toISOString(),
      assignedExpert,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule a slot</DialogTitle>
          <DialogDescription>
            Assign a pending request to this time. Only requests without a slot yet are listed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm text-foreground">Request</span>
            {candidates.length === 0 ? (
              <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
                Nothing waiting to be scheduled — confirm a request in the Inbox first.
              </p>
            ) : (
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="w-full rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-gold-deep"
              >
                <option value="">Select a request…</option>
                {candidates.map((c) => (
                  <option key={`${c.type}:${c.id}`} value={`${c.type}:${c.id}`}>
                    {c.name} — {c.type === "session_request" ? "Session" : "Corporate"} ({c.status})
                  </option>
                ))}
              </select>
            )}
          </label>

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
              placeholder="Clinician or facilitator name"
              className="w-full rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-gold-deep"
            />
          </label>
        </div>

        <DialogFooter>
          <button
            onClick={handleSave}
            disabled={!selected || !when}
            className="rounded-full bg-gold-gradient px-5 py-2 text-sm font-medium text-navy disabled:opacity-40"
          >
            Schedule
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
