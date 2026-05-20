"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, Search, Tags } from "lucide-react";
import { getStoredAdminCode } from "@/components/admin-auth-gate";
import type { SearchLogRecord } from "@/lib/types";

type TopItem = {
  name: string;
  count: number;
};

type SearchAnalytics = {
  recentSearches: SearchLogRecord[];
  noResultSearches: SearchLogRecord[];
  topTerms: TopItem[];
  topCategories: TopItem[];
  topLocations: TopItem[];
};

export function AdminSearches() {
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/searches", {
      headers: {
        "x-admin-access-code": getStoredAdminCode()
      }
    })
      .then((response) => response.json())
      .then((data) => setAnalytics(data))
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
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-eclipse-gold">Search intelligence</p>
        <h1 className="mt-2 text-3xl font-bold text-eclipse-ink">FriendlyBot searches</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Review user demand, exact misses and the strongest category or location signals.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <TopList title="Top searched terms" icon={Search} items={analytics?.topTerms ?? []} />
        <TopList title="Top categories" icon={Tags} items={analytics?.topCategories ?? []} />
        <TopList title="Top locations" icon={MapPin} items={analytics?.topLocations ?? []} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <SearchList title="Recent searches" searches={analytics?.recentSearches ?? []} />
        <SearchList title="No-result searches" searches={analytics?.noResultSearches ?? []} emptyText="No missed searches yet." />
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
              <span className="text-sm font-medium text-eclipse-ink">{item.name}</span>
              <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">{item.count}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-600">No search data yet.</p>
        )}
      </div>
    </section>
  );
}

function SearchList({
  title,
  searches,
  emptyText = "No searches logged yet."
}: {
  title: string;
  searches: SearchLogRecord[];
  emptyText?: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <h2 className="font-semibold text-eclipse-ink">{title}</h2>
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
        {searches.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {searches.map((search) => (
              <article key={search.id} className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-eclipse-ink">{search.query}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {search.matchedCategory ?? "No category"}
                      {search.matchedLocation ? ` / ${search.matchedLocation}` : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-semibold ${
                      search.resultsFound ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {search.resultsFound ? "Results found" : "No results"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{new Date(search.createdAt).toLocaleString()}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="p-4 text-sm text-slate-600">{emptyText}</p>
        )}
      </div>
    </section>
  );
}
