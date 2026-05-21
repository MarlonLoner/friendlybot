"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Edit3, Loader2, Plus, Star, Trash2, XCircle } from "lucide-react";
import { getStoredAdminCode } from "@/components/admin-auth-gate";
import { formatPrice } from "@/lib/lodge-options";
import type { LodgeRecord, LodgeStatus } from "@/lib/types";

const statuses: (LodgeStatus | "ALL")[] = ["ALL", "PENDING", "ACTIVE", "REJECTED", "ARCHIVED"];

export function AdminLodges() {
  const [lodges, setLodges] = useState<LodgeRecord[]>([]);
  const [status, setStatus] = useState<LodgeStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return lodges.filter((lodge) => {
      if (status !== "ALL" && lodge.status !== status) return false;
      if (!normalized) return true;
      return [lodge.name, lodge.location, lodge.lodgeType].join(" ").toLowerCase().includes(normalized);
    });
  }, [lodges, query, status]);

  async function load() {
    setIsLoading(true);
    const response = await fetch("/api/admin/lodges", { headers: { "x-admin-access-code": getStoredAdminCode() } });
    const data = await response.json();
    setLodges(data.lodges ?? []);
    setIsLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function patch(id: string, body: Record<string, unknown>, success: string) {
    setMessage(null);
    const response = await fetch(`/api/admin/lodges/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-access-code": getStoredAdminCode() },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.error ?? "Could not update lodge.");
      return;
    }
    setMessage(success);
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this lodge listing?")) return;
    await fetch(`/api/admin/lodges/${id}`, { method: "DELETE", headers: { "x-admin-access-code": getStoredAdminCode() } });
    setMessage("Lodge deleted.");
    await load();
  }

  if (isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-eclipse-gold" /></div>;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-eclipse-gold">Find Lodges</p>
          <h1 className="mt-2 text-3xl font-bold text-eclipse-ink">Lodge Management</h1>
          <p className="mt-2 text-sm text-slate-600">Approve submissions, feature listings, and manage subscription readiness.</p>
        </div>
        <Link href="/admin/lodges/new" className="inline-flex items-center justify-center gap-2 rounded-md bg-eclipse-gold px-4 py-2 text-sm font-semibold text-eclipse-blue">
          <Plus className="h-4 w-4" /> New Lodge
        </Link>
      </div>
      {message ? <p className="mb-5 rounded-lg bg-eclipse-gold/15 px-4 py-3 text-sm text-eclipse-ink">{message}</p> : null}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="input" placeholder="Search by name or location" />
          <select value={status} onChange={(event) => setStatus(event.target.value as LodgeStatus | "ALL")} className="input">
            {statuses.map((item) => <option key={item} value={item}>{item === "ALL" ? "All statuses" : item}</option>)}
          </select>
        </div>
        <div className="mt-5 grid gap-4">
          {filtered.map((lodge) => (
            <article key={lodge.id} className="rounded-lg border border-slate-200 p-4">
              <div className="grid gap-4 lg:grid-cols-[140px_1fr_auto]">
                <img src={lodge.images[0]?.imageUrl ?? "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80"} alt={lodge.name} className="aspect-[4/3] w-full rounded-lg object-cover" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-eclipse-ink">{lodge.name}</h2>
                    <span className="rounded-md bg-eclipse-mist px-2 py-1 text-xs font-semibold text-slate-600">{lodge.status}</span>
                    {lodge.isFeatured ? <span className="rounded-md bg-eclipse-gold/20 px-2 py-1 text-xs font-semibold text-eclipse-blue">Featured</span> : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{lodge.location} / {lodge.lodgeType} / From {formatPrice(lodge.priceFrom)}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{lodge.description}</p>
                  <p className="mt-2 text-xs text-slate-500">Views {lodge.views} / WhatsApp clicks {lodge.whatsappClicks} / Subscription {lodge.subscriptionStatus}</p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <button onClick={() => patch(lodge.id, { action: "status", status: "ACTIVE" }, "Lodge approved.")} className="action-button"><CheckCircle2 className="h-4 w-4" />Approve</button>
                  <button onClick={() => patch(lodge.id, { action: "status", status: "REJECTED" }, "Lodge rejected.")} className="action-button"><XCircle className="h-4 w-4" />Reject</button>
                  <button onClick={() => patch(lodge.id, { action: "status", status: "ARCHIVED" }, "Lodge archived.")} className="action-button">Archive</button>
                  <button onClick={() => patch(lodge.id, { action: "featured", isFeatured: !lodge.isFeatured }, lodge.isFeatured ? "Featured removed." : "Lodge featured.")} className="action-button"><Star className="h-4 w-4" />{lodge.isFeatured ? "Unfeature" : "Feature"}</button>
                  <Link href={`/admin/lodges/${lodge.id}/edit`} className="action-button"><Edit3 className="h-4 w-4" />Edit</Link>
                  <button onClick={() => remove(lodge.id)} className="action-button text-rose-600"><Trash2 className="h-4 w-4" />Delete</button>
                </div>
              </div>
            </article>
          ))}
          {filtered.length === 0 ? <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600">No lodge listings match this view.</p> : null}
        </div>
      </section>
    </div>
  );
}
