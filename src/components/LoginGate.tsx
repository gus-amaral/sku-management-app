"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function LoginGate({ children }: { children: React.ReactNode }) {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("sku-user-id") : null;
    if (stored) login(stored);
    setLoading(false);
  }, [login]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Sign in</h2>
          <p className="mb-4 text-sm text-muted-foreground">Select a user to continue (demo)</p>
          <div className="space-y-2">
            {["user-1", "user-2", "user-3"].map((id) => (
              <button
                key={id}
                type="button"
                className="w-full rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium hover:bg-accent"
                onClick={() => {
                  login(id);
                  if (typeof window !== "undefined") localStorage.setItem("sku-user-id", id);
                }}
              >
                {id === "user-1" ? "John Doe (Admin)" : id === "user-2" ? "Jane Approver" : "Bob Manager"}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
