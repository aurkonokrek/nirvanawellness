import { useState } from "react";
import { Outlet } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminBottomNav } from "@/components/admin/AdminBottomNav";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { cn } from "@/lib/utils";

export function AdminShell({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <AdminSidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((v) => !v)} />

      <div
        className={cn(
          "flex flex-col transition-[padding] duration-200",
          collapsed ? "md:pl-[68px]" : "md:pl-60",
        )}
      >
        <AdminHeader user={user} onOpenPalette={() => setPaletteOpen(true)} onSignOut={onSignOut} />
        <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">
          <div className="animate-fade-up mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      <AdminBottomNav />

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} onSignOut={onSignOut} />
    </div>
  );
}
