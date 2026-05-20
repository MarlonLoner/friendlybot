import type { CategoryRecord, SearchFilters, WhatsAppGroupRecord } from "@/lib/types";

const commonLocationHints = [
  "zimbabwe",
  "harare",
  "bulawayo",
  "kariba",
  "victoria falls",
  "mutare",
  "gweru",
  "masvingo",
  "kwekwe",
  "chinhoyi",
  "kadoma"
];

const categoryKeywords: Record<string, string[]> = {
  farming: ["farm", "farming", "tomato", "crop", "livestock", "rabbit", "aquaculture", "fish", "tilapia", "horticulture"],
  tourism: ["tourism", "travel", "lodge", "lodges", "hotel", "hospitality", "kariba", "victoria falls", "holiday", "tour"],
  business: ["business", "network", "networking", "sme", "supplier", "trade", "entrepreneur", "market"],
  jobs: ["job", "jobs", "vacancy", "vacancies", "career", "employment", "work"],
  property: ["property", "house", "houses", "stand", "stands", "rental", "rent", "real estate", "buyer", "seller"],
  health: ["health", "wellness", "medical", "clinic", "awareness", "doctor"],
  education: ["education", "school", "supplies", "learning", "student", "teacher"],
  transport: ["transport", "logistics", "truck", "trucks", "delivery", "loads", "fleet"]
};

export function normalizeText(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

export function slugify(value: string) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function detectCategory(query: string, categories: Pick<CategoryRecord, "name" | "slug">[]) {
  const normalized = normalizeText(query);

  for (const category of categories) {
    const name = normalizeText(category.name);
    const slug = normalizeText(category.slug);

    if (normalized.includes(name) || normalized.includes(slug)) {
      return category.name;
    }
  }

  const scored = categories
    .map((category) => {
      const keywords = categoryKeywords[category.slug] ?? [];
      const score = keywords.reduce((total, keyword) => {
        return normalized.includes(keyword) ? total + 1 : total;
      }, 0);

      return { category, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.score ? scored[0].category.name : null;
}

export function detectLocation(query: string, groups: Pick<WhatsAppGroupRecord, "location">[] = []) {
  const normalized = normalizeText(query);
  const groupLocations = groups
    .map((group) => group.location)
    .filter((location): location is string => Boolean(location))
    .map((location) => normalizeText(location));
  const candidates = Array.from(new Set([...commonLocationHints, ...groupLocations]));
  const match = candidates.find((location) => normalized.includes(location));

  if (!match) {
    return null;
  }

  return match
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function searchGroups(groups: WhatsAppGroupRecord[], filters: SearchFilters) {
  const query = normalizeText(filters.query ?? "");
  const category = normalizeText(filters.category ?? "");
  const subcategory = normalizeText(filters.subcategory ?? "");
  const location = normalizeText(filters.location ?? "");
  const status = filters.status && filters.status !== "ALL" ? filters.status : null;

  return groups
    .filter((group) => filters.includeArchived || group.status !== "ARCHIVED")
    .filter((group) => {
      if (category && normalizeText(group.category.slug) !== category && normalizeText(group.category.name) !== category) {
        return false;
      }

      if (subcategory && normalizeText(group.subcategory ?? "") !== subcategory) {
        return false;
      }

      if (location && !normalizeText(group.location ?? "").includes(location)) {
        return false;
      }

      if (status && group.status !== status) {
        return false;
      }

      return true;
    })
    .map((group) => {
      if (!query) {
        return { group, score: group.isFeatured ? 2 : 1 };
      }

      const searchable = normalizeText(
        [
          group.name,
          group.category.name,
          group.subcategory,
          group.location,
          group.description,
          ...group.tags
        ]
          .filter(Boolean)
          .join(" ")
      );
      const queryTerms = query.split(" ").filter((term) => term.length > 1);
      const score = queryTerms.reduce((total, term) => {
        if (normalizeText(group.name).includes(term)) {
          return total + 4;
        }

        if (normalizeText(group.subcategory ?? "").includes(term) || normalizeText(group.category.name).includes(term)) {
          return total + 3;
        }

        if (normalizeText(group.location ?? "").includes(term)) {
          return total + 2;
        }

        if (searchable.includes(term)) {
          return total + 1;
        }

        return total;
      }, 0);

      return {
        group,
        score: score + (group.isFeatured ? 0.5 : 0)
      };
    })
    .filter(({ score }) => !query || score > 0)
    .sort((a, b) => b.score - a.score || a.group.name.localeCompare(b.group.name))
    .map(({ group }) => group);
}

export function groupStatusLabel(status: WhatsAppGroupRecord["status"]) {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "ALMOST_FULL":
      return "Almost Full";
    case "FULL":
      return "Full";
    case "ARCHIVED":
      return "Archived";
  }
}
