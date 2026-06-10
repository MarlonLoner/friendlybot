"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Edit3, Loader2, Plus, Star, Trash2, XCircle } from "lucide-react";
import { getStoredAdminCode } from "@/components/admin-auth-gate";
import { LodgeImageCarousel } from "@/components/lodge-image-carousel";
import { getHiddenLodgeReason, hasPublicLodgeVisibility } from "@/lib/lodge-visibility";
import { formatPrice } from "@/lib/lodge-options";
import type { LodgeRecord } from "@/lib/types";

const queueTabs = [
  { id: "ACTION_NEEDED", label: "Action Needed" },
  { id: "PENDING_PAYMENT", label: "Pending Payment" },
  { id: "POP_RECEIVED", label: "POP Received" },
  { id: "ACTIVE", label: "Active Listings" },
  { id: "EXPIRING_SOON", label: "Expiring Soon" },
  { id: "EXPIRED", label: "Expired" },
  { id: "ARCHIVED", label: "Archived" },
  { id: "ALL", label: "All Lodges" }
] as const;

type QueueTab = (typeof queueTabs)[number]["id"];

export function AdminLodges() {
  const [lodges, setLodges] = useState<LodgeRecord[]>([]);
  const [activeTab, setActiveTab] = useState<QueueTab>("ACTION_NEEDED");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const tabCounts = useMemo(() => {
    return queueTabs.reduce<Record<QueueTab, number>>((counts, tab) => {
      counts[tab.id] = lodges.filter((lodge) => matchesQueueTab(lodge, tab.id)).length;
      return counts;
    }, {} as Record<QueueTab, number>);
  }, [lodges]);

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return lodges.filter((lodge) => {
      if (!matchesQueueTab(lodge, activeTab)) return false;
      if (!normalized) return true;
      return [lodge.name, lodge.location, lodge.lodgeType, lodge.ownerName ?? "", lodge.paymentReference ?? ""].join(" ").toLowerCase().includes(normalized);
    });
  }, [activeTab, lodges, query]);

  const emptyState = getEmptyState(activeTab);

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
        <p className="mb-4 rounded-lg bg-eclipse-blue/5 px-4 py-3 text-sm font-medium text-eclipse-ink">
          To make a lodge public, use Verify Payment & Activate 1 Year after confirming POP.
        </p>
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {queueTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                activeTab === tab.id ? "bg-eclipse-blue text-white" : "bg-eclipse-mist text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-white text-slate-600"}`}>{tabCounts[tab.id] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="input" placeholder="Search by name or location" />
          <Link href="/admin/lodges/new" className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-eclipse-blue">
            <Plus className="h-4 w-4" /> Add Lodge
          </Link>
        </div>
        <div className="mt-5 grid gap-4">
          {filtered.map((lodge) => {
            const isFullActiveListing = hasPublicLodgeVisibility(lodge);
            const isExpiredListing = isExpired(lodge);
            const hasPopReceived = lodge.proofOfPaymentStatus === "RECEIVED";
            const isPendingPayment = lodge.subscriptionStatus === "PENDING_PAYMENT";
            const canVerifyAndActivate = hasPopReceived || lodge.subscriptionStatus === "EXPIRED" || isExpiredListing;
            const canMarkPopReceived = isPendingPayment && lodge.proofOfPaymentStatus !== "RECEIVED";
            const canRenew = isFullActiveListing || isExpiredListing || lodge.subscriptionStatus === "EXPIRED";
            const canExpire = isFullActiveListing;
            const canFeature = lodge.status !== "ARCHIVED";
            const visibilityLabel = isFullActiveListing ? "Public: Live" : "Public: Hidden";
            const hiddenReason = isFullActiveListing ? null : getHiddenLodgeReason(lodge);

            return (
            <article key={lodge.id} className="rounded-lg border border-slate-200 p-4">
              <div className="grid gap-4 lg:grid-cols-[140px_1fr_auto]">
                <LodgeImageCarousel images={lodge.images} lodgeName={lodge.name} mode="compact" showThumbnails={false} enableLightbox={false} className="overflow-hidden rounded-lg" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-eclipse-ink">{lodge.name}</h2>
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${isFullActiveListing ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-rose-50 text-rose-700 ring-1 ring-rose-100"}`}>{visibilityLabel}</span>
                    <span className="rounded-md bg-eclipse-mist px-2 py-1 text-xs font-semibold text-slate-600">{lodge.status}</span>
                    {lodge.isFeatured ? <span className="rounded-md bg-eclipse-gold/20 px-2 py-1 text-xs font-semibold text-eclipse-blue">Featured</span> : null}
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">{lodge.subscriptionStatus}</span>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">POP {lodge.proofOfPaymentStatus ?? "NOT_RECEIVED"}</span>
                  </div>
                  {hiddenReason ? <p className="mt-2 text-xs font-semibold text-rose-700">{hiddenReason}</p> : null}
                  {!isFullActiveListing && lodge.isFeatured ? <p className="mt-1 text-xs text-slate-500">Featured status will apply after the listing is activated.</p> : null}
                  <p className="mt-2 text-sm text-slate-600">{lodge.location} / {lodge.lodgeType} / From {formatPrice(lodge.priceFrom)}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{lodge.description}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Payment {lodge.paymentMethod ?? "Not selected"} / Ref {lodge.paymentReference || "None"} / Expiry {lodge.subscriptionExpiresAt ? new Date(lodge.subscriptionExpiresAt).toLocaleDateString() : "Not set"} / Days {daysRemaining(lodge.subscriptionExpiresAt)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Views {lodge.views} / WhatsApp clicks {lodge.whatsappClicks}</p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {canMarkPopReceived ? <button onClick={() => patch(lodge.id, { action: "pop-received" }, `${lodge.name} POP marked as received.`)} className="action-button">Mark POP Received</button> : null}
                  {canVerifyAndActivate ? <button onClick={() => patch(lodge.id, { action: "verify-activate" }, `${lodge.name} activated for 1 year.`)} className="action-button bg-eclipse-gold text-eclipse-blue hover:bg-eclipse-gold/90">Verify Payment & Activate 1 Year</button> : null}
                  {canRenew ? <button onClick={() => patch(lodge.id, { action: "renew-year" }, `${lodge.name} subscription renewed for 1 year.`)} className="action-button">Renew for 1 Year</button> : null}
                  {canExpire ? <button onClick={() => patch(lodge.id, { action: "expire-subscription" }, `${lodge.name} subscription marked expired.`)} className="action-button">Mark Subscription Expired</button> : null}
                  {lodge.status !== "REJECTED" && lodge.status !== "ARCHIVED" && !isFullActiveListing ? <button onClick={() => patch(lodge.id, { action: "status", status: "REJECTED" }, `${lodge.name} rejected.`)} className="action-button"><XCircle className="h-4 w-4" />Reject</button> : null}
                  {lodge.status !== "ARCHIVED" ? <button onClick={() => patch(lodge.id, { action: "status", status: "ARCHIVED" }, `${lodge.name} archived.`)} className="action-button">Archive</button> : null}
                  {canFeature ? <button onClick={() => patch(lodge.id, { action: "featured", isFeatured: !lodge.isFeatured }, lodge.isFeatured ? `${lodge.name} removed from featured listings.` : isFullActiveListing ? `${lodge.name} marked as featured.` : `${lodge.name} marked as featured. Featured status will apply after the listing is activated.`)} className="action-button"><Star className="h-4 w-4" />{lodge.isFeatured ? "Unfeature" : "Feature"}</button> : null}
                  <Link href={`/admin/lodges/${lodge.id}/edit`} className="action-button"><Edit3 className="h-4 w-4" />Edit</Link>
                  <button onClick={() => remove(lodge.id)} className="action-button text-rose-600"><Trash2 className="h-4 w-4" />Delete</button>
                </div>
              </div>
            </article>
          );
          })}
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
              <h2 className="text-lg font-bold text-eclipse-ink">{emptyState.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{emptyState.message}</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function matchesQueueTab(lodge: LodgeRecord, tab: QueueTab) {
  if (tab === "ALL") return true;
  if (tab === "ARCHIVED") return lodge.status === "ARCHIVED";
  if (lodge.status === "ARCHIVED") return false;
  if (tab === "ACTION_NEEDED") return needsAdminAction(lodge);
  if (tab === "PENDING_PAYMENT") return lodge.subscriptionStatus === "PENDING_PAYMENT";
  if (tab === "POP_RECEIVED") return lodge.proofOfPaymentStatus === "RECEIVED";
  if (tab === "ACTIVE") return isFullyActivePaid(lodge);
  if (tab === "EXPIRING_SOON") return isExpiringSoon(lodge.subscriptionExpiresAt);
  if (tab === "EXPIRED") return isExpired(lodge) || lodge.subscriptionStatus === "EXPIRED";
  return false;
}

function needsAdminAction(lodge: LodgeRecord) {
  if (lodge.status === "ARCHIVED") return false;
  return lodge.status === "PENDING" ||
    lodge.subscriptionStatus === "PENDING_PAYMENT" ||
    lodge.proofOfPaymentStatus === "RECEIVED" ||
    lodge.subscriptionStatus === "EXPIRED" ||
    isExpired(lodge) ||
    isExpiringSoon(lodge.subscriptionExpiresAt);
}

function isFullyActivePaid(lodge: LodgeRecord) {
  return hasPublicLodgeVisibility(lodge);
}

function isExpired(lodge: LodgeRecord) {
  if (lodge.subscriptionStatus === "EXPIRED") return true;
  if (!lodge.subscriptionExpiresAt) return false;
  return new Date(lodge.subscriptionExpiresAt).getTime() < Date.now();
}

function isExpiringSoon(value?: string | Date | null) {
  if (!value) return false;
  const days = Number(daysRemaining(value));
  return days >= 0 && days <= 30;
}

function daysRemaining(value?: string | Date | null) {
  if (!value) return "Not set";
  return Math.ceil((new Date(value).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

function getEmptyState(tab: QueueTab) {
  if (tab === "ACTION_NEEDED") {
    return {
      title: "No lodge actions needed.",
      message: "All pending payments, approvals, and renewals are clear."
    };
  }
  if (tab === "ACTIVE") {
    return {
      title: "No active lodge listings yet.",
      message: "Approved and paid lodges will appear here."
    };
  }
  return {
    title: "No lodge listings found.",
    message: "Try another workflow tab or clear the search field."
  };
}
