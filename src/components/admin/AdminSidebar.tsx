import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/components/admin/nav-items";
import { cn } from "@/lib/utils";

export function AdminSidebar({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-black/10 bg-navy text-cream transition-[width] duration-200 md:flex",
        collapsed ? "w-[68px]" : "w-60",
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="h-7 w-7 shrink-0 rounded-sm bg-gold-gradient" />
        {!collapsed && (
          <>
            <span className="font-display text-lg text-gold-soft">Nirvana</span>
            <span className="font-eyebrow text-stone">Admin</span>
          </>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                collapsed && "justify-center",
                isActive
                  ? "bg-gold/15 font-medium text-gold-soft"
                  : "text-stone hover:bg-white/5 hover:text-cream",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          onClick={onToggleCollapsed}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-stone transition-colors hover:bg-white/5 hover:text-cream",
            collapsed && "justify-center",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  );
}
