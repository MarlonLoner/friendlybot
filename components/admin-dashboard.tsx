"use client";

import { useEffect, useState } from "react";
import { AlertCircle, FolderTree, Loader2, Search, TrendingUp, UsersRound } from "lucide-react";
import { getStoredAdminCode } from "@/components/admin-auth-gate";

type Stats = {
  totalGroups: number;
  totalCategories: number;
  totalSearches: number;
  noResultSearches: number;
  almostFullGroups: number;
  fullGroups: number;
};

const statConfig = [
  { key: "totalGroups", label: "Total groups", icon: UsersRound },
  { key: "totalCategories", label: "Total categories", icon: FolderTree },
  { key: "totalSearches", label: "Total searches", icon: Search },
  { key: "noResultSearches", label: "No-result searches", icon: AlertCircle },
  { key: "almostFullGroups", label: "Almost full", icon: TrendingUp },
  { key: "fullGroups", label: "Full groups", icon: AlertCircle }
] satisfies { key: keyof Stats; label: string; icon: typeof UsersRound }[];

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", {
      headers: {
        "x-admin-access-code": getStoredAdminCode()
      }
    })
      .then((response) => response.json())
      .then((data) => setStats(data))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-eclipse-gold" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-eclipse-gold">Admin dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-eclipse-ink">Eclipse FriendlyBot overview</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Track directory health, user demand and capacity signals while Sandra&apos;s team grows the group network.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statConfig.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.key} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold text-eclipse-ink">{stats?.[item.key] ?? 0}</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-eclipse-gold/15 text-eclipse-gold">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <section className="mt-6 rounded-lg bg-eclipse-blue p-6 text-white shadow-soft">
        <h2 className="text-xl font-semibold">Operational focus</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-white/10 p-4 ring-1 ring-white/15">
            <p className="text-sm font-semibold text-eclipse-gold">No-result searches</p>
            <p className="mt-2 text-sm leading-6 text-white/75">Use these to create new groups or improve tags for existing communities.</p>
          </div>
          <div className="rounded-lg bg-white/10 p-4 ring-1 ring-white/15">
            <p className="text-sm font-semibold text-eclipse-gold">Almost full groups</p>
            <p className="mt-2 text-sm leading-6 text-white/75">Prepare backups before a high-demand group reaches capacity.</p>
          </div>
          <div className="rounded-lg bg-white/10 p-4 ring-1 ring-white/15">
            <p className="text-sm font-semibold text-eclipse-gold">Click tracking</p>
            <p className="mt-2 text-sm leading-6 text-white/75">Clicks show which industries and locations are pulling the most interest.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
