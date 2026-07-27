import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  Building2,
  MessageSquare,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { rowKey } from "@/components/admin/inbox-types";
import type { Submission, SubmissionType } from "@/hooks/useSubmissions";
import { cn } from "@/lib/utils";

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

type SortField = "created_at" | "name" | "status";

export function InboxTable({
  rows,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  sort,
  dir,
  onSort,
  onOpen,
}: {
  rows: Submission[];
  selected: Set<string>;
  onToggleSelect: (key: string, checked: boolean) => void;
  onToggleSelectAll: (checked: boolean) => void;
  sort: SortField;
  dir: "asc" | "desc";
  onSort: (field: SortField) => void;
  onOpen: (s: Submission) => void;
}) {
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(rowKey(r)));

  return (
    <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(v) => onToggleSelectAll(!!v)}
                aria-label="Select all rows on this page"
              />
            </TableHead>
            <SortableHead field="name" sort={sort} dir={dir} onSort={onSort}>
              Name
            </SortableHead>
            <TableHead>Type</TableHead>
            <SortableHead field="status" sort={sort} dir={dir} onSort={onSort}>
              Status
            </SortableHead>
            <TableHead>Preferred date</TableHead>
            <SortableHead field="created_at" sort={sort} dir={dir} onSort={onSort}>
              Received
            </SortableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((s) => {
            const key = rowKey(s);
            return (
              <TableRow
                key={key}
                className="cursor-pointer"
                data-state={selected.has(key) ? "selected" : undefined}
                onClick={() => onOpen(s)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(key)}
                    onCheckedChange={(v) => onToggleSelect(key, !!v)}
                    aria-label={`Select ${s.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.email}</div>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {TYPE_ICONS[s.type]} {TYPE_LABELS[s.type]}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={s.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {s.preferred_date ?? "—"}
                </TableCell>
                <TableCell className="tabular-nums text-sm text-muted-foreground">
                  {new Date(s.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function SortableHead({
  field,
  sort,
  dir,
  onSort,
  children,
}: {
  field: SortField;
  sort: SortField;
  dir: "asc" | "desc";
  onSort: (field: SortField) => void;
  children: React.ReactNode;
}) {
  const isActive = sort === field;
  const Icon = isActive ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TableHead>
      <button
        onClick={() => onSort(field)}
        aria-sort={isActive ? (dir === "asc" ? "ascending" : "descending") : "none"}
        className={cn(
          "flex items-center gap-1 text-xs font-medium uppercase tracking-wide transition-colors hover:text-foreground",
          isActive ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {children}
        <Icon className="h-3 w-3" />
      </button>
    </TableHead>
  );
}
