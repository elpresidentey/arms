# ARMS PRD v2.0 - Product Requirements Document

**Product:** Automated Refuse Management System (ARMS)  
**Version:** 2.0  
**Date:** June 6, 2026  
**Status:** Pre-Launch & Architecture Stabilization  

---

## 1. Executive Summary

ARMS is a comprehensive waste management platform serving Oriade LCDA residents and municipal operations staff. This PRD merges MVP feature specifications with critical architecture stabilization work required for production readiness.

**Target Users:**
- **Primary:** 1,000+ Oriade LCDA residents
- **Secondary:** 20+ municipal staff (admin, supervisors, ward officers, finance officers, dispatchers)
- **Tertiary:** PSP operators and recyclers

**Core Value Propositions:**
- **For Residents:** Transparent waste service visibility, online bill payments, recyclables monetization
- **For Staff:** Centralized operations control, automated billing, complaint resolution system

---

## 2. Problem Statement

### 2.1 Operational Problem (MVP)
- **Service Opacity:** Residents lack visibility into collection schedules, billing status, and service issues
- **Payment Friction:** Manual bill payments create delays and administrative overhead
- **Complaint Handling:** No systematic approach to service issue resolution and tracking
- **Recycling Underutilization:** Limited resident engagement with recycling programs

### 2.2 Architectural Problem (Post-MVP)
- **Frontend Coupling:** Components tightly coupled, hindering feature development and maintenance
- **Missing RBAC:** Role-based access control gaps create security and operational risks
- **Event Architecture:** Lack of event-driven patterns limits real-time capabilities and audit trails
- **Data Integrity:** Wallet and billing systems lack proper validation and audit controls
- **Webhook Reliability:** Payment and external service integrations lack proper validation

---

## 3. Goals & Success Metrics

### 3.1 Product Metrics (MVP Launch)

| Metric | Baseline | 3-Month Target | 6-Month Target |
|--------|----------|----------------|----------------|
| Resident Registration | 0 | 300 users | 800 users |
| Monthly Bill Payments | 0% online | 40% online | 70% online |
| Collection Request Resolution | Manual | 80% within 48h | 90% within 24h |
| Service Issue Resolution Time | 5-7 days | 3 days | 24 hours |
| Recyclables Submissions | 0 | 50/month | 200/month |
| System Uptime | N/A | 99.5% | 99.9% |

### 3.2 Engineering Metrics (Architecture Stabilization)

| Metric | Current State | Phase 1 Target | Phase 2 Target |
|--------|---------------|----------------|----------------|
| Frontend Bundle Size | ~2MB | <1.5MB | <1MB |
| API Response Time (p95) | ~500ms | <200ms | <100ms |
| Test Coverage | 15% | 70% | 85% |
| Security Audit Score | Basic | B+ | A- |
| Database Query Performance | Ad-hoc | Indexed | Optimized |
| Error Rate | Unknown | <1% | <0.1% |

---

## 4. User Personas & Roles

### 4.1 Primary Users

**Resident (Sarah, 32)**
- Homeowner in Festac Town ward
- Busy professional, values convenience
- Wants bill payment visibility and collection tracking
- Interested in recycling rewards

**Municipal Admin (James, 45)**  
- Operations manager for waste collection
- Needs oversight of routes, billing, and complaints
- Manages 5+ staff members
- Reports to LCDA leadership

### 4.2 Role Matrix & Permissions

| Feature | Resident | PSP Operator | Ward Officer | Supervisor | Finance Officer | Admin |
|---------|----------|--------------|--------------|------------|-----------------|--------|
| Dashboard Access | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Waste Collection Tracking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bill Management | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Payment Processing | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Wallet & Withdrawals | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Recyclables Management | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Issue Reporting | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Service Requests | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Operations Dashboard | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Route Management | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Staff Management | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Financial Reports | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| System Configuration | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Audit Log** | ❌ | ❌ | Read | Read | Read | Full |
| **RBAC/Permissions** | ❌ | ❌ | ❌ | Read | Read | Full |

