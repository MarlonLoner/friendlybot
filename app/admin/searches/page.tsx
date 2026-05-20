import { AdminAuthGate } from "@/components/admin-auth-gate";
import { AdminLayout } from "@/components/admin-layout";
import { AdminSearches } from "@/components/admin-searches";

export default function AdminSearchesPage() {
  return (
    <AdminAuthGate>
      <AdminLayout>
        <AdminSearches />
      </AdminLayout>
    </AdminAuthGate>
  );
}
