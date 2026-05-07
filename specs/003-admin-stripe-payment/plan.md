# Implementation Plan: Admin Dashboard & Stripe Payment Integration

**Branch**: `003-admin-stripe-payment` | **Date**: 2026-04-21 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/003-admin-stripe-payment/spec.md`

## Summary

Add Stripe payment processing to enable members to purchase membership plans through secure hosted checkout, and create a comprehensive admin dashboard for managing plans, bookings, and payments. This feature transforms IronPulse Gym from a booking system into a revenue-generating platform with full administrative oversight.

**Primary Requirements**:
- Stripe Checkout Sessions for secure payment collection
- Webhook handling for payment confirmation and booking creation
- Admin dashboard with revenue metrics and activity overview
- Admin interfaces for managing plans, bookings, and payments
- Role-based access control for admin routes
- Payment record tracking with status management

**Technical Approach**:
- Backend: Stripe SDK integration with webhook signature verification
- Frontend: Stripe.js for checkout redirection, admin UI with ShadCN components
- Database: New Payment model, enhanced User/Plan models with Stripe identifiers
- Security: Webhook signature validation, admin role middleware, audit logging

## Technical Context

**Language/Version**: TypeScript 5.x (Backend: Node.js 20+, Frontend: Next.js 15)  
**Primary Dependencies**: 
- Backend: Express.js 5.x, Prisma 5.x, Stripe SDK 14.x, Zod 4.x, JWT
- Frontend: Next.js 15, React 19, TanStack Query 5.x, Zustand 5.x, @stripe/stripe-js 2.x, ShadCN/UI

**Storage**: PostgreSQL 15+ (Neon) with Prisma ORM  
**Testing**: Manual testing with Stripe test mode, integration tests for webhook handling  
**Target Platform**: Web application (Linux server backend, modern browsers frontend)  
**Project Type**: Web (separate backend and frontend)  
**Performance Goals**: 
- Checkout session creation: <500ms
- Webhook processing: <5 seconds
- Admin dashboard load: <2 seconds
- Support 100 concurrent checkout sessions

**Constraints**: 
- Webhook endpoint must be publicly accessible
- Payment processor handles PCI compliance (no card storage)
- Admin operations require ADMIN role
- All payment amounts in USD (single currency)
- Webhook signature verification required for security

**Scale/Scope**: 
- Support 10,000+ payment records
- Support 10,000+ bookings
- Handle 100 concurrent checkout sessions
- Admin dashboard with real-time statistics
- 5 admin pages (dashboard, plans, bookings, payments, users)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Security-First Development ✅ PASS
- **Webhook Signature Verification**: All webhook requests will verify Stripe signatures before processing
- **Admin Role Protection**: Middleware will verify ADMIN role before granting access to admin routes
- **No Card Storage**: Stripe handles all card data (PCI compliant)
- **Environment Variables**: All Stripe keys stored in .env files (never committed)
- **Audit Trail**: Admin actions logged for accountability (FR-043)

### Type Safety & Validation ✅ PASS
- **Zod Schemas**: Payment creation, webhook payloads, admin operations validated
- **TypeScript Strict Mode**: Enabled throughout
- **Prisma Schema**: Single source of truth for Payment, enhanced User/Plan models
- **API Response Types**: Shared between backend and frontend for payment/admin operations

### User Experience Excellence ✅ PASS
- **Loading States**: Checkout button, admin dashboard, data tables
- **Error Handling**: Payment failures, webhook errors, admin operation failures
- **Toast Notifications**: Payment success/failure, admin action confirmations
- **Responsive Design**: Admin dashboard mobile-friendly (768px+)
- **Accessibility**: Keyboard navigation, ARIA labels for admin tables

### API Contract Integrity ✅ PASS
- **Consistent Responses**: `{ success: true/false, data/error }` format maintained
- **Versioning**: `/api/v1/` prefix for all new routes
- **HTTP Status Codes**: 200 (success), 201 (created), 400 (validation), 401 (auth), 403 (forbidden), 500 (server error)
- **Webhook Endpoint**: Public `/api/webhooks/stripe` (no auth, signature verified)

### Test-Driven Development ⚠️ PARTIAL
- **Manual Testing**: Stripe test mode with test cards
- **Webhook Testing**: Stripe CLI for local webhook simulation
- **Integration Tests**: Webhook processing, payment confirmation flow
- **Note**: Automated tests for critical paths recommended but not blocking for MVP

### Performance & Scalability ✅ PASS
- **Database Indexes**: userId, planId, stripePaymentId for Payment model
- **Pagination**: Admin tables support filtering and pagination for 10,000+ records
- **Caching**: TanStack Query caches admin data (5-minute stale time)
- **Connection Pooling**: Prisma handles database connections
- **Response Time Targets**: <500ms checkout session, <2s admin dashboard

**Constitution Compliance**: ✅ PASS with note on testing
- All security, type safety, UX, API, and performance requirements met
- Automated testing recommended but manual testing sufficient for MVP
- Re-evaluation after Phase 1 design will confirm no violations introduced

## Project Structure

### Documentation (this feature)

```text
specs/003-admin-stripe-payment/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - Stripe integration patterns
├── data-model.md        # Phase 1 output - Payment model, enhanced entities
├── quickstart.md        # Phase 1 output - Setup and testing guide
├── contracts/           # Phase 1 output - API contracts
│   ├── payment-api.yaml       # Payment endpoints OpenAPI spec
│   ├── webhook-api.yaml       # Webhook endpoint spec
│   └── admin-api.yaml         # Admin endpoints spec
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── controllers/
│   │   ├── payment.controller.ts      # NEW: Checkout session creation
│   │   ├── admin.controller.ts        # NEW: Dashboard stats, admin operations
│   │   ├── plan.controller.ts         # ENHANCED: Stripe price sync
│   │   └── booking.controller.ts      # ENHANCED: Payment association
│   ├── routes/
│   │   ├── payment.routes.ts          # NEW: Payment endpoints
│   │   └── admin.routes.ts            # NEW: Admin endpoints
│   ├── webhooks/
│   │   └── stripe.webhook.ts          # NEW: Webhook handler with signature verification
│   ├── middleware/
│   │   ├── admin.middleware.ts        # EXISTING: Role check (already implemented)
│   │   └── webhook.middleware.ts      # NEW: Webhook signature verification
│   ├── schemas/
│   │   ├── payment.schema.ts          # NEW: Payment validation
│   │   └── admin.schema.ts            # NEW: Admin operation validation
│   ├── services/
│   │   ├── stripe.service.ts          # NEW: Stripe SDK wrapper
│   │   └── payment.service.ts         # NEW: Payment business logic
│   └── utils/
│       └── stripe.ts                  # NEW: Stripe client initialization
├── prisma/
│   └── schema.prisma                  # ENHANCED: Payment model, User/Plan enhancements
└── tests/
    ├── integration/
    │   ├── payment.test.ts            # NEW: Payment flow tests
    │   └── webhook.test.ts            # NEW: Webhook processing tests
    └── unit/
        └── stripe.service.test.ts     # NEW: Stripe service tests

