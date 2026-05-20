export type GroupStatus = "ACTIVE" | "ALMOST_FULL" | "FULL" | "ARCHIVED";

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

export type SearchFilters = {
  query?: string;
  category?: string;
  subcategory?: string;
  location?: string;
  status?: GroupStatus | "ALL";
  includeArchived?: boolean;
};
