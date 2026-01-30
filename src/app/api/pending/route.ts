import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function GET() {
  const store = getStore();
  const requests = store.getPendingRequests().filter((r) => r.status === "pending");
  return NextResponse.json({ requests });
}