frontend/
├── app/
│   ├── admin/                         # NEW: Admin section
│   │   ├── layout.tsx                 # Admin layout with sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx               # Dashboard overview
│   │   ├── plans/
│   │   │   └── page.tsx               # Plans management
│   │   ├── bookings/
│   │   │   └── page.tsx               # Bookings management
│   │   ├── payments/
│   │   │   └── page.tsx               # Payments management
│   │   └── users/
│   │       └── page.tsx               # Users management (optional)
│   ├── payment/
│   │   ├── success/
│   │   │   └── page.tsx               # Payment success page
│   │   └── cancel/
│   │       └── page.tsx               # Payment cancelled page
│   └── plans/
│       └── page.tsx                   # ENHANCED: Add payment button
├── components/
│   ├── admin/                         # NEW: Admin components
│   │   ├── AdminNavbar.tsx            # Admin top navigation
│   │   ├── AdminSidebar.tsx           # Admin sidebar navigation
│   │   ├── StatsCard.tsx              # Dashboard statistics card
│   │   ├── DataTable.tsx              # Reusable data table with filters
│   │   ├── PlanForm.tsx               # Plan create/edit form
│   │   ├── BookingFilters.tsx         # Booking filter controls
│   │   └── PaymentFilters.tsx         # Payment filter controls
│   ├── payment/                       # NEW: Payment components
│   │   └── StripeCheckoutButton.tsx   # Checkout initiation button
│   └── features/
│       └── BookingModal.tsx           # ENHANCED: Add payment option
├── lib/
│   ├── services/
│   │   ├── payment.service.ts         # NEW: Payment API calls
│   │   └── admin.service.ts           # NEW: Admin API calls
│   ├── hooks/
│   │   ├── usePayments.ts             # NEW: Payment queries/mutations
│   │   └── useAdminStats.ts           # NEW: Admin dashboard data
│   └── stripe.ts                      # NEW: Stripe.js initialization
├── types/
│   ├── payment.ts                     # NEW: Payment types
│   └── admin.ts                       # NEW: Admin types
└── tests/
    └── e2e/
        ├── payment-flow.spec.ts       # NEW: E2E payment test
        └── admin-dashboard.spec.ts    # NEW: E2E admin test
