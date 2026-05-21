import { Prisma } from "@prisma/client";
import { fallbackCategories, fallbackGroupRequests, fallbackGroups } from "@/lib/fallback-data";
import { fallbackLodges } from "@/lib/fallback-lodges";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import { detectCategory, detectLocation, searchGroups, slugify } from "@/lib/search";
import type {
  CategoryRecord,
  DemandSignal,
  GroupRequestRecord,
  GroupRequestStatus,
  GroupStatus,
  LodgeFilters,
  LodgeRecord,
  LodgeStatus,
  SubscriptionStatus,
  SearchFilters,
  SearchLogRecord,
  TopItem,
  WhatsAppGroupRecord
} from "@/lib/types";

const groupInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true
    }
  }
} satisfies Prisma.WhatsAppGroupInclude;

const requestInclude = {
  createdGroup: {
    include: groupInclude
  }
} satisfies Prisma.GroupRequestInclude;

const lodgeInclude = {
  images: {
    orderBy: {
      sortOrder: "asc"
    }
  }
} satisfies Prisma.LodgeInclude;

function databaseReady() {
  return hasDatabaseUrl();
}

async function withFallback<T>(operation: () => Promise<T>, fallback: T) {
  if (!databaseReady()) {
    return fallback;
  }

  try {
    return await operation();
  } catch (error) {
    console.error("Database operation failed. Falling back to bundled MVP data.", error);
    return fallback;
  }
}

export async function getCategories(): Promise<CategoryRecord[]> {
  return withFallback<CategoryRecord[]>(
    async () => {
      const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
          children: true,
          _count: {
            select: {
              groups: {
                where: {
                  status: {
                    not: "ARCHIVED"
                  }
                }
              }
            }
          }
        }
      });

      return categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentId: category.parentId,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        children: category.children,
        groupCount: category._count.groups
      }));
    },
    fallbackCategories.map((category) => ({
      ...category,
      groupCount: fallbackGroups.filter((group) => group.categoryId === category.id && group.status !== "ARCHIVED").length
    }))
  );
}

export async function getGroups(filters: SearchFilters = {}): Promise<WhatsAppGroupRecord[]> {
  const fallback = searchGroups(fallbackGroups, filters);

  return withFallback<WhatsAppGroupRecord[]>(async () => {
    const where: Prisma.WhatsAppGroupWhereInput = {};

    if (filters.status && filters.status !== "ALL") {
      where.status = filters.status;
    } else if (!filters.includeArchived) {
      where.status = { not: "ARCHIVED" };
    }

    if (filters.category) {
      where.category = {
        OR: [{ slug: filters.category }, { name: { equals: filters.category, mode: "insensitive" } }]
      };
    }

    if (filters.subcategory) {
      where.subcategory = {
        equals: filters.subcategory,
        mode: "insensitive"
      };
    }

    if (filters.location) {
      where.location = {
        contains: filters.location,
        mode: "insensitive"
      };
    }

    const groups = await prisma.whatsAppGroup.findMany({
      where,
      include: groupInclude,
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }]
    });

    return searchGroups(groups, filters);
  }, fallback);
}

export async function searchAndLogGroups(query: string) {
  const categories = await getCategories();
  const allGroups = await getGroups({ status: "ALL" });
  const matchedCategory = detectCategory(query, categories);
  const matchedLocation = detectLocation(query, allGroups);
  const categorySlug = categories.find((category) => category.name === matchedCategory)?.slug;
  const results = await getGroups({
    query,
    category: categorySlug,
    location: matchedLocation ?? undefined
  });
  const filteredResults = results.length > 0 ? results : await getGroups({ query });
  const resultsFound = filteredResults.length > 0;

  await logSearch({
    query,
    matchedCategory,
    matchedLocation,
    resultsFound
  });

  return {
    results: filteredResults,
    matchedCategory,
    matchedLocation,
    resultsFound
  };
}

export async function logSearch(input: {
  query: string;
  matchedCategory: string | null;
  matchedLocation: string | null;
  resultsFound: boolean;
}) {
  if (!databaseReady()) {
    return null;
  }

  try {
    return await prisma.searchLog.create({
      data: input
    });
  } catch (error) {
    console.error("Unable to log search", error);
    return null;
  }
}

