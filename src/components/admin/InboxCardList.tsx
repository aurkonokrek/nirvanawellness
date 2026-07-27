import { CalendarDays, Building2, MessageSquare, StickyNote } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { rowKey } from "@/components/admin/inbox-types";
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

export function InboxCardList({
  rows,
  selected,
  onToggleSelect,
  onOpen,
}: {
  rows: Submission[];
  selected: Set<string>;
  onToggleSelect: (key: string, checked: boolean) => void;
  onOpen: (s: Submission) => void;
}) {
  return (
    <div className="space-y-2 md:hidden">
      {rows.map((s) => {
        const key = rowKey(s);
        return (
          <div
            key={key}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm"
          >
            <div onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={selected.has(key)}
                onCheckedChange={(v) => onToggleSelect(key, !!v)}
                aria-label={`Select ${s.name}`}
              />
            </div>
            <button type="button" onClick={() => onOpen(s)} className="min-w-0 flex-1 text-left">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-muted-foreground">{TYPE_ICONS[s.type]}</span>
                <span className="font-medium text-foreground">{s.name}</span>
                <StatusBadge status={s.status} />
                {s.admin_notes && (
                  <StickyNote className="h-3 w-3 text-gold-deep" aria-label="Has internal notes" />
                )}
              </div>
              <div className="mt-0.5 truncate text-xs text-muted-foreground">
                {s.email} · {TYPE_LABELS[s.type]}
                {s.preferred_date && ` · Pref. ${s.preferred_date}`}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
