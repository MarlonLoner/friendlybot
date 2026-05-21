import { clsx } from "clsx";
import type { GroupRequestStatus } from "@/lib/types";

const statusClasses: Record<GroupRequestStatus, string> = {
  NEW: "bg-eclipse-gold/15 text-eclipse-blue ring-eclipse-gold/40",
  REVIEWED: "bg-sky-50 text-sky-700 ring-sky-200",
  CREATED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  IGNORED: "bg-slate-100 text-slate-600 ring-slate-200"
};

export function requestStatusLabel(status: GroupRequestStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function RequestStatusBadge({ status }: { status: GroupRequestStatus }) {
  return (
    <span className={clsx("inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1", statusClasses[status])}>
      {requestStatusLabel(status)}
    </span>
  );
}
