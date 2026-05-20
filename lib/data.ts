import { Prisma } from "@prisma/client";
import { fallbackCategories, fallbackGroups } from "@/lib/fallback-data";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import { detectCategory, detectLocation, searchGroups, slugify } from "@/lib/search";
import type { CategoryRecord, GroupStatus, SearchFilters, SearchLogRecord, WhatsAppGroupRecord } from "@/lib/types";

const groupInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true
    }
  }
} satisfies Prisma.WhatsAppGroupInclude;

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
      const [totalGroups, totalCategories, totalSearches, noResultSearches, almostFullGroups, fullGroups] = await Promise.all([
        prisma.whatsAppGroup.count({ where: { status: { not: "ARCHIVED" } } }),
        prisma.category.count(),
        prisma.searchLog.count(),
        prisma.searchLog.count({ where: { resultsFound: false } }),
        prisma.whatsAppGroup.count({ where: { status: "ALMOST_FULL" } }),
        prisma.whatsAppGroup.count({ where: { status: "FULL" } })
      ]);

      return {
        totalGroups,
        totalCategories,
        totalSearches,
        noResultSearches,
        almostFullGroups,
        fullGroups
      };
    },
    {
      totalGroups: fallbackGroups.filter((group) => group.status !== "ARCHIVED").length,
      totalCategories: fallbackCategories.length,
      totalSearches: 0,
      noResultSearches: 0,
      almostFullGroups: fallbackGroups.filter((group) => group.status === "ALMOST_FULL").length,
      fullGroups: fallbackGroups.filter((group) => group.status === "FULL").length
    }
  );
}

export async function getSearchAnalytics() {
  return withFallback(
    async () => {
      const recentSearches = await prisma.searchLog.findMany({
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

function topList(values: (string | null | undefined)[]) {
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
    topTerms: topList(allSearches.map((search) => search.query.toLowerCase())),
    topCategories: topList(allSearches.map((search) => search.matchedCategory)),
    topLocations: topList(allSearches.map((search) => search.matchedLocation))
  };
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
