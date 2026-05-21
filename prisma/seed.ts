import { GroupRequestStatus, GroupStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Farming",
    slug: "farming",
    description: "Crop, livestock, aquaculture and agribusiness communities."
  },
  {
    name: "Tourism",
    slug: "tourism",
    description: "Travel, lodges, hospitality and destination communities."
  },
  {
    name: "Business",
    slug: "business",
    description: "Networking, trade, entrepreneurship and supplier communities."
  },
  {
    name: "Jobs",
    slug: "jobs",
    description: "Vacancies, career support and job seeker communities."
  },
  {
    name: "Property",
    slug: "property",
    description: "Property buyers, sellers, rentals and real estate communities."
  },
  {
    name: "Health",
    slug: "health",
    description: "Health awareness, wellness and support communities."
  },
  {
    name: "Education",
    slug: "education",
    description: "Schools, supplies, learning and parent communities."
  },
  {
    name: "Transport",
    slug: "transport",
    description: "Logistics, lifts, trucking and transport service communities."
  }
];

const groups = [
  {
    name: "Tomato Farming Zimbabwe",
    categorySlug: "farming",
    subcategory: "Crop Farming",
    location: "Zimbabwe",
    description: "Growers sharing tomato production tips, input suppliers, pests, market prices and seasonal advice.",
    tags: ["tomato", "horticulture", "farming", "zim"],
    status: GroupStatus.ACTIVE,
    isFeatured: true
  },
  {
    name: "Aquaculture Farmers Hub",
    categorySlug: "farming",
    subcategory: "Aquaculture",
    location: "Zimbabwe",
    description: "A practical network for fish farmers, pond setup, feed sourcing and aquaculture market support.",
    tags: ["fish", "aquaculture", "ponds", "tilapia"],
    status: GroupStatus.ACTIVE,
    isFeatured: true
  },
  {
    name: "Rabbit Rearing Network",
    categorySlug: "farming",
    subcategory: "Livestock",
    location: "Zimbabwe",
    description: "Rabbit farmers discussing breeding, cages, feed planning, health checks and buyer connections.",
    tags: ["rabbit", "livestock", "breeding"],
    status: GroupStatus.ALMOST_FULL,
    isFeatured: false
  },
  {
    name: "Zimbabwe Lodge Owners",
    categorySlug: "tourism",
    subcategory: "Hospitality",
    location: "Zimbabwe",
    description: "Lodge owners and managers exchanging hospitality updates, supplier leads and occupancy insights.",
    tags: ["lodges", "hospitality", "tourism"],
    status: GroupStatus.ACTIVE,
    isFeatured: true
  },
  {
    name: "Kariba Tourism & Lodges",
    categorySlug: "tourism",
    subcategory: "Lodges",
    location: "Kariba",
    description: "Kariba travel, lodge availability, activities, packages and tourism operator updates.",
    tags: ["kariba", "lodges", "travel", "tourism"],
    status: GroupStatus.ALMOST_FULL,
    isFeatured: true
  },
  {
    name: "Victoria Falls Travel Deals",
    categorySlug: "tourism",
    subcategory: "Travel Deals",
    location: "Victoria Falls",
    description: "Travel deals, tour packages, transfers and local hospitality updates around Victoria Falls.",
    tags: ["victoria falls", "travel", "deals", "tours"],
    status: GroupStatus.ACTIVE,
    isFeatured: false
  },
  {
    name: "Small Business Network Zimbabwe",
    categorySlug: "business",
    subcategory: "Networking",
    location: "Zimbabwe",
    description: "Entrepreneurs, suppliers and service providers sharing leads, promotions and practical business support.",
    tags: ["business", "networking", "sme", "suppliers"],
    status: GroupStatus.ACTIVE,
    isFeatured: true
  },
  {
    name: "Job Seekers Zimbabwe",
    categorySlug: "jobs",
    subcategory: "Job Alerts",
    location: "Zimbabwe",
    description: "Vacancy alerts, application tips and career opportunities for job seekers across Zimbabwe.",
    tags: ["jobs", "vacancies", "careers"],
    status: GroupStatus.ACTIVE,
    isFeatured: true
  },
  {
    name: "Property Buyers & Sellers",
    categorySlug: "property",
    subcategory: "Real Estate",
    location: "Zimbabwe",
    description: "Property listings, buyer requests, rentals, stands, houses and trusted real estate introductions.",
    tags: ["property", "real estate", "houses", "stands"],
    status: GroupStatus.FULL,
    isFeatured: false
  },
  {
    name: "Health Awareness Zimbabwe",
    categorySlug: "health",
    subcategory: "Health Awareness",
    location: "Zimbabwe",
    description: "Community health awareness, campaigns, wellness updates and practical prevention information.",
    tags: ["health", "wellness", "awareness"],
    status: GroupStatus.ACTIVE,
    isFeatured: false
  },
  {
    name: "School Supplies & Education Network",
    categorySlug: "education",
    subcategory: "School Supplies",
    location: "Zimbabwe",
    description: "Parents, schools and suppliers sharing school supplies, learning resources and education leads.",
    tags: ["education", "school supplies", "learning"],
    status: GroupStatus.ACTIVE,
    isFeatured: false
  },
  {
    name: "Transport & Logistics Zimbabwe",
    categorySlug: "transport",
    subcategory: "Logistics",
    location: "Zimbabwe",
    description: "Transporters, logistics providers and customers sharing route requests, loads and fleet services.",
    tags: ["transport", "logistics", "trucks", "deliveries"],
    status: GroupStatus.ACTIVE,
    isFeatured: true
  }
];

