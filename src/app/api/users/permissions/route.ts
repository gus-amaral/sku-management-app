import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import type { Permission } from "@/lib/types";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const targetUserId = body.userId as string;
    const permissions = body.permissions as Permission[] | undefined;
    const adminId = request.headers.get("x-user-id") ?? "user-1";
    const store = getStore();
    const admin = store.getUserById(adminId);
    if (!admin?.permissions.includes("manage_users")) {
      return NextResponse.json({ error: "Forbidden: Manage Users permission required" }, { status: 403 });
    }
    const target = store.getUserById(targetUserId);
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const before = [...target.permissions];
    const after = permissions ?? before;
    store.updateUser(targetUserId, { permissions: after });
    store.addPermissionLog({
      id: `perm-${Date.now()}`,
      adminId,
      adminName: admin.name,
      targetUserId,
      targetUserName: target.name,
      permissionsBefore: before,
      permissionsAfter: after,
      timestamp: new Date().toISOString(),
    });
    const updated = store.getUserById(targetUserId);
    return NextResponse.json({ user: updated, message: "Permissions updated" });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
