export type GroupStatus = "ACTIVE" | "ALMOST_FULL" | "FULL" | "ARCHIVED";
export type GroupRequestStatus = "NEW" | "REVIEWED" | "CREATED" | "IGNORED";
export type LodgeStatus = "PENDING" | "ACTIVE" | "REJECTED" | "ARCHIVED";
export type SubscriptionStatus = "NONE" | "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED";

export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  children?: CategoryRecord[];
  groupCount?: number;
};

export type WhatsAppGroupRecord = {
  id: string;
  name: string;
  inviteLink: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: string | null;
  location?: string | null;
  description: string;
  tags: string[];
  status: GroupStatus;
  isFeatured: boolean;
  clicks: number;
  lastVerifiedAt?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type SearchLogRecord = {
  id: string;
  query: string;
  matchedCategory?: string | null;
  matchedLocation?: string | null;
  resultsFound: boolean;
  createdAt: Date | string;
};

export type GroupRequestRecord = {
  id: string;
  name?: string | null;
  whatsappNumber?: string | null;
  query: string;
  category?: string | null;
  location?: string | null;
  notes?: string | null;
  status: GroupRequestStatus;
  createdGroupId?: string | null;
  createdGroup?: WhatsAppGroupRecord | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type TopItem = {
  name: string;
  count: number;
};

export type DemandSignal = {
  term: string;
  count: number;
  suggestedAction: "Create a new group" | "Add more groups" | "Review existing category";
  source: "search" | "request" | "combined";
};

export type LodgeImageRecord = {
  id: string;
  lodgeId: string;
  imageUrl: string;
  altText?: string | null;
  sortOrder: number;
  createdAt?: Date | string;
};

export type LodgeRecord = {
  id: string;
  name: string;
  slug: string;
  ownerName?: string | null;
  whatsappNumber: string;
  phoneNumber?: string | null;
  email?: string | null;
  location: string;
  address?: string | null;
  googleMapsUrl?: string | null;
  priceFrom: number;
  lodgeType: string;
  roomTypes?: string | null;
  facilities: string[];
  description: string;
  status: LodgeStatus;
  isFeatured: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt?: Date | string | null;
  notes?: string | null;
  views: number;
  whatsappClicks: number;
  images: LodgeImageRecord[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type LodgeFilters = {
  query?: string;
  location?: string;
  priceRange?: string;
  lodgeType?: string;
  facilities?: string[];
  status?: LodgeStatus | "ALL";
  includeArchived?: boolean;
};

export type SearchFilters = {
  query?: string;
  category?: string;
  subcategory?: string;
  location?: string;
  status?: GroupStatus | "ALL";
  includeArchived?: boolean;
};
