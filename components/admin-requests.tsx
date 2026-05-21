"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Inbox, Loader2, Plus, Search, XCircle } from "lucide-react";
import { getStoredAdminCode } from "@/components/admin-auth-gate";
import { RequestStatusBadge } from "@/components/request-status-badge";
import type { CategoryRecord, GroupRequestRecord, GroupRequestStatus, GroupStatus } from "@/lib/types";

type RequestStats = {
  totalRequests: number;
  newRequests: number;
  reviewedRequests: number;
  createdRequests: number;
  ignoredRequests: number;
};

type GroupFormState = {
  name: string;
  inviteLink: string;
  categoryId: string;
  subcategory: string;
  location: string;
  description: string;
  tags: string;
  status: GroupStatus;
  isFeatured: boolean;
  lastVerifiedAt: string;
};

const requestStatuses: GroupRequestStatus[] = ["NEW", "REVIEWED", "CREATED", "IGNORED"];

function suggestGroupName(request: GroupRequestRecord) {
  const cleaned = request.query.replace(/\b(group|groups|whatsapp)\b/gi, "").replace(/\s+/g, " ").trim();
  const base = cleaned || request.category || "Community";
  return request.location && !base.toLowerCase().includes(request.location.toLowerCase()) ? `${base} ${request.location}` : base;
}

