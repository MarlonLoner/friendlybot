import { GroupRequestStatus, GroupStatus, LodgeStatus, PrismaClient, SubscriptionStatus } from "@prisma/client";

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

const lodges = [
  {
    name: "Kariba Sunset Lodge",
    slug: "kariba-sunset-lodge",
    ownerName: "Eclipse Demo",
    whatsappNumber: "+263771234567",
    location: "Kariba",
    address: "Lake Drive, Kariba",
    googleMapsUrl: "https://maps.google.com/?q=Kariba",
    priceFrom: 85,
    lodgeType: "Lodge",
    roomTypes: "Standard rooms, family rooms, lake-view chalets",
    facilities: ["WiFi", "Swimming Pool", "Parking", "Restaurant", "Bar", "Family Friendly", "Air Conditioning"],
    description: "A warm lake-facing lodge for family holidays, fishing weekends and relaxed Kariba getaways.",
    status: LodgeStatus.ACTIVE,
    isFeatured: true,
    subscriptionStatus: SubscriptionStatus.TRIAL,
    images: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    name: "Victoria Falls Family Guest House",
    slug: "victoria-falls-family-guest-house",
    ownerName: "Eclipse Demo",
    whatsappNumber: "+263772345678",
    location: "Victoria Falls",
    priceFrom: 65,
    lodgeType: "Guest House",
    roomTypes: "Double rooms, twin rooms, family suite",
    facilities: ["WiFi", "Parking", "Restaurant", "Family Friendly", "Hot Water", "Security"],
    description: "A comfortable guest house close to Victoria Falls activities, ideal for families and small groups.",
    status: LodgeStatus.ACTIVE,
    isFeatured: true,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"]
  },
  {
    name: "Nyanga Mist Cottages",
    slug: "nyanga-mist-cottages",
    ownerName: "Eclipse Demo",
    whatsappNumber: "+263773456789",
    location: "Nyanga",
    priceFrom: 70,
    lodgeType: "Cottage",
    roomTypes: "Self-catering cottages and mountain-view cabins",
    facilities: ["Parking", "Self Catering", "Family Friendly", "Hot Water", "Backup Power", "Security"],
    description: "Quiet mountain cottages for weekend retreats, family stays and misty Nyanga escapes.",
    status: LodgeStatus.ACTIVE,
    isFeatured: false,
    subscriptionStatus: SubscriptionStatus.TRIAL,
    images: ["https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=80"]
  },
  {
    name: "Harare Executive Guest House",
    slug: "harare-executive-guest-house",
    ownerName: "Eclipse Demo",
    whatsappNumber: "+263774567890",
    location: "Harare",
    priceFrom: 55,
    lodgeType: "Guest House",
    roomTypes: "Executive rooms, conference package rooms",
    facilities: ["WiFi", "Parking", "Restaurant", "Conference Room", "Air Conditioning", "Backup Power", "Security"],
    description: "Business-friendly guest house with convenient city access and practical meeting facilities.",
    status: LodgeStatus.ACTIVE,
    isFeatured: false,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80"]
  },
  {
    name: "Lake Chivero Weekend Lodge",
    slug: "lake-chivero-weekend-lodge",
    ownerName: "Eclipse Demo",
    whatsappNumber: "+263775678901",
    location: "Lake Chivero",
    priceFrom: 60,
    lodgeType: "Lodge",
    roomTypes: "Weekend chalets and group rooms",
    facilities: ["Parking", "Restaurant", "Bar", "Self Catering", "Family Friendly", "Security"],
    description: "A simple weekend lodge for quick escapes, group braais and lakeside relaxation near Harare.",
    status: LodgeStatus.ACTIVE,
    isFeatured: false,
    subscriptionStatus: SubscriptionStatus.NONE,
    images: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80"]
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

  for (const lodge of lodges) {
    await prisma.lodge.upsert({
      where: { slug: lodge.slug },
      update: {
        name: lodge.name,
        ownerName: lodge.ownerName,
        whatsappNumber: lodge.whatsappNumber,
        location: lodge.location,
        address: "address" in lodge ? lodge.address : null,
        googleMapsUrl: "googleMapsUrl" in lodge ? lodge.googleMapsUrl : null,
        priceFrom: lodge.priceFrom,
        lodgeType: lodge.lodgeType,
        roomTypes: lodge.roomTypes,
        facilities: lodge.facilities,
        description: lodge.description,
        status: lodge.status,
        isFeatured: lodge.isFeatured,
        subscriptionStatus: lodge.subscriptionStatus
      },
      create: {
        name: lodge.name,
        slug: lodge.slug,
        ownerName: lodge.ownerName,
        whatsappNumber: lodge.whatsappNumber,
        location: lodge.location,
        address: "address" in lodge ? lodge.address : null,
        googleMapsUrl: "googleMapsUrl" in lodge ? lodge.googleMapsUrl : null,
        priceFrom: lodge.priceFrom,
        lodgeType: lodge.lodgeType,
        roomTypes: lodge.roomTypes,
        facilities: lodge.facilities,
        description: lodge.description,
        status: lodge.status,
        isFeatured: lodge.isFeatured,
        subscriptionStatus: lodge.subscriptionStatus,
        images: {
          create: lodge.images.map((imageUrl, index) => ({
            imageUrl,
            altText: lodge.name,
            sortOrder: index
          }))
        }
      }
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
