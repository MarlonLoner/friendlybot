import { AdminAuthGate } from "@/components/admin-auth-gate";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLayout } from "@/components/admin-layout";

export default function AdminPage() {
  return (
    <AdminAuthGate>
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    </AdminAuthGate>
  );
}
