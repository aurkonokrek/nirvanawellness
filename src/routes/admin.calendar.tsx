import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useCalendar, type CalendarEntry } from "@/hooks/useCalendar";
import { useSubmissions } from "@/hooks/useSubmissions";
import { CalendarWeekGrid } from "@/components/admin/CalendarWeekGrid";
import { CalendarMonthGrid } from "@/components/admin/CalendarMonthGrid";
import { CalendarAssignDialog } from "@/components/admin/CalendarAssignDialog";
import { CalendarEventDialog } from "@/components/admin/CalendarEventDialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BUSINESS_HOURS,
  addDays,
  startOfWeek,
  startOfMonthGrid,
  endOfMonthGrid,
} from "@/components/admin/calendar-utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/calendar")({
  head: () => ({ meta: [{ title: "Calendar · Nirvana Admin" }] }),
  component: AdminCalendarPage,
});

type ViewMode = "week" | "month";

function AdminCalendarPage() {
  const [mode, setMode] = useState<ViewMode>("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const [assignTarget, setAssignTarget] = useState<Date | null>(null);
  const [eventTarget, setEventTarget] = useState<CalendarEntry | null>(null);

  const { submissions, setSchedule } = useSubmissions();

  const weekStart = useMemo(() => startOfWeek(anchor), [anchor]);
  const monthGridStart = useMemo(() => startOfMonthGrid(anchor), [anchor]);
  const monthGridEnd = useMemo(() => endOfMonthGrid(anchor), [anchor]);

  const rangeStart = mode === "week" ? weekStart : monthGridStart;
  const rangeEnd = mode === "week" ? addDays(weekStart, 6) : addDays(monthGridEnd, -1);
  const { entries, isLoading } = useCalendar(rangeStart, rangeEnd);

  const candidates = useMemo(
    () =>
      submissions.filter(
        (s) =>
          (s.type === "session_request" || s.type === "corporate_inquiry") &&
          !s.scheduled_at &&
          s.status !== "cancelled" &&
          s.status !== "closed",
      ),
    [submissions],
  );

  function goPrev() {
    setAnchor((d) => addDays(d, mode === "week" ? -7 : -30));
  }
  function goNext() {
    setAnchor((d) => addDays(d, mode === "week" ? 7 : 30));
  }
  function goToday() {
    setAnchor(new Date());
  }

  async function handleAssign(args: {
    type: "session_request" | "corporate_inquiry";
    id: string;
    scheduledAt: string;
    assignedExpert: string;
  }) {
    try {
      await setSchedule({
        type: args.type,
        id: args.id,
        scheduledAt: args.scheduledAt,
        assignedExpert: args.assignedExpert || null,
      });
      toast.success("Scheduled.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed.");
    }
  }

  async function handleEventSave(args: { scheduledAt: string; assignedExpert: string }) {
    if (!eventTarget) return;
    try {
      await setSchedule({
        type: eventTarget.type,
        id: eventTarget.id,
        scheduledAt: args.scheduledAt,
        assignedExpert: args.assignedExpert || null,
      });
      toast.success("Updated.");
      setEventTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed.");
    }
  }

  async function handleUnschedule() {
    if (!eventTarget) return;
    try {
      await setSchedule({ type: eventTarget.type, id: eventTarget.id, scheduledAt: null });
      toast.success("Removed from the calendar.");
      setEventTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed.");
    }
  }

  const label =
    mode === "week"
      ? `${weekStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${addDays(
          weekStart,
          6,
        ).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
      : anchor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <div>
      <p className="mb-6 text-sm text-muted-foreground">
        Scheduled sessions and corporate calls. Click an empty slot to place a confirmed request;
        click an appointment to move it or view full details.
      </p>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goNext}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={goToday}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            Today
          </button>
          <span className="ml-2 font-display text-lg text-foreground">{label}</span>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {(["week", "month"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs capitalize transition-colors",
                mode === m
                  ? "bg-gold-deep text-white font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-[480px] rounded-xl" />
      ) : mode === "week" ? (
        <CalendarWeekGrid
          weekStart={weekStart}
          entries={entries}
          onCellClick={(day, hour) => {
            const dt = new Date(day);
            dt.setHours(hour, 0, 0, 0);
            setAssignTarget(dt);
          }}
          onEventClick={setEventTarget}
        />
      ) : (
        <CalendarMonthGrid
          gridStart={monthGridStart}
          month={anchor}
          entries={entries}
          onDayClick={(day) => {
            const dt = new Date(day);
            dt.setHours(BUSINESS_HOURS.start, 0, 0, 0);
            setAssignTarget(dt);
          }}
          onEventClick={setEventTarget}
        />
      )}

      <CalendarAssignDialog
        open={!!assignTarget}
        onOpenChange={(open) => !open && setAssignTarget(null)}
        initialDate={assignTarget}
        candidates={candidates}
        onAssign={handleAssign}
      />

      <CalendarEventDialog
        entry={eventTarget}
        onOpenChange={(open) => !open && setEventTarget(null)}
        onSave={handleEventSave}
        onUnschedule={handleUnschedule}
      />
    </div>
  );
}
