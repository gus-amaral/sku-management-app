"use client";

import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <h1 className="text-lg font-semibold">SKU Manager</h1>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        {user && (
          <span className="text-sm text-muted-foreground">
            {user.name} <span className="text-muted-foreground/80">({user.permissions.includes("manage_users") ? "Administrator" : "User"})</span>
          </span>
        )}
      </div>
    </header>
  );
}
