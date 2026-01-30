import type { SKU, User, PendingRequest, AuditEntry, PermissionChangeLog } from "./types";

// In-memory store (replace with DB in production)
let skus: SKU[] = [];
let users: User[] = [];
let pendingRequests: PendingRequest[] = [];
let auditLog: AuditEntry[] = [];
let permissionLog: PermissionChangeLog[] = [];

// Seed data
const CATEGORIES = [
  "Fiber Equipment",
  "Network Routers",
  "Network Switches",
  "Transceivers",
  "Cables",
  "Wireless Equipment",
  "Power Equipment",
  "Servers",
];

const SEED_SKUS: Omit<SKU, "id" | "createdAt" | "updatedAt" | "createdBy">[] = [
  { skuCode: "NET-FBR-001", name: "Fiber Optic Cable 100m", description: "Single-mode fiber", category: "Fiber Equipment", unitPrice: 299.99, inventoryLevel: 1250, status: "approved" },
  { skuCode: "NET-RTR-002", name: "Enterprise Router X500", description: "Enterprise grade", category: "Network Routers", unitPrice: 1499.99, inventoryLevel: 45, status: "approved" },
  { skuCode: "NET-SWT-003", name: "48-Port Managed Switch", description: "Layer 2 managed", category: "Network Switches", unitPrice: 799.99, inventoryLevel: 320, status: "pending_approval" },
  { skuCode: "NET-MOD-004", name: "SFP+ Transceiver Module", description: "10G SFP+", category: "Transceivers", unitPrice: 89.99, inventoryLevel: 2100, status: "approved" },
  { skuCode: "NET-CAB-005", name: "Cat6A Ethernet Cable 50m", description: "Shielded", category: "Cables", unitPrice: 49.99, inventoryLevel: 28, status: "rejected" },
  { skuCode: "NET-ANT-006", name: "5G Antenna Panel", description: "Outdoor panel", category: "Wireless Equipment", unitPrice: 2499.99, inventoryLevel: 85, status: "pending_deletion" },
  { skuCode: "NET-PWR-007", name: "PoE Injector 48V", description: "802.3at", category: "Power Equipment", unitPrice: 129.99, inventoryLevel: 560, status: "approved" },
  { skuCode: "NET-SRV-008", name: "Edge Server Node", description: "Edge compute", category: "Servers", unitPrice: 4999.99, inventoryLevel: 15, status: "pending_approval" },
  { skuCode: "NET-FBR-009", name: "Fiber Splice Closure", description: "Outdoor closure", category: "Fiber Equipment", unitPrice: 179.99, inventoryLevel: 890, status: "approved" },
  { skuCode: "NET-RTR-010", name: "Core Router Enterprise", description: "Core network", category: "Network Routers", unitPrice: 8999.99, inventoryLevel: 8, status: "approved" },
];

function initStore() {
  if (skus.length > 0) return;
  const now = new Date().toISOString();
  skus = SEED_SKUS.map((s, i) => ({
    ...s,
    id: `sku-${i + 1}`,
    createdAt: now,
    updatedAt: now,
    createdBy: "user-1",
  }));
  users = [
    { id: "user-1", email: "admin@example.com", name: "John Doe", permissions: ["create_sku", "update_sku", "delete_sku", "view_inventory", "approve_reject", "manage_users"], optInNotifications: true },
    { id: "user-2", email: "approver@example.com", name: "Jane Approver", permissions: ["view_inventory", "approve_reject"], optInNotifications: true },
    { id: "user-3", email: "manager@example.com", name: "Bob Manager", permissions: ["create_sku", "update_sku", "view_inventory"], optInNotifications: false },
  ];
}

export function getStore() {
  initStore();
  return {
    getSkus: () => [...skus],
    getSkuById: (id: string) => skus.find((s) => s.id === id),
    getSkuByCode: (code: string) => skus.find((s) => s.skuCode.toUpperCase() === code.toUpperCase()),
    addSku: (sku: SKU) => {
      skus.push(sku);
      return sku;
    },
    updateSku: (id: string, updates: Partial<SKU>) => {
      const i = skus.findIndex((s) => s.id === id);
      if (i === -1) return null;
      skus[i] = { ...skus[i], ...updates, updatedAt: new Date().toISOString() };
      return skus[i];
    },
    getUsers: () => [...users],
    getUserById: (id: string) => users.find((u) => u.id === id),
    updateUser: (id: string, updates: Partial<User>) => {
      const i = users.findIndex((u) => u.id === id);
      if (i === -1) return null;
      users[i] = { ...users[i], ...updates };
      return users[i];
    },
    getPendingRequests: () => [...pendingRequests],
    getPendingRequestById: (id: string) => pendingRequests.find((r) => r.id === id),
    addPendingRequest: (req: PendingRequest) => {
      pendingRequests.push(req);
      return req;
    },
    updatePendingRequest: (id: string, updates: Partial<PendingRequest>) => {
      const i = pendingRequests.findIndex((r) => r.id === id);
      if (i === -1) return null;
      pendingRequests[i] = { ...pendingRequests[i], ...updates };
      return pendingRequests[i];
    },
    removePendingRequest: (id: string) => {
      pendingRequests = pendingRequests.filter((r) => r.id !== id);
    },
    getAuditLog: (skuId?: string) => (skuId ? auditLog.filter((e) => e.skuId === skuId) : [...auditLog]),
    addAuditEntry: (entry: AuditEntry) => {
      auditLog.push(entry);
      return entry;
    },
    getPermissionLog: () => [...permissionLog],
    addPermissionLog: (entry: PermissionChangeLog) => {
      permissionLog.push(entry);
      return entry;
    },
    getCategories: () => CATEGORIES,
  };
}

export type Store = ReturnType<typeof getStore>;
