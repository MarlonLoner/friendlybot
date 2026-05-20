import { AdminAuthGate } from "@/components/admin-auth-gate";
import { AdminGroups } from "@/components/admin-groups";
import { AdminLayout } from "@/components/admin-layout";

export default function AdminGroupsPage() {
  return (
    <AdminAuthGate>
      <AdminLayout>
        <AdminGroups />
      </AdminLayout>
    </AdminAuthGate>
  );
}
