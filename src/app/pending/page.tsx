"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { PendingRequest } from "@/lib/types";
import { format } from "date-fns";

export default function PendingApprovalsPage() {
  const { hasPermission } = useAuth();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PendingRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approveComments, setApproveComments] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = () => {
    setLoading(true);
    api<{ requests: PendingRequest[] }>("/api/pending")
      .then((data) => setRequests(data.requests))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await api(`/api/pending/${selected.id}/approve`, { method: "POST", body: { comments: approveComments } });
      setSelected(null);
      setApproveComments("");
      load();
      setMessage({ type: "success", text: "Request approved." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to approve" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selected || !rejectReason.trim()) {
      setMessage({ type: "error", text: "Rejection reason is required." });
      return;
    }
    setActionLoading(true);
    try {
      await api(`/api/pending/${selected.id}/reject`, { method: "POST", body: { reason: rejectReason.trim() } });
      setSelected(null);
      setRejectReason("");
      load();
      setMessage({ type: "success", text: "Request rejected." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to reject" });
    } finally {
      setActionLoading(false);
    }
  };

  const canApprove = hasPermission("approve_reject");

  if (!canApprove) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold text-destructive">Access Denied</h2>
        <p className="mt-2 text-muted-foreground">You do not have permission to view pending approvals.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Pending Approvals</h1>
      {message && (
        <div
          className={`mb-4 rounded-md border p-3 ${message.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}
        >
          {message.text}
        </div>
      )}
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : requests.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          No pending requests.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">SKU Code</th>
                <th className="px-4 py-3 font-medium">SKU Name</th>
                <th className="px-4 py-3 font-medium">Action Type</th>
                <th className="px-4 py-3 font-medium">Requester</th>
                <th className="px-4 py-3 font-medium">Request Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{req.skuCode}</td>
                  <td className="px-4 py-3">{req.skuName}</td>
                  <td className="px-4 py-3 capitalize">{req.actionType}</td>
                  <td className="px-4 py-3">{req.requesterName}</td>
                  <td className="px-4 py-3">{format(new Date(req.requestDate), "PPp")}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(req)}
                      className="inline-flex items-center rounded border border-border px-2 py-1 text-xs font-medium hover:bg-accent"
                    >
                      <FileText className="mr-1 h-3 w-3" />
                      View / Act
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-lg">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-lg font-semibold">
                {selected.actionType.charAt(0).toUpperCase() + selected.actionType.slice(1)} — {selected.skuCode}
              </h2>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3 text-sm">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-muted-foreground">SKU Name</span>
                <span>{selected.skuName}</span>
                <span className="text-muted-foreground">Requester</span>
                <span>{selected.requesterName}</span>
                <span className="text-muted-foreground">Request Date</span>
                <span>{format(new Date(selected.requestDate), "PPp")}</span>
                {selected.summaryOfChanges && (
                  <>
                    <span className="text-muted-foreground">Summary</span>
                    <pre className="rounded bg-muted p-2 text-xs">{selected.summaryOfChanges}</pre>
                  </>
                )}
                {selected.deletionReason && (
                  <>
                    <span className="text-muted-foreground">Deletion reason</span>
                    <span>{selected.deletionReason}</span>
                  </>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Approval comments (optional)</label>
                <textarea
                  value={approveComments}
                  onChange={(e) => setApproveComments(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Optional comments..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Rejection reason (required to reject)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Required if rejecting..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border p-4">
              <button type="button" onClick={() => { setSelected(null); setRejectReason(""); setApproveComments(""); }} className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="inline-flex items-center rounded-md border border-destructive bg-background px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={actionLoading}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                <Check className="mr-2 h-4 w-4" />
                {actionLoading ? "..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
