export const lodgeTypes = ["Lodge", "Guest House", "Cottage", "Safari Camp", "Resort", "Backpackers", "Hotel", "Other"];

export const lodgeFacilities = [
  "WiFi",
  "Swimming Pool",
  "Parking",
  "Restaurant",
  "Bar",
  "Conference Room",
  "Self Catering",
  "Family Friendly",
  "Pet Friendly",
  "Air Conditioning",
  "Hot Water",
  "Backup Power",
  "Security"
];

export const publicFacilityLabels = ["WiFi", "Pool", "Parking", "Restaurant", "Conference", "Self-catering", "Family Friendly"];

export function normalizeFacility(value: string) {
  if (value === "Pool") return "Swimming Pool";
  if (value === "Conference") return "Conference Room";
  if (value === "Self-catering") return "Self Catering";
  return value;
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}