---

## 5. Core Features

### 5.1 Resident Features

**Dashboard & Timeline**
- Personal waste collection calendar
- Real-time collection status updates
- Service history and statistics
- Quick actions for common tasks

**Bill Management**
- Monthly waste service bills (₦2,000 residential, ₦3,500 commercial)
- Secure online payment via Paystack
- Payment history and receipts
- Late fee notifications (10% after 7-day grace period)

**Collection Services**
- Schedule special collections (bulky waste, urgent pickup)
- Track collection request status
- Receive pickup notifications
- Rate and review service quality

**Recyclables Program**
- Log recyclable items with photos
- Request recyclables pickup
- Track recycling contributions
- Earn wallet credits for verified recyclables

**Issue Reporting**
- Report missed pickups with photos/location
- Submit service complaints
- Track resolution progress
- Receive status updates

**Wallet System**
- View recycling earnings balance
- Transaction history
- Request payout to bank account
- Withdrawal status tracking

### 5.2 Staff Features

**Operations Dashboard**
- Live collection route status
- Service request queue management
- Complaint resolution workflow
- Performance metrics and KPIs

**Route Management**
- Collection schedule oversight
- Truck assignment and tracking
- Route optimization recommendations
- Service disruption management

**Billing Administration** *(Finance Officer/Admin)*
- Monthly bill generation
- Payment tracking and reconciliation
- Late fee application
- Revenue reporting

**Complaint Resolution**
- Service issue triage and assignment
- Resolution workflow management
- Resident communication tools
- Performance tracking

**Financial Management** *(Finance Officer/Admin)*
- Wallet withdrawal approvals
- Payout processing
- Financial reporting
- Revenue analytics

---

## 6. Technical Architecture

### 6.1 Current Stack
- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** NestJS + TypeScript + PostgreSQL
- **Real-time:** WebSocket connections via Socket.IO
- **Payments:** Paystack integration
- **Storage:** Supabase (images, files)
- **Auth:** Supabase Auth + JWT
- **Hosting:** Render (backend), Vercel (frontend)

### 6.2 Data Models

**User Entity:**
```typescript
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  address: string
  ward?: string
  houseNumber?: string
  street: string
  role: 'resident' | 'psp_operator' | 'recycler' | 'admin' | 
        'ward_officer' | 'supervisor' | 'dispatcher' | 'finance_officer'
  latitude?: number
  longitude?: number
  isActive: boolean
  bankDetails?: BankInfo
  createdAt: string
  updatedAt: string
}
```

**Billing System:**
- Monthly bills with automated generation
- Property type-based rates
- Late fee calculation (10% after 7-day grace period)
- Paystack payment integration
- Receipt generation

**Wallet System:**
- Transaction tracking (credits/debits)
- Balance management
- Withdrawal request workflow
- Payout processing via Paystack transfers

---

## 7. Security & Compliance

### 7.1 Current Security Controls

| Control Type | Implementation | Status |
|-------------|----------------|--------|
| Authentication | Supabase Auth + JWT | ✅ Implemented |
| Password Policy | 8+ chars, mixed case, numbers | ✅ Implemented |
| Rate Limiting | 100 req/15min general, 5 req/15min auth | ✅ Implemented |
| Input Validation | Class-validator DTOs | ✅ Implemented |
| Security Headers | Helmet.js (CSP, HSTS, etc.) | ✅ Implemented |
| CORS Configuration | Origin whitelist | ✅ Implemented |
| SQL Injection Prevention | TypeORM parameterized queries | ✅ Implemented |
| XSS Prevention | Input sanitization | ✅ Implemented |
| Session Management | JWT with expiration | ✅ Implemented |
| Role-Based Access | Basic guards | ⚠️ Partial |

### 7.2 Stabilization Phase Targets

