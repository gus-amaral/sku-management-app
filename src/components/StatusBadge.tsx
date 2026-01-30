import clsx from "clsx";

const statusStyles: Record<string, string> = {
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  pending_approval: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  pending_deletion: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  archived: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const statusLabels: Record<string, string> = {
  approved: "Approved",
  pending_approval: "Pending Approval",
  rejected: "Rejected",
  pending_deletion: "Pending Deletion",
  archived: "Archived",
};

export function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? "bg-gray-100 text-gray-800";
  const label = statusLabels[status] ?? status;
  return (
    <span className={clsx("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", style)}>
      {label}
    </span>
  );
}
