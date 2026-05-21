import { LodgeSubmissionForm } from "@/components/lodge-submission-form";
import { SiteHeader } from "@/components/site-header";

export default function ListYourLodgePage() {
  return (
    <main className="min-h-screen bg-eclipse-mist">
      <SiteHeader />
      <section className="bg-eclipse-blue text-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-eclipse-gold">Lodge owners</p>
          <h1 className="mt-2 text-4xl font-bold tracking-normal">List Your Lodge</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
            Submit your lodge for review. Approved listings appear on Find Lodges by Eclipse.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <LodgeSubmissionForm />
      </section>
    </main>
  );
}
