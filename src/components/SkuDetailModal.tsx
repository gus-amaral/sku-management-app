"use client";

import { X } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import type { SKU } from "@/lib/types";
import { format } from "date-fns";

interface SkuDetailModalProps {
  sku: SKU;
  onClose: () => void;
}

export function SkuDetailModal({ sku, onClose }: SkuDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-semibold">SKU Details — {sku.skuCode}</h2>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="text-muted-foreground">Name</span>
            <span>{sku.name}</span>
            <span className="text-muted-foreground">Description</span>
            <span>{sku.description || "—"}</span>
            <span className="text-muted-foreground">Category</span>
            <span>{sku.category}</span>
            <span className="text-muted-foreground">Unit Price</span>
            <span>${sku.unitPrice.toFixed(2)}</span>
            <span className="text-muted-foreground">Inventory Level</span>
            <span>{sku.inventoryLevel.toLocaleString()}</span>
            <span className="text-muted-foreground">Status</span>
            <StatusBadge status={sku.status} />
            <span className="text-muted-foreground">Last Updated</span>
            <span>{format(new Date(sku.updatedAt), "PPp")}</span>
          </div>
        </div>
        <div className="border-t border-border px-4 py-3">
          <button type="button" onClick={onClose} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
