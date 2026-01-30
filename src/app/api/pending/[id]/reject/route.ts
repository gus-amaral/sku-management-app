import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const reason = (body.reason as string)?.trim();
    if (!reason) return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
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
      store.updateSku(req.skuId, { status: "rejected" });
    } else if (req.actionType === "update") {
      store.updateSku(req.skuId, { status: "rejected", proposedChanges: undefined });
    } else if (req.actionType === "delete") {
      store.updateSku(req.skuId, { status: "approved", deletionReason: undefined });
    }
    store.updatePendingRequest(id, { status: "rejected" });
    store.addAuditEntry({
      id: `audit-${Date.now()}`,
      skuId: sku.id,
      skuCode: sku.skuCode,
      action: "rejected",
      userId,
      userName: user.name,
      timestamp: now,
      rejectionReason: reason,
    });
    return NextResponse.json({ message: "Request rejected" });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
