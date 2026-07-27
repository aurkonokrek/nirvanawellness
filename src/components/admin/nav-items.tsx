import { LayoutDashboard, Inbox, CalendarRange, Users, BarChart3, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AdminNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

// Single source of truth for the sidebar, the mobile bottom-tab bar, and the
// command palette. Exactly 5 — the Material bottom-nav limit — with Settings
// living in the account dropdown instead (see PAGE_LABELS below and
// AdminHeader's account menu).
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { to: "/admin", label: "Today", icon: LayoutDashboard, exact: true },
  { to: "/admin/calendar", label: "Calendar", icon: CalendarRange },
  { to: "/admin/inbox", label: "Inbox", icon: Inbox },
  { to: "/admin/contacts", label: "Contacts", icon: Users },
  { to: "/admin/analytics", label: "Insights", icon: BarChart3 },
];

// Pages reachable but not in the primary nav — still need a header title.
export const ADMIN_SECONDARY_PAGES: AdminNavItem[] = [
  { to: "/admin/settings", label: "Settings", icon: Settings },
];
