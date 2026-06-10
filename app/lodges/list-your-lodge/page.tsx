import { LodgeSubmissionForm } from "@/components/lodge-submission-form";
import { PaymentInstructions } from "@/components/payment-instructions";
import { SiteHeader } from "@/components/site-header";

export default function ListYourLodgePage() {
  return (
    <main className="min-h-screen bg-eclipse-mist">
      <SiteHeader />
      <section className="bg-eclipse-blue text-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-eclipse-gold">Find Lodges Annual Listing</p>
          <h1 className="mt-2 text-4xl font-bold tracking-normal">List your lodge for only $10/year.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
            Get discovered by people searching for lodges, stays, and getaways across Zimbabwe.
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <aside className="space-y-5">
          <div className="rounded-lg bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-eclipse-gold">Plan</p>
            <h2 className="mt-2 text-2xl font-bold text-eclipse-ink">Find Lodges Annual Listing</h2>
            <p className="mt-3 text-4xl font-bold text-eclipse-blue">USD $10<span className="text-base text-slate-500">/year</span></p>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
              <li>Listed on Find Lodges by Eclipse for 12 months</li>
              <li>Lodge profile with photos/details</li>
              <li>WhatsApp booking button</li>
              <li>Location and facility filters</li>
              <li>Direct customer discovery from Eclipse network</li>
            </ul>
            <a href="#lodge-form" className="mt-5 inline-flex rounded-md bg-eclipse-gold px-4 py-3 text-sm font-semibold text-eclipse-blue">
              Submit My Lodge
            </a>
          </div>
          <PaymentInstructions compact />
        </aside>
        <div id="lodge-form">
          <LodgeSubmissionForm />
        </div>
      </section>
    </main>
  );
}