export function AdminRequests() {
  const [requests, setRequests] = useState<GroupRequestRecord[]>([]);
  const [stats, setStats] = useState<RequestStats | null>(null);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<GroupRequestRecord | null>(null);
  const [form, setForm] = useState<GroupFormState | null>(null);
  const [filter, setFilter] = useState<GroupRequestStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const filteredRequests = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return requests.filter((request) => {
      if (filter !== "ALL" && request.status !== filter) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return [request.query, request.name, request.whatsappNumber, request.category, request.location, request.notes]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [filter, query, requests]);

  async function loadData() {
    setIsLoading(true);
    const headers = { "x-admin-access-code": getStoredAdminCode() };
    const [requestsResponse, categoriesResponse] = await Promise.all([
      fetch("/api/admin/requests", { headers }),
      fetch("/api/categories", { headers })
    ]);
    const requestData = await requestsResponse.json();
    const categoryData = await categoriesResponse.json();
    setRequests(requestData.requests ?? []);
    setStats(requestData.stats ?? null);
    setCategories(categoryData.categories ?? []);
    setIsLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function updateStatus(request: GroupRequestRecord, status: GroupRequestStatus) {
    setMessage(null);
    const response = await fetch(`/api/admin/requests/${request.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-access-code": getStoredAdminCode()
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.error ?? "Could not update this request.");
      return;
    }

    setMessage(`Request marked ${status.toLowerCase()}.`);
    await loadData();
  }

  function openCreateGroup(request: GroupRequestRecord) {
    const category = categories.find((item) => item.name.toLowerCase() === request.category?.toLowerCase());
    setSelectedRequest(request);
    setForm({
      name: suggestGroupName(request),
      inviteLink: "",
      categoryId: category?.id ?? categories[0]?.id ?? "",
      subcategory: request.category ?? "",
      location: request.location ?? "",
      description: `A WhatsApp community for ${request.query}${request.location ? ` in ${request.location}` : ""}.`,
      tags: [request.query, request.category, request.location].filter(Boolean).join(", "),
      status: "ACTIVE",
      isFeatured: false,
      lastVerifiedAt: new Date().toISOString().slice(0, 10)
    });
    setMessage(null);
  }

  async function createGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedRequest || !form) {
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const response = await fetch(`/api/admin/requests/${selectedRequest.id}/create-group`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-access-code": getStoredAdminCode()
      },
      body: JSON.stringify({
        ...form,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        subcategory: form.subcategory || null,
        location: form.location || null,
        lastVerifiedAt: form.lastVerifiedAt || null
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.error ?? "Could not create this group.");
      setIsSaving(false);
      return;
    }

    setMessage("Group created and request marked created.");
    setSelectedRequest(null);
    setForm(null);
    await loadData();
    setIsSaving(false);
  }

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
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-eclipse-gold">Demand Engine</p>
        <h1 className="mt-2 text-3xl font-bold text-eclipse-ink">Group Requests</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Review explicit user demand, follow up when useful, and create new WhatsApp groups from repeated requests.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Total requests" value={stats?.totalRequests ?? 0} />
        <Stat label="New" value={stats?.newRequests ?? 0} />
        <Stat label="Reviewed" value={stats?.reviewedRequests ?? 0} />
        <Stat label="Created" value={stats?.createdRequests ?? 0} />
        <Stat label="Ignored" value={stats?.ignoredRequests ?? 0} />
      </div>

      {message ? <p className="mt-5 rounded-lg bg-eclipse-gold/15 px-4 py-3 text-sm text-eclipse-ink">{message}</p> : null}

      {selectedRequest && form ? (
        <section className="mt-6 rounded-lg border border-eclipse-gold/40 bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-eclipse-ink">Create Group from Request</h2>
              <p className="mt-1 text-sm text-slate-600">{selectedRequest.query}</p>
            </div>
            <button type="button" onClick={() => setSelectedRequest(null)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
              <XCircle className="h-4 w-4" aria-hidden="true" />
              Close
            </button>
          </div>
          <form onSubmit={createGroup} className="mt-5 grid gap-4 lg:grid-cols-2">
            <Field label="Group name">
              <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="input" />
            </Field>
            <Field label="WhatsApp invite link">
              <input required type="url" value={form.inviteLink} onChange={(event) => setForm({ ...form, inviteLink: event.target.value })} className="input" />
            </Field>
            <Field label="Category">
              <select required value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} className="input">
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Location">
              <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="input" />
            </Field>
            <Field label="Subcategory">
              <input value={form.subcategory} onChange={(event) => setForm({ ...form, subcategory: event.target.value })} className="input" />
            </Field>
            <Field label="Tags">
              <input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} className="input" />
            </Field>
            <label className="block text-sm font-semibold text-eclipse-ink lg:col-span-2">
              Description
              <textarea
                required
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                rows={3}
                className="input mt-2 min-h-24 py-3"
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-eclipse-gold px-4 py-2 text-sm font-semibold text-eclipse-blue transition hover:bg-[#e8b957] disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
                Save group and mark created
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="input pl-9" placeholder="Search requests" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`rounded-md px-3 py-2 text-sm font-semibold ${filter === "ALL" ? "bg-eclipse-blue text-white" : "bg-eclipse-mist text-slate-600"}`}
            >
              All
            </button>
            {requestStatuses.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`rounded-md px-3 py-2 text-sm font-semibold ${filter === status ? "bg-eclipse-blue text-white" : "bg-eclipse-mist text-slate-600"}`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          {filteredRequests.map((request) => (
            <article key={request.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-eclipse-ink">{request.query}</h3>
                    <RequestStatusBadge status={request.status} />
                  </div>
                  <dl className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-3">
                    <Meta label="Name" value={request.name} />
                    <Meta label="WhatsApp" value={request.whatsappNumber} />
                    <Meta label="Category" value={request.category} />
                    <Meta label="Location" value={request.location} />
                    <Meta label="Date" value={new Date(request.createdAt).toLocaleString()} />
                    <Meta label="Created group" value={request.createdGroup?.name} />
                  </dl>
                  {request.notes ? <p className="mt-3 rounded-lg bg-eclipse-mist p-3 text-sm leading-6 text-slate-600">{request.notes}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2 xl:justify-end">
                  <button type="button" onClick={() => updateStatus(request, "REVIEWED")} className="action-button">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Mark Reviewed
                  </button>
                  <button type="button" onClick={() => updateStatus(request, "CREATED")} className="action-button">
                    Mark Created
                  </button>
                  <button type="button" onClick={() => updateStatus(request, "IGNORED")} className="action-button">
                    Ignore
                  </button>
                  <button
                    type="button"
                    onClick={() => openCreateGroup(request)}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-eclipse-gold px-3 py-2 text-sm font-semibold text-eclipse-blue transition hover:bg-[#e8b957]"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Create Group
                  </button>
                </div>
              </div>
            </article>
          ))}
          {filteredRequests.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
              <Inbox className="mx-auto h-8 w-8 text-eclipse-gold" aria-hidden="true" />
              <p className="mt-3 font-semibold text-eclipse-ink">No requests match this view.</p>
              <p className="mt-1 text-sm text-slate-600">New user requests will appear here after no-result FriendlyBot searches.</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-eclipse-ink">{value}</p>
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-eclipse-ink">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Meta({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-700">{value || "Not provided"}</dd>
    </div>
  );
}
