import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, Bus, GraduationCap, HeartPulse, Leaf, Map, Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getCategories, getGroups } from "@/lib/data";

const iconBySlug = {
  farming: Leaf,
  tourism: Map,
  business: BriefcaseBusiness,
  jobs: Search,
  property: Building2,
  health: HeartPulse,
  education: GraduationCap,
  transport: Bus
};

export default async function CategoriesPage() {
  const [categories, groups] = await Promise.all([getCategories(), getGroups()]);

  return (
    <main className="min-h-screen bg-eclipse-mist">
      <SiteHeader />
      <section className="bg-eclipse-blue text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-eclipse-gold">Directory</p>
          <h1 className="mt-2 text-4xl font-bold tracking-normal">Browse categories and subcategories</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
            Explore Sandra&apos;s curated WhatsApp group network by industry, then jump into FriendlyBot with the category already filtered.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => {
            const Icon = iconBySlug[category.slug as keyof typeof iconBySlug] ?? Search;
            const subcategories = Array.from(
              new Set(
                groups
                  .filter((group) => group.category.slug === category.slug)
                  .map((group) => group.subcategory)
                  .filter((value): value is string => Boolean(value))
              )
            ).sort();

            return (
              <Link
                key={category.id}
                href={`/friendlybot?category=${category.slug}`}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-eclipse-gold/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-eclipse-gold/15 text-eclipse-gold">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="rounded-md bg-eclipse-mist px-2 py-1 text-xs font-semibold text-slate-600">{category.groupCount ?? 0} groups</span>
                </div>
                <h2 className="mt-4 text-lg font-semibold text-eclipse-ink">{category.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {subcategories.length > 0 ? (
                    subcategories.slice(0, 4).map((subcategory) => (
                      <span key={subcategory} className="rounded-md bg-eclipse-mist px-2 py-1 text-xs font-medium text-slate-600">
                        {subcategory}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-md bg-eclipse-mist px-2 py-1 text-xs font-medium text-slate-600">General</span>
                  )}
                </div>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-eclipse-blue">
                  Search this category
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
