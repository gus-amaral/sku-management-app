import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function GET() {
  const store = getStore();
  const categories = store.getCategories();
  return NextResponse.json({ categories });
}
