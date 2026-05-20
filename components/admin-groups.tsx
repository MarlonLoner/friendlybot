"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Edit3, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { getStoredAdminCode } from "@/components/admin-auth-gate";
import { StatusBadge } from "@/components/status-badge";
import type { CategoryRecord, GroupStatus, WhatsAppGroupRecord } from "@/lib/types";

type GroupFormState = {
  id?: string;
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

const emptyForm: GroupFormState = {
  name: "",
  inviteLink: "",
  categoryId: "",
  subcategory: "",
  location: "",
  description: "",
  tags: "",
  status: "ACTIVE",
  isFeatured: false,
  lastVerifiedAt: ""
};

const statuses: (GroupStatus | "ALL")[] = ["ALL", "ACTIVE", "ALMOST_FULL", "FULL", "ARCHIVED"];

export function AdminGroups() {
  const [groups, setGroups] = useState<WhatsAppGroupRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [form, setForm] = useState<GroupFormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    query: "",
    category: "",
    subcategory: "",
    location: "",
    status: "ALL"
  });

  const filteredGroups = useMemo(() => {
    const query = filters.query.toLowerCase().trim();
    return groups.filter((group) => {
      if (query && !group.name.toLowerCase().includes(query)) {
        return false;
      }

      if (filters.category && group.category.slug !== filters.category && group.category.id !== filters.category) {
        return false;
      }

      if (filters.subcategory && group.subcategory?.toLowerCase() !== filters.subcategory.toLowerCase()) {
        return false;
      }

      if (filters.location && !group.location?.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      if (filters.status !== "ALL" && group.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [filters, groups]);

  const subcategories = useMemo(
    () => Array.from(new Set(groups.map((group) => group.subcategory).filter((value): value is string => Boolean(value)))).sort(),
    [groups]
  );

  async function loadData() {
    setIsLoading(true);
    const headers = {
      "x-admin-access-code": getStoredAdminCode()
    };
    const [groupsResponse, categoriesResponse] = await Promise.all([
      fetch("/api/admin/groups?includeArchived=true", { headers }),
      fetch("/api/categories", { headers })
    ]);
    const groupData = await groupsResponse.json();
    const categoryData = await categoriesResponse.json();
    setGroups(groupData.groups ?? []);
    setCategories(categoryData.categories ?? []);
    setForm((current) => ({
      ...current,
      categoryId: current.categoryId || categoryData.categories?.[0]?.id || ""
    }));
    setIsLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  function editGroup(group: WhatsAppGroupRecord) {
    setMessage(null);
    setForm({
      id: group.id,
      name: group.name,
      inviteLink: group.inviteLink,
      categoryId: group.categoryId,
      subcategory: group.subcategory ?? "",
      location: group.location ?? "",
      description: group.description,
      tags: group.tags.join(", "),
      status: group.status,
      isFeatured: group.isFeatured,
      lastVerifiedAt: group.lastVerifiedAt ? new Date(group.lastVerifiedAt).toISOString().slice(0, 10) : ""
    });
  }

  function resetForm() {
    setForm({
      ...emptyForm,
      categoryId: categories[0]?.id ?? ""
    });
    setMessage(null);
  }

  async function saveGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const payload = {
      ...form,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      subcategory: form.subcategory.trim() || null,
      location: form.location.trim() || null,
      lastVerifiedAt: form.lastVerifiedAt || null
    };

    const response = await fetch(form.id ? `/api/admin/groups/${form.id}` : "/api/admin/groups", {
      method: form.id ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-access-code": getStoredAdminCode()
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.error ?? "Could not save this group.");
      setIsSaving(false);
      return;
    }

    setMessage(form.id ? "Group updated." : "Group added.");
    resetForm();
    await loadData();
    setIsSaving(false);
  }

  async function archiveGroup(id: string) {
    const confirmed = window.confirm("Archive this WhatsApp group?");

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/admin/groups/${id}`, {
      method: "DELETE",
      headers: {
        "x-admin-access-code": getStoredAdminCode()
      }
    });

    if (!response.ok) {
      setMessage("Could not archive this group.");
      return;
    }

    setMessage("Group archived.");
    await loadData();
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
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-eclipse-gold">Group management</p>
          <h1 className="mt-2 text-3xl font-bold text-eclipse-ink">WhatsApp groups</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Add, edit, filter and archive directory groups.</p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-eclipse-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-eclipse-blueSoft"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New group
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={saveGroup} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-eclipse-ink">{form.id ? "Edit group" : "Add group"}</h2>
          <div className="mt-4 grid gap-4">
            <Field label="Group name">
              <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="input" />
            </Field>
            <Field label="WhatsApp invite link">
              <input
                required
                type="url"
                value={form.inviteLink}
                onChange={(event) => setForm({ ...form, inviteLink: event.target.value })}
                className="input"
                placeholder="https://chat.whatsapp.com/example"
              />
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Subcategory">
                <input value={form.subcategory} onChange={(event) => setForm({ ...form, subcategory: event.target.value })} className="input" />
              </Field>
              <Field label="Location">
                <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="input" />
              </Field>
            </div>
            <Field label="Description">
              <textarea
                required
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                rows={4}
                className="input min-h-24 py-3"
              />
            </Field>
            <Field label="Tags">
              <input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} className="input" placeholder="tomato, farming, kariba" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status">
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as GroupStatus })} className="input">
                  {statuses.filter((status) => status !== "ALL").map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Last verified">
                <input type="date" value={form.lastVerifiedAt} onChange={(event) => setForm({ ...form, lastVerifiedAt: event.target.value })} className="input" />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-eclipse-gold focus:ring-eclipse-gold"
              />
              Feature this group in default recommendations
            </label>
            {message ? <p className="rounded-md bg-eclipse-gold/15 px-3 py-2 text-sm text-eclipse-ink">{message}</p> : null}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-eclipse-gold px-4 py-2 text-sm font-semibold text-eclipse-blue transition hover:bg-[#e8b957] disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
                {form.id ? "Save changes" : "Add group"}
              </button>
              {form.id ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center justify-center rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </form>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative xl:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                value={filters.query}
                onChange={(event) => setFilters({ ...filters, query: event.target.value })}
                className="input pl-9"
                placeholder="Search by group name"
              />
            </div>
            <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })} className="input">
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            <select value={filters.subcategory} onChange={(event) => setFilters({ ...filters, subcategory: event.target.value })} className="input">
              <option value="">All subcategories</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory} value={subcategory}>
                  {subcategory}
                </option>
              ))}
            </select>
            <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} className="input">
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All status" : status.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3">
            <input
              value={filters.location}
              onChange={(event) => setFilters({ ...filters, location: event.target.value })}
              className="input"
              placeholder="Filter by location"
            />
          </div>

          <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
            <div className="hidden grid-cols-[1.4fr_1fr_1fr_110px_100px] gap-4 bg-eclipse-mist px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 lg:grid">
              <span>Name</span>
              <span>Category</span>
              <span>Location</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            <div className="divide-y divide-slate-200">
              {filteredGroups.map((group) => (
                <article key={group.id} className="grid gap-3 px-4 py-4 lg:grid-cols-[1.4fr_1fr_1fr_110px_100px] lg:items-center">
                  <div>
                    <h3 className="font-semibold text-eclipse-ink">{group.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{group.description}</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    {group.category.name}
                    {group.subcategory ? ` / ${group.subcategory}` : ""}
                  </p>
                  <p className="text-sm text-slate-600">{group.location ?? "Any location"}</p>
                  <StatusBadge status={group.status} />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => editGroup(group)}
                      className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                      aria-label={`Edit ${group.name}`}
                    >
                      <Edit3 className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => archiveGroup(group.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-md border border-rose-100 text-rose-600 transition hover:bg-rose-50"
                      aria-label={`Archive ${group.name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
              {filteredGroups.length === 0 ? <p className="p-6 text-sm text-slate-600">No groups match these filters.</p> : null}
            </div>
          </div>
        </section>
      </div>
    </div>
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
