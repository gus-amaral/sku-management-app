import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import type { SKU } from "@/lib/types";

export async function GET(request: NextRequest) {
  const store = getStore();
  const skus = store.getSkus();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const category = searchParams.get("category") ?? "";
  const status = searchParams.get("status") ?? "";
  const sort = searchParams.get("sort") ?? "updatedAt";
  const order = searchParams.get("order") ?? "desc";
  let filtered = skus.filter((s) => {
    if (search && !s.skuCode.toLowerCase().includes(search) && !s.name.toLowerCase().includes(search) && !s.category.toLowerCase().includes(search)) return false;
    if (category && s.category !== category) return false;
    if (status && s.status !== status) return false;
    return true;
  });
  filtered.sort((a, b) => {
    const aVal = (a as unknown as Record<string, unknown>)[sort];
    const bVal = (b as unknown as Record<string, unknown>)[sort];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return order === "asc" ? -1 : 1;
    if (bVal == null) return order === "asc" ? 1 : -1;
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
    return order === "asc" ? cmp : -cmp;
  });
  return NextResponse.json({ skus: filtered });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = request.headers.get("x-user-id") ?? "user-1";
    const store = getStore();
    const user = store.getUserById(userId);
    if (!user?.permissions.includes("create_sku")) {
      return NextResponse.json({ error: "Forbidden: Create SKU permission required" }, { status: 403 });
    }
    const skuCode = (body.skuCode as string)?.trim().toUpperCase();
    if (!skuCode || !body.name || body.unitPrice == null || body.inventoryLevel == null) {
      return NextResponse.json({ error: "Missing required fields: skuCode, name, unitPrice, inventoryLevel" }, { status: 400 });
    }
    if (store.getSkuByCode(skuCode)) {
      return NextResponse.json({ error: "SKU Code already exists" }, { status: 400 });
    }
    if (Number(body.inventoryLevel) < 0) {
      return NextResponse.json({ error: "Inventory level cannot be negative" }, { status: 400 });
    }
    const now = new Date().toISOString();
    const sku: SKU = {
      id: `sku-${Date.now()}`,
      skuCode,
      name: String(body.name).trim(),
      description: String(body.description ?? "").trim(),
      category: String(body.category ?? "").trim(),
      unitPrice: Number(body.unitPrice),
      inventoryLevel: Number(body.inventoryLevel),
      status: "pending_approval",
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
    };
    store.addSku(sku);
    const reqId = `req-${Date.now()}`;
    store.addPendingRequest({
      id: reqId,
      skuId: sku.id,
      skuCode: sku.skuCode,
      skuName: sku.name,
      actionType: "create",
      requesterId: userId,
      requesterName: user.name,
      requestDate: now,
      skuSnapshot: { ...sku },
      status: "pending",
    });
    store.addAuditEntry({
      id: `audit-${Date.now()}`,
      skuId: sku.id,
      skuCode: sku.skuCode,
      action: "create",
      userId,
      userName: user.name,
      timestamp: now,
    });
    return NextResponse.json({ sku, message: "SKU submitted for approval" });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
