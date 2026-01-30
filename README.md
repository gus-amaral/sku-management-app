# Network Provisioning SKU Manager

A full-stack SKU management application with role-based access, approval workflow, and audit history. Built to match the [v0 SKU Management Dashboard](https://v0-sku-management-dashboard.vercel.app/) UI and the provided user stories.

## Features

- **Epic 1 – SKU Management (CRUD)**
  - Add SKU (permission-gated, unique SKU code, status Pending Approval)
  - Edit SKU (Approved/Rejected only, submit for approval)
  - Delete SKU (reason required, Pending Deletion until approved)
  - View inventory with search, filter, sort, pagination, CSV export

- **Epic 2 – User Management & Permissions**
  - Admin: assign/revoke Create SKU, Update SKU, Delete SKU, View Inventory, Approve/Reject, Manage Users
  - My Permissions: view own permissions and help text

- **Epic 3 – Approval Workflow**
  - Pending Approvals dashboard (filter by action type, requester, date)
  - Approve with optional comments
  - Reject with required reason; requester can resubmit

- **Epic 4 – Email Notifications**
  - Stubs in place for “notify approvers” and “notify requester”; wire to your email provider in production

- **Epic 5 – Audit & History**
  - SKU change history (action, user, timestamp, field changes)
  - Export audit log to CSV

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- In-memory store (replace with DB for production)

## Prerequisites

- **Node.js 18+** and **npm** must be installed and on your PATH.
  - Download from [https://nodejs.org](https://nodejs.org) (LTS).
  - After installing, open a **new** Command Prompt or PowerShell and run:
    - `node -v` (should show e.g. v20.x)
    - `npm -v` (should show e.g. 10.x)

## Getting Started

1. **Install dependencies**

   ```bash
   cd sku-management-app
   npm install
   ```

   If install fails:
   - **"npm is not recognized"** → Node.js is not installed or not on your PATH. Install Node.js from nodejs.org and restart the terminal.
   - **ERESOLVE / peer dependency errors** → Try: `npm install --legacy-peer-deps`
   - **Network/timeout errors** → Check your connection or try: `npm install --prefer-offline --no-audit`

2. **Run the dev server**

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000).

4. **Demo login**  
   Choose a user: **John Doe (Admin)**, **Jane Approver**, or **Bob Manager** to see different permission sets.

## Demo Users

| User            | Role     | Permissions                                              |
|-----------------|----------|----------------------------------------------------------|
| John Doe        | Admin    | All (Create/Update/Delete SKU, View Inventory, Approve, Manage Users) |
| Jane Approver   | Approver | View Inventory, Approve/Reject                           |
| Bob Manager     | Manager  | Create SKU, Update SKU, View Inventory                   |

## Project Structure

```
src/
  app/           # Routes and API
    api/          # API routes (skus, users, pending, audit, categories)
    inventory/    # SKU inventory page
    pending/      # Pending approvals
    my-requests/  # Current user’s requests
    users/        # User management (admin)
    my-permissions/
    history/      # Audit / reports
  components/     # UI components and modals
  context/        # Auth context
  lib/            # Types, store, api client, notifications stub
```

## Production Notes

- Replace the in-memory store with a database (e.g. PostgreSQL) and use the existing API shape.
- Implement real email in `src/lib/notifications.ts` (e.g. SendGrid, Resend).
- Add proper authentication (e.g. NextAuth, Clerk) and use session/cookies instead of `x-user-id`.
- Enforce RBAC at the API layer (already gated by permissions in routes).
- Use HTTPS and secure cookies; consider 30-minute session timeout per requirements.

## License

MIT