export async function incrementGroupClicks(id: string) {
  if (!databaseReady()) {
    return fallbackGroups.find((group) => group.id === id) ?? null;
  }

  try {
    return await prisma.whatsAppGroup.update({
      where: { id },
      data: {
        clicks: {
          increment: 1
        }
      },
      include: groupInclude
    });
  } catch (error) {
    console.error("Unable to increment clicks", error);
    return fallbackGroups.find((group) => group.id === id) ?? null;
  }
}

export async function getAdminStats() {
  return withFallback(
    async () => {
      const [
        totalGroups,
        totalCategories,
        totalSearches,
        noResultSearches,
        almostFullGroups,
        fullGroups,
        totalRequests,
        newRequests,
        reviewedRequests,
        createdRequests,
        ignoredRequests,
        totalLodges,
        pendingLodges,
        activeLodges,
        featuredLodges,
        expiredSubscriptions,
        lodgeWhatsappClicks,
        mostViewedLodges
      ] = await Promise.all([
        prisma.whatsAppGroup.count({ where: { status: { not: "ARCHIVED" } } }),
        prisma.category.count(),
        prisma.searchLog.count(),
        prisma.searchLog.count({ where: { resultsFound: false } }),
        prisma.whatsAppGroup.count({ where: { status: "ALMOST_FULL" } }),
        prisma.whatsAppGroup.count({ where: { status: "FULL" } }),
        prisma.groupRequest.count(),
        prisma.groupRequest.count({ where: { status: "NEW" } }),
        prisma.groupRequest.count({ where: { status: "REVIEWED" } }),
        prisma.groupRequest.count({ where: { status: "CREATED" } }),
        prisma.groupRequest.count({ where: { status: "IGNORED" } }),
        prisma.lodge.count({ where: { status: { not: "ARCHIVED" } } }),
        prisma.lodge.count({ where: { status: "PENDING" } }),
        prisma.lodge.count({ where: { status: "ACTIVE" } }),
        prisma.lodge.count({ where: { status: "ACTIVE", isFeatured: true } }),
        prisma.lodge.count({ where: { subscriptionStatus: "EXPIRED" } }),
        prisma.lodge.aggregate({ _sum: { whatsappClicks: true } }),
        prisma.lodge.findMany({ where: { status: "ACTIVE" }, include: lodgeInclude, orderBy: { views: "desc" }, take: 5 })
      ]);

      return {
        totalGroups,
        totalCategories,
        totalSearches,
        noResultSearches,
        almostFullGroups,
        fullGroups,
        totalRequests,
        newRequests,
        reviewedRequests,
        createdRequests,
        ignoredRequests,
        totalLodges,
        pendingLodges,
        activeLodges,
        featuredLodges,
        expiredSubscriptions,
        lodgeWhatsappClicks: lodgeWhatsappClicks._sum.whatsappClicks ?? 0,
        mostViewedLodges
      };
    },
    {
      totalGroups: fallbackGroups.filter((group) => group.status !== "ARCHIVED").length,
      totalCategories: fallbackCategories.length,
      totalSearches: 0,
      noResultSearches: 0,
      almostFullGroups: fallbackGroups.filter((group) => group.status === "ALMOST_FULL").length,
      fullGroups: fallbackGroups.filter((group) => group.status === "FULL").length,
      totalRequests: fallbackGroupRequests.length,
      newRequests: fallbackGroupRequests.filter((request) => request.status === "NEW").length,
      reviewedRequests: fallbackGroupRequests.filter((request) => request.status === "REVIEWED").length,
      createdRequests: fallbackGroupRequests.filter((request) => request.status === "CREATED").length,
      ignoredRequests: fallbackGroupRequests.filter((request) => request.status === "IGNORED").length,
      totalLodges: fallbackLodges.filter((lodge) => lodge.status !== "ARCHIVED").length,
      pendingLodges: fallbackLodges.filter((lodge) => lodge.status === "PENDING").length,
      activeLodges: fallbackLodges.filter((lodge) => lodge.status === "ACTIVE").length,
      featuredLodges: fallbackLodges.filter((lodge) => lodge.status === "ACTIVE" && lodge.isFeatured).length,
      expiredSubscriptions: fallbackLodges.filter((lodge) => lodge.subscriptionStatus === "EXPIRED").length,
      lodgeWhatsappClicks: fallbackLodges.reduce((total, lodge) => total + lodge.whatsappClicks, 0),
      mostViewedLodges: fallbackLodges.filter((lodge) => lodge.status === "ACTIVE").sort((a, b) => b.views - a.views).slice(0, 5)
    }
  );
}

