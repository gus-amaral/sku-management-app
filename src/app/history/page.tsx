"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { AuditEntry } from "@/lib/types";
import { format } from "date-fns";
import { Download } from "lucide-react";

export default function HistoryPage() {
  const { hasPermission } = useAuth();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [skuFilter, setSkuFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const canView = hasPermission("view_inventory") || hasPermission("manage_users");

  useEffect(() => {
    setLoading(true);
    const url = skuFilter ? `/api/audit?skuId=${encodeURIComponent(skuFilter)}` : "/api/audit";
    api<{ entries: AuditEntry[] }>(url)
      .then((data) => setEntries(data.entries ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [skuFilter]);

  const handleExportCSV = () => {
    const headers = ["Timestamp", "SKU Code", "Action", "User", "Comments", "Rejection Reason"];
    const rows = entries.map((e) => [
      format(new Date(e.timestamp), "yyyy-MM-dd HH:mm:ss"),
      e.skuCode,
      e.action,
      e.userName,
      e.comments ?? "",
      e.rejectionReason ?? "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sku-audit-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!canView) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold text-destructive">Access Denied</h2>
        <p className="mt-2 text-muted-foreground">You do not have permission to view reports and history.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Reports & History</h1>
        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
        >
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter by SKU ID (optional)"
          value={skuFilter}
          onChange={(e) => setSkuFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full max-w-xs"
        />
      </div>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : entries.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          No audit entries found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">SKU Code</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Comments / Reason</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">{format(new Date(e.timestamp), "PPp")}</td>
                  <td className="px-4 py-3 font-mono text-xs">{e.skuCode}</td>
                  <td className="px-4 py-3 capitalize">{e.action}</td>
                  <td className="px-4 py-3">{e.userName}</td>
                  <td className="px-4 py-3">{e.comments ?? e.rejectionReason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