| Control Type | Target Implementation | Priority |
|-------------|----------------------|----------|
| Advanced RBAC | Fine-grained permissions system | P0 |
| Audit Logging | All sensitive actions logged | P0 |
| API Security | Request signing, webhook validation | P0 |
| Data Encryption | Sensitive data at rest | P1 |
| Security Scanning | SAST/DAST integration | P1 |
| Incident Response | Automated alerting | P1 |

---

## 8. Known Gaps & Issues

### 8.1 Critical (P0) - Pre-Launch

| Issue | Impact | Status | Owner |
|-------|--------|--------|-------|
| **Modal Blocking UI** | Users can't navigate after login | 🔴 Open | Frontend |
| **Title Case Selectors** | UX inconsistency (bin collection) | 🟡 Minor | Frontend |
| **Missing RBAC Enforcement** | Security risk in API endpoints | 🔴 Critical | Backend |

### 8.2 High Priority (P0) - Post-Launch

| Issue | Impact | Status | Owner |
|-------|--------|--------|-------|
| **Event-Driven Architecture** | Limited real-time capabilities | 🟡 Open | Backend |
| **Wallet Integrity Validation** | Financial accuracy risks | 🔴 Critical | Backend |
| **Webhook Security** | Payment fraud prevention | 🔴 Critical | Backend |
| **Frontend Component Coupling** | Development velocity impact | 🟡 Open | Frontend |

### 8.3 Medium Priority (P1) - Phase 2

| Issue | Impact | Status | Owner |
|-------|--------|--------|-------|
| **Database Query Optimization** | Performance degradation at scale | 🟡 Open | Backend |
| **Design System Inconsistency** | UX fragmentation | 🟡 Open | Frontend |
| **Error Handling Standardization** | Poor user experience | 🟡 Open | Full Stack |
| **Test Coverage Gaps** | Quality assurance risks | 🟡 Open | Full Stack |

### 8.4 Low Priority (P2) - Future

| Issue | Impact | Status | Owner |
|-------|--------|--------|-------|
| **Mobile App** | Limited mobile experience | 🟡 Future | Mobile |
| **Advanced Analytics** | Limited business insights | 🟡 Future | Backend |
| **Multi-language Support** | Limited accessibility | 🟡 Future | Frontend |

---

## 9. Deployment & Infrastructure

### 9.1 Current Configuration
- **Frontend:** Vercel (automatic deployments from GitHub)
- **Backend:** Render (Docker-based deployment)
- **Database:** Supabase Postgres (managed)
- **File Storage:** Supabase Storage
- **Monitoring:** Sentry error tracking

### 9.2 Environment Variables

**Backend (.env):**
```bash
NODE_ENV=production
DATABASE_URL=postgres://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379
JWT_SECRET=strong-secret-key
FRONTEND_URL=https://arms.vercel.app
PAYSTACK_PUBLIC_KEY=pk_live_xxx
PAYSTACK_SECRET_KEY=sk_live_xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJxxx
SENTRY_DSN=https://xxx@sentry.io/xxx
```

**Frontend (.env):**
```bash
VITE_API_URL=https://arms-backend.render.com
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxx
```

---

## 10. Architecture Stabilization Plan

### 10.1 Phase 0: Critical Fixes (Pre-Launch) - 1 week

**Priority:** P0 - Must complete before MVP launch

**Frontend Issues:**
- Fix modal blocking entire screen after login/signup
- Convert selectors to title case (Bin Collection → bin collection)
- Remove WelcomeModal completely (currently disabled in Dashboard)

**Backend Issues:**
- Implement proper RBAC enforcement on all API endpoints
- Add role-based route guards
- Validate user permissions in service layer

**Deliverables:**
- [ ] Modal fixes deployed
- [ ] UI text case consistency
- [ ] RBAC security audit complete
- [ ] All API endpoints protected

### 10.2 Phase 1: Architecture Foundation (Weeks 1-4)

**Priority:** P0 - Critical for production stability

