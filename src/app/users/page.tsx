"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { User as UserType, Permission } from "@/lib/types";

const PERMISSION_LABELS: Record<Permission, string> = {
  create_sku: "Create SKU",
  update_sku: "Update SKU",
  delete_sku: "Delete SKU",
  view_inventory: "View Inventory",
  approve_reject: "Approve/Reject SKU Changes",
  manage_users: "Manage Users (Admin)",
};

const ALL_PERMISSIONS: Permission[] = [
  "create_sku",
  "update_sku",
  "delete_sku",
  "view_inventory",
  "approve_reject",
  "manage_users",
];

export default function UserManagementPage() {
  const { user: currentUser, hasPermission } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<UserType | null>(null);
  const [perms, setPerms] = useState<Permission[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const canManage = hasPermission("manage_users");

  useEffect(() => {
    api<{ users: UserType[] }>("/api/users")
      .then((data) => setUsers(data.users))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (editing) setPerms([...editing.permissions]);
  }, [editing]);

  const handleSave = async () => {
    if (!editing) return;
    try {
      await api("/api/users/permissions", { method: "PATCH", body: { userId: editing.id, permissions: perms } });
      setMessage({ type: "success", text: "Permissions updated." });
      setEditing(null);
      api<{ users: UserType[] }>("/api/users").then((data) => setUsers(data.users));
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Update failed" });
    }
  };

  const togglePerm = (p: Permission) => {
    setPerms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  if (!canManage) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold text-destructive">Access Denied</h2>
        <p className="mt-2 text-muted-foreground">Only administrators can access User Management.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">User Management</h1>
      {message && (
        <div
          className={`mb-4 rounded-md border p-3 ${message.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}
        >
          {message.text}
        </div>
      )}
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-4">
          {users.map((u) => (
            <div key={u.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </div>
                {editing?.id === u.id ? (
                  <div className="flex gap-2">
                    <button type="button" onClick={handleSave} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                      Save
                    </button>
                    <button type="button" onClick={() => setEditing(null)} className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(u)}
                    disabled={u.id === currentUser?.id}
                    className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent disabled:opacity-50"
                  >
                    Edit permissions
                  </button>
                )}
              </div>
              {editing?.id === u.id && (
                <div className="mt-4 grid gap-2 border-t border-border pt-4 sm:grid-cols-2">
                  {ALL_PERMISSIONS.map((p) => (
                    <label key={p} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={perms.includes(p)}
                        onChange={() => togglePerm(p)}
                        className="rounded border-input"
                      />
                      <span className="text-sm">{PERMISSION_LABELS[p]}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
