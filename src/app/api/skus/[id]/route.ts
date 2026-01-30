import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import type { SKU } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = getStore();
  const sku = store.getSkuById(id);
  if (!sku) return NextResponse.json({ error: "SKU not found" }, { status: 404 });
  return NextResponse.json(sku);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const userId = request.headers.get("x-user-id") ?? "user-1";
    const store = getStore();
    const user = store.getUserById(userId);
    if (!user?.permissions.includes("update_sku")) {
      return NextResponse.json({ error: "Forbidden: Update SKU permission required" }, { status: 403 });
    }
    const sku = store.getSkuById(id);
    if (!sku) return NextResponse.json({ error: "SKU not found" }, { status: 404 });
    if (sku.status !== "approved" && sku.status !== "rejected") {
      return NextResponse.json({ error: "Only Approved or Rejected SKUs can be edited" }, { status: 400 });
    }
    const proposedChanges: Partial<SKU> = {};
    if (body.name != null) proposedChanges.name = String(body.name).trim();
    if (body.description != null) proposedChanges.description = String(body.description).trim();
    if (body.category != null) proposedChanges.category = String(body.category).trim();
    if (body.unitPrice != null) proposedChanges.unitPrice = Number(body.unitPrice);
    if (body.inventoryLevel != null) {
      const level = Number(body.inventoryLevel);
      if (level < 0) return NextResponse.json({ error: "Inventory level cannot be negative" }, { status: 400 });
      proposedChanges.inventoryLevel = level;
    }
    const now = new Date().toISOString();
    const reqId = `req-${Date.now()}`;
    store.addPendingRequest({
      id: reqId,
      skuId: sku.id,
      skuCode: sku.skuCode,
      skuName: sku.name,
      actionType: "update",
      requesterId: userId,
      requesterName: user.name,
      requestDate: now,
      summaryOfChanges: JSON.stringify(proposedChanges),
      skuSnapshot: { ...sku, ...proposedChanges },
      status: "pending",
    });
    store.updateSku(id, { status: "pending_approval", proposedChanges });
    const fieldChanges = Object.entries(proposedChanges).map(([field, after]) => ({
      field,
      before: (sku as unknown as Record<string, unknown>)[field],
      after,
    }));
    store.addAuditEntry({
      id: `audit-${Date.now()}`,
      skuId: sku.id,
      skuCode: sku.skuCode,
      action: "update",
      userId,
      userName: user.name,
      timestamp: now,
      fieldChanges,
    });
    const updated = store.getSkuById(id);
    return NextResponse.json({ sku: updated, message: "Changes submitted for approval" });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = (body.reason as string)?.trim();
    const userId = request.headers.get("x-user-id") ?? "user-1";
    const store = getStore();
    const user = store.getUserById(userId);
    if (!user?.permissions.includes("delete_sku")) {
      return NextResponse.json({ error: "Forbidden: Delete SKU permission required" }, { status: 403 });
    }
    const sku = store.getSkuById(id);
    if (!sku) return NextResponse.json({ error: "SKU not found" }, { status: 404 });
    if (!reason) return NextResponse.json({ error: "Deletion reason is required" }, { status: 400 });
    const now = new Date().toISOString();
    store.updateSku(id, { status: "pending_deletion", deletionReason: reason });
    const reqId = `req-${Date.now()}`;
    store.addPendingRequest({
      id: reqId,
      skuId: sku.id,
      skuCode: sku.skuCode,
      skuName: sku.name,
      actionType: "delete",
      requesterId: userId,
      requesterName: user.name,
      requestDate: now,
      deletionReason: reason,
      skuSnapshot: { ...sku },
      status: "pending",
    });
    store.addAuditEntry({
      id: `audit-${Date.now()}`,
      skuId: sku.id,
      skuCode: sku.skuCode,
      action: "delete",
      userId,
      userName: user.name,
      timestamp: now,
      comments: reason,
    });
    const updated = store.getSkuById(id);
    return NextResponse.json({ sku: updated, message: "Deletion request submitted for approval" });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
