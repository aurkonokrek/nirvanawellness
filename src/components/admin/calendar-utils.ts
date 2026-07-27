// Calendar date-grid math. Bucketing and slot creation both use the browser's
// local time consistently — simplest correct behaviour for staff physically
// operating the admin from the practice's own timezone. If Nirvana ever needs
// remote staff scheduling across timezones, swap these for kit_timezone()-aware
// Intl.DateTimeFormat bucketing (see analytics-collect.ts's tzDateString for the pattern).

export const BUSINESS_HOURS = { start: 9, end: 20 }; // 9:00–20:00, 1-hour rows

export function startOfDay(d: Date) {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function addDays(d: Date, n: number) {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export function startOfWeek(d: Date) {
  const out = startOfDay(d);
  out.setDate(out.getDate() - out.getDay()); // Sunday
  return out;
}

/** Grid start: the Sunday on/before the 1st of the month — fills a clean 7-column grid. */
export function startOfMonthGrid(d: Date) {
  const firstOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  return startOfWeek(firstOfMonth);
}

/** Always 6 weeks (42 days) so the grid height never jumps between months. */
export function endOfMonthGrid(d: Date) {
  return addDays(startOfMonthGrid(d), 42);
}

export function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export function hourLabel(hour: number) {
  const period = hour < 12 ? "am" : "pm";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}${period}`;
}
