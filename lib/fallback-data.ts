import type { CategoryRecord, WhatsAppGroupRecord } from "@/lib/types";

export const fallbackCategories: CategoryRecord[] = [
  {
    id: "cat-farming",
    name: "Farming",
    slug: "farming",
    description: "Crop, livestock, aquaculture and agribusiness communities."
  },
  {
    id: "cat-tourism",
    name: "Tourism",
    slug: "tourism",
    description: "Travel, lodges, hospitality and destination communities."
  },
  {
    id: "cat-business",
    name: "Business",
    slug: "business",
    description: "Networking, trade, entrepreneurship and supplier communities."
  },
  {
    id: "cat-jobs",
    name: "Jobs",
    slug: "jobs",
    description: "Vacancies, career support and job seeker communities."
  },
  {
    id: "cat-property",
    name: "Property",
    slug: "property",
    description: "Property buyers, sellers, rentals and real estate communities."
  },
  {
    id: "cat-health",
    name: "Health",
    slug: "health",
    description: "Health awareness, wellness and support communities."
  },
  {
    id: "cat-education",
    name: "Education",
    slug: "education",
    description: "Schools, supplies, learning and parent communities."
  },
  {
    id: "cat-transport",
    name: "Transport",
    slug: "transport",
    description: "Logistics, lifts, trucking and transport service communities."
  }
];

const categoryBySlug = new Map(fallbackCategories.map((category) => [category.slug, category]));

function group(
  id: string,
  name: string,
  categorySlug: string,
  subcategory: string,
  location: string,
  description: string,
  tags: string[],
  status: WhatsAppGroupRecord["status"],
  isFeatured = false
): WhatsAppGroupRecord {
  const category = categoryBySlug.get(categorySlug);

  if (!category) {
    throw new Error(`Missing fallback category ${categorySlug}`);
  }

  return {
    id,
    name,
    inviteLink: "https://chat.whatsapp.com/example",
    categoryId: category.id,
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug
    },
    subcategory,
    location,
    description,
    tags,
    status,
    isFeatured,
    clicks: 0,
    lastVerifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export const fallbackGroups: WhatsAppGroupRecord[] = [
  group(
    "seed-tomato-farming-zimbabwe",
    "Tomato Farming Zimbabwe",
    "farming",
    "Crop Farming",
    "Zimbabwe",
    "Growers sharing tomato production tips, input suppliers, pests, market prices and seasonal advice.",
    ["tomato", "horticulture", "farming", "zim"],
    "ACTIVE",
    true
  ),
  group(
    "seed-aquaculture-farmers-hub",
    "Aquaculture Farmers Hub",
    "farming",
    "Aquaculture",
    "Zimbabwe",
    "A practical network for fish farmers, pond setup, feed sourcing and aquaculture market support.",
    ["fish", "aquaculture", "ponds", "tilapia"],
    "ACTIVE",
    true
  ),
  group(
    "seed-rabbit-rearing-network",
    "Rabbit Rearing Network",
    "farming",
    "Livestock",
    "Zimbabwe",
    "Rabbit farmers discussing breeding, cages, feed planning, health checks and buyer connections.",
    ["rabbit", "livestock", "breeding"],
    "ALMOST_FULL"
  ),
  group(
    "seed-zimbabwe-lodge-owners",
    "Zimbabwe Lodge Owners",
    "tourism",
    "Hospitality",
    "Zimbabwe",
    "Lodge owners and managers exchanging hospitality updates, supplier leads and occupancy insights.",
    ["lodges", "hospitality", "tourism"],
    "ACTIVE",
    true
  ),
  group(
    "seed-kariba-tourism-lodges",
    "Kariba Tourism & Lodges",
    "tourism",
    "Lodges",
    "Kariba",
    "Kariba travel, lodge availability, activities, packages and tourism operator updates.",
    ["kariba", "lodges", "travel", "tourism"],
    "ALMOST_FULL",
    true
  ),
  group(
    "seed-victoria-falls-travel-deals",
    "Victoria Falls Travel Deals",
    "tourism",
    "Travel Deals",
    "Victoria Falls",
    "Travel deals, tour packages, transfers and local hospitality updates around Victoria Falls.",
    ["victoria falls", "travel", "deals", "tours"],
    "ACTIVE"
  ),
  group(
    "seed-small-business-network-zimbabwe",
    "Small Business Network Zimbabwe",
    "business",
    "Networking",
    "Zimbabwe",
    "Entrepreneurs, suppliers and service providers sharing leads, promotions and practical business support.",
    ["business", "networking", "sme", "suppliers"],
    "ACTIVE",
    true
  ),
  group(
    "seed-job-seekers-zimbabwe",
    "Job Seekers Zimbabwe",
    "jobs",
    "Job Alerts",
    "Zimbabwe",
    "Vacancy alerts, application tips and career opportunities for job seekers across Zimbabwe.",
    ["jobs", "vacancies", "careers"],
    "ACTIVE",
    true
  ),
  group(
    "seed-property-buyers-sellers",
    "Property Buyers & Sellers",
    "property",
    "Real Estate",
    "Zimbabwe",
    "Property listings, buyer requests, rentals, stands, houses and trusted real estate introductions.",
    ["property", "real estate", "houses", "stands"],
    "FULL"
  ),
  group(
    "seed-health-awareness-zimbabwe",
    "Health Awareness Zimbabwe",
    "health",
    "Health Awareness",
    "Zimbabwe",
    "Community health awareness, campaigns, wellness updates and practical prevention information.",
    ["health", "wellness", "awareness"],
    "ACTIVE"
  ),
  group(
    "seed-school-supplies-education-network",
    "School Supplies & Education Network",
    "education",
    "School Supplies",
    "Zimbabwe",
    "Parents, schools and suppliers sharing school supplies, learning resources and education leads.",
    ["education", "school supplies", "learning"],
    "ACTIVE"
  ),
  group(
    "seed-transport-logistics-zimbabwe",
    "Transport & Logistics Zimbabwe",
    "transport",
    "Logistics",
    "Zimbabwe",
    "Transporters, logistics providers and customers sharing route requests, loads and fleet services.",
    ["transport", "logistics", "trucks", "deliveries"],
    "ACTIVE",
    true
  )
];
