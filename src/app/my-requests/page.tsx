"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import type { PendingRequest } from "@/lib/types";
import { format } from "date-fns";
import { api } from "@/lib/api";

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ requests: PendingRequest[] }>("/api/my-requests")
      .then((data) => setRequests(data.requests))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const statusLabel = (r: PendingRequest) => (r.status === "pending" ? "Pending" : r.status === "approved" ? "Approved" : "Rejected");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My Requests</h1>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : requests.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          You have no SKU requests.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">SKU Code</th>
                <th className="px-4 py-3 font-medium">SKU Name</th>
                <th className="px-4 py-3 font-medium">Action Type</th>
                <th className="px-4 py-3 font-medium">Request Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{req.skuCode}</td>
                  <td className="px-4 py-3">{req.skuName}</td>
                  <td className="px-4 py-3 capitalize">{req.actionType}</td>
                  <td className="px-4 py-3">{format(new Date(req.requestDate), "PPp")}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      req.status === "pending" ? "bg-amber-100 text-amber-800" :
                      req.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {statusLabel(req)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