**Frontend Restructuring:**
```
src/
├── domains/               # Domain-driven feature organization
│   ├── auth/             # Authentication domain
│   ├── billing/          # Bill management domain  
│   ├── waste/            # Waste collection domain
│   ├── recyclables/      # Recycling domain
│   └── wallet/           # Wallet domain
├── shared/               # Shared components and utilities
│   ├── components/       # Reusable UI components
│   ├── hooks/           # Custom hooks
│   ├── services/        # API clients
│   └── utils/           # Utilities
└── infrastructure/       # Infrastructure concerns
    ├── routing/         # Route configuration
    ├── auth/           # Authentication infrastructure
    └── monitoring/     # Error tracking, analytics
```

**Domain Isolation Benefits:**
- Clear feature boundaries
- Independent development and testing
- Easier code navigation and maintenance
- Reduced coupling between features

**Event-Driven Architecture:**
```typescript
// Event system for real-time updates
interface DomainEvent {
  type: string
  payload: unknown
  timestamp: Date
  userId?: string
}

// Examples:
BillPaid: { billId, amount, paymentMethod }
CollectionCompleted: { collectionId, residentId, timestamp }
RecyclableSubmitted: { recyclableId, type, estimatedValue }
WithdrawalRequested: { walletTransactionId, amount, userId }
```

**Database Governance:**
- Query performance monitoring
- Index optimization strategy
- Connection pooling configuration
- Migration rollback procedures

**Deliverables:**
- [ ] Frontend domain structure implemented
- [ ] Event-driven patterns in place
- [ ] Database performance baseline established
- [ ] Development workflow documentation

### 10.3 Phase 2: Production Hardening (Weeks 5-8)

**Priority:** P0 - Security and reliability

**RBAC Hardening:**
```typescript
// Fine-grained permission system
interface Permission {
  resource: string    // 'bills', 'wallet', 'reports'
  action: string      // 'create', 'read', 'update', 'delete'
  conditions?: object // { own: true, ward: 'festac' }
}

interface Role {
  name: string
  permissions: Permission[]
}
```

**Wallet Integrity System:**
- Double-entry accounting validation
- Transaction atomicity guarantees
- Balance reconciliation checks
- Audit trail for all financial operations

**Webhook Hardening:**
```typescript
// Secure webhook processing
interface WebhookEvent {
  signature: string     // HMAC signature verification
  timestamp: number     // Replay attack prevention  
  payload: unknown      // Event data
  source: 'paystack'    // Trusted source verification
}
```

**Observability & DevOps:**
- Structured logging with correlation IDs
- Application metrics (response time, error rate)
- Database monitoring (slow queries, connection pool)
- Automated alerts for critical issues

**Deliverables:**
- [ ] RBAC system with granular permissions
- [ ] Wallet integrity validation
- [ ] Webhook security implementation
- [ ] Comprehensive monitoring setup

### 10.4 Phase 3: Performance & Scale (Weeks 9-12)

**Priority:** P1 - Optimization for growth

**Redis Integration:**
- Session management
- API response caching
- Rate limiting state
- Real-time event processing with BullMQ

**Performance Optimization:**
- Frontend bundle splitting and lazy loading
- Database query optimization
- API response caching strategy
- Image optimization and CDN integration

**Advanced Features:**
- Audit log system for compliance
- Advanced reporting and analytics
- Automated testing pipeline
- Performance monitoring dashboard

**Deliverables:**
- [ ] Redis-backed caching system
- [ ] Performance benchmarks met
- [ ] Comprehensive test suite
- [ ] Production monitoring dashboard

---

## 11. Roadmap

### Pre-Launch (Current) - Week 0
**Goals:** Fix critical UX and security issues
- [ ] Fix modal blocking UI
- [ ] Implement proper RBAC
- [ ] Security audit and penetration testing
- [ ] Load testing with realistic data volumes

