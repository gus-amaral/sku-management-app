"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Download, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { AddSkuModal } from "@/components/AddSkuModal";
import { EditSkuModal } from "@/components/EditSkuModal";
import { DeleteSkuModal } from "@/components/DeleteSkuModal";
import { SkuDetailModal } from "@/components/SkuDetailModal";
import { api } from "@/lib/api";
import type { SKU } from "@/lib/types";
import { format } from "date-fns";

const ROWS_PER_PAGE = 10;

export default function InventoryPage() {
  const { hasPermission } = useAuth();
  const [skus, setSkus] = useState<SKU[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editSku, setEditSku] = useState<SKU | null>(null);
  const [deleteSku, setDeleteSku] = useState<SKU | null>(null);
  const [detailSku, setDetailSku] = useState<SKU | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadSkus = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryFilter) params.set("category", categoryFilter);
    if (statusFilter) params.set("status", statusFilter);
    params.set("sort", sortBy);
    params.set("order", sortOrder);
    api<{ skus: SKU[] }>(`/api/skus?${params}`)
      .then((data) => setSkus(data.skus))
      .catch(() => setSkus([]));
  }, [search, categoryFilter, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    loadSkus();
  }, [loadSkus]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => setCategories([]));
  }, []);

  const canCreate = hasPermission("create_sku");
  const canUpdate = hasPermission("update_sku");
  const canDelete = hasPermission("delete_sku");
  const canView = hasPermission("view_inventory");

  const paginated = skus.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  const totalPages = Math.ceil(skus.length / ROWS_PER_PAGE) || 1;

  const handleExportCSV = () => {
    const headers = ["SKU Code", "Name", "Category", "Unit Price", "Inventory Level", "Status", "Last Updated"];
    const rows = skus.map((s) => [
      s.skuCode,
      s.name,
      s.category,
      s.unitPrice.toFixed(2),
      s.inventoryLevel,
      s.status,
      s.updatedAt,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sku-inventory-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  if (!canView) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold text-destructive">Access Denied</h2>
        <p className="mt-2 text-muted-foreground">You do not have permission to view inventory.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">SKU Inventory</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </button>
          {canCreate && (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add SKU
            </button>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-md border p-3 ${message.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by SKU, name, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="approved">Approved</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="rejected">Rejected</option>
          <option value="pending_deletion">Pending Deletion</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">SKU Code</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Unit Price</th>
                <th className="px-4 py-3 font-medium">Inventory Level</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((sku) => (
                <tr key={sku.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{sku.skuCode}</td>
                  <td className="px-4 py-3">{sku.name}</td>
                  <td className="px-4 py-3">{sku.category}</td>
                  <td className="px-4 py-3">${sku.unitPrice.toFixed(2)}</td>
                  <td className="px-4 py-3">{sku.inventoryLevel.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={sku.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setDetailSku(sku)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {canUpdate && (sku.status === "approved" || sku.status === "rejected") && (
                        <button
                          type="button"
                          onClick={() => setEditSku(sku)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {canDelete && (sku.status === "approved" || sku.status === "rejected") && (
                        <button
                          type="button"
                          onClick={() => setDeleteSku(sku)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <span>
            Rows per page: {ROWS_PER_PAGE} · Showing {(page - 1) * ROWS_PER_PAGE + 1}–
            {Math.min(page * ROWS_PER_PAGE, skus.length)} of {skus.length} items
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded border border-border px-2 py-1 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded border border-border px-2 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <AddSkuModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => {
          setAddOpen(false);
          loadSkus();
          showMessage("success", "SKU submitted for approval.");
        }}
        categories={categories}
      />
      {editSku && (
        <EditSkuModal
          sku={editSku}
          onClose={() => setEditSku(null)}
          onSuccess={() => {
            setEditSku(null);
            loadSkus();
            showMessage("success", "Changes submitted for approval.");
          }}
          categories={categories}
        />
      )}
      {deleteSku && (
        <DeleteSkuModal
          sku={deleteSku}
          onClose={() => setDeleteSku(null)}
          onSuccess={() => {
            setDeleteSku(null);
            loadSkus();
            showMessage("success", "Deletion request submitted for approval.");
          }}
        />
      )}
      {detailSku && <SkuDetailModal sku={detailSku} onClose={() => setDetailSku(null)} />}
    </div>
  );
}
