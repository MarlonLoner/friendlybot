"use client";

import { ExternalLink } from "lucide-react";
import type { LodgeRecord } from "@/lib/types";

export function LodgeWhatsappButton({ lodge }: { lodge: LodgeRecord }) {
  function trackClick() {
    void fetch(`/api/lodges/${lodge.id}/whatsapp-click`, { method: "POST", keepalive: true });
  }

  return (
    <a
      href={`https://wa.me/${lodge.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I found ${lodge.name} on Find Lodges by Eclipse.`)}`}
      target="_blank"
      rel="noreferrer"
      onClick={trackClick}
      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-eclipse-gold px-4 py-3 text-sm font-semibold text-eclipse-blue transition hover:bg-[#e8b957]"
    >
      WhatsApp Booking
      <ExternalLink className="h-4 w-4" />
    </a>
  );
}
