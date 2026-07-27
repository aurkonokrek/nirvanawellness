import { useRouterState, useNavigate } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { LogOut, Search, Settings, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ADMIN_NAV_ITEMS, ADMIN_SECONDARY_PAGES } from "@/components/admin/nav-items";

function useCurrentPageLabel() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const match = [...ADMIN_NAV_ITEMS, ...ADMIN_SECONDARY_PAGES].find((item) =>
    item.exact ? pathname === item.to : pathname.startsWith(item.to),
  );
  return match?.label ?? "Admin";
}

export function AdminHeader({
  user,
  onOpenPalette,
  onSignOut,
}: {
  user: User;
  onOpenPalette: () => void;
  onSignOut: () => void;
}) {
  const pageLabel = useCurrentPageLabel();
  const navigate = useNavigate();
  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-card/95 px-4 backdrop-blur md:px-6">
      <div className="flex-1">
        <span className="font-eyebrow text-muted-foreground">Nirvana Admin</span>
        <h1 className="font-display text-xl leading-tight text-foreground">{pageLabel}</h1>
      </div>

      <button
        onClick={onOpenPalette}
        className="hidden items-center gap-2 rounded-full border border-border bg-secondary/60 px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:border-gold-deep/40 hover:text-foreground sm:flex"
      >
        <Search className="h-3.5 w-3.5" />
        Jump to…
        <kbd className="ml-2 rounded border border-border bg-card px-1.5 py-0.5 font-sans text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>
      <button
        onClick={onOpenPalette}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground sm:hidden"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-medium text-gold-soft outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring">
          {initial}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2 font-normal text-muted-foreground">
            <UserIcon className="h-3.5 w-3.5" />
            <span className="truncate">{user.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate({ to: "/admin/settings" })}>
            <Settings className="h-4 w-4" /> Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onSignOut} className="text-destructive focus:text-destructive">
            <LogOut className="h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
