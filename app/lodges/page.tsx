import Link from "next/link";
import { ArrowRight, Hotel } from "lucide-react";
import { LodgeBrowser } from "@/components/lodge-browser";
import { SiteHeader } from "@/components/site-header";
import { getLodges } from "@/lib/data";

export default async function LodgesPage() {
  const lodges = await getLodges();
  return (
    <main className="min-h-screen bg-eclipse-mist">
      <SiteHeader />
      <section className="overflow-hidden bg-eclipse-blue text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1 text-sm text-eclipse-gold ring-1 ring-white/15">
            <Hotel className="h-4 w-4" />
            Find Lodges by Eclipse
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-normal sm:text-5xl">Find lodges, stays, and getaways across Zimbabwe.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">Browse listed lodges and connect directly through WhatsApp.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/lodges/list-your-lodge" className="inline-flex items-center justify-center gap-2 rounded-md bg-eclipse-gold px-5 py-3 text-sm font-semibold text-eclipse-blue transition hover:bg-[#e8b957]">
              List Your Lodge
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      <LodgeBrowser lodges={lodges} />
    </main>
  );
}
