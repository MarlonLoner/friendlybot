"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { LodgeCard } from "@/components/lodge-card";
import { lodgeFacilities, lodgeTypes } from "@/lib/lodge-options";
import type { LodgeRecord } from "@/lib/types";

export function LodgeBrowser({ lodges }: { lodges: LodgeRecord[] }) {
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [lodgeType, setLodgeType] = useState("");
  const [facility, setFacility] = useState("");

  const filtered = useMemo(() => {
    return lodges.filter((lodge) => {
      if (location && !lodge.location.toLowerCase().includes(location.toLowerCase())) return false;
      if (lodgeType && lodge.lodgeType !== lodgeType) return false;
      if (facility && !lodge.facilities.includes(facility)) return false;
      if (priceRange) {
        const [min, max] = priceRange.split("-").map(Number);
        if (!Number.isNaN(min) && lodge.priceFrom < min) return false;
        if (!Number.isNaN(max) && lodge.priceFrom > max) return false;
      }
      return true;
    });
  }, [facility, location, lodgeType, lodges, priceRange]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input value={location} onChange={(event) => setLocation(event.target.value)} className="input pl-9" placeholder="Location" />
          </div>
          <select value={priceRange} onChange={(event) => setPriceRange(event.target.value)} className="input">
            <option value="">Any price</option>
            <option value="0-60">Up to $60</option>
            <option value="60-90">$60 - $90</option>
            <option value="90-9999">$90+</option>
          </select>
          <select value={lodgeType} onChange={(event) => setLodgeType(event.target.value)} className="input">
            <option value="">Any type</option>
            {lodgeTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select value={facility} onChange={(event) => setFacility(event.target.value)} className="input">
            <option value="">Any facility</option>
            {lodgeFacilities.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((lodge) => <LodgeCard key={lodge.id} lodge={lodge} />)}
      </div>
      {filtered.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-soft">
          <p className="font-semibold text-eclipse-ink">No lodges match these filters yet.</p>
          <p className="mt-2 text-sm text-slate-600">Try another location, type, price range or facility.</p>
        </div>
      ) : null}
    </section>
  );
}