const groupRequests = [
  {
    id: "seed-request-beekeeping-zimbabwe",
    query: "Beekeeping group in Zimbabwe",
    category: "Farming",
    location: "Zimbabwe",
    notes: "People are asking for honey production, hives and buyer connections.",
    status: GroupRequestStatus.NEW
  },
  {
    id: "seed-request-kariba-lodges",
    query: "Kariba lodges group",
    category: "Tourism",
    location: "Kariba",
    notes: "Likely demand for lodge availability and travel packages.",
    status: GroupRequestStatus.REVIEWED
  },
  {
    id: "seed-request-goat-farming-buyers",
    query: "Goat farming buyers",
    category: "Farming",
    location: "Zimbabwe",
    notes: "Buyer-focused livestock group could reduce repeat manual replies.",
    status: GroupRequestStatus.NEW
  },
  {
    id: "seed-request-solar-equipment-suppliers",
    query: "Solar equipment suppliers",
    category: "Business",
    location: "Zimbabwe",
    notes: "Supplier discovery request for panels, batteries and installers.",
    status: GroupRequestStatus.NEW
  },
  {
    id: "seed-request-truck-hire-group",
    query: "Truck hire group",
    category: "Transport",
    location: "Zimbabwe",
    notes: "Demand for transport operators and truck hire leads.",
    status: GroupRequestStatus.REVIEWED
  }
];

async function main() {
  const createdCategories = new Map<string, string>();

  for (const category of categories) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description
      },
      create: category
    });

    createdCategories.set(category.slug, saved.id);
  }

  for (const group of groups) {
    const categoryId = createdCategories.get(group.categorySlug);

    if (!categoryId) {
      throw new Error(`Missing category for ${group.name}`);
    }

    await prisma.whatsAppGroup.upsert({
      where: { id: `seed-${group.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` },
      update: {
        name: group.name,
        inviteLink: "https://chat.whatsapp.com/example",
        categoryId,
        subcategory: group.subcategory,
        location: group.location,
        description: group.description,
        tags: group.tags,
        status: group.status,
        isFeatured: group.isFeatured,
        lastVerifiedAt: new Date()
      },
      create: {
        id: `seed-${group.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name: group.name,
        inviteLink: "https://chat.whatsapp.com/example",
        categoryId,
        subcategory: group.subcategory,
        location: group.location,
        description: group.description,
        tags: group.tags,
        status: group.status,
        isFeatured: group.isFeatured,
        lastVerifiedAt: new Date()
      }
    });
  }

  for (const request of groupRequests) {
    await prisma.groupRequest.upsert({
      where: { id: request.id },
      update: {
        query: request.query,
        category: request.category,
        location: request.location,
        notes: request.notes,
        status: request.status
      },
      create: request
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
