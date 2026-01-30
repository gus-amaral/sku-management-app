import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const comments = (body.comments as string)?.trim() ?? "";
    const userId = request.headers.get("x-user-id") ?? "user-1";
    const store = getStore();
    const user = store.getUserById(userId);
    if (!user?.permissions.includes("approve_reject")) {
      return NextResponse.json({ error: "Forbidden: Approve/Reject permission required" }, { status: 403 });
    }
    const req = store.getPendingRequestById(id);
    if (!req) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (req.status !== "pending") return NextResponse.json({ error: "Request already processed" }, { status: 400 });
    const sku = store.getSkuById(req.skuId);
    if (!sku) return NextResponse.json({ error: "SKU not found" }, { status: 404 });
    const now = new Date().toISOString();
    if (req.actionType === "create") {
      store.updateSku(req.skuId, { status: "approved" });
    } else if (req.actionType === "update") {
      const snapshot = req.skuSnapshot;
      store.updateSku(req.skuId, {
        status: "approved",
        ...(snapshot && {
          name: snapshot.name ?? sku.name,
          description: snapshot.description ?? sku.description,
          category: snapshot.category ?? sku.category,
          unitPrice: snapshot.unitPrice ?? sku.unitPrice,
          inventoryLevel: snapshot.inventoryLevel ?? sku.inventoryLevel,
        }),
        proposedChanges: undefined,
      });
    } else if (req.actionType === "delete") {
      store.updateSku(req.skuId, { status: "archived" });
    }
    store.updatePendingRequest(id, { status: "approved" });
    store.addAuditEntry({
      id: `audit-${Date.now()}`,
      skuId: sku.id,
      skuCode: sku.skuCode,
      action: "approved",
      userId,
      userName: user.name,
      timestamp: now,
      comments,
    });
    return NextResponse.json({ message: "Request approved" });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
