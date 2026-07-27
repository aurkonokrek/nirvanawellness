import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CalendarDays, Building2, MessageSquare, StickyNote, ExternalLink } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useContactNotes } from "@/hooks/useContacts";
import type { Contact } from "@/hooks/useContacts";
import type { Submission, SubmissionType } from "@/hooks/useSubmissions";

const TYPE_LABELS: Record<SubmissionType, string> = {
  session_request: "Session",
  corporate_inquiry: "Corporate",
  contact_message: "Contact",
};

const TYPE_ICONS: Record<SubmissionType, React.ReactNode> = {
  session_request: <CalendarDays className="h-3.5 w-3.5" />,
  corporate_inquiry: <Building2 className="h-3.5 w-3.5" />,
  contact_message: <MessageSquare className="h-3.5 w-3.5" />,
};

export function ContactDetailSheet({
  contact,
  submissions,
  onOpenChange,
}: {
  contact: Contact | null;
  submissions: Submission[];
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const { notes, addNote } = useContactNotes(contact?.id ?? null);
  const [draft, setDraft] = useState("");

  async function handleAddNote() {
    if (!draft.trim()) return;
    await addNote(draft.trim());
    setDraft("");
  }

  return (
    <Sheet open={!!contact} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {contact && (
          <>
            <SheetHeader>
              <SheetTitle className="font-display text-2xl">{contact.name || "Unnamed"}</SheetTitle>
              <SheetDescription className="sr-only">Contact history and notes</SheetDescription>
              <div className="space-y-0.5 pt-1 text-sm text-muted-foreground">
                {contact.email && <div>{contact.email}</div>}
                {contact.phone && <div>{contact.phone}</div>}
              </div>
            </SheetHeader>

            <div className="space-y-6 py-6">
              {/* Submission history */}
              <div>
                <span className="mb-2 block text-[10px] uppercase tracking-wider text-muted-foreground">
                  Submission history ({submissions.length})
                </span>
                <div className="space-y-2">
                  {submissions.map((s) => (
                    <button
                      key={s.type + s.id}
                      onClick={() =>
                        navigate({ to: "/admin/inbox", search: { open: `${s.type}:${s.id}` } })
                      }
                      className="flex w-full items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-left text-sm hover:bg-secondary/50"
                    >
                      <span className="text-muted-foreground">{TYPE_ICONS[s.type]}</span>
                      <span className="flex-1 truncate text-foreground">{TYPE_LABELS[s.type]}</span>
                      <StatusBadge status={s.status} />
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {new Date(s.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="border-t border-border pt-4">
                <span className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <StickyNote className="h-3 w-3" /> Notes
                </span>
                <div className="mb-3 space-y-2">
                  {notes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No notes yet.</p>
                  ) : (
                    notes.map((n) => (
                      <div key={n.id} className="rounded-md bg-secondary/30 px-3 py-2 text-sm">
                        <p className="text-foreground">{n.note}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {new Date(n.created_at).toLocaleString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  placeholder="Add a note about this person…"
                  className="w-full rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none focus:border-gold-deep"
                />
                {draft.trim() && (
                  <button
                    onClick={handleAddNote}
                    className="mt-2 rounded-full bg-secondary px-3 py-1.5 text-xs text-foreground hover:bg-secondary/70"
                  >
                    Add note
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