export async function getSearchAnalytics(resultsFilter: "ALL" | "FOUND" | "NO_RESULTS" = "ALL") {
  return withFallback(
    async () => {
      const where: Prisma.SearchLogWhereInput =
        resultsFilter === "FOUND" ? { resultsFound: true } : resultsFilter === "NO_RESULTS" ? { resultsFound: false } : {};
      const recentSearches = await prisma.searchLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50
      });
      const noResultSearches = await prisma.searchLog.findMany({
        where: { resultsFound: false },
        orderBy: { createdAt: "desc" },
        take: 50
      });
      const allSearches = await prisma.searchLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 500
      });

      return buildSearchAnalytics(recentSearches, noResultSearches, allSearches);
    },
    buildSearchAnalytics([], [], [])
  );
}

function topList(values: (string | null | undefined)[]): TopItem[] {
  const counts = new Map<string, number>();

  for (const value of values) {
    const key = value?.trim();

    if (!key) {
      continue;
    }

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 10);
}

function buildSearchAnalytics(
  recentSearches: SearchLogRecord[],
  noResultSearches: SearchLogRecord[],
  allSearches: SearchLogRecord[]
) {
  return {
    recentSearches,
    noResultSearches,
    repeatedNoResultQueries: topList(noResultSearches.map((search) => search.query.toLowerCase())),
    topTerms: topList(allSearches.map((search) => search.query.toLowerCase())),
    topCategories: topList(allSearches.map((search) => search.matchedCategory)),
    topLocations: topList(allSearches.map((search) => search.matchedLocation))
  };
}

function buildDemandSignals(searches: SearchLogRecord[], requests: GroupRequestRecord[]): DemandSignal[] {
  const noResultCounts = new Map<string, number>();
  const requestCounts = new Map<string, number>();

  for (const search of searches.filter((item) => !item.resultsFound)) {
    const key = search.query.trim().toLowerCase();
    if (key) {
      noResultCounts.set(key, (noResultCounts.get(key) ?? 0) + 1);
    }
  }

  for (const request of requests.filter((item) => item.status !== "IGNORED")) {
    const key = request.query.trim().toLowerCase();
    if (key) {
      requestCounts.set(key, (requestCounts.get(key) ?? 0) + 1);
    }
  }

  return Array.from(new Set([...noResultCounts.keys(), ...requestCounts.keys()]))
    .map((term) => {
      const searchCount = noResultCounts.get(term) ?? 0;
      const requestCount = requestCounts.get(term) ?? 0;
      const count = searchCount + requestCount;
      const source = searchCount > 0 && requestCount > 0 ? "combined" : requestCount > 0 ? "request" : "search";
      const suggestedAction =
        requestCount >= 1 || count >= 3 ? "Create a new group" : searchCount >= 2 ? "Add more groups" : "Review existing category";

      return {
        term,
        count,
        source,
        suggestedAction
      } satisfies DemandSignal;
    })
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
    .slice(0, 10);
}

