# Eclipse FriendlyBot

Eclipse FriendlyBot is a mobile-first Next.js MVP for helping users find relevant WhatsApp group links quickly. It gives Sandra Kawodza a searchable group directory, search logging, click tracking, and a simple admin console foundation that can later expand into the paid Find Lodges by Eclipse marketplace.

The next value layer is the FriendlyBot Demand Engine: failed searches and explicit user requests become admin insights so the Eclipse team can decide which new WhatsApp groups to create next.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- API routes for search, admin CRUD, analytics, and click tracking
- Group request capture and demand analytics
- Simple admin access-code placeholder

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create an environment file:

```bash
cp .env.example .env
```

3. Set your PostgreSQL connection string in `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
ADMIN_ACCESS_CODE="friendlybot-admin"
```

4. Generate Prisma Client and run the first migration:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Seed realistic MVP data:

```bash
npm run prisma:seed
```

6. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Routes

- `/` public landing page
- `/friendlybot` chat-style search interface
- `/categories` category and subcategory directory
- `/admin` protected dashboard
- `/admin/groups` protected group management
- `/admin/searches` protected search analytics
- `/admin/requests` protected group request inbox and create-from-request workflow

## Admin Access

The MVP uses `ADMIN_ACCESS_CODE` as a placeholder gate. The browser stores the accepted code in localStorage or sessionStorage, then sends it to admin API routes in the `x-admin-access-code` header.

Replace this with production authentication before giving access to a wider team.

## FriendlyBot Demand Engine

When a user searches on `/friendlybot` and no matching group is found, FriendlyBot shows a request card. The user can optionally add their name, WhatsApp number, category, location and notes. Submitting the form creates a `GroupRequest` record.

Admin users can then:

1. Review searches in `/admin/searches`
2. Review explicit requests in `/admin/requests`
3. Create new WhatsApp groups directly from demand
4. Track demand over time from the dashboard Demand Signals section

Demand Signals combine no-result searches and group requests. Each signal suggests whether Sandra should create a new group, add more groups, or review an existing category.

## Scripts

```bash
npm run dev
npm run build
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Deployment Notes

The project is ready for Vercel:

1. Push to GitHub.
2. Create a Vercel project from the repo.
3. Add `DATABASE_URL` and `ADMIN_ACCESS_CODE` in Vercel environment variables.
4. Run Prisma migrations against your production database.

The current code intentionally includes only a “Find Lodges by Eclipse is coming soon” section. The data structure and layout leave room for lodge listings, payments, subscriptions, image galleries, and Paynow integration later.
