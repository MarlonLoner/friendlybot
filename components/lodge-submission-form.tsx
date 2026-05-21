"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { lodgeFacilities, lodgeTypes } from "@/lib/lodge-options";

export function LodgeSubmissionForm({ admin = false, initialStatus = "PENDING" }: { admin?: boolean; initialStatus?: string }) {
  const [form, setForm] = useState({
    name: "",
    ownerName: "",
    whatsappNumber: "",
    phoneNumber: "",
    email: "",
    location: "",
    address: "",
    googleMapsUrl: "",
    priceFrom: "",
    lodgeType: "Lodge",
    roomTypes: "",
    facilities: [] as string[],
    description: "",
    images: "",
    notes: "",
    status: initialStatus,
    isFeatured: false,
    subscriptionStatus: "NONE",
    subscriptionExpiresAt: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleFacility(facility: string) {
    setForm((current) => ({
      ...current,
      facilities: current.facilities.includes(facility) ? current.facilities.filter((item) => item !== facility) : [...current.facilities, facility]
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);
    const response = await fetch(admin ? "/api/admin/lodges" : "/api/lodges", {
      method: "POST",
      headers: admin ? { "Content-Type": "application/json", "x-admin-access-code": localStorage.getItem("eclipse_friendlybot_admin_code") ?? "" } : { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, priceFrom: Number(form.priceFrom) })
    });
    const data = await response.json().catch(() => ({}));
    setIsSubmitting(false);
    if (!response.ok) {
      setError(data.error ?? "Could not save this lodge listing.");
      return;
    }
    setMessage(admin ? "Lodge listing created." : "Your lodge has been submitted. The Eclipse team will review it before publishing.");
  }

  if (message) {
    return (
      <div className="rounded-lg border border-emerald-100 bg-white p-6 shadow-soft">
        <CheckCircle2 className="h-8 w-8 text-emerald-700" aria-hidden="true" />
        <p className="mt-3 font-semibold text-eclipse-ink">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-soft md:grid-cols-2">
      <Field label="Lodge name"><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Owner/manager name"><input required className="input" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} /></Field>
      <Field label="WhatsApp number"><input required className="input" value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} /></Field>
      <Field label="Phone number optional"><input className="input" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} /></Field>
      <Field label="Email optional"><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
      <Field label="Location"><input required className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
      <Field label="Address optional"><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
      <Field label="Google Maps link optional"><input className="input" value={form.googleMapsUrl} onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })} /></Field>
      <Field label="Starting price"><input required type="number" min="1" className="input" value={form.priceFrom} onChange={(e) => setForm({ ...form, priceFrom: e.target.value })} /></Field>
      <Field label="Lodge type"><select className="input" value={form.lodgeType} onChange={(e) => setForm({ ...form, lodgeType: e.target.value })}>{lodgeTypes.map((type) => <option key={type}>{type}</option>)}</select></Field>
      <label className="block text-sm font-semibold text-eclipse-ink md:col-span-2">Room types<input className="input mt-2" value={form.roomTypes} onChange={(e) => setForm({ ...form, roomTypes: e.target.value })} /></label>
      <div className="md:col-span-2">
        <p className="text-sm font-semibold text-eclipse-ink">Facilities</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {lodgeFacilities.map((facility) => (
            <button key={facility} type="button" onClick={() => toggleFacility(facility)} className={`rounded-md px-3 py-2 text-sm font-semibold ${form.facilities.includes(facility) ? "bg-eclipse-blue text-white" : "bg-eclipse-mist text-slate-600"}`}>
              {facility}
            </button>
          ))}
        </div>
      </div>
      <label className="block text-sm font-semibold text-eclipse-ink md:col-span-2">Description<textarea required rows={5} className="input mt-2 min-h-32 py-3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <label className="block text-sm font-semibold text-eclipse-ink md:col-span-2">Image URLs<textarea rows={4} className="input mt-2 min-h-28 py-3" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="One image URL per line" /></label>
      <label className="block text-sm font-semibold text-eclipse-ink md:col-span-2">Notes for admin optional<textarea rows={3} className="input mt-2 min-h-24 py-3" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
      {admin ? (
        <div className="grid gap-4 md:col-span-2 md:grid-cols-3">
          <Field label="Status"><select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{["PENDING", "ACTIVE", "REJECTED", "ARCHIVED"].map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Subscription"><select className="input" value={form.subscriptionStatus} onChange={(e) => setForm({ ...form, subscriptionStatus: e.target.value })}>{["NONE", "TRIAL", "ACTIVE", "EXPIRED", "CANCELLED"].map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Expiry date"><input type="date" className="input" value={form.subscriptionExpiresAt} onChange={(e) => setForm({ ...form, subscriptionExpiresAt: e.target.value })} /></Field>
        </div>
      ) : null}
      {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 md:col-span-2">{error}</p> : null}
      <button disabled={isSubmitting} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-eclipse-gold px-4 text-sm font-semibold text-eclipse-blue transition hover:bg-[#e8b957] disabled:opacity-60 md:col-span-2 md:w-fit">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {admin ? "Create Lodge" : "Submit Lodge"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-eclipse-ink">{label}<div className="mt-2">{children}</div></label>;
}
