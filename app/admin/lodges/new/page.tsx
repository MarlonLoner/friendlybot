import { AdminAuthGate } from "@/components/admin-auth-gate";
import { AdminLayout } from "@/components/admin-layout";
import { LodgeSubmissionForm } from "@/components/lodge-submission-form";

export default function NewLodgePage() {
  return (
    <AdminAuthGate>
      <AdminLayout>
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-eclipse-gold">Find Lodges</p>
          <h1 className="mt-2 text-3xl font-bold text-eclipse-ink">Create Lodge Listing</h1>
        </div>
        <LodgeSubmissionForm admin initialStatus="ACTIVE" />
      </AdminLayout>
    </AdminAuthGate>
  );
}
