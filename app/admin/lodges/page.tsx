import { AdminAuthGate } from "@/components/admin-auth-gate";
import { AdminLayout } from "@/components/admin-layout";
import { AdminLodges } from "@/components/admin-lodges";

export default function AdminLodgesPage() {
  return (
    <AdminAuthGate>
      <AdminLayout>
        <AdminLodges />
      </AdminLayout>
    </AdminAuthGate>
  );
}
