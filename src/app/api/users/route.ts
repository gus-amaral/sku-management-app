import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function GET() {
  const store = getStore();
  const users = store.getUsers();
  return NextResponse.json({ users });
}
