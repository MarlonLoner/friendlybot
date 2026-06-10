"use client";

import Link from "next/link";
import { ExternalLink, MapPin, Star } from "lucide-react";
import { LodgeImageCarousel } from "@/components/lodge-image-carousel";
import { formatPrice } from "@/lib/lodge-options";
import type { LodgeRecord } from "@/lib/types";

export function LodgeCard({ lodge }: { lodge: LodgeRecord }) {
  function trackClick() {
    void fetch(`/api/lodges/${lodge.id}/whatsapp-click`, { method: "POST", keepalive: true });
  }

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="relative bg-eclipse-blue">
        <LodgeImageCarousel images={lodge.images} lodgeName={lodge.name} mode="compact" showThumbnails={false} enableLightbox={false} />
        {lodge.isFeatured ? (
          <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-md bg-eclipse-gold px-2 py-1 text-xs font-bold text-eclipse-blue shadow-sm">
            <Star className="h-3.5 w-3.5" aria-hidden="true" />
            Featured
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-eclipse-ink">{lodge.name}</h3>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-eclipse-gold" aria-hidden="true" />
              {lodge.location}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">From</p>
            <p className="font-bold text-eclipse-blue">{formatPrice(lodge.priceFrom)}</p>
          </div>
        </div>
        <p className="mt-2 text-sm font-medium text-slate-600">{lodge.lodgeType}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {lodge.facilities.slice(0, 5).map((facility) => (
            <span key={facility} className="rounded-md bg-eclipse-mist px-2 py-1 text-xs font-medium text-slate-600">
              {facility}
            </span>
          ))}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Link href={`/lodges/${lodge.slug}`} className="inline-flex items-center justify-center rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-eclipse-blue transition hover:bg-slate-50">
            View Details
          </Link>
          <a
            href={`https://wa.me/${lodge.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I found ${lodge.name} on Find Lodges by Eclipse.`)}`}
            target="_blank"
            rel="noreferrer"
            onClick={trackClick}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-eclipse-gold px-3 py-2 text-sm font-semibold text-eclipse-blue transition hover:bg-[#e8b957]"
          >
            WhatsApp Booking
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
