import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Inbox as InboxIcon, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useSubmissions, type Submission, type SubmissionType } from "@/hooks/useSubmissions";
import { toast } from "sonner";
import { StatTile } from "@/components/admin/StatTile";
import { EmptyState } from "@/components/admin/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { InboxTable } from "@/components/admin/InboxTable";
import { InboxCardList } from "@/components/admin/InboxCardList";
import { SubmissionDetailSheet } from "@/components/admin/SubmissionDetailSheet";
import { BulkActionsBar } from "@/components/admin/BulkActionsBar";
import { inboxSearchSchema, rowKey, PAGE_SIZE } from "@/components/admin/inbox-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/inbox")({
  head: () => ({ meta: [{ title: "Inbox · Nirvana Admin" }] }),
  validateSearch: inboxSearchSchema,
  component: AdminIndexPage,
});

const TYPE_LABELS: Record<SubmissionType, string> = {
  session_request: "Session",
  corporate_inquiry: "Corporate",
  contact_message: "Contact",
};

function AdminIndexPage() {
  const { submissions, isLoading, setStatus, reschedule, setNotes } = useSubmissions();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { q, type: filterType, status: filterStatus, sort, dir, page, open } = search;

  function updateSearch(patch: Partial<typeof search>, resetPage = true) {
    navigate({
      search: (prev) => ({ ...prev, ...patch, ...(resetPage ? { page: 1 } : {}) }),
    });
  }

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return submissions.filter((s) => {
      if (filterType !== "all" && s.type !== filterType) return false;
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      if (
        query &&
        !(s.name.toLowerCase().includes(query) || (s.email ?? "").toLowerCase().includes(query))
      ) {
        return false;
      }
      return true;
    });
  }, [submissions, filterType, filterStatus, q]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let cmp = 0;
      if (sort === "name") cmp = a.name.localeCompare(b.name);
      else if (sort === "status") cmp = a.status.localeCompare(b.status);
      else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return dir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [filtered, sort, dir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openSubmission = open ? (submissions.find((s) => rowKey(s) === open) ?? null) : null;

  // A stale filter combo (e.g. back button after a status change) can leave the
  // page pointer past the end — snap back rather than showing a blank page.
  useEffect(() => {
    if (page !== currentPage) updateSearch({ page: currentPage }, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const counts = {
    new: submissions.filter((s) => s.status === "new").length,
    session: submissions.filter((s) => s.type === "session_request").length,
    corporate: submissions.filter((s) => s.type === "corporate_inquiry").length,
    contact: submissions.filter((s) => s.type === "contact_message").length,
  };

  async function withToast(action: () => Promise<unknown>, successMessage: string) {
    try {
      await action();
      toast.success(successMessage);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed.");
    }
  }

  function openRow(s: Submission) {
    navigate({ search: (prev) => ({ ...prev, open: rowKey(s) }) });
  }

  function closeSheet() {
    navigate({ search: (prev) => ({ ...prev, open: undefined }) });
  }

  function toggleSelect(key: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function toggleSelectAll(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const s of paged) {
        const key = rowKey(s);
        if (checked) next.add(key);
        else next.delete(key);
      }
      return next;
    });
  }

  async function runBulkAction(action: "confirmed" | "cancelled" | "closed" | "new") {
    const isTerminalAction = action === "new";
    const targets = submissions.filter((s) => {
      if (!selected.has(rowKey(s))) return false;
      const isTerminal = s.status === "closed" || s.status === "cancelled";
      return isTerminalAction ? isTerminal : !isTerminal;
    });
    if (targets.length === 0) {
      toast.error("None of the selected items are eligible for that action.");
      return;
    }
    const results = await Promise.allSettled(
      targets.map((s) => setStatus({ type: s.type, id: s.id, status: action })),
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    const ok = targets.length - failed;
    const verb =
      action === "confirmed"
        ? "Confirmed"
        : action === "cancelled"
          ? "Cancelled"
          : action === "closed"
            ? "Closed"
            : "Reopened";
    if (ok > 0) toast.success(`${verb} ${ok} item${ok === 1 ? "" : "s"}.`);
    if (failed > 0) toast.error(`${failed} failed.`);
    setSelected(new Set());
  }

  return (
    <div>
      <p className="mb-6 text-sm text-muted-foreground">
        Every session request, corporate inquiry, and message in one place.
      </p>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="New" value={counts.new} accent="var(--gold-deep)" />
        <StatTile label="Sessions" value={counts.session} accent="#2563EB" />
        <StatTile label="Corporate" value={counts.corporate} accent="#7C3AED" />
        <StatTile label="Contact" value={counts.contact} accent="#059669" />
      </div>

      {/* Search + filters */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => updateSearch({ q: e.target.value })}
            placeholder="Search by name or email…"
            className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-gold-deep sm:max-w-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["all", "session_request", "corporate_inquiry", "contact_message"] as const).map(
            (t) => (
              <FilterPill
                key={t}
                active={filterType === t}
                onClick={() => updateSearch({ type: t })}
              >
                {t === "all" ? "All types" : TYPE_LABELS[t as SubmissionType]}
              </FilterPill>
            ),
          )}
          <div className="mx-1 hidden h-4 w-px bg-border sm:block" />
          {(
            ["all", "new", "confirmed", "rescheduled", "contacted", "cancelled", "closed"] as const
          ).map((s) => (
            <FilterPill
              key={s}
              active={filterStatus === s}
              onClick={() => updateSearch({ status: s })}
            >
              <span className="capitalize">{s === "all" ? "All statuses" : s}</span>
            </FilterPill>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={submissions.length === 0 ? InboxIcon : Sparkles}
          title={submissions.length === 0 ? "Nothing here yet" : "No matches"}
          description={
            submissions.length === 0
              ? "Session requests, corporate inquiries, and contact messages will land here as they come in."
              : "Try a different search term or clear a filter."
          }
        />
      ) : (
        <>
          <BulkActionsBar
            count={selected.size}
            onAction={runBulkAction}
            onClear={() => setSelected(new Set())}
          />
          <InboxTable
            rows={paged}
            selected={selected}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            sort={sort}
            dir={dir}
            onSort={(field) =>
              updateSearch(
                { sort: field, dir: sort === field && dir === "asc" ? "desc" : "asc" },
                false,
              )
            }
            onOpen={openRow}
          />
          <InboxCardList
            rows={paged}
            selected={selected}
            onToggleSelect={toggleSelect}
            onOpen={openRow}
          />

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {currentPage} of {totalPages} · {sorted.length} total
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => updateSearch({ page: currentPage - 1 }, false)}
                  className={cn(
                    "flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs",
                    currentPage <= 1
                      ? "cursor-not-allowed opacity-40"
                      : "hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => updateSearch({ page: currentPage + 1 }, false)}
                  className={cn(
                    "flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs",
                    currentPage >= totalPages
                      ? "cursor-not-allowed opacity-40"
                      : "hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <SubmissionDetailSheet
        submission={openSubmission}
        wasOpen={!!open}
        onClose={closeSheet}
        onSetStatus={(status) => {
          if (!openSubmission) return;
          const s = openSubmission;
          void withToast(
            () => setStatus({ type: s.type, id: s.id, status }),
            status === "closed"
              ? "Closed."
              : status === "cancelled"
                ? "Cancelled."
                : status === "new"
                  ? "Reopened."
                  : "Confirmed.",
          );
        }}
        onReschedule={(newDate) => {
          if (!openSubmission) return;
          const s = openSubmission;
          void withToast(() => reschedule({ type: s.type, id: s.id, newDate }), "Rescheduled.");
        }}
        onSaveNotes={(notes) => {
          if (!openSubmission) return;
          const s = openSubmission;
          void withToast(() => setNotes({ type: s.type, id: s.id, notes }), "Note saved.");
        }}
      />
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? "border-gold-deep bg-gold-deep/10 text-gold-deep font-medium"
          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
