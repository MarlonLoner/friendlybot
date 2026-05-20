import { clsx } from "clsx";
import { groupStatusLabel } from "@/lib/search";
import type { GroupStatus } from "@/lib/types";

const statusClasses: Record<GroupStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  ALMOST_FULL: "bg-amber-50 text-amber-700 ring-amber-200",
  FULL: "bg-rose-50 text-rose-700 ring-rose-200",
  ARCHIVED: "bg-slate-100 text-slate-600 ring-slate-200"
};

export function StatusBadge({ status }: { status: GroupStatus }) {
  return (
    <span className={clsx("inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1", statusClasses[status])}>
      {groupStatusLabel(status)}
    </span>
  );
}
