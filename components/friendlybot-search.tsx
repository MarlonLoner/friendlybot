"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, CheckCircle2, Loader2, Search, Send, Sparkles } from "lucide-react";
import { GroupCard } from "@/components/group-card";
import type { CategoryRecord, WhatsAppGroupRecord } from "@/lib/types";

type SearchResponse = {
  results: WhatsAppGroupRecord[];
  matchedCategory: string | null;
  matchedLocation: string | null;
  resultsFound: boolean;
};

const promptExamples = ["tomato farming groups", "lodges in Kariba", "aquaculture group", "business networking"];

export function FriendlyBotSearch() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialCategory = searchParams.get("category") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [results, setResults] = useState<WhatsAppGroupRecord[]>([]);
  const [meta, setMeta] = useState<Pick<SearchResponse, "matchedCategory" | "matchedLocation" | "resultsFound"> | null>(null);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLabel = useMemo(() => {
    if (query.trim()) {
      return query.trim();
    }

    if (category) {
      return `${category} groups`;
    }

    return "";
  }, [category, query]);

  async function runSearch(nextQuery = query, nextCategory = category) {
    const trimmed = nextQuery.trim();

    if (!trimmed && !nextCategory) {
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setError(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: trimmed || nextCategory,
          category: nextCategory || undefined
        })
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = (await response.json()) as SearchResponse;
      setResults(data.results);
      setMeta({
        matchedCategory: data.matchedCategory,
        matchedLocation: data.matchedLocation,
        resultsFound: data.resultsFound
      });
    } catch {
      setError("FriendlyBot could not complete the search. Please try again.");
      setResults([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch();
  }

  useEffect(() => {
    fetch("/api/categories")
      .then((response) => response.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (initialQuery || initialCategory) {
      void runSearch(initialQuery, initialCategory);
    }
  }, [initialCategory, initialQuery]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-lg bg-eclipse-blue text-white shadow-soft">
        <div className="relative px-5 py-8 sm:px-8 lg:px-10">
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] [background-size:28px_28px]" />
          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1 text-sm text-eclipse-gold ring-1 ring-white/15">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Ask in plain language
            </div>
            <h1 className="max-w-2xl text-3xl font-bold tracking-normal sm:text-4xl">What group are you looking for?</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
              Search Sandra&apos;s directory across farming, tourism, business, jobs, property, health, education and transport.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 rounded-lg bg-white p-2 shadow-soft">
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor="friendlybot-query">
                  Search query
                </label>
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    id="friendlybot-query"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="What group are you looking for?"
                    className="h-12 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-base text-eclipse-ink outline-none transition focus:border-eclipse-gold focus:ring-2 focus:ring-eclipse-gold/30"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-eclipse-gold px-5 text-sm font-semibold text-eclipse-blue transition hover:bg-[#e8b957] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Bot className="h-4 w-4" aria-hidden="true" />}
                  Ask FriendlyBot
                </button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {promptExamples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    setQuery(example);
                    setCategory("");
                    void runSearch(example, "");
                  }}
                  className="rounded-md bg-white/10 px-3 py-2 text-sm text-white/85 ring-1 ring-white/15 transition hover:bg-white/15 hover:text-white"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8" aria-live="polite">
        {error ? <div className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

        {isLoading ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-soft">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-eclipse-gold" aria-hidden="true" />
            <p className="mt-3 text-sm text-slate-600">FriendlyBot is checking the directory.</p>
          </div>
        ) : null}

        {!isLoading && hasSearched ? (
          <div>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.14em] text-eclipse-gold">Search results</p>
                <h2 className="text-2xl font-semibold text-eclipse-ink">{requestLabel || "Matching groups"}</h2>
              </div>
              {meta?.matchedCategory || meta?.matchedLocation ? (
                <p className="text-sm text-slate-600">
                  Matched {meta.matchedCategory ?? "any category"}
                  {meta.matchedLocation ? ` in ${meta.matchedLocation}` : ""}
                </p>
              ) : null}
            </div>

            {results.length > 0 ? (
              <div className="grid gap-4">
                {results.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            ) : (
              <GroupRequestCard
                categories={categories}
                query={requestLabel}
                matchedCategory={meta?.matchedCategory ?? null}
                matchedLocation={meta?.matchedLocation ?? null}
              />
            )}
          </div>
        ) : null}

        {!isLoading && !hasSearched ? (
          <div className="rounded-lg bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold text-eclipse-ink">Try asking for a specific industry, place or need.</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              FriendlyBot can understand requests like crop type, lodge location, job alerts, transport services or business networking.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function GroupRequestCard({
  categories,
  query,
  matchedCategory,
  matchedLocation
}: {
  categories: CategoryRecord[];
  query: string;
  matchedCategory: string | null;
  matchedLocation: string | null;
}) {
  const [form, setForm] = useState({
    name: "",
    whatsappNumber: "",
    query,
    category: matchedCategory ?? "",
    location: matchedLocation ?? "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      query,
      category: current.category || matchedCategory || "",
      location: current.location || matchedLocation || ""
    }));
    setIsSubmitted(false);
    setError(null);
  }, [matchedCategory, matchedLocation, query]);

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/group-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error ?? "FriendlyBot could not save this request.");
      }

      setIsSubmitted(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "FriendlyBot could not save this request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="rounded-lg border border-emerald-100 bg-white p-6 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-eclipse-ink">Request received.</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">Request received. FriendlyBot has sent this to the Eclipse team.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-eclipse-gold/40 bg-white p-5 shadow-soft sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-eclipse-gold/15 text-eclipse-gold">
          <Bot className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-lg font-semibold text-eclipse-ink">We couldn&apos;t find that group yet.</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Tell us what you&apos;re looking for and the Eclipse team may create or recommend the right group.
          </p>
        </div>
      </div>

      <form onSubmit={submitRequest} className="mt-5 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold text-eclipse-ink">
            Name optional
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="input mt-2" />
          </label>
          <label className="block text-sm font-semibold text-eclipse-ink">
            WhatsApp number optional
            <input
              value={form.whatsappNumber}
              onChange={(event) => setForm({ ...form, whatsappNumber: event.target.value })}
              className="input mt-2"
              placeholder="+263..."
            />
          </label>
        </div>
        <label className="block text-sm font-semibold text-eclipse-ink">
          What are you looking for?
          <input required value={form.query} onChange={(event) => setForm({ ...form, query: event.target.value })} className="input mt-2" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold text-eclipse-ink">
            Location optional
            <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="input mt-2" />
          </label>
          <label className="block text-sm font-semibold text-eclipse-ink">
            Category optional
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="input mt-2">
              <option value="">Not sure</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm font-semibold text-eclipse-ink">
          Notes optional
          <textarea
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            rows={3}
            className="input mt-2 min-h-24 py-3"
            placeholder="Any details that would help Sandra's team recommend the right group."
          />
        </label>

        {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting || !form.query.trim()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-eclipse-gold px-4 text-sm font-semibold text-eclipse-blue transition hover:bg-[#e8b957] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          Request this group
        </button>
      </form>
    </div>
  );
}
