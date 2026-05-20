import Link from "next/link";
import { ArrowRight, Bot, BriefcaseBusiness, Building2, Bus, GraduationCap, HeartPulse, Home, Leaf, Map, MessageCircle, Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

const categories = [
  { name: "Farming", slug: "farming", icon: Leaf, description: "Crop, livestock and agribusiness groups." },
  { name: "Tourism", slug: "tourism", icon: Map, description: "Lodges, travel deals and hospitality." },
  { name: "Business", slug: "business", icon: BriefcaseBusiness, description: "Networks, suppliers and entrepreneurs." },
  { name: "Jobs", slug: "jobs", icon: Search, description: "Vacancy alerts and career communities." },
  { name: "Property", slug: "property", icon: Building2, description: "Homes, stands, rentals and buyers." },
  { name: "Health", slug: "health", icon: HeartPulse, description: "Wellness and health awareness." },
  { name: "Education", slug: "education", icon: GraduationCap, description: "Schools, supplies and learning." },
  { name: "Transport", slug: "transport", icon: Bus, description: "Logistics, routes and fleet services." }
];

const steps = [
  "Search what you need",
  "FriendlyBot finds the best matching groups",
  "Join the right WhatsApp community"
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-eclipse-mist">
      <SiteHeader />
      <section className="relative overflow-hidden bg-eclipse-blue text-white">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(#ffffff_1px,transparent_1px),linear-gradient(90deg,#ffffff_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative mx-auto grid min-h-[680px] max-w-7xl content-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1 text-sm text-eclipse-gold ring-1 ring-white/15">
              <Bot className="h-4 w-4" aria-hidden="true" />
              Sandra Kawodza&apos;s WhatsApp directory assistant
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-normal sm:text-5xl lg:text-6xl">Find the right WhatsApp group in seconds.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
              Eclipse FriendlyBot connects you to active communities across farming, tourism, business, jobs, property, health, education and more.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/friendlybot"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-eclipse-gold px-5 py-3 text-sm font-semibold text-eclipse-blue transition hover:bg-[#e8b957]"
              >
                Ask FriendlyBot
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Browse Categories
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-lg bg-white p-4 text-eclipse-ink shadow-soft">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-eclipse-gold text-eclipse-blue">
                  <Bot className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold">FriendlyBot</p>
                  <p className="text-xs text-slate-500">Directory search engine</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="max-w-[82%] rounded-lg bg-eclipse-mist p-3 text-sm text-slate-700">I need tomato farming groups in Zimbabwe.</div>
                <div className="ml-auto max-w-[88%] rounded-lg bg-eclipse-blue p-3 text-sm text-white">
                  I found active farming communities with crop tips, suppliers and market leads.
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">Tomato Farming Zimbabwe</p>
                    <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Active</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Growers sharing production tips, input suppliers and market prices.</p>
                  <div className="mt-3 h-9 rounded-md bg-eclipse-gold" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-eclipse-gold">Popular categories</p>
            <h2 className="mt-2 text-3xl font-bold text-eclipse-ink">Start with what you need</h2>
          </div>
          <Link href="/categories" className="inline-flex items-center gap-2 text-sm font-semibold text-eclipse-blue hover:text-eclipse-blueSoft">
            View all categories
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                href={`/friendlybot?category=${category.slug}`}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-eclipse-gold/60"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-eclipse-gold/15 text-eclipse-gold">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold text-eclipse-ink">{category.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-eclipse-gold">How it works</p>
          <h2 className="mt-2 text-3xl font-bold text-eclipse-ink">A faster path to the right community</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step} className="rounded-lg border border-slate-200 bg-eclipse-mist p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-eclipse-blue text-sm font-bold text-eclipse-gold">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-eclipse-ink">{step}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-eclipse-blue p-6 text-white shadow-soft sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-eclipse-gold">Coming soon</p>
          <h2 className="mt-2 text-3xl font-bold">Find Lodges by Eclipse is coming soon</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
            The group finder foundation is being built so lodge listings, subscriptions, payments, Paynow integration and image-rich marketplace tools can plug in later.
          </p>
        </div>
      </section>
    </main>
  );
}
