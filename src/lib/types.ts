// Permission keys matching user stories
export type Permission =
  | "create_sku"
  | "update_sku"
  | "delete_sku"
  | "view_inventory"
  | "approve_reject"
  | "manage_users";

export type SKUStatus = "pending_approval" | "approved" | "rejected" | "pending_deletion" | "archived";

export type ActionType = "create" | "update" | "delete" | "approved" | "rejected";

export interface SKU {
  id: string;
  skuCode: string;
  name: string;
  description: string;
  category: string;
  unitPrice: number;
  inventoryLevel: number;
  status: SKUStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version?: number;
  // For pending updates: proposed changes
  proposedChanges?: Partial<SKU>;
  deletionReason?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  permissions: Permission[];
  optInNotifications?: boolean;
}

export interface PendingRequest {
  id: string;
  skuId: string;
  skuCode: string;
  skuName: string;
  actionType: ActionType;
  requesterId: string;
  requesterName: string;
  requestDate: string;
  summaryOfChanges?: string;
  deletionReason?: string;
  skuSnapshot: Partial<SKU>;
  status: "pending" | "approved" | "rejected";
}

export interface AuditEntry {
  id: string;
  skuId: string;
  skuCode: string;
  action: ActionType;
  userId: string;
  userName: string;
  timestamp: string;
  fieldChanges?: { field: string; before: unknown; after: unknown }[];
  comments?: string;
  rejectionReason?: string;
}

export interface PermissionChangeLog {
  id: string;
  adminId: string;
  adminName: string;
  targetUserId: string;
  targetUserName: string;
  permissionsBefore: Permission[];
  permissionsAfter: Permission[];
  timestamp: string;
}
