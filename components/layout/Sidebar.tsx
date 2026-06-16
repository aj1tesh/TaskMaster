"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  Calendar,
  CalendarDays,
  LayoutDashboard,
  FolderKanban,
  HelpCircle,
} from "lucide-react";
import { ProjectSidebar } from "@/components/projects/ProjectSidebar";
import { TimerFooter } from "@/components/layout/TimerFooter";
import { UserMenu } from "@/components/layout/UserMenu";
import { useSmartLists } from "@/components/providers/AppDataProvider";

const navItems = [
  { href: "/dashboard", label: "Reports", icon: LayoutDashboard },
  { href: "/today", label: "Today", icon: Calendar },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/upcoming", label: "Upcoming", icon: CalendarDays },
];

export function Sidebar() {
  const pathname = usePathname();
  const { smartLists } = useSmartLists();

  return (
    <>
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-sidebar flex-col border-r border-border bg-surface md:flex">
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
          <span className="text-sm font-medium text-text-primary">ToDo</span>
        </div>

        {/* Scrollable nav */}
        <nav className="min-h-0 flex-1 overflow-y-auto p-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex h-10 items-center gap-3 rounded-none px-3 text-sm transition-colors ${
                  active
                    ? "bg-raised text-accent"
                    : "text-text-muted hover:bg-raised hover:text-text-primary"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}

          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 px-3 text-xs text-text-muted">Projects</p>
            <ProjectSidebar />
          </div>

          {smartLists.length > 0 && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 px-3 text-xs text-text-muted">Smart Lists</p>
              {smartLists.map((list) => (
                <Link
                  key={list.id}
                  href={`/lists/${list.id}`}
                  className={`flex h-10 items-center gap-3 rounded-none px-3 text-sm ${
                    pathname === `/lists/${list.id}`
                      ? "bg-raised text-accent"
                      : "text-text-muted hover:bg-raised"
                  }`}
                >
                  {list.name}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Pinned footer */}
        <div className="shrink-0 border-t border-border bg-surface">
          <TimerFooter />
          <UserMenu />
          <Link
            href="/help"
            className={`flex h-10 items-center gap-3 rounded-none px-4 text-sm transition-colors ${
              pathname === "/help"
                ? "bg-raised text-accent"
                : "text-text-muted hover:bg-raised hover:text-text-primary"
            }`}
          >
            <HelpCircle size={16} />
            Help
          </Link>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-surface md:hidden">
        {[
          { href: "/today", label: "Today", icon: Calendar },
          { href: "/inbox", label: "Inbox", icon: Inbox },
          { href: "/projects", label: "Projects", icon: FolderKanban },
          { href: "/dashboard", label: "Search", icon: LayoutDashboard },
        ].map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={(e) => {
                if (href === "/dashboard") {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent("open-command-palette"));
                }
              }}
              className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 py-3 ${
                active ? "text-accent" : "text-text-muted"
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px]">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
