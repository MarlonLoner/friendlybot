"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Save, Trash2 } from "lucide-react";
import { getStoredAdminCode } from "@/components/admin-auth-gate";
import { ImageUploadPicker, type SelectedImage } from "@/components/image-upload-picker";
import { lodgeFacilities, lodgeTypes } from "@/lib/lodge-options";
import type { LodgeRecord } from "@/lib/types";

export function AdminLodgeEdit({ id }: { id: string }) {
  const [lodge, setLodge] = useState<LodgeRecord | null>(null);
  const [form, setForm] = useState<any>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/lodges/${id}`, { headers: { "x-admin-access-code": getStoredAdminCode() } })
      .then((response) => response.json())
      .then((data) => {
        setLodge(data.lodge);
        const existingImages = data.lodge.images?.map((image: any) => image.imageUrl).filter(Boolean) ?? [];
        setImageUrls(existingImages);
        setForm({
          ...data.lodge,
          images: "",
          subscriptionExpiresAt: data.lodge.subscriptionExpiresAt ? new Date(data.lodge.subscriptionExpiresAt).toISOString().slice(0, 10) : ""
        });
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  function toggleFacility(facility: string) {
    setForm((current: any) => ({
      ...current,
      facilities: current.facilities.includes(facility) ? current.facilities.filter((item: string) => item !== facility) : [...current.facilities, facility]
    }));
  }

  async function uploadSelectedImages() {
    if (selectedImages.length === 0) return [];
    setUploadingImages(true);
    const formData = new FormData();
    formData.append("lodgeName", form.name || "lodge");
    selectedImages.forEach((image) => formData.append("files", image.file));
    const response = await fetch("/api/uploads/lodge-images", { method: "POST", body: formData });
    const data = await response.json().catch(() => ({}));
    setUploadingImages(false);
    if (!response.ok) throw new Error(data.error ?? "Could not upload lodge images.");
    return (data.images ?? []).map((image: { url: string }) => image.url).filter(Boolean);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const uploadedUrls = await uploadSelectedImages();
      const manualUrls = String(form.images ?? "")
        .split(/\r?\n/)
        .map((url) => url.trim())
        .filter(Boolean);
      const response = await fetch(`/api/admin/lodges/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-access-code": getStoredAdminCode() },
        body: JSON.stringify({ ...form, images: [...imageUrls, ...uploadedUrls, ...manualUrls], priceFrom: Number(form.priceFrom) })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Could not update lodge.");
      setImageUrls(data.lodge.images?.map((image: any) => image.imageUrl).filter(Boolean) ?? []);
      setSelectedImages([]);
      setForm({ ...data.lodge, images: "", subscriptionExpiresAt: data.lodge.subscriptionExpiresAt ? new Date(data.lodge.subscriptionExpiresAt).toISOString().slice(0, 10) : "" });
      setMessage("Lodge updated.");
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : "Could not update lodge.");
    } finally {
      setUploadingImages(false);
      setIsSaving(false);
    }
  }

  if (isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-eclipse-gold" /></div>;
  if (!lodge || !form) return <p className="rounded-lg bg-white p-6 text-sm text-slate-600 shadow-soft">Lodge not found.</p>;

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/lodges" className="text-sm font-semibold text-eclipse-blue">Back to lodges</Link>
        <h1 className="mt-2 text-3xl font-bold text-eclipse-ink">Edit {lodge.name}</h1>
      </div>
      {message ? <p className="mb-5 rounded-lg bg-eclipse-gold/15 px-4 py-3 text-sm text-eclipse-ink">{message}</p> : null}
      {shouldShowRenewal(form.subscriptionExpiresAt, form.subscriptionStatus) ? (
        <section className="mb-5 rounded-lg border border-eclipse-gold/40 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-eclipse-gold">Renewal WhatsApp Helper</p>
          <p className="mt-3 rounded-lg bg-eclipse-mist p-3 text-sm leading-6 text-slate-700">
            {`Hi ${form.ownerName || "there"}, your Find Lodges by Eclipse listing for ${form.name} is due for renewal. The annual listing is USD $10. You can pay via EcoCash/InnBucks to 0772219228 or bank transfer to Eclipse Executive Selection (Pvt) Ltd. Please send POP to Sandra on +263772219228.`}
          </p>
        </section>
      ) : null}
      <form onSubmit={save} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-soft md:grid-cols-2">
        {[
          ["name", "Lodge name"],
          ["ownerName", "Owner/manager"],
          ["whatsappNumber", "WhatsApp number"],
          ["phoneNumber", "Phone number"],
          ["email", "Email"],
          ["location", "Location"],
          ["address", "Address"],
          ["googleMapsUrl", "Google Maps URL"],
          ["priceFrom", "Starting price"]
        ].map(([key, label]) => (
          <label key={key} className="block text-sm font-semibold text-eclipse-ink">
            {label}
            <input className="input mt-2" value={form[key] ?? ""} type={key === "priceFrom" ? "number" : "text"} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
          </label>
        ))}
        <label className="block text-sm font-semibold text-eclipse-ink">Lodge type<select className="input mt-2" value={form.lodgeType} onChange={(e) => setForm({ ...form, lodgeType: e.target.value })}>{lodgeTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
        <label className="block text-sm font-semibold text-eclipse-ink">Status<select className="input mt-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{["PENDING", "ACTIVE", "REJECTED", "ARCHIVED"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="block text-sm font-semibold text-eclipse-ink">Subscription<select className="input mt-2" value={form.subscriptionStatus} onChange={(e) => setForm({ ...form, subscriptionStatus: e.target.value })}>{["NONE", "PENDING_PAYMENT", "TRIAL", "ACTIVE", "EXPIRED", "CANCELLED"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="block text-sm font-semibold text-eclipse-ink">Subscription expiry<input type="date" className="input mt-2" value={form.subscriptionExpiresAt ?? ""} onChange={(e) => setForm({ ...form, subscriptionExpiresAt: e.target.value })} /></label>
        <label className="block text-sm font-semibold text-eclipse-ink">Payment method<select className="input mt-2" value={form.paymentMethod ?? ""} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>{["", "ECOCASH", "INNBUCKS", "BANK_TRANSFER", "WESTERN_UNION", "WORLD_REMIT", "MUKURU", "OTHER"].map((item) => <option key={item} value={item}>{item || "Not selected"}</option>)}</select></label>
        <label className="block text-sm font-semibold text-eclipse-ink">Payment reference<input className="input mt-2" value={form.paymentReference ?? ""} onChange={(e) => setForm({ ...form, paymentReference: e.target.value })} /></label>
        <label className="block text-sm font-semibold text-eclipse-ink">POP status<select className="input mt-2" value={form.proofOfPaymentStatus ?? "NOT_RECEIVED"} onChange={(e) => setForm({ ...form, proofOfPaymentStatus: e.target.value })}>{["NOT_RECEIVED", "RECEIVED", "VERIFIED", "REJECTED"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="flex items-center gap-2 text-sm font-semibold text-eclipse-ink md:col-span-2"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured listing</label>
        <label className="block text-sm font-semibold text-eclipse-ink md:col-span-2">Room types<input className="input mt-2" value={form.roomTypes ?? ""} onChange={(e) => setForm({ ...form, roomTypes: e.target.value })} /></label>
        <div className="md:col-span-2"><p className="text-sm font-semibold text-eclipse-ink">Facilities</p><div className="mt-2 flex flex-wrap gap-2">{lodgeFacilities.map((facility) => <button key={facility} type="button" onClick={() => toggleFacility(facility)} className={`rounded-md px-3 py-2 text-sm font-semibold ${form.facilities.includes(facility) ? "bg-eclipse-blue text-white" : "bg-eclipse-mist text-slate-600"}`}>{facility}</button>)}</div></div>
        <label className="block text-sm font-semibold text-eclipse-ink md:col-span-2">Description<textarea className="input mt-2 min-h-32 py-3" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <div className="md:col-span-2">
          <p className="text-sm font-semibold text-eclipse-ink">Current images</p>
          {imageUrls.length > 0 ? (
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {imageUrls.map((url) => (
                <div key={url} className="relative overflow-hidden rounded-lg bg-eclipse-mist ring-1 ring-slate-200">
                  <img src={url} alt={form.name} className="aspect-square w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrls(imageUrls.filter((imageUrl) => imageUrl !== url))}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md bg-white/95 text-rose-600 shadow-sm"
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">No images saved yet.</p>
          )}
        </div>
        <div className="md:col-span-2">
          <ImageUploadPicker images={selectedImages} onChange={setSelectedImages} maxImages={12} existingCount={imageUrls.length} />
        </div>
        <details className="rounded-lg border border-slate-200 bg-white p-4 md:col-span-2">
          <summary className="cursor-pointer text-sm font-semibold text-eclipse-ink">Optional image URLs</summary>
          <label className="mt-3 block text-sm font-semibold text-eclipse-ink">
            Add manual image URLs
            <textarea className="input mt-2 min-h-28 py-3" rows={4} value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="One image URL per line" />
          </label>
        </details>
        <label className="block text-sm font-semibold text-eclipse-ink md:col-span-2">Admin notes<textarea className="input mt-2 min-h-24 py-3" rows={3} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
        <button disabled={isSaving} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-eclipse-gold px-4 text-sm font-semibold text-eclipse-blue transition hover:bg-[#e8b957] disabled:opacity-60 md:w-fit">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {uploadingImages ? "Uploading images..." : "Save Lodge"}
        </button>
      </form>
    </div>
  );
}

function shouldShowRenewal(expiry?: string | null, status?: string) {
  if (status === "EXPIRED") return true;
  if (!expiry) return false;
  return new Date(expiry).getTime() <= Date.now() + 30 * 24 * 60 * 60 * 1000;
}
