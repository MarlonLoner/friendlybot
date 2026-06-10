import type { LodgeRecord } from "@/lib/types";

export function hasPublicLodgeVisibility(
  lodge: Pick<LodgeRecord, "status" | "subscriptionStatus" | "proofOfPaymentStatus" | "subscriptionExpiresAt">
) {
  return lodge.status === "ACTIVE" &&
    lodge.subscriptionStatus === "ACTIVE" &&
    lodge.proofOfPaymentStatus === "VERIFIED" &&
    Boolean(lodge.subscriptionExpiresAt) &&
    new Date(lodge.subscriptionExpiresAt as string | Date).getTime() > Date.now();
}

export function getHiddenLodgeReason(
  lodge: Pick<LodgeRecord, "status" | "subscriptionStatus" | "proofOfPaymentStatus" | "subscriptionExpiresAt">
) {
  if (lodge.status !== "ACTIVE") return "Hidden: listing not active";
  if (lodge.subscriptionStatus === "PENDING_PAYMENT") return "Hidden: subscription pending";
  if (lodge.subscriptionStatus === "EXPIRED") return "Hidden: subscription expired";
  if (lodge.subscriptionStatus !== "ACTIVE") return "Hidden: subscription not active";
  if (!lodge.subscriptionExpiresAt) return "Hidden: missing expiry date";
  if (new Date(lodge.subscriptionExpiresAt).getTime() <= Date.now()) return "Hidden: subscription expired";
  if (lodge.proofOfPaymentStatus !== "VERIFIED") return "Hidden: payment not verified";
  return "Hidden: not public";
}
