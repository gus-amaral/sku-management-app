"use client";

import { useAuth } from "@/context/AuthContext";

const PERMISSION_LABELS: Record<string, string> = {
  create_sku: "Create SKU — You can add new SKUs (submitted for approval).",
  update_sku: "Update SKU — You can edit existing Approved or Rejected SKUs.",
  delete_sku: "Delete SKU — You can request deletion of SKUs (requires a reason).",
  view_inventory: "View Inventory — You can view the SKU list and export to CSV.",
  approve_reject: "Approve/Reject — You can approve or reject pending SKU requests.",
  manage_users: "Manage Users — You can assign and revoke permissions for other users (Admin only).",
};

export default function MyPermissionsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        Not signed in.
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My Permissions</h1>
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <p className="mb-4 text-muted-foreground">
          Your account: <strong>{user.name}</strong> ({user.email})
        </p>
        {user.permissions.length === 0 ? (
          <p className="text-muted-foreground">You have no permissions assigned.</p>
        ) : (
          <ul className="space-y-2">
            {user.permissions.map((p) => (
              <li key={p} className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
                <span className="font-medium text-primary">{p.replace(/_/g, " ")}</span>
                <span className="text-muted-foreground">— {PERMISSION_LABELS[p] ?? p}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
