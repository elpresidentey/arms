# ARMS Product Requirements Document — v2.0

**Product:** Automated Refuse Management System  
**Geography:** Oriade LCDA, Lagos (Amuwo Odofin)  
**Last updated:** June 2026  
**Status:** Pre-launch / Active development

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Goals](#2-goals)
3. [Users & Roles](#3-users--roles)
4. [Role Permission Matrix](#4-role-permission-matrix)
5. [Feature Specifications](#5-feature-specifications)
6. [Billing & Payments](#6-billing--payments)
7. [Wallet & Payouts](#7-wallet--payouts)
8. [Security Controls](#8-security-controls)
9. [Known Gaps & Open Issues](#9-known-gaps--open-issues)
10. [Architecture Stabilization Plan](#10-architecture-stabilization-plan)
11. [Roadmap](#11-roadmap)
12. [Deployment & Configuration](#12-deployment--configuration)

---

## 1. Problem Statement

### 1.1 Operational Problem

Residents in Oriade LCDA have no visibility into their waste collection schedule, no channel to report missed pickups, and no mechanism to pay bills digitally. Field teams operate without a coordination layer — route assignments, collection confirmations, and service requests are managed manually via phone and paper. There is no audit trail, no performance data, and no resident accountability for payment.

### 1.2 Architectural Problem

The codebase has grown feature-by-feature without domain boundaries, creating coupling between concerns that will become a maintenance and reliability liability. Specific technical risks:

- Frontend components mix data fetching, business logic, and rendering with no clear separation. A single change can break unrelated views.
- No event-driven layer: operations that should fire background tasks (payout approved → Paystack transfer, bill generated → email, collection confirmed → wallet credited) are handled synchronously in controllers, creating fragile chains.
- RBAC is partially implemented. Route guards and role checks exist, but fine-grained resource ownership checks — "can this user read this bill?" — are missing from service layers.
- Wallet balance is not a first-class entity. It is derived at query time from transaction history, creating risk of drift and no atomicity guarantees on concurrent writes.
- Webhook endpoints (Paystack) are exposed without signature verification, creating a spoofing vector.
- No structured observability. Errors surface via Sentry if configured, but there are no structured logs, no performance metrics, and no alerting thresholds.

Both problems are treated as equally real. Product launch does not wait for architectural resolution, but architectural work runs in parallel and is not deferred indefinitely.

---

## 2. Goals

### 2.1 Product Goals

| Metric | Target | Timeframe |
|---|---|---|
| Residents onboarded | 500 | Month 1 post-launch |
| Bills paid digitally | ≥ 60% of generated | Month 2 |
| Missed pickup reports resolved within 48 hours | ≥ 80% | Ongoing |
| Collection schedule visibility | 100% of active routes published | Launch |
| Recyclable payout processed within 5 days | ≥ 90% | Month 1 |

### 2.2 Engineering Goals

| Metric | Target | Timeframe |
|---|---|---|
| Backend build success rate (CI) | 100% | Now |
| TypeScript strict errors | 0 | Now |
| API p95 response time | < 300 ms | Phase 1 |
| Webhook signature verification | 100% of Paystack events | Phase 1 |
| Wallet balance consistency | Zero drift incidents | Phase 1 |
| RBAC resource-ownership checks | All billing and wallet endpoints | Phase 1 |
| Frontend bundle size | < 500 KB gzip | Phase 2 |
| Test coverage (critical paths) | ≥ 60% | Phase 2 |

---

## 3. Users & Roles

Eight roles are defined in the system. Each maps to a distinct user type and set of permissions.

| Role | Description | Entry Method |
|---|---|---|
| `resident` | Household account holder in Oriade LCDA | Self-register at `/resident/register` |
| `admin` | System-wide operator with full access | Invite-only via admin invite token |
| `supervisor` | Oversees field operations and staff | Invite-only |
| `ward_officer` | Manages a specific ward's service | Invite-only |
| `dispatcher` | Assigns and tracks truck routes | Invite-only |
| `finance_officer` | Manages billing, payouts, financial reports | Invite-only |
| `psp_operator` | Private sector waste collection operator | Invite-only |
| `recycler` | Recyclables collection agent | Invite-only |

Staff accounts (all non-resident roles) are created exclusively through the admin invite system. An existing admin issues a one-time, time-limited invite link. The invitee clicks the link and completes registration using that token. The token is validated before account creation and marked as used on success.

---

## 4. Role Permission Matrix

| Feature / Resource | resident | admin | supervisor | ward_officer | dispatcher | finance_officer | psp_operator | recycler |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| View own profile | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View own waste history | ✓ | — | — | — | — | — | — | — |
| Submit collection request | ✓ | — | — | — | — | — | — | — |
| View collection requests queue | — | ✓ | ✓ | ✓ | ✓ | — | — | — |
| Submit recyclable | ✓ | — | — | — | — | — | — | — |
| Process recyclable | — | ✓ | ✓ | — | — | — | — | ✓ |
| View wallet balance / history | ✓ | — | — | — | — | — | — | — |
| Request wallet withdrawal | ✓ | — | — | — | — | — | — | — |
| Approve withdrawal | — | ✓ | ✓ | — | — | ✓ | — | — |
| View own bills | ✓ | — | — | — | — | — | — | — |
| Pay bill (Paystack) | ✓ | — | — | — | — | — | — | — |
| Generate bills | — | ✓ | — | — | — | ✓ | — | — |
| View all bills | — | ✓ | — | — | — | ✓ | — | — |
| Apply late fees | — | ✓ | — | — | — | ✓ | — | — |
| Submit issue report | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| Resolve issue report | — | ✓ | ✓ | ✓ | — | — | — | — |
| View service schedules | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — |
| Manage service schedules | — | ✓ | ✓ | ✓ | — | — | — | — |
| View collection routes | — | ✓ | ✓ | ✓ | ✓ | — | ✓ | — |
| Manage collection routes | — | ✓ | ✓ | — | ✓ | — | — | — |
| Operations dashboard | — | ✓ | ✓ | ✓ | ✓ | — | ✓ | — |
| Finance dashboard | — | ✓ | ✓ | — | — | ✓ | — | — |
| Payout approvals | — | ✓ | ✓ | — | — | ✓ | — | — |
| Issue admin invites | — | ✓ | — | — | — | — | — | — |
| Revoke admin invites | — | ✓ | — | — | — | — | — | — |
| View audit log | — | ✓ | ✓ | — | — | — | — | — |
| Manage RBAC / permissions | — | ✓ | — | — | — | — | — | — |

---

## 5. Feature Specifications

### 5.1 Authentication & Onboarding

**Resident registration:**
- Fields: email, password, first name, last name, phone, house number, street, full address (with autocomplete), optional ward / service zone / property type / landmark / household size
- Password requirements: minimum 8 characters, at least one uppercase, one lowercase, one number
- Address autocomplete via Geoapify
- After registration: redirected to dashboard

**Admin / staff registration:**
- Invite-only: token required in URL query string (`?email=&token=`)
- Token validated against `admin_invites` table before Supabase account creation
- On success: token marked as used, account assigned role from invite record
- If no invite token is present on `/admin/register`: blocked with a clear message

**Login pages:**
- Separate entry points: `/resident/login` and `/admin/login`
- Workspace-aware: resident login rejects staff accounts, admin login rejects resident accounts with a clear error message
- `/login` and `/register` redirect to their resident equivalents for backwards compatibility
- The login and register forms are full-page layouts — not modals. They must not render over or block any other page content. There is no floating modal on login or signup; the forms are standalone pages.

**Post-login redirect:**
- Honors `?redirect=` query param if the target path is within `/app` and accessible to the user's role
- Falls back to `/app` (dashboard)

**Selector inputs (e.g., Bin Collection type, property type):**
- All `<select>` and option labels must use Title Case (e.g., "Bin Collection", not "bin collection" or "BIN COLLECTION")

### 5.2 Dashboard

The `/app` route renders the dashboard for all authenticated roles. Content is role-aware:

- **Residents** see: waste collection timeline, upcoming schedule, bill status, wallet balance, recyclable summary, recent reports
- **Staff** see: operations summary (pending requests, open complaints, route readiness), relevant queues based on their role

Dashboard must not render a blocking modal on first load. The WelcomeModal component exists in the codebase but is intentionally disabled. It must remain disabled. If an onboarding checklist is re-introduced, it must render inline within the page layout, not as a screen-blocking overlay.

### 5.3 Waste Collection

- Residents view a personal waste timeline of scheduled and completed collections
- Each collection entry shows: date, status (scheduled / in progress / completed / missed / verified), truck code, address
- Residents can request future pickups via the collection request form
- Request types: `Routine`, `Urgent`, `Bulky`, `Special` (Title Case in UI)
- Staff can view and manage the collection requests queue at `/app/collection-requests-queue`

### 5.4 Collection Routes & Schedules

- Routes have: code, name, ward, street, frequency (Daily / Weekly / Biweekly / Monthly), service day, time window, next collection date, truck code, PSP operator, status
- Service schedules: published by admins or supervisors, visible to residents as read-only
- Route status values in UI: `Active`, `Disrupted`, `Inactive` (Title Case)
- Schedule status values: `Draft`, `Published`, `Archived`, `Suspended`

### 5.5 Recyclables

- Residents log recyclable items: type (Plastic Bottles, Glass Bottles, Aluminum Cans, Cardboard, Paper, Metal Scraps, Electronics, Other), quantity, unit, photo upload, optional coordinates
- Logged items move through: `Logged` → `Pickup Requested` → `Collected` → `Processed` → `Paid`
- On `Paid`: a credit transaction is written to the resident's wallet
- Recyclers can update recyclable status through the operations view

### 5.6 Issue Reports

- Report types: `Missed Pickup`, `Illegal Dumping`, `Damaged Bins`, `Truck Issue`, `Other`
- Fields: title, description, address, ward, street, optional photo URLs, optional coordinates
- Status lifecycle: `Submitted` → `Under Review` → `In Progress` → `Resolved` → `Closed`
- Priority levels: `Low`, `Medium`, `High`, `Urgent`
- Staff can assign reports, add resolution notes, and upload evidence photos

### 5.7 Service Requests

- Types: `Bin Replacement`, `New Bin`, `Bulky Pickup`, `Missed Pickup Follow-Up`, `Service Transfer`, `Property Onboarding`
- Status: `Submitted` → `Triaged` → `Scheduled` → `In Progress` → `Completed` / `Cancelled` / `Escalated`
- SLA due date tracked per request
- Staff assign requests, schedule them, and mark completion with resolution notes

### 5.8 Locations

- Residents can view nearby bin locations and collection points on a map
- POI data sourced from Geoapify
- Curated collection points can be added by admins

### 5.9 Operations Dashboard

Staff roles access `/app/operations` which shows:
- Fleet summary: total trucks, deployed today, idle, unassigned routes
- Route readiness: active routes, due today, ready today, missing truck assignments, disrupted routes, readiness percentage
- Queues: pending collections, open service requests, open complaints, urgent items
- Truck deployments: per-truck breakdown of routes, due today, next route
- Attention items: unassigned routes, disrupted routes

### 5.10 Notifications

- Real-time notifications delivered via WebSocket (Socket.IO)
- Notification events: new bill generated, payment confirmed, collection status change, report status change, wallet credit, withdrawal status change
- Notifications stored in DB and retrievable via API for offline/missed events

---

## 6. Billing & Payments

### 6.1 Billing Rates

| Property Type | Monthly Rate |
|---|---|
| Residential | ₦2,000 |
| Commercial | ₦3,500 |

**Late fee:** 10% of base amount, applied automatically after the 7-day grace period post due date.  
**Due date:** 7 days after the billing period end date.

### 6.2 Bill Lifecycle

```
Generated → Pending → [grace period expires] → Overdue → Paid
                                                        ↘ Cancelled (admin only)
```

Bill numbers follow the format: `BILL-YYYY-MM-NNNN`

### 6.3 Admin Billing Actions

- `POST /billing/generate` — generates bills for all active users for the current or specified period
- `POST /billing/apply-late-fees` — runs the overdue check and applies the 10% penalty
- `GET /billing` — view all bills with filters
- `GET /billing/stats` — revenue statistics

### 6.4 Resident Payment Flow

1. Resident opens `/app/bills` and selects a pending or overdue bill
2. Calls `POST /billing/:id/pay` → backend creates a Paystack transaction, returns a payment URL
3. Resident is redirected to Paystack hosted page
4. Paystack sends a webhook event on payment completion
5. Backend verifies the Paystack event signature, updates bill status to `paid`, sets `paidAt` and `paymentReference`
6. Resident is redirected to `/app/payment/verify?reference=...` which shows the confirmation
7. Receipt available at `/app/bills/:billId/receipt`

### 6.5 Paystack Webhook Requirements (P0 Gap)

Webhook handler at `POST /paystack/webhook` must:
- Verify `x-paystack-signature` HMAC-SHA512 against `PAYSTACK_SECRET_KEY`
- Reject any event that fails verification with HTTP 400
- Idempotently handle duplicate `charge.success` events (check `paymentReference` uniqueness before updating bill)
- Return HTTP 200 immediately on success

---

## 7. Wallet & Payouts

### 7.1 Wallet Model

The wallet is a virtual balance per user, derived from `wallet_transactions`. Transactions have:

- `type`: `credit` or `debit`
- `source`: `recyclables` | `reward_points` | `withdrawal` | `bonus` | `penalty`
- `status`: `pending` | `approved` | `completed` | `rejected` | `failed`
- `balanceAfter`: the user's running balance at the time of the transaction

### 7.2 Wallet Limits

| Limit | Value |
|---|---|
| Minimum withdrawal | ₦500 |
| Maximum single withdrawal | ₦50,000 |
| Daily withdrawal cap | ₦100,000 |

### 7.3 Withdrawal Flow

1. Resident enters amount, bank code, account number on `/app/wallet`
2. Backend resolves account name via Paystack account verification
3. Resident confirms and submits
4. A `wallet_transaction` record is created with `status: pending` and `type: debit`
5. The wallet balance is not debited until the withdrawal is approved
6. An approver (admin / supervisor / finance_officer) views `/app/withdrawal-approvals`
7. On approval: Paystack Transfer API is called; on transfer initiation, balance is debited and status set to `processing`
8. Paystack sends a `transfer.success` or `transfer.failed` webhook
9. Backend verifies signature, updates transaction status to `completed` or `failed`
10. On failure: the debit is reversed (new credit transaction) and the user is notified

### 7.4 Wallet Integrity Requirements (P0 Gap)

- Balance updates on concurrent withdrawal requests must use database transactions with row-level locking to prevent double-spend
- `balanceAfter` on each transaction must be verifiable: `previous_balanceAfter + amount (signed) = this_balanceAfter`
- A balance reconciliation endpoint (`GET /wallet/balance/verify`) must be available to admins to detect drift

---

## 8. Security Controls

### 8.1 Current Controls (Implemented)

| Control | Implementation |
|---|---|
| Authentication | Supabase Auth (JWT) + backend JWT validation |
| Password hashing | bcrypt |
| Password policy | min 8 chars, uppercase + lowercase + number required |
| Route protection | JWT guard on all `/app` routes |
| Role-based routing | `RoleGuard` component and `canAccess()` on frontend; `RolesGuard` + `@Roles()` decorator on backend |
| Admin invite system | One-time tokens with expiry, invite-only staff creation |
| Rate limiting | 100 req/15 min global; 5 req/15 min on auth endpoints (express-rate-limit + ThrottlerModule) |
| Input validation | class-validator DTOs, whitelist mode, `forbidNonWhitelisted: true` |
| SQL injection prevention | TypeORM parameterized queries |
| Security headers | Helmet.js (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, etc.) |
| CORS | Origin whitelist; Vercel preview domains allowed via regex |
| Security logging | Custom middleware logging suspicious patterns (path traversal, SQLi, XSS attempts) |
| Error monitoring | Sentry (opt-in via `SENTRY_DSN` env var) |
| Secret management | All secrets via env vars, never committed |

### 8.2 Stabilization-Phase Security Targets

| Gap | Target State | Priority |
|---|---|---|
| Paystack webhook signature verification | Implemented, blocking invalid events | P0 |
| Wallet balance atomicity | DB transactions + row locks on all balance mutations | P0 |
| Resource-ownership checks in service layer | Every billing and wallet endpoint verifies the requesting user owns the resource | P0 |
| Audit log for sensitive actions (payout approved, bill generated, invite issued) | Structured log entries with actor, action, resource ID, timestamp | P1 |
| RBAC hardening: fine-grained per-resource access | Service-layer ownership checks on bills, reports, collection requests | P1 |
| Dependency pinning | Lock all production dependencies to exact versions | P1 |

---

## 9. Known Gaps & Open Issues

| # | Area | Gap | Severity | Phase |
|---|---|---|---|---|
| 1 | Payments | Paystack webhook not verifying HMAC signature | P0 | Pre-launch |
| 2 | Wallet | No DB-transaction-level lock on concurrent withdrawal approval | P0 | Pre-launch |
| 3 | RBAC | Service layer lacks resource-ownership checks (e.g., user A can request bill for user B) | P0 | Phase 1 |
| 4 | Billing | Bill generation and late fee application have no idempotency guard (duplicate runs create duplicate bills) | P0 | Pre-launch |
| 5 | Auth | `WelcomeModal` was showing as a full-screen blocking overlay on login/signup pages — disabled but root cause (portal rendering outside layout) not fixed | P1 | Phase 1 |
| 6 | UI | Several `<select>` option labels use lowercase strings instead of Title Case (e.g., bin collection type, property type selectors) | P1 | Pre-launch |
| 7 | Events | Payout approval triggers Paystack transfer synchronously in controller; should be queued via BullMQ to handle retries and failures | P1 | Phase 2 |
| 8 | Frontend | No design system or shared component library; UI inconsistencies accumulate with each feature addition | P1 | Phase 2 |
| 9 | Frontend | Pages directly call API services with no caching layer; identical requests fire redundantly across components | P1 | Phase 2 |
| 10 | Backend | Modules have no domain boundary enforcement; any module can import any other, creating hidden coupling | P2 | Phase 2 |
| 11 | Database | No migration versioning system; schema changes applied manually via SQL scripts with no rollback path | P2 | Phase 2 |
| 12 | Observability | No structured logs or metrics. Sentry catches exceptions but there's no latency tracking, queue depth monitoring, or alerting | P2 | Phase 2 |
| 13 | Redis | Imported as a dependency; not actively used. Intended for BullMQ queues in Phase 2 — no jobs should be queued against it until then | P2 | Phase 2 |

---

## 10. Architecture Stabilization Plan

This section runs in parallel to the product roadmap. It does not gate launch but must be completed before Phase 2 feature work begins.

### 10.1 Frontend Restructuring

**Current state:** Components mix API calls, business logic, and rendering. Large pages (Dashboard, Operations, Wallet) have grown to 400–800 lines with no internal separation.

**Target state:**
```
pages/         → route-level components only (thin, mostly layout)
features/      → domain modules (billing/, wallet/, collection/, etc.)
  components/  → feature-specific components
  hooks/       → data-fetching hooks (React Query)
  utils/       → pure functions
components/    → shared design system primitives
services/      → API client (no business logic)
```

**Immediate actions:**
- Install React Query (`@tanstack/react-query`) as the data-fetching layer
- Extract all `useEffect`/`fetch` patterns into domain hooks
- Create a shared `<Select>` component that enforces Title Case option rendering
- Ensure no modal renders outside the component tree of its triggering page (fix the WelcomeModal portal pattern if re-enabled)

### 10.2 Domain Isolation (Backend)

**Current state:** All modules are co-equal in `app.module.ts`. `BillingModule` imports `WalletModule` imports `UsersModule` — no clear dependency direction.

**Target state:** Enforce a layered dependency graph:
```
infrastructure/ (TypeORM, Paystack client, Supabase client)
    ↑
domain/         (Users, Wallet, Billing, Collection — pure business logic, no HTTP)
    ↑
application/    (NestJS modules, controllers, DTOs — orchestration only)
```

No module in the `domain` layer may import from `application`. Controllers may not contain business logic.

### 10.3 Event-Driven Architecture (Phase 2)

**Current state:** Side effects (send email on bill generated, credit wallet on recyclable paid, transfer on withdrawal approved) are triggered synchronously in controller methods. A failure in any side effect fails the entire request.

**Target state:** BullMQ (backed by Redis) processes all side effects as background jobs:

| Event | Queue | Handler |
|---|---|---|
| Bill generated | `billing.notifications` | Send email to resident |
| Bill overdue | `billing.late-fees` | Apply late fee, send reminder |
| Recyclable paid | `wallet.credit` | Credit wallet transaction |
| Withdrawal approved | `payouts.transfer` | Initiate Paystack transfer, retry on failure |
| Transfer failed | `payouts.reversal` | Create credit reversal, notify user |
| Collection completed | `collection.confirmation` | Update status, trigger any route metrics |

Redis is already installed as a dependency. It must not be used for any live job queue until BullMQ integration is complete and tested.

### 10.4 Database Governance

**Current state:** Schema changes are applied via hand-written SQL files in `/backend/sql/`. No versioning, no rollback scripts, no migration runner beyond `TypeORM synchronize` (disabled in production).

**Target state:**
- Adopt TypeORM migrations (`typeorm migration:generate`, `migration:run`)
- All schema changes go through a migration file with a corresponding `down()` method
- CI runs `migration:run` before deploying to staging
- `DB_SYNC=false` is enforced in all environments (already done)
- No manual SQL changes to production schema without a corresponding migration file

### 10.5 RBAC Hardening

**Current state:** Frontend `RoleGuard` blocks unauthorized route access. Backend `@Roles()` guard checks the role on the token. Neither checks resource ownership.

**Target gaps to close:**
- `GET /billing/:id` → verify `bill.userId === req.user.id` unless requester is admin/finance_officer
- `POST /billing/:id/pay` → same ownership check
- `GET /wallet/transactions` → always scoped to `req.user.id`, not queryable by other users
- `PATCH /payouts/:id/approve` → verify approver has `withdrawal-approver` role AND payout is in `pending` status
- All ownership checks live in the service layer, not the controller

### 10.6 Wallet Integrity

**Current state:** Balance is computed by summing all transactions for a user at query time. No lock mechanism on concurrent writes.

**Target state:**
- Introduce a `wallets` table with a `balance` column (single source of truth)
- All balance mutations use `UPDATE wallets SET balance = balance - :amount WHERE user_id = :userId AND balance >= :amount` in a database transaction
- `wallet_transactions.balanceAfter` is written atomically in the same transaction
- A nightly reconciliation job compares `wallets.balance` against the sum of `wallet_transactions` and alerts on any mismatch
- `GET /wallet/balance` reads from `wallets.balance`, not a computed sum

### 10.7 Webhook Hardening

Both Paystack webhooks (bill payment and wallet transfer) must implement:

```typescript
const hash = crypto
  .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
  .update(JSON.stringify(req.body))
  .digest('hex')

if (hash !== req.headers['x-paystack-signature']) {
  throw new UnauthorizedException('Invalid webhook signature')
}
```

All webhook handlers must also:
- Be idempotent: check if the reference has already been processed before making state changes
- Return HTTP 200 before performing side effects to prevent Paystack retry storms
- Log every received event with event type, reference, and processing result

### 10.8 Observability & DevOps Targets

| Target | Tool / Approach |
|---|---|
| Structured request logs | Pino or Winston with JSON output, log level from env |
| API latency tracking | Prometheus histogram or Datadog APM |
| Background job monitoring | BullMQ board (Phase 2) |
| Uptime monitoring | Render/Railway built-in health checks + external ping (e.g., Better Uptime) |
| Error alerting | Sentry (already available) with alert rules for error spikes |
| Deployment pipeline | GitHub Actions: lint → test → build → deploy to staging → manual promote to production |

---

## 11. Roadmap

### Pre-Launch (Current Sprint)

| Task | Owner | Status |
|---|---|---|
| Fix Paystack webhook signature verification | Backend | 🔴 Open |
| Add idempotency guard to bill generation | Backend | 🔴 Open |
| Fix Title Case on all UI selectors | Frontend | 🔴 Open |
| Ensure Login/Register are standalone pages (no blocking modal) | Frontend | ✅ Done (WelcomeModal disabled) |
| Push codebase to GitHub | DevOps | 🟡 Ready |
| Deploy frontend to Vercel | DevOps | 🟡 Staged |
| Deploy backend to Render | DevOps | 🟡 Staged |
| Wire production env vars (DATABASE_URL, PAYSTACK keys, JWT_SECRET) | DevOps | 🟡 Pending |

### Phase 1 — Operational Stability (Weeks 1–4 post-launch)

- RBAC resource-ownership checks on billing and wallet endpoints
- Wallet balance atomicity (introduce `wallets` table, locking writes)
- Wallet transfer failure reversal flow
- Payout approval end-to-end with Paystack Transfer API
- Admin audit log (structured log entries for sensitive actions)
- TypeORM migration system adopted for all future schema changes
- Automated health check endpoint with DB connectivity check

### v1.0 — First Public Release

- 500 resident target onboarded
- Bill generation and payment flow live
- Recyclable submission and payout live
- Operations dashboard usable by field staff
- Monitoring and alerting in place

### Phase 2 — Architecture & Scale (Months 2–4)

- BullMQ integration: all side effects moved to background queues
- Redis active as job broker
- Frontend restructure: React Query + feature-based folder structure
- Shared design system: `<Select>`, `<Modal>`, `<DataTable>` primitives
- TypeScript strict mode clean-up (no implicit any)
- Database migration CI integration
- Frontend bundle optimization (code splitting by route)
- Test coverage for critical paths (auth, billing, wallet)

### Phase 3 — Intelligence & Growth (Month 5+)

- Collection route optimization based on GPS data
- Resident engagement scoring and incentives
- Bulk SMS notifications for collection reminders
- Multi-LCDA expansion readiness (multi-tenant schema)
- Mobile app (React Native, shared API)
- Paystack Recurring Charge for automatic bill payment

---

## 12. Deployment & Configuration

### Active Deployment Stack

| Layer | Platform | Config File |
|---|---|---|
| Frontend | Vercel | Vercel project dashboard |
| Backend | Render | `backend/render.yaml` |
| Database | Supabase (PostgreSQL) | `DATABASE_URL` env var |
| Cache / Queues | Redis (Phase 2) | `REDIS_URL` env var |
| File Storage | Supabase Storage | `SUPABASE_URL` + `SUPABASE_ANON_KEY` |
| Payments | Paystack | `PAYSTACK_SECRET_KEY` + `PAYSTACK_PUBLIC_KEY` |

### Required Environment Variables

**Backend (`backend/.env`):**
```
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgres://user:pass@host:5432/dbname
DB_SSL=true

# Auth
JWT_SECRET=<min 32 random chars>
JWT_EXPIRATION=7d
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key>

# Frontend
FRONTEND_URL=https://your-frontend.vercel.app
ALLOWED_ORIGINS=https://your-frontend.vercel.app

# Payments
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...

# Email (optional)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=ARMS <notifications@yourdomain.com>

# Monitoring (optional)
SENTRY_DSN=https://...@sentry.io/...

# Redis (Phase 2 only)
REDIS_URL=redis://...
```

**Frontend (Vercel environment variables):**
```
VITE_API_URL=https://your-backend.onrender.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
VITE_PAYSTACK_PUBLIC_KEY=pk_live_...
VITE_ENABLE_ADMIN_SIGNUP=false
```

### Local Development

```bash
# Install all dependencies
npm run install:all   # from root, or:
cd backend && npm install
cd frontend && npm install

# Start backend (port 3001)
cd backend && npm run start:dev

# Start frontend (port 3000 / 5173)
cd frontend && npm run dev

# Or run full stack with Docker
docker-compose up
```

### Database Setup

All schema migrations are in `/backend/sql/`. Apply in order:

```bash
# Apply a specific migration
cd backend && node scripts/apply-sql.js sql/<migration-file>.sql

# Or apply all pending (requires apply-sql.js to support ordering)
cd backend && npm run apply:sql
```

After Phase 2 migration system adoption, use:
```bash
npm run typeorm migration:run
```

---

*ARMS PRD v2.0 — merged from codebase-grounded v1.0 and architecture stabilization doc.*  
*All feature specs reflect the current state of `/backend/src` and `/frontend/src` as of June 2026.*