export async function getDemandInsights() {
  return withFallback<{
    topNoResultSearches: TopItem[];
    latestGroupRequests: GroupRequestRecord[];
    topRequestedCategories: TopItem[];
    topRequestedLocations: TopItem[];
    suggestedGroups: DemandSignal[];
  }>(
    async () => {
      const [latestGroupRequests, allRequests, noResultSearches] = await Promise.all([
        prisma.groupRequest.findMany({
          orderBy: { createdAt: "desc" },
          take: 8,
          include: requestInclude
        }),
        prisma.groupRequest.findMany({
          orderBy: { createdAt: "desc" },
          take: 500,
          include: requestInclude
        }),
        prisma.searchLog.findMany({
          where: { resultsFound: false },
          orderBy: { createdAt: "desc" },
          take: 500
        })
      ]);

      return {
        topNoResultSearches: topList(noResultSearches.map((search) => search.query.toLowerCase())),
        latestGroupRequests,
        topRequestedCategories: topList(allRequests.map((request) => request.category)),
        topRequestedLocations: topList(allRequests.map((request) => request.location)),
        suggestedGroups: buildDemandSignals(noResultSearches, allRequests)
      };
    },
    {
      topNoResultSearches: [],
      latestGroupRequests: fallbackGroupRequests.slice(0, 8),
      topRequestedCategories: topList(fallbackGroupRequests.map((request) => request.category)),
      topRequestedLocations: topList(fallbackGroupRequests.map((request) => request.location)),
      suggestedGroups: buildDemandSignals([], fallbackGroupRequests)
    }
  );
}

export async function getGroupRequests(): Promise<GroupRequestRecord[]> {
  return withFallback<GroupRequestRecord[]>(
    async () =>
      prisma.groupRequest.findMany({
        include: requestInclude,
        orderBy: { createdAt: "desc" }
      }),
    fallbackGroupRequests
  );
}

export async function getGroupRequestStats() {
  return withFallback(
    async () => {
      const [totalRequests, newRequests, reviewedRequests, createdRequests, ignoredRequests] = await Promise.all([
        prisma.groupRequest.count(),
        prisma.groupRequest.count({ where: { status: "NEW" } }),
        prisma.groupRequest.count({ where: { status: "REVIEWED" } }),
        prisma.groupRequest.count({ where: { status: "CREATED" } }),
        prisma.groupRequest.count({ where: { status: "IGNORED" } })
      ]);

      return { totalRequests, newRequests, reviewedRequests, createdRequests, ignoredRequests };
    },
    {
      totalRequests: fallbackGroupRequests.length,
      newRequests: fallbackGroupRequests.filter((request) => request.status === "NEW").length,
      reviewedRequests: fallbackGroupRequests.filter((request) => request.status === "REVIEWED").length,
      createdRequests: fallbackGroupRequests.filter((request) => request.status === "CREATED").length,
      ignoredRequests: fallbackGroupRequests.filter((request) => request.status === "IGNORED").length
    }
  );
}

export async function createGroupRequest(input: {
  name?: string | null;
  whatsappNumber?: string | null;
  query: string;
  category?: string | null;
  location?: string | null;
  notes?: string | null;
}) {
  if (!databaseReady()) {
    throw new Error("DATABASE_URL is required to save group requests.");
  }

  return prisma.groupRequest.create({
    data: {
      name: input.name || null,
      whatsappNumber: input.whatsappNumber || null,
      query: input.query,
      category: input.category || null,
      location: input.location || null,
      notes: input.notes || null
    },
    include: requestInclude
  });
}

export async function updateGroupRequestStatus(id: string, status: GroupRequestStatus, createdGroupId?: string | null) {
  if (!databaseReady()) {
    throw new Error("DATABASE_URL is required to update group requests.");
  }

  return prisma.groupRequest.update({
    where: { id },
    data: {
      status,
      createdGroupId: status === "CREATED" ? createdGroupId ?? undefined : undefined
    },
    include: requestInclude
  });
}

export async function createGroupFromRequest(
  requestId: string,
  input: {
    name: string;
    inviteLink: string;
    categoryId: string;
    subcategory?: string | null;
    location?: string | null;
    description: string;
    tags: string[];
    status: GroupStatus;
    isFeatured: boolean;
    lastVerifiedAt?: string | null;
  }
) {
  if (!databaseReady()) {
    throw new Error("DATABASE_URL is required to create groups from requests.");
  }

  return prisma.$transaction(async (tx) => {
    const group = await tx.whatsAppGroup.create({
      data: {
        ...input,
        lastVerifiedAt: input.lastVerifiedAt ? new Date(input.lastVerifiedAt) : null
      },
      include: groupInclude
    });

    const request = await tx.groupRequest.update({
      where: { id: requestId },
      data: {
        status: "CREATED",
        createdGroupId: group.id
      },
      include: requestInclude
    });

    return { group, request };
  });
}

