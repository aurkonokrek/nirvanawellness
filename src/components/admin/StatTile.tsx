import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatTile({
  icon: Icon,
  label,
  value,
  accent,
  className,
}: {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  accent?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <span className="font-eyebrow text-muted-foreground">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div
        className="mt-2 font-display text-3xl tabular-nums text-foreground"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
    </div>
  );
}
