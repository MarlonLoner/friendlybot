import Link from "next/link";
import { Bot, LayoutDashboard, Menu, Search } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-eclipse-blue/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-eclipse-gold text-eclipse-blue">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold leading-4">Eclipse</span>
            <span className="block text-xs text-white/70">FriendlyBot</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          <Link className="rounded-md px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white" href="/friendlybot">
            FriendlyBot
          </Link>
          <Link className="rounded-md px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white" href="/categories">
            Categories
          </Link>
          <Link className="rounded-md px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white" href="/lodges">
            Find Lodges
          </Link>
          <Link className="rounded-md px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white" href="/admin">
            Admin
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/lodges/list-your-lodge"
            className="inline-flex items-center gap-2 rounded-md bg-eclipse-gold px-3 py-2 text-sm font-semibold text-eclipse-blue shadow-sm transition hover:bg-[#e8b957]"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            List
          </Link>
          <Link
            href="/admin"
            className="hidden h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white/80 transition hover:bg-white/10 hover:text-white sm:inline-flex"
            aria-label="Admin dashboard"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/categories"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white/80 transition hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Open categories"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
