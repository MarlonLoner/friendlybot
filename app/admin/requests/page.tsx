import { AdminAuthGate } from "@/components/admin-auth-gate";
import { AdminLayout } from "@/components/admin-layout";
import { AdminRequests } from "@/components/admin-requests";

export default function AdminRequestsPage() {
  return (
    <AdminAuthGate>
      <AdminLayout>
        <AdminRequests />
      </AdminLayout>
    </AdminAuthGate>
  );
}
