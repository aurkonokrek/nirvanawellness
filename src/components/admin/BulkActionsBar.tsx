import { Check, X, RotateCcw, XCircle } from "lucide-react";

export function BulkActionsBar({
  count,
  onAction,
  onClear,
}: {
  count: number;
  onAction: (status: "confirmed" | "cancelled" | "closed" | "new") => void;
  onClear: () => void;
}) {
  if (count === 0) return null;

  return (
    <div className="sticky top-[calc(4rem+1px)] z-10 mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-gold-deep/30 bg-gold-deep/10 px-4 py-3 shadow-sm">
      <span className="text-sm font-medium text-foreground">{count} selected</span>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button
          onClick={() => onAction("confirmed")}
          className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
        >
          <Check className="h-3.5 w-3.5" /> Confirm
        </button>
        <button
          onClick={() => onAction("cancelled")}
          className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700 hover:bg-red-100"
        >
          <X className="h-3.5 w-3.5" /> Cancel
        </button>
        <button
          onClick={() => onAction("closed")}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary/40"
        >
          Close
        </button>
        <button
          onClick={() => onAction("new")}
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary/40"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reopen
        </button>
        <button
          onClick={onClear}
          className="flex items-center gap-1 rounded-full p-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Clear selection"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
