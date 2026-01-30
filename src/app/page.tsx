"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Clock, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<{ total: number; pending: number; approved: number } | null>(null);

  useEffect(() => {
    fetch("/api/skus")
      .then((r) => r.json())
      .then((data) => {
        const skus = data.skus ?? [];
        const total = skus.length;
        const pending = skus.filter((s: { status: string }) => s.status === "pending_approval" || s.status === "pending_deletion").length;
        const approved = skus.filter((s: { status: string }) => s.status === "approved").length;
        setStats({ total, pending, approved });
      })
      .catch(() => setStats({ total: 0, pending: 0, approved: 0 }));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-5 w-5" />
            <span className="text-sm font-medium">Total SKUs</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{stats?.total ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-5 w-5" />
            <span className="text-sm font-medium">Pending Approval</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{stats?.pending ?? "—"}</p>
          <Link href="/pending" className="mt-2 text-sm text-primary hover:underline">
            View pending
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm font-medium">Approved</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{stats?.approved ?? "—"}</p>
        </div>
      </div>
      <div className="mt-8">
        <Link
          href="/inventory"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Package className="mr-2 h-4 w-4" />
          SKU Inventory
        </Link>
      </div>
    </div>
  );
}
