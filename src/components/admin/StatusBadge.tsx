import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-sky-50 text-sky-700 border-sky-200",
  contacted: "bg-violet-50 text-violet-700 border-violet-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rescheduled: "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  closed: "bg-stone/10 text-stone border-stone/20",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize",
        STATUS_STYLES[status] ?? STATUS_STYLES.new,
        className,
      )}
    >
      {status}
    </span>
  );
}
