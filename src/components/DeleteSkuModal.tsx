"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import type { SKU } from "@/lib/types";

interface DeleteSkuModalProps {
  sku: SKU;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteSkuModal({ sku, onClose, onSuccess }: DeleteSkuModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for deletion.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api(`/api/skus/${sku.id}`, {
        method: "DELETE",
        body: { reason: reason.trim() },
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit deletion request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-semibold text-destructive">Delete SKU</h2>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm">
              SKU <strong>{sku.skuCode}</strong> — {sku.name} will be marked as &quot;Pending Deletion&quot; until an approver confirms. Provide a reason for deletion.
            </p>
          </div>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium">Reason for deletion *</label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="e.g. Obsolete product, replaced by new SKU..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-50">
              {loading ? "Submitting..." : "Submit for Approval"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
