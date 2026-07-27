import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { AlertCircle, CalendarClock, CalendarDays, Building2, ArrowRight } from "lucide-react";
import { useSubmissions, type Submission } from "@/hooks/useSubmissions";
import { useCalendar, type CalendarEntry } from "@/hooks/useCalendar";
import { StatTile } from "@/components/admin/StatTile";
import { EmptyState } from "@/components/admin/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { addDays, isSameDay, startOfWeek } from "@/components/admin/calendar-utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Today · Nirvana Admin" }] }),
  component: AdminTodayPage,
});

const DAY_MS = 24 * 60 * 60 * 1000;

function AdminTodayPage() {
  const { submissions, isLoading: submissionsLoading } = useSubmissions();
  const navigate = useNavigate();

  const today = useMemo(() => new Date(), []);
  const weekStart = useMemo(() => startOfWeek(today), [today]);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const { entries, isLoading: calendarLoading } = useCalendar(weekStart, weekEnd);

  const newLast24h = submissions.filter(
    (s) => Date.now() - new Date(s.created_at).getTime() < DAY_MS,
  );
  const unanswered = submissions.filter(
    (s) => s.status === "new" && Date.now() - new Date(s.created_at).getTime() >= DAY_MS,
  );
  const todaysEntries = entries
    .filter((e) => isSameDay(new Date(e.scheduled_at), today))
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  const tomorrow = addDays(today, 1);
  const tomorrowsEntries = entries
    .filter((e) => isSameDay(new Date(e.scheduled_at), tomorrow))
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekCounts = weekDays.map(
    (day) => entries.filter((e) => isSameDay(new Date(e.scheduled_at), day)).length,
  );

  function openSubmission(s: Pick<Submission, "type" | "id">) {
    navigate({ to: "/admin/inbox", search: { open: `${s.type}:${s.id}` } });
  }

  const isLoading = submissionsLoading || calendarLoading;

  return (
    <div>
      <p className="mb-6 text-sm text-muted-foreground">
        {today.toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="New (24h)" value={newLast24h.length} accent="var(--gold-deep)" />
        <StatTile label="Unanswered" value={unanswered.length} accent="#DC2626" />
        <StatTile label="Scheduled Today" value={todaysEntries.length} accent="#2563EB" />
        <StatTile
          label="Scheduled This Week"
          value={weekCounts.reduce((a, b) => a + b, 0)}
          accent="#7C3AED"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Needs attention */}
          <Section
            icon={AlertCircle}
            title="Needs attention"
            subtitle={
              unanswered.length > 0 ? `${unanswered.length} unanswered over 24h` : undefined
            }
          >
            {unanswered.length === 0 ? (
              <EmptyState
                icon={AlertCircle}
                title="All caught up"
                description="Nothing has been sitting unanswered for more than a day."
              />
            ) : (
              <div className="space-y-2">
                {unanswered.map((s) => (
                  <button
                    key={s.type + s.id}
                    onClick={() => openSubmission(s)}
                    className="flex w-full items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-left text-sm hover:bg-red-100"
                  >
                    <span className="font-medium text-foreground">{s.name}</span>
                    <span className="text-xs text-red-700">
                      {new Date(s.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Section>

          {/* Today's schedule */}
          <Section icon={CalendarClock} title="Today's schedule">
            <ScheduleList
              entries={todaysEntries}
              onOpen={openSubmission}
              emptyLabel="Nothing scheduled today."
            />
          </Section>

          {/* Tomorrow's schedule */}
          <Section icon={CalendarClock} title="Tomorrow's schedule">
            <ScheduleList
              entries={tomorrowsEntries}
              onOpen={openSubmission}
              emptyLabel="Nothing scheduled tomorrow yet."
            />
          </Section>

          {/* Week at a glance */}
          <Section
            icon={CalendarDays}
            title="This week at a glance"
            action={
              <button
                onClick={() => navigate({ to: "/admin/calendar" })}
                className="flex items-center gap-1 text-xs text-gold-deep hover:underline"
              >
                Open calendar <ArrowRight className="h-3 w-3" />
              </button>
            }
          >
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, i) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "rounded-lg border border-border bg-secondary/20 p-2 text-center",
                    isSameDay(day, today) && "border-gold-deep/40 bg-gold-deep/10",
                  )}
                >
                  <div className="font-eyebrow text-muted-foreground">
                    {day.toLocaleDateString("en-GB", { weekday: "short" })}
                  </div>
                  <div className="mt-0.5 text-sm text-foreground">{day.getDate()}</div>
                  <div className="mt-1 font-display text-lg text-gold-deep">{weekCounts[i]}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gold-deep" />
          <h3 className="font-display text-lg text-foreground">{title}</h3>
          {subtitle && <span className="text-xs text-muted-foreground">· {subtitle}</span>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function ScheduleList({
  entries,
  onOpen,
  emptyLabel,
}: {
  entries: CalendarEntry[];
  onOpen: (e: Pick<Submission, "type" | "id">) => void;
  emptyLabel: string;
}) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <div className="space-y-2">
      {entries.map((e) => (
        <button
          key={e.type + e.id}
          onClick={() => onOpen(e)}
          className="flex w-full items-center gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-left text-sm hover:bg-secondary/50"
        >
          <span className="tabular-nums text-xs font-medium text-gold-deep">
            {new Date(e.scheduled_at).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="text-muted-foreground">
            {e.type === "session_request" ? (
              <CalendarDays className="h-3.5 w-3.5" />
            ) : (
              <Building2 className="h-3.5 w-3.5" />
            )}
          </span>
          <span className="flex-1 truncate text-foreground">{e.name}</span>
          {e.assigned_expert && (
            <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
              {e.assigned_expert}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
