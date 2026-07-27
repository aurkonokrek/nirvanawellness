import { CalendarDays, Building2 } from "lucide-react";
import type { CalendarEntry } from "@/hooks/useCalendar";
import { BUSINESS_HOURS, addDays, hourLabel, isSameDay } from "@/components/admin/calendar-utils";
import { cn } from "@/lib/utils";

const TYPE_ICONS = {
  session_request: <CalendarDays className="h-3 w-3" />,
  corporate_inquiry: <Building2 className="h-3 w-3" />,
};

export function CalendarWeekGrid({
  weekStart,
  entries,
  onCellClick,
  onEventClick,
}: {
  weekStart: Date;
  entries: CalendarEntry[];
  onCellClick: (day: Date, hour: number) => void;
  onEventClick: (entry: CalendarEntry) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from(
    { length: BUSINESS_HOURS.end - BUSINESS_HOURS.start },
    (_, i) => BUSINESS_HOURS.start + i,
  );
  const today = new Date();

  function entriesFor(day: Date, hour: number) {
    return entries.filter((e) => {
      const d = new Date(e.scheduled_at);
      if (!isSameDay(d, day)) return false;
      const bucket = Math.min(Math.max(d.getHours(), BUSINESS_HOURS.start), BUSINESS_HOURS.end - 1);
      return bucket === hour;
    });
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <div className="grid min-w-[720px] grid-cols-[64px_repeat(7,1fr)]">
        {/* Header row */}
        <div className="border-b border-r border-border" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "border-b border-border px-2 py-2 text-center",
              isSameDay(day, today) && "bg-gold-deep/10",
            )}
          >
            <div className="font-eyebrow text-muted-foreground">
              {day.toLocaleDateString("en-GB", { weekday: "short" })}
            </div>
            <div
              className={cn(
                "font-display text-lg",
                isSameDay(day, today) ? "text-gold-deep" : "text-foreground",
              )}
            >
              {day.getDate()}
            </div>
          </div>
        ))}

        {/* Hour rows */}
        {hours.map((hour) => (
          <div key={hour} className="contents">
            <div className="flex items-start justify-end border-r border-border px-2 py-1.5 text-[11px] text-muted-foreground">
              {hourLabel(hour)}
            </div>
            {days.map((day) => {
              const cellEntries = entriesFor(day, hour);
              return (
                <button
                  key={day.toISOString() + hour}
                  onClick={() =>
                    cellEntries.length === 0 ? onCellClick(day, hour) : onEventClick(cellEntries[0])
                  }
                  className={cn(
                    "min-h-[44px] border-b border-r border-border/60 p-1 text-left transition-colors last:border-r-0 hover:bg-secondary/40",
                    isSameDay(day, today) && "bg-gold-deep/[0.03]",
                  )}
                >
                  {cellEntries.map((e) => (
                    <div
                      key={e.id}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onEventClick(e);
                      }}
                      className={cn(
                        "mb-0.5 flex items-center gap-1 truncate rounded px-1.5 py-1 text-[11px]",
                        e.status === "cancelled"
                          ? "bg-red-50 text-red-700 line-through"
                          : "bg-gold-deep/15 text-gold-deep",
                      )}
                    >
                      {TYPE_ICONS[e.type]}
                      <span className="truncate">{e.name}</span>
                    </div>
                  ))}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
