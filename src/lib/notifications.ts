/**
 * Email notification stubs.
 * In production, wire these to your email provider (e.g. SendGrid, Resend, Nodemailer).
 * Acceptance: Email sent within 1 minute of triggering action.
 */

export type NotificationPayload = {
  toUserIds: string[];
  subject: string;
  body: string;
  actionType: "create" | "update" | "delete" | "approved" | "rejected";
  skuCode: string;
  requesterName?: string;
  approverName?: string;
  reason?: string;
};

export function notifyApprovers(payload: NotificationPayload) {
  if (typeof process !== "undefined") {
    console.log("[Email stub] To approvers:", payload.subject, payload.body);
  }
}

export function notifyRequester(payload: Omit<NotificationPayload, "toUserIds"> & { toUserId: string }) {
  if (typeof process !== "undefined") {
    console.log("[Email stub] To requester:", payload.subject, payload.body);
  }
}
