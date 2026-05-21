import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, ShieldCheck } from "lucide-react";
import { LodgeCard } from "@/components/lodge-card";
import { LodgeWhatsappButton } from "@/components/lodge-whatsapp-button";
import { SiteHeader } from "@/components/site-header";
import { getLodgeBySlug, getLodges, incrementLodgeViews } from "@/lib/data";
import { formatPrice } from "@/lib/lodge-options";

export default async function LodgeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lodge = await getLodgeBySlug(slug);
  if (!lodge) notFound();
  await incrementLodgeViews(lodge.id);
  const similar = (await getLodges({ location: lodge.location })).filter((item) => item.id !== lodge.id).slice(0, 3);
  const hero = lodge.images[0]?.imageUrl ?? "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";

  return (
    <main className="min-h-screen bg-eclipse-mist">
      <SiteHeader />
      <section className="bg-eclipse-blue text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/lodges" className="text-sm font-semibold text-eclipse-gold">Back to lodges</Link>
          <h1 className="mt-3 text-4xl font-bold tracking-normal">{lodge.name}</h1>
          <p className="mt-2 inline-flex items-center gap-2 text-white/75"><MapPin className="h-4 w-4 text-eclipse-gold" />{lodge.location}{lodge.address ? ` / ${lodge.address}` : ""}</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <img src={hero} alt={lodge.name} className="aspect-[16/10] w-full rounded-lg object-cover shadow-soft" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {lodge.images.slice(1, 3).map((image) => <img key={image.id} src={image.imageUrl} alt={image.altText ?? lodge.name} className="aspect-[16/10] w-full rounded-lg object-cover shadow-soft" />)}
          </div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <article className="rounded-lg bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-eclipse-gold">{lodge.lodgeType}</p>
            <h2 className="mt-2 text-2xl font-bold text-eclipse-ink">From {formatPrice(lodge.priceFrom)}</h2>
            <p className="mt-4 leading-7 text-slate-600">{lodge.description}</p>
            {lodge.roomTypes ? <p className="mt-5 text-sm text-slate-700"><span className="font-semibold text-eclipse-ink">Room types:</span> {lodge.roomTypes}</p> : null}
            <div className="mt-5 flex flex-wrap gap-2">
              {lodge.facilities.map((facility) => <span key={facility} className="rounded-md bg-eclipse-mist px-2 py-1 text-sm font-medium text-slate-600">{facility}</span>)}
            </div>
          </article>
          <aside className="rounded-lg bg-white p-6 shadow-soft">
            <LodgeWhatsappButton lodge={lodge} />
            {lodge.googleMapsUrl ? <a href={lodge.googleMapsUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex w-full justify-center rounded-md border border-slate-200 px-4 py-3 text-sm font-semibold text-eclipse-blue">Open Google Maps</a> : null}
            <div className="mt-5 rounded-lg bg-eclipse-blue p-4 text-white">
              <div className="flex items-center gap-2 text-eclipse-gold"><ShieldCheck className="h-5 w-5" /><span className="font-semibold">Listed on Find Lodges by Eclipse</span></div>
              <p className="mt-2 text-sm leading-6 text-white/75">Connect directly with lodge owners through WhatsApp.</p>
            </div>
          </aside>
        </div>
        {similar.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-2xl font-bold text-eclipse-ink">Similar lodges</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-3">{similar.map((item) => <LodgeCard key={item.id} lodge={item} />)}</div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
