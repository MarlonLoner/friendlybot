"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Bot, Home, LogOut, Search, UsersRound } from "lucide-react";
import { adminStorageKey } from "@/lib/admin-storage";

const links = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/groups", label: "Groups", icon: UsersRound },
  { href: "/admin/searches", label: "Searches", icon: Search }
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    window.localStorage.removeItem(adminStorageKey);
    window.sessionStorage.removeItem(adminStorageKey);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-eclipse-mist">
      <aside className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-eclipse-blue text-white lg:inset-y-0 lg:right-auto lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center justify-between px-4 lg:h-auto lg:flex-col lg:items-stretch lg:gap-6 lg:p-5">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-eclipse-gold text-eclipse-blue">
              <Bot className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold">Eclipse</span>
              <span className="block text-xs text-white/70">Admin Console</span>
            </span>
          </Link>

          <nav className="hidden gap-2 lg:flex lg:flex-col" aria-label="Admin navigation">
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                    active ? "bg-white text-eclipse-blue" : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden gap-2 lg:flex lg:flex-col">
            <Link href="/" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white">
              <Home className="h-4 w-4" aria-hidden="true" />
              Public site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex h-10 w-10 items-center justify-center rounded-md text-white/80 transition hover:bg-white/10 hover:text-white"
                  aria-label={link.label}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </div>
      </aside>

      <main className="pt-20 lg:pl-64 lg:pt-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
