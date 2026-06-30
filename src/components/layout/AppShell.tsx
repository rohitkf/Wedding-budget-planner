"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  FolderTree,
  Wallet,
  PieChart,
  ListChecks,
  Users,
  Settings as SettingsIcon,
  Heart,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/categories", label: "Categories", icon: FolderTree },
  { href: "/payment-sources", label: "Payment Sources", icon: Wallet },
  { href: "/financial-overview", label: "Financial Overview", icon: PieChart },
  { href: "/expenses", label: "Expense Tracking", icon: ListChecks },
  { href: "/guests", label: "Guests & Simulator", icon: Users },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-rose-600 text-white"
                : "text-foreground/70 hover:bg-surface-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-foreground/70 hover:bg-surface-muted"
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex md:w-60 md:flex-col border-r border-border-subtle bg-surface">
        <div className="flex items-center gap-2 px-5 py-5">
          <Heart className="h-5 w-5 text-rose-600" />
          <span className="font-semibold tracking-tight">Wedding Budget</span>
        </div>
        <NavLinks />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-surface border-r border-border-subtle">
            <div className="flex items-center justify-between px-5 py-5">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-600" />
                <span className="font-semibold tracking-tight">Wedding Budget</span>
              </div>
              <button onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-border-subtle bg-surface px-4 py-3 md:px-6">
          <button className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:block" />
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 md:p-6 bg-background">{children}</main>
      </div>
    </div>
  );
}
