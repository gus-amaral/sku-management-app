import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function GET(request: NextRequest) {
  const store = getStore();
  const { searchParams } = new URL(request.url);
  const skuId = searchParams.get("skuId") ?? undefined;
  const entries = store.getAuditLog(skuId);
  return NextResponse.json({ entries });
}
