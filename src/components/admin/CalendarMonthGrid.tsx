import type { CalendarEntry } from "@/hooks/useCalendar";
import { addDays, isSameDay } from "@/components/admin/calendar-utils";
import { cn } from "@/lib/utils";

export function CalendarMonthGrid({
  gridStart,
  month,
  entries,
  onDayClick,
  onEventClick,
}: {
  gridStart: Date;
  /** The month being displayed — days outside it render dimmed. */
  month: Date;
  entries: CalendarEntry[];
  onDayClick: (day: Date) => void;
  onEventClick: (entry: CalendarEntry) => void;
}) {
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const today = new Date();

  function entriesFor(day: Date) {
    return entries.filter((e) => isSameDay(new Date(e.scheduled_at), day));
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="grid grid-cols-7 border-b border-border">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-2 text-center font-eyebrow text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const inMonth = day.getMonth() === month.getMonth();
          const dayEntries = entriesFor(day);
          const isToday = isSameDay(day, today);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={cn(
                "flex min-h-[92px] flex-col items-start gap-1 border-b border-r border-border/60 p-2 text-left transition-colors hover:bg-secondary/40 [&:nth-child(7n)]:border-r-0",
                !inMonth && "bg-secondary/20",
                isToday && "bg-gold-deep/[0.06]",
              )}
            >
              <span
                className={cn(
                  "text-sm",
                  isToday
                    ? "font-semibold text-gold-deep"
                    : inMonth
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {day.getDate()}
              </span>
              <div className="flex w-full flex-col gap-0.5">
                {dayEntries.slice(0, 2).map((e) => (
                  <div
                    key={e.id}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onEventClick(e);
                    }}
                    className={cn(
                      "truncate rounded px-1.5 py-0.5 text-[10px]",
                      e.status === "cancelled"
                        ? "bg-red-50 text-red-700 line-through"
                        : "bg-gold-deep/15 text-gold-deep",
                    )}
                  >
                    {e.name}
                  </div>
                ))}
                {dayEntries.length > 2 && (
                  <span className="px-1.5 text-[10px] text-muted-foreground">
                    +{dayEntries.length - 2} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
