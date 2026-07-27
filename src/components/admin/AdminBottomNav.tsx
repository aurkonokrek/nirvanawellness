import { Link, useRouterState } from "@tanstack/react-router";
import { ADMIN_NAV_ITEMS } from "@/components/admin/nav-items";
import { cn } from "@/lib/utils";

export function AdminBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition-colors",
              isActive ? "text-gold-deep" : "text-muted-foreground",
            )}
          >
            <item.icon className={cn("h-5 w-5", isActive && "fill-gold-deep/10")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