function filterLodges(lodges: LodgeRecord[], filters: LodgeFilters = {}) {
  const query = filters.query?.trim().toLowerCase() ?? "";
  const location = filters.location?.trim().toLowerCase() ?? "";
  const lodgeType = filters.lodgeType?.trim().toLowerCase() ?? "";
  const facilities = filters.facilities ?? [];
  const status = filters.status && filters.status !== "ALL" ? filters.status : null;

  return lodges
    .filter((lodge) => filters.includeArchived || lodge.status !== "ARCHIVED")
    .filter((lodge) => (status ? lodge.status === status : filters.includeArchived ? true : lodge.status === "ACTIVE"))
    .filter((lodge) => {
      if (query && ![lodge.name, lodge.location, lodge.description, lodge.lodgeType].join(" ").toLowerCase().includes(query)) return false;
      if (location && !lodge.location.toLowerCase().includes(location)) return false;
      if (lodgeType && lodge.lodgeType.toLowerCase() !== lodgeType) return false;
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split("-").map(Number);
        if (!Number.isNaN(min) && lodge.priceFrom < min) return false;
        if (!Number.isNaN(max) && lodge.priceFrom > max) return false;
      }
      if (facilities.length > 0 && !facilities.every((facility) => lodge.facilities.includes(facility))) return false;
      return true;
    })
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.priceFrom - b.priceFrom || a.name.localeCompare(b.name));
}

export async function getLodges(filters: LodgeFilters = {}): Promise<LodgeRecord[]> {
  return withFallback<LodgeRecord[]>(
    async () => {
      const where: Prisma.LodgeWhereInput = {};
      if (filters.status && filters.status !== "ALL") where.status = filters.status;
      else if (!filters.includeArchived) where.status = "ACTIVE";
      if (filters.location) where.location = { contains: filters.location, mode: "insensitive" };
      if (filters.lodgeType) where.lodgeType = { equals: filters.lodgeType, mode: "insensitive" };
      if (filters.query) {
        where.OR = [
          { name: { contains: filters.query, mode: "insensitive" } },
          { location: { contains: filters.query, mode: "insensitive" } },
          { description: { contains: filters.query, mode: "insensitive" } }
        ];
      }
      const lodges = await prisma.lodge.findMany({
        where,
        include: lodgeInclude,
        orderBy: [{ isFeatured: "desc" }, { priceFrom: "asc" }, { name: "asc" }]
      });
      return filterLodges(lodges, filters);
    },
    filterLodges(fallbackLodges, filters)
  );
}

export async function getLodgeBySlug(slug: string) {
  return withFallback<LodgeRecord | null>(
    async () => prisma.lodge.findFirst({ where: { slug, status: "ACTIVE" }, include: lodgeInclude }),
    fallbackLodges.find((lodge) => lodge.slug === slug && lodge.status === "ACTIVE") ?? null
  );
}

export async function getLodgeById(id: string) {
  if (!databaseReady()) return fallbackLodges.find((lodge) => lodge.id === id) ?? null;
  return prisma.lodge.findUnique({ where: { id }, include: lodgeInclude });
}

type LodgeInput = {
  name: string;
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
  subscriptionExpiresAt?: string | null;
  notes?: string | null;
  images: { imageUrl: string; altText?: string | null; sortOrder?: number }[];
};

export async function createLodge(input: LodgeInput) {
  if (!databaseReady()) throw new Error("DATABASE_URL is required to save lodge listings.");
  const slugBase = slugify(input.name);
  const existing = await prisma.lodge.count({ where: { slug: { startsWith: slugBase } } });
  const slug = existing ? `${slugBase}-${existing + 1}` : slugBase;

  return prisma.lodge.create({
    data: {
      ...input,
      slug,
      subscriptionExpiresAt: input.subscriptionExpiresAt ? new Date(input.subscriptionExpiresAt) : null,
      images: { create: input.images.map((image, index) => ({ ...image, sortOrder: image.sortOrder ?? index })) }
    },
    include: lodgeInclude
  });
}

