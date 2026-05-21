"use client";

import { useEffect, useState } from "react";
import { AlertCircle, FolderTree, Hotel, Inbox, Lightbulb, Loader2, MapPin, MousePointerClick, Search, Star, Tags, TrendingUp, UsersRound } from "lucide-react";
import { getStoredAdminCode } from "@/components/admin-auth-gate";
import { RequestStatusBadge } from "@/components/request-status-badge";
import type { DemandSignal, GroupRequestRecord, LodgeRecord, TopItem } from "@/lib/types";

type Stats = {
  totalGroups: number;
  totalCategories: number;
  totalSearches: number;
  noResultSearches: number;
  almostFullGroups: number;
  fullGroups: number;
  totalRequests: number;
  newRequests: number;
  totalLodges: number;
  pendingLodges: number;
  activeLodges: number;
  featuredLodges: number;
  expiredSubscriptions: number;
  lodgeWhatsappClicks: number;
  mostViewedLodges: LodgeRecord[];
  demand: {
    topNoResultSearches: TopItem[];
    latestGroupRequests: GroupRequestRecord[];
    topRequestedCategories: TopItem[];
    topRequestedLocations: TopItem[];
    suggestedGroups: DemandSignal[];
  };
};

const statConfig = [
  { key: "totalGroups", label: "Total groups", icon: UsersRound },
  { key: "totalCategories", label: "Total categories", icon: FolderTree },
  { key: "totalSearches", label: "Total searches", icon: Search },
  { key: "noResultSearches", label: "No-result searches", icon: AlertCircle },
  { key: "totalRequests", label: "Group requests", icon: Inbox },
  { key: "newRequests", label: "New requests", icon: Lightbulb },
  { key: "totalLodges", label: "Total lodges", icon: Hotel },
  { key: "pendingLodges", label: "Pending lodges", icon: AlertCircle },
  { key: "activeLodges", label: "Active lodges", icon: Hotel },
  { key: "featuredLodges", label: "Featured lodges", icon: Star },
  { key: "expiredSubscriptions", label: "Expired subs", icon: AlertCircle },
  { key: "lodgeWhatsappClicks", label: "Lodge WhatsApp clicks", icon: MousePointerClick },
  { key: "almostFullGroups", label: "Almost full", icon: TrendingUp },
  { key: "fullGroups", label: "Full groups", icon: AlertCircle }
] satisfies { key: keyof Omit<Stats, "demand">; label: string; icon: typeof UsersRound }[];

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

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="font-semibold text-eclipse-ink">Most viewed lodges</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {(stats?.mostViewedLodges ?? []).length > 0 ? (
            stats?.mostViewedLodges.map((lodge) => (
              <article key={lodge.id} className="rounded-lg bg-eclipse-mist p-3">
                <p className="font-semibold text-eclipse-ink">{lodge.name}</p>
                <p className="mt-1 text-sm text-slate-600">{lodge.views} views / {lodge.whatsappClicks} clicks</p>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-600">No lodge views yet.</p>
          )}
        </div>
      </section>

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

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-eclipse-gold/15 text-eclipse-gold">
            <Lightbulb className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-eclipse-gold">Demand Signals</p>
            <h2 className="mt-1 text-2xl font-bold text-eclipse-ink">Suggested new groups to create</h2>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          {(stats?.demand.suggestedGroups ?? []).length > 0 ? (
            stats?.demand.suggestedGroups.map((signal) => (
              <article key={signal.term} className="flex flex-col gap-3 rounded-lg bg-eclipse-mist p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-semibold capitalize text-eclipse-ink">{signal.term}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {signal.count} demand signal{signal.count === 1 ? "" : "s"} from {signal.source}
                  </p>
                </div>
                <span className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-eclipse-blue ring-1 ring-slate-200">
                  {signal.suggestedAction}
                </span>
              </article>
            ))
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-600">No demand signals yet. They will appear as users search and submit requests.</p>
          )}
        </div>
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <TopList title="Top no-result searches" icon={Search} items={stats?.demand.topNoResultSearches ?? []} />
        <TopList title="Top requested categories" icon={Tags} items={stats?.demand.topRequestedCategories ?? []} />
        <TopList title="Top requested locations" icon={MapPin} items={stats?.demand.topRequestedLocations ?? []} />
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="font-semibold text-eclipse-ink">Latest group requests</h2>
          <div className="mt-4 space-y-3">
            {(stats?.demand.latestGroupRequests ?? []).length > 0 ? (
              stats?.demand.latestGroupRequests.map((request) => (
                <article key={request.id} className="rounded-lg bg-eclipse-mist p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-eclipse-ink">{request.query}</p>
                    <RequestStatusBadge status={request.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {request.category ?? "No category"}
                    {request.location ? ` / ${request.location}` : ""}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-600">No group requests yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function TopList({ title, icon: Icon, items }: { title: string; icon: typeof Search; items: TopItem[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-eclipse-gold/15 text-eclipse-gold">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="font-semibold text-eclipse-ink">{title}</h2>
      </div>
      <div className="mt-4 space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-4 rounded-lg bg-eclipse-mist px-3 py-2">
              <span className="text-sm font-medium capitalize text-eclipse-ink">{item.name}</span>
              <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">{item.count}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-600">No data yet.</p>
        )}
      </div>
    </section>
  );
}
