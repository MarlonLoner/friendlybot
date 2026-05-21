import { AdminAuthGate } from "@/components/admin-auth-gate";
import { AdminLayout } from "@/components/admin-layout";
import { AdminLodgeEdit } from "@/components/admin-lodge-edit";

export default async function EditLodgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AdminAuthGate>
      <AdminLayout>
        <AdminLodgeEdit id={id} />
      </AdminLayout>
    </AdminAuthGate>
  );
}
