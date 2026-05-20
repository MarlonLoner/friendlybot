import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { FriendlyBotSearch } from "@/components/friendlybot-search";

export default function FriendlyBotPage() {
  return (
    <main className="min-h-screen bg-eclipse-mist">
      <SiteHeader />
      <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-8 text-sm text-slate-600">Loading FriendlyBot...</div>}>
        <FriendlyBotSearch />
      </Suspense>
    </main>
  );
}
