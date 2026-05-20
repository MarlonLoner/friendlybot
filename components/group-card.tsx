"use client";

import { ExternalLink, MapPin, MessageCircle, Tag } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import type { WhatsAppGroupRecord } from "@/lib/types";

export function GroupCard({ group }: { group: WhatsAppGroupRecord }) {
  const isFull = group.status === "FULL";

  function trackClick() {
    if (isFull) {
      return;
    }

    void fetch(`/api/groups/${group.id}/click`, {
      method: "POST",
      keepalive: true
    });
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-eclipse-ink">{group.name}</h3>
            <StatusBadge status={group.status} />
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-md bg-eclipse-mist px-2 py-1">
              <Tag className="h-3.5 w-3.5 text-eclipse-gold" aria-hidden="true" />
              {group.category.name}
              {group.subcategory ? ` / ${group.subcategory}` : ""}
            </span>
            {group.location ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-eclipse-mist px-2 py-1">
                <MapPin className="h-3.5 w-3.5 text-eclipse-gold" aria-hidden="true" />
                {group.location}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{group.description}</p>

      {isFull ? (
        <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
          This group is full. Try another related group.
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {group.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
              {tag}
            </span>
          ))}
        </div>
        {isFull ? (
          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Group Full
          </button>
        ) : (
          <a
            href={group.inviteLink}
            target="_blank"
            rel="noreferrer"
            onClick={trackClick}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-eclipse-gold px-4 py-2 text-sm font-semibold text-eclipse-blue transition hover:bg-[#e8b957]"
          >
            Join WhatsApp Group
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}
