"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import type { SKU } from "@/lib/types";

interface EditSkuModalProps {
  sku: SKU;
  onClose: () => void;
  onSuccess: () => void;
  categories: string[];
}

export function EditSkuModal({ sku, onClose, onSuccess, categories }: EditSkuModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: sku.name,
    description: sku.description,
    category: sku.category,
    unitPrice: String(sku.unitPrice),
    inventoryLevel: String(sku.inventoryLevel),
  });

  useEffect(() => {
    setForm({
      name: sku.name,
      description: sku.description,
      category: sku.category,
      unitPrice: String(sku.unitPrice),
      inventoryLevel: String(sku.inventoryLevel),
    });
  }, [sku]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api(`/api/skus/${sku.id}`, {
        method: "PATCH",
        body: {
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category.trim(),
          unitPrice: Number(form.unitPrice),
          inventoryLevel: Number(form.inventoryLevel),
        },
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update SKU");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-semibold">Edit SKU — {sku.skuCode}</h2>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium">SKU Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={2}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Unit Price *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.unitPrice}
                onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Inventory Level *</label>
              <input
                type="number"
                required
                min="0"
                value={form.inventoryLevel}
                onChange={(e) => setForm((f) => ({ ...f, inventoryLevel: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {loading ? "Submitting..." : "Submit for Approval"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