### Phase 1: MVP Launch (Weeks 1-4)
**Goals:** Deploy stable MVP to production
- [ ] Resident onboarding flow
- [ ] Bill payment system  
- [ ] Collection tracking
- [ ] Basic issue reporting
- [ ] Admin operations dashboard

### Phase 2: Enhanced Features (Weeks 5-8) 
**Goals:** Add advanced functionality
- [ ] Recyclables program with wallet
- [ ] Advanced reporting system
- [ ] Automated billing workflows
- [ ] Real-time notifications

### Phase 3: Scale & Optimize (Weeks 9-12)
**Goals:** Prepare for larger user base
- [ ] Performance optimizations
- [ ] Advanced analytics
- [ ] Mobile-responsive improvements
- [ ] Integration with external systems

### Phase 4: Platform Evolution (Months 4-6)
**Goals:** Expand platform capabilities  
- [ ] Mobile application
- [ ] Multi-LCDA support
- [ ] Advanced recycling analytics
- [ ] IoT integration (smart bins)

---

## 12. Success Criteria

### 12.1 Launch Readiness
- [ ] 100+ residents successfully registered
- [ ] Bill payment flow tested end-to-end
- [ ] All staff roles can access appropriate features
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Monitoring and alerting operational

### 12.2 Post-Launch Success (3 months)
- [ ] 300+ active residents
- [ ] 40% of bills paid online
- [ ] 80% of service requests resolved within 48h
- [ ] 99.5% system uptime
- [ ] <1% error rate
- [ ] User satisfaction score >4.0/5.0

### 12.3 Architecture Maturity (6 months)  
- [ ] Domain-driven frontend architecture
- [ ] Event-driven backend patterns
- [ ] 85% test coverage
- [ ] A- security audit score
- [ ] <100ms API response time (p95)
- [ ] Comprehensive audit logging

---

## 13. Risks & Mitigations

### 13.1 Technical Risks

**Database Performance**
- *Risk:* Query performance degrades with scale
- *Mitigation:* Index optimization, query monitoring, connection pooling

**Frontend Bundle Size**
- *Risk:* Large bundles impact load times
- *Mitigation:* Code splitting, lazy loading, bundle analysis

**Third-party Dependencies**
- *Risk:* Payment provider or auth service outages
- *Mitigation:* Circuit breakers, fallback mechanisms, monitoring

### 13.2 Business Risks

**User Adoption**
- *Risk:* Low resident registration rates  
- *Mitigation:* Phased rollout, user education, incentives

**Staff Training**
- *Risk:* Municipal staff struggle with new system
- *Mitigation:* Comprehensive training, documentation, support

**Regulatory Compliance**
- *Risk:* LCDA policy changes affect requirements
- *Mitigation:* Regular stakeholder communication, flexible architecture

---

## 14. Appendices

### 14.1 Billing Rate Structure
- **Residential Properties:** ₦2,000/month
- **Commercial Properties:** ₦3,500/month  
- **Late Fee:** 10% of bill amount
- **Grace Period:** 7 days after due date
- **Payment Methods:** Card, Bank Transfer, USSD

### 14.2 Wallet Transaction Limits
- **Minimum Withdrawal:** ₦500
- **Maximum Withdrawal:** ₦50,000/transaction
- **Daily Limit:** ₦100,000
- **Monthly Limit:** ₦500,000

### 14.3 Service Level Agreements
- **Collection Requests:** 48 hours response
- **Issue Reports:** 24 hours acknowledgment  
- **Bill Inquiries:** 4 hours response
- **System Downtime:** <0.5% monthly
- **API Response Time:** <200ms (95th percentile)

### 14.4 Contact Information
- **Product Owner:** [Name] - [email]
- **Technical Lead:** [Name] - [email]
- **Project Manager:** [Name] - [email]
- **Stakeholder (LCDA):** [Name] - [email]

---

**Document Version:** 2.0  
**Last Updated:** June 6, 2026  
**Next Review:** June 20, 2026  
**Status:** Active - Architecture Stabilization Phase