export async function updateLodge(id: string, input: LodgeInput) {
  if (!databaseReady()) throw new Error("DATABASE_URL is required to update lodge listings.");
  return prisma.$transaction(async (tx) => {
    await tx.lodgeImage.deleteMany({ where: { lodgeId: id } });
    return tx.lodge.update({
      where: { id },
      data: {
        ...input,
        subscriptionExpiresAt: input.subscriptionExpiresAt ? new Date(input.subscriptionExpiresAt) : null,
        images: { create: input.images.map((image, index) => ({ ...image, sortOrder: image.sortOrder ?? index })) }
      },
      include: lodgeInclude
    });
  });
}

export async function updateLodgeStatus(id: string, status: LodgeStatus) {
  if (!databaseReady()) throw new Error("DATABASE_URL is required to update lodge listings.");
  return prisma.lodge.update({ where: { id }, data: { status }, include: lodgeInclude });
}

export async function toggleLodgeFeatured(id: string, isFeatured: boolean) {
  if (!databaseReady()) throw new Error("DATABASE_URL is required to update lodge listings.");
  return prisma.lodge.update({ where: { id }, data: { isFeatured }, include: lodgeInclude });
}

export async function deleteLodge(id: string) {
  if (!databaseReady()) throw new Error("DATABASE_URL is required to delete lodge listings.");
  return prisma.lodge.delete({ where: { id } });
}

export async function incrementLodgeViews(id: string) {
  if (!databaseReady()) return null;
  return prisma.lodge.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => null);
}

export async function incrementLodgeWhatsappClicks(id: string) {
  if (!databaseReady()) return fallbackLodges.find((lodge) => lodge.id === id) ?? null;
  return prisma.lodge
    .update({ where: { id }, data: { whatsappClicks: { increment: 1 } }, include: lodgeInclude })
    .catch(() => fallbackLodges.find((lodge) => lodge.id === id) ?? null);
}

export async function createGroup(input: {
  name: string;
  inviteLink: string;
  categoryId: string;
  subcategory?: string | null;
  location?: string | null;
  description: string;
  tags: string[];
  status: GroupStatus;
  isFeatured: boolean;
  lastVerifiedAt?: string | null;
}) {
  if (!databaseReady()) {
    throw new Error("DATABASE_URL is required to manage groups.");
  }

  return prisma.whatsAppGroup.create({
    data: {
      ...input,
      lastVerifiedAt: input.lastVerifiedAt ? new Date(input.lastVerifiedAt) : null
    },
    include: groupInclude
  });
}

export async function updateGroup(
  id: string,
  input: {
    name: string;
    inviteLink: string;
    categoryId: string;
    subcategory?: string | null;
    location?: string | null;
    description: string;
    tags: string[];
    status: GroupStatus;
    isFeatured: boolean;
    lastVerifiedAt?: string | null;
  }
) {
  if (!databaseReady()) {
    throw new Error("DATABASE_URL is required to manage groups.");
  }

  return prisma.whatsAppGroup.update({
    where: { id },
    data: {
      ...input,
      lastVerifiedAt: input.lastVerifiedAt ? new Date(input.lastVerifiedAt) : null
    },
    include: groupInclude
  });
}

export async function archiveGroup(id: string) {
  if (!databaseReady()) {
    throw new Error("DATABASE_URL is required to archive groups.");
  }

  return prisma.whatsAppGroup.update({
    where: { id },
    data: {
      status: "ARCHIVED"
    },
    include: groupInclude
  });
}

export async function ensureCategory(name: string) {
  if (!databaseReady()) {
    throw new Error("DATABASE_URL is required to create categories.");
  }

  return prisma.category.upsert({
    where: { slug: slugify(name) },
    update: {},
    create: {
      name,
      slug: slugify(name),
      description: `${name} WhatsApp communities curated by Eclipse FriendlyBot.`
    }
  });
}
