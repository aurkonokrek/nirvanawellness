import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Users, Mail, Phone } from "lucide-react";
import { useContacts, type Contact } from "@/hooks/useContacts";
import { useSubmissions } from "@/hooks/useSubmissions";
import { ContactDetailSheet } from "@/components/admin/ContactDetailSheet";
import { StatTile } from "@/components/admin/StatTile";
import { EmptyState } from "@/components/admin/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/contacts")({
  head: () => ({ meta: [{ title: "Contacts · Nirvana Admin" }] }),
  component: AdminContactsPage,
});

function AdminContactsPage() {
  const { contacts, isLoading } = useContacts();
  const { submissions } = useSubmissions();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Contact | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) => (c.name ?? "").toLowerCase().includes(q) || (c.email ?? "").toLowerCase().includes(q),
    );
  }, [contacts, query]);

  const selectedSubmissions = useMemo(
    () => (selected ? submissions.filter((s) => s.contact_id === selected.id) : []),
    [selected, submissions],
  );

  return (
    <div>
      <p className="mb-6 text-sm text-muted-foreground">
        Every person who has reached out — deduplicated across sessions, corporate inquiries, and
        messages.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile icon={Users} label="Total Contacts" value={contacts.length} />
        <StatTile icon={Mail} label="With Email" value={contacts.filter((c) => c.email).length} />
        <StatTile icon={Phone} label="With Phone" value={contacts.filter((c) => c.phone).length} />
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-gold-deep sm:max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={contacts.length === 0 ? "No contacts yet" : "No matches"}
          description={
            contacts.length === 0
              ? "Contacts are created automatically from session requests, corporate inquiries, and messages."
              : "Try a different search term."
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Last contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer" onClick={() => setSelected(c)}>
                    <TableCell className="font-medium text-foreground">
                      {c.name || "Unnamed"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.phone ?? "—"}
                    </TableCell>
                    <TableCell className="tabular-nums text-sm text-foreground">
                      {c.submission_count}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.last_submission_at
                        ? new Date(c.last_submission_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 text-left shadow-sm"
              >
                <div className="min-w-0">
                  <div className="font-medium text-foreground">{c.name || "Unnamed"}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {c.email ?? c.phone ?? "No contact info"}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                  {c.submission_count}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      <ContactDetailSheet
        contact={selected}
        submissions={selectedSubmissions}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}