```

**Structure Decision**: Web application structure with separate backend and frontend. Backend adds payment processing and admin API endpoints. Frontend adds admin section under `/admin` route and payment flow pages. Existing authentication and booking systems are enhanced to integrate with payment processing.

## Complexity Tracking

> **No violations requiring justification**

All constitution requirements are met without introducing unnecessary complexity:
- Security measures are standard for payment processing (webhook signatures, role checks)
- Type safety maintained through existing TypeScript + Zod + Prisma stack
- UX patterns consistent with existing application (loading states, toasts, responsive design)
- API contracts follow established patterns (versioned, consistent responses)
- Performance targets achievable with existing infrastructure (indexes, caching, pagination)

## Phase 0: Research & Technical Decisions

**Objective**: Resolve technical unknowns and establish implementation patterns for Stripe integration and admin dashboard.

### Research Tasks

1. **Stripe Checkout Sessions vs Payment Intents**
   - **Question**: Which Stripe API pattern best fits the membership purchase flow?
   - **Research**: Compare Checkout Sessions (hosted page) vs Payment Intents (custom UI)
   - **Decision Criteria**: Development speed, PCI compliance, user experience, maintenance burden

2. **Webhook Idempotency Handling**
   - **Question**: How to handle duplicate webhook notifications from Stripe?
   - **Research**: Stripe webhook best practices, idempotency key patterns
   - **Decision Criteria**: Data integrity, performance, simplicity

3. **Admin Dashboard Data Fetching Strategy**
   - **Question**: Real-time queries vs cached aggregations for dashboard statistics?
   - **Research**: Performance implications of aggregating 10,000+ records
   - **Decision Criteria**: Response time, database load, data freshness requirements

4. **Stripe Price Management**
   - **Question**: Create Stripe Prices programmatically or manually in dashboard?
   - **Research**: Stripe Price API, product/price lifecycle management
   - **Decision Criteria**: Admin workflow, error handling, synchronization complexity

5. **Payment Failure Recovery**
   - **Question**: How to handle scenarios where payment succeeds but webhook fails?
   - **Research**: Stripe webhook retry behavior, manual reconciliation patterns
   - **Decision Criteria**: Data consistency, support burden, user experience

**Output**: `research.md` with decisions, rationale, and implementation guidance for each research task.

## Phase 1: Design & Contracts

**Objective**: Define data models, API contracts, and integration patterns.

### Data Model Design

**New Entities**:
- Payment (id, userId, planId, stripePaymentId, amount, currency, status, createdAt)
- User enhancement (stripeCustomerId)
- Plan enhancement (stripePriceId)

**Relationships**:
- Payment → User (many-to-one)
- Payment → Plan (many-to-one)
- Booking → Payment (one-to-one, optional initially)

**State Machines**:
- Payment Status: PENDING → SUCCEEDED/FAILED/REFUNDED
- Booking Status: PENDING → CONFIRMED (after payment success)

**Output**: `data-model.md` with complete Prisma schema, entity relationships, validation rules, and state transitions.

### API Contracts

**Payment Endpoints**:
- `POST /api/v1/payments/create-checkout-session` (protected)
  - Request: `{ planId, successUrl, cancelUrl }`
  - Response: `{ sessionId, url }`
- `POST /api/webhooks/stripe` (public, signature verified)
  - Request: Stripe webhook payload
  - Response: `200 OK` or `400 Bad Request`

**Admin Endpoints**:
- `GET /api/v1/admin/dashboard/stats` (admin only)
  - Response: `{ totalRevenue, activeMembers, totalBookings, recentActivity }`
- `GET /api/v1/admin/bookings` (admin only, with filters)
  - Query: `status, startDate, endDate, search`
  - Response: `{ bookings[], total, page, pageSize }`
- `GET /api/v1/admin/payments` (admin only, with filters)
  - Query: `status, startDate, endDate`
  - Response: `{ payments[], total, page, pageSize }`

**Enhanced Endpoints**:
- `POST /api/v1/plans` (admin only) - Add stripePriceId field
- `PUT /api/v1/plans/:id` (admin only) - Update stripePriceId field

**Output**: `contracts/` directory with OpenAPI specifications for payment, webhook, and admin endpoints.

### Integration Patterns

**Stripe Checkout Flow**:
1. Member clicks "Pay Now" → Frontend calls backend
2. Backend creates Checkout Session → Returns session URL
3. Frontend redirects to Stripe hosted page
4. Member completes payment → Stripe redirects to success/cancel URL
5. Stripe sends webhook → Backend processes payment
6. Backend creates Payment record → Confirms Booking

**Admin Dashboard Flow**:
1. Admin logs in → Role verified by middleware
2. Admin accesses dashboard → Backend aggregates statistics
3. Dashboard displays metrics → Real-time data from database
4. Admin navigates to management pages → Filtered data tables
5. Admin performs actions → Validated and logged

**Output**: `quickstart.md` with setup instructions, environment variables, Stripe configuration, and testing procedures.

## Phase 2: Task Breakdown

**Note**: Task breakdown is performed by `/sp.tasks` command, not `/sp.plan`. This section outlines the expected task categories.

### Expected Task Categories

1. **Database Migration** (1-2 tasks)
   - Update Prisma schema with Payment model and enhancements
   - Run migration and seed test data

2. **Backend Payment Integration** (5-7 tasks)
   - Install Stripe SDK and configure client
   - Implement checkout session creation endpoint
   - Implement webhook handler with signature verification
   - Create Payment service for business logic
   - Add payment validation schemas
   - Implement payment-booking association logic
   - Add error handling and logging

3. **Backend Admin API** (4-6 tasks)
   - Implement dashboard statistics endpoint
   - Implement admin bookings endpoint with filters
   - Implement admin payments endpoint with filters
   - Enhance plan endpoints with Stripe price sync
   - Add admin middleware for role verification
   - Implement audit logging for admin actions

4. **Frontend Payment Integration** (3-4 tasks)
   - Install Stripe.js and configure
   - Create StripeCheckoutButton component
   - Implement payment success/cancel pages
   - Add payment button to plans page
   - Integrate payment status with booking display

5. **Frontend Admin Dashboard** (8-10 tasks)
   - Create admin layout with sidebar and navbar
   - Implement dashboard overview page with stats
   - Create plans management page with CRUD
   - Create bookings management page with filters
   - Create payments management page with filters
   - Create reusable DataTable component
   - Implement admin route protection
   - Add loading states and error handling
   - Create admin-specific hooks and services
   - Implement responsive design for admin pages

6. **Testing & Documentation** (3-4 tasks)
   - Test payment flow with Stripe test cards
   - Test webhook processing with Stripe CLI
   - Test admin dashboard functionality
   - Update README with Stripe setup instructions

**Total Estimated Tasks**: 24-33 tasks across 6 categories

## Implementation Phases

### Phase 0: Environment Setup (Day 1)
- Create Stripe account (test mode)
- Configure environment variables (backend + frontend)
- Update Prisma schema and run migration
- Install Stripe dependencies

**Deliverables**: Environment ready, database updated, dependencies installed

### Phase 1: Backend Payment Core (Day 1-2)
- Implement Stripe service wrapper
- Create checkout session endpoint
- Implement webhook handler with signature verification
- Create Payment model CRUD operations
- Add payment validation schemas

**Deliverables**: Backend payment processing functional, testable with Postman

### Phase 2: Frontend Payment Integration (Day 2-3)
- Install and configure Stripe.js
- Create checkout button component
- Implement success/cancel pages
- Integrate payment button into plans page
- Add payment status to member dashboard

**Deliverables**: End-to-end payment flow working with test cards

### Phase 3: Backend Admin API (Day 3-4)
- Implement dashboard statistics endpoint
- Create admin bookings endpoint with filters
- Create admin payments endpoint with filters
- Enhance plan endpoints for Stripe sync
- Add admin middleware and audit logging

**Deliverables**: Admin API complete, testable with Postman

### Phase 4: Frontend Admin Dashboard (Day 4-6)
- Create admin layout structure
- Implement dashboard overview page
- Build plans management interface
- Build bookings management interface
- Build payments management interface
- Create reusable admin components

**Deliverables**: Full admin dashboard functional

### Phase 5: Integration & Testing (Day 6-7)
- End-to-end payment flow testing
- Webhook processing verification
- Admin dashboard functionality testing
- Security testing (role checks, webhook signatures)
- Performance testing (dashboard load times)

**Deliverables**: All features tested and verified

### Phase 6: Polish & Documentation (Day 7-8)
- Mobile responsiveness for admin pages
- Loading states and error messages
- Toast notifications for all actions
- Code cleanup and comments
- README updates with setup instructions

**Deliverables**: Production-ready feature

**Total Timeline**: 8 days (4-6 hours per day)

## Risk Assessment

### High Risk
- **Webhook Delivery Failures**: Stripe webhook may fail to reach system
  - **Mitigation**: Implement webhook retry logic, manual reconciliation tool
- **Payment-Booking Synchronization**: Race condition between webhook and user return
  - **Mitigation**: Idempotency keys, transaction isolation, status checks

### Medium Risk
- **Admin Dashboard Performance**: Aggregating 10,000+ records may be slow
  - **Mitigation**: Database indexes, pagination, caching, consider materialized views
- **Stripe Price Synchronization**: Manual price creation may cause mismatches
  - **Mitigation**: Validation checks, admin warnings, sync verification tool

### Low Risk
- **Admin UI Complexity**: Multiple management pages may be overwhelming
  - **Mitigation**: Consistent UI patterns, clear navigation, user testing
- **Test Mode to Live Mode Transition**: Configuration changes required
  - **Mitigation**: Clear documentation, environment variable checklist

## Success Metrics

- Payment success rate: >95% (excluding user errors)
- Webhook processing time: <5 seconds
- Admin dashboard load time: <2 seconds
- Zero unauthorized admin access
- 100% payment-booking synchronization
- Admin can manage plans in <1 minute
- Mobile-responsive admin interface (768px+)

## Next Steps

1. Run `/sp.tasks` to generate detailed task breakdown
2. Begin Phase 0: Environment setup and Stripe configuration
3. Implement backend payment core (Phase 1)
4. Integrate frontend payment flow (Phase 2)
5. Build admin API and dashboard (Phases 3-4)
6. Test and polish (Phases 5-6)
