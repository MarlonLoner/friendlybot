import type { LodgeStatus, SubscriptionStatus } from "@/lib/types";

export function parseImageUrls(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item, index) => ({ imageUrl: String(item).trim(), altText: null, sortOrder: index })).filter((item) => item.imageUrl);
  }

  return String(value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((imageUrl, index) => ({ imageUrl, altText: null, sortOrder: index }));
}

export function parseLodgePayload(body: Record<string, unknown>, defaults?: { status?: LodgeStatus; isFeatured?: boolean; subscriptionStatus?: SubscriptionStatus }) {
  const name = String(body.name ?? "").trim();
  const whatsappNumber = String(body.whatsappNumber ?? "").trim();
  const location = String(body.location ?? "").trim();
  const lodgeType = String(body.lodgeType ?? "").trim();
  const description = String(body.description ?? "").trim();
  const priceFrom = Number(body.priceFrom ?? 0);

  if (!name || !whatsappNumber || !location || !lodgeType || !description || !priceFrom) {
    throw new Error("Lodge name, WhatsApp number, location, lodge type, starting price and description are required.");
  }

  return {
    name,
    ownerName: body.ownerName ? String(body.ownerName).trim() : null,
    whatsappNumber,
    phoneNumber: body.phoneNumber ? String(body.phoneNumber).trim() : null,
    email: body.email ? String(body.email).trim() : null,
    location,
    address: body.address ? String(body.address).trim() : null,
    googleMapsUrl: body.googleMapsUrl ? String(body.googleMapsUrl).trim() : null,
    priceFrom,
    lodgeType,
    roomTypes: body.roomTypes ? String(body.roomTypes).trim() : null,
    facilities: Array.isArray(body.facilities) ? body.facilities.map((facility) => String(facility).trim()).filter(Boolean) : [],
    description,
    status: (body.status as LodgeStatus) ?? defaults?.status ?? "PENDING",
    isFeatured: typeof body.isFeatured === "boolean" ? body.isFeatured : defaults?.isFeatured ?? false,
    subscriptionStatus: (body.subscriptionStatus as SubscriptionStatus) ?? defaults?.subscriptionStatus ?? "NONE",
    subscriptionExpiresAt: body.subscriptionExpiresAt ? String(body.subscriptionExpiresAt) : null,
    notes: body.notes ? String(body.notes).trim() : null,
    images: parseImageUrls(body.images)
  };
}
