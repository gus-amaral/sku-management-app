"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Clock, Users, User, FileText, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "SKU Management", icon: Package, permission: "view_inventory" as const },
  { href: "/pending", label: "Pending Approvals", icon: Clock, permission: "approve_reject" as const },
  { href: "/my-requests", label: "My Requests", icon: FileText },
  { href: "/users", label: "User Management", icon: Users, permission: "manage_users" as const },
  { href: "/my-permissions", label: "My Permissions", icon: User },
  { href: "/history", label: "Reports & History", icon: Shield, permission: "view_inventory" as const },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, hasPermission } = useAuth();

  const visibleNav = nav.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-border bg-card text-card-foreground">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b border-border px-4">
          <span className="font-semibold">Network Provisioning</span>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <nav className="space-y-0.5 px-2">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        {user && (
          <div className="border-t border-border p-3">
            <p className="truncate text-xs font-medium text-muted-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") localStorage.removeItem("sku-user-id");
                window.location.reload();
              }}
              className="mt-2 text-xs text-muted-foreground underline hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
