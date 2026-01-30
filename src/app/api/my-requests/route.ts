import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id") ?? "";
  const store = getStore();
  const requests = store.getPendingRequests().filter((r) => r.requesterId === userId);
  return NextResponse.json({ requests });
}
