
# Tasks: Admin Dashboard & Stripe Payment Integration

**Input**: Design documents from `/specs/003-admin-stripe-payment/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are not included as they were not explicitly requested in the feature specification. Manual testing with Stripe test mode will be used.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/prisma/`, `backend/tests/`
- **Frontend**: `frontend/app/`, `frontend/components/`, `frontend/lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, environment configuration, and dependency installation

- [ ] T001 Create Stripe account in test mode and obtain API keys (pk_test_..., sk_test_...)
- [X] T002 [P] Install Stripe SDK in backend: `npm install stripe` in backend/
- [X] T003 [P] Install Stripe.js in frontend: `npm install @stripe/stripe-js` in frontend/
- [X] T004 Configure backend environment variables in backend/.env (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET placeholder)
- [X] T005 Configure frontend environment variables in frontend/.env.local (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
- [ ] T006 Create Stripe Products and Prices in Stripe Dashboard for Basic, Premium, Elite plans (copy Price IDs)
- [ ] T007 Install Stripe CLI for local webhook testing: `stripe login` and verify authentication

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Update Prisma schema in backend/prisma/schema.prisma with Payment model, PaymentStatus enum, User/Plan/Booking enhancements per data-model.md
- [X] T009 Run Prisma migration: `npx prisma db push` and `npx prisma generate` in backend/
- [ ] T010 Verify database schema in Prisma Studio: Payment table exists with correct columns and indexes
- [X] T011 [P] Create Stripe client initialization utility in backend/src/utils/stripe.ts
- [ ] T012 [P] Create admin user in database with role ADMIN (email: admin@ironpulse.com) for testing
- [X] T013 [P] Create payment types in frontend/types/payment.ts (Payment, PaymentStatus, CreateCheckoutRequest, CheckoutResponse)
- [X] T014 [P] Create admin types in frontend/types/admin.ts (DashboardStats, AdminBooking, AdminPayment, FilterParams)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Member Payment Processing (Priority: P1) 🎯 MVP

**Goal**: Enable members to purchase membership plans through Stripe Checkout and automatically confirm bookings upon successful payment

**Independent Test**: Member can select a plan, complete payment with test card (4242 4242 4242 4242), and see confirmed booking in dashboard

### Backend Payment Core

- [X] T015 [P] [US1] Create payment validation schemas in backend/src/schemas/payment.schema.ts (createCheckoutSessionSchema)
- [X] T016 [P] [US1] Create Stripe service wrapper in backend/src/services/stripe.service.ts (createCheckoutSession, retrieveSession methods)
- [X] T017 [US1] Create payment controller in backend/src/controllers/payment.controller.ts (createCheckoutSession endpoint handler)
- [X] T018 [US1] Create payment routes in backend/src/routes/payment.routes.ts (POST /payments/create-checkout-session with auth middleware)
- [X] T019 [US1] Register payment routes in backend/src/server.ts (app.use('/api/v1/payments', paymentRoutes))

### Webhook Processing

- [X] T020 [P] [US1] Create webhook signature verification middleware in backend/src/middleware/webhook.middleware.ts
- [X] T021 [US1] Create webhook handler in backend/src/webhooks/stripe.webhook.ts (handle checkout.session.completed, payment_intent.succeeded events)
- [X] T022 [US1] Implement payment-booking association logic in webhook handler (create Payment record, update Booking status to CONFIRMED)
- [X] T023 [US1] Register webhook route in backend/src/server.ts (POST /api/webhooks/stripe with signature verification)
- [ ] T024 [US1] Setup Stripe CLI webhook forwarding: `stripe listen --forward-to localhost:5000/api/webhooks/stripe` and update STRIPE_WEBHOOK_SECRET in backend/.env

### Frontend Payment Integration

- [X] T025 [P] [US1] Initialize Stripe.js in frontend/lib/stripe.ts (loadStripe with publishable key)
- [X] T026 [P] [US1] Create payment service in frontend/lib/services/payment.service.ts (createCheckoutSession API call)
- [X] T027 [P] [US1] Create payment hooks in frontend/lib/hooks/usePayments.ts (useCreateCheckout mutation with TanStack Query)
- [X] T028 [US1] Create StripeCheckoutButton component in frontend/components/payment/StripeCheckoutButton.tsx (handles checkout session creation and redirect)
- [X] T029 [US1] Enhance plans page in frontend/app/plans/page.tsx (add StripeCheckoutButton to plan cards)
- [X] T030 [US1] Create payment success page in frontend/app/payment/success/page.tsx (display confirmation message)
- [X] T031 [US1] Create payment cancel page in frontend/app/payment/cancel/page.tsx (display cancellation message with retry option)

### Testing & Validation

- [ ] T032 [US1] Test end-to-end payment flow: select plan → checkout → test card payment → verify booking confirmed
- [ ] T033 [US1] Test webhook processing: trigger `stripe trigger checkout.session.completed` and verify Payment record created
- [ ] T034 [US1] Test payment failure: use decline test card (4000 0000 0000 0002) and verify no booking created

**Checkpoint**: User Story 1 complete - members can purchase plans and bookings are automatically confirmed

---

## Phase 4: User Story 2 - Admin Dashboard Overview (Priority: P2)

**Goal**: Provide admins with centralized dashboard showing revenue metrics, active members, total bookings, and recent activity

**Independent Test**: Admin can login, access /admin/dashboard, and see accurate statistics matching database records

### Backend Admin API

- [X] T035 [P] [US2] Create admin validation schemas in backend/src/schemas/admin.schema.ts (dashboard stats query validation)
- [X] T036 [US2] Create admin controller in backend/src/controllers/admin.controller.ts (getDashboardStats endpoint with aggregation queries)
- [X] T037 [US2] Create admin routes in backend/src/routes/admin.routes.ts (GET /admin/dashboard/stats with auth + admin middleware)
- [X] T038 [US2] Register admin routes in backend/src/server.ts (app.use('/api/v1/admin', adminRoutes))

### Frontend Admin Dashboard

- [X] T039 [P] [US2] Create admin service in frontend/lib/services/admin.service.ts (getDashboardStats API call)
- [X] T040 [P] [US2] Create admin hooks in frontend/lib/hooks/useAdminStats.ts (useQuery for dashboard stats with 5-minute cache)
- [X] T041 [P] [US2] Create AdminNavbar component in frontend/components/admin/AdminNavbar.tsx (top navigation with logout)
- [X] T042 [P] [US2] Create AdminSidebar component in frontend/components/admin/AdminSidebar.tsx (navigation links to dashboard, plans, bookings, payments)
- [X] T043 [P] [US2] Create StatsCard component in frontend/components/admin/StatsCard.tsx (reusable card for displaying metrics)
- [X] T044 [US2] Create admin layout in frontend/app/admin/layout.tsx (includes AdminNavbar, AdminSidebar, ProtectedRoute with ADMIN role check)
- [X] T045 [US2] Create admin dashboard page in frontend/app/admin/dashboard/page.tsx (displays revenue, active members, bookings, recent payments using StatsCard)

### Testing & Validation

- [ ] T046 [US2] Test admin dashboard access: login as admin → navigate to /admin/dashboard → verify statistics displayed
- [ ] T047 [US2] Test non-admin access: login as member → attempt /admin/dashboard → verify 403 Forbidden
- [ ] T048 [US2] Verify dashboard statistics accuracy: compare displayed metrics with database queries

**Checkpoint**: User Story 2 complete - admins have functional dashboard with business metrics

---

## Phase 5: User Story 3 - Admin Plans Management (Priority: P3)

**Goal**: Enable admins to create, update, and delete membership plans with Stripe Price ID linking

**Independent Test**: Admin can create new plan with Stripe Price ID, update existing plan, and delete plan (if no bookings exist)

### Backend Plans Enhancement

- [ ] T049 [US3] Enhance plan controller in backend/src/controllers/plan.controller.ts (add stripePriceId validation in create/update methods)
- [ ] T050 [US3] Add Stripe Price validation in backend/src/services/stripe.service.ts (validatePriceId method to verify Price exists and is active)
- [ ] T051 [US3] Update plan deletion logic in backend/src/controllers/plan.controller.ts (check for associated payments before deletion)

### Frontend Plans Management

- [ ] T052 [P] [US3] Create PlanForm component in frontend/components/admin/PlanForm.tsx (form for create/edit with title, price, duration, features, stripePriceId fields)
- [ ] T053 [P] [US3] Create DataTable component in frontend/components/admin/DataTable.tsx (reusable table with sorting, filtering, pagination)
- [X] T054 [US3] Create admin plans page in frontend/app/admin/plans/page.tsx (list all plans with DataTable, add/edit/delete actions)
- [ ] T055 [US3] Integrate PlanForm with admin plans page (modal or separate page for create/edit operations)

### Testing & Validation

- [ ] T056 [US3] Test plan creation: create plan with valid Stripe Price ID → verify plan appears in member plans page
- [ ] T057 [US3] Test plan update: edit plan details → verify changes reflected immediately
- [ ] T058 [US3] Test plan deletion: attempt to delete plan with bookings → verify prevention with error message

**Checkpoint**: User Story 3 complete - admins can fully manage membership plans

---

## Phase 6: User Story 4 - Admin Bookings Management (Priority: P4)

**Goal**: Provide admins with comprehensive view of all bookings with filtering by status, date range, and member search

**Independent Test**: Admin can view all bookings, filter by status (CONFIRMED, PENDING), filter by date range, and search by member name

### Backend Bookings API

- [X] T059 [US4] Enhance admin controller in backend/src/controllers/admin.controller.ts (getBookings endpoint with filters: status, startDate, endDate, search, pagination)
- [X] T060 [US4] Add bookings route in backend/src/routes/admin.routes.ts (GET /admin/bookings with query parameters)
- [X] T061 [US4] Optimize bookings query with includes for user and plan data, implement pagination (50 records per page)

### Frontend Bookings Management

- [ ] T062 [P] [US4] Create BookingFilters component in frontend/components/admin/BookingFilters.tsx (status dropdown, date range picker, search input)
- [X] T063 [P] [US4] Add getBookings method to frontend/lib/services/admin.service.ts (API call with filter parameters)
- [X] T064 [P] [US4] Create useAdminBookings hook in frontend/lib/hooks/useAdminStats.ts (useQuery with filter state management)
- [X] T065 [US4] Create admin bookings page in frontend/app/admin/bookings/page.tsx (DataTable with BookingFilters, display member name, plan, date, status, payment status)

### Testing & Validation

- [ ] T066 [US4] Test bookings list: verify all bookings displayed with correct member and plan information
- [ ] T067 [US4] Test status filter: filter by CONFIRMED → verify only confirmed bookings shown
- [ ] T068 [US4] Test date range filter: select date range → verify bookings within range displayed
- [ ] T069 [US4] Test member search: search by name → verify matching bookings displayed

**Checkpoint**: User Story 4 complete - admins have full visibility into booking operations

---

## Phase 7: User Story 5 - Admin Payments Management (Priority: P5)

**Goal**: Provide admins with complete payment transaction history with filtering by status and date range

**Independent Test**: Admin can view all payments, filter by status (SUCCEEDED, FAILED), filter by date range, and see transaction details

### Backend Payments API

- [X] T070 [US5] Enhance admin controller in backend/src/controllers/admin.controller.ts (getPayments endpoint with filters: status, startDate, endDate, pagination)
- [X] T071 [US5] Add payments route in backend/src/routes/admin.routes.ts (GET /admin/payments with query parameters)
- [X] T072 [US5] Optimize payments query with includes for user and plan data, implement pagination (50 records per page)

### Frontend Payments Management

- [ ] T073 [P] [US5] Create PaymentFilters component in frontend/components/admin/PaymentFilters.tsx (status dropdown, date range picker)
- [X] T074 [P] [US5] Add getPayments method to frontend/lib/services/admin.service.ts (API call with filter parameters)
- [X] T075 [P] [US5] Create useAdminPayments hook in frontend/lib/hooks/useAdminStats.ts (useQuery with filter state management)
- [X] T076 [US5] Create admin payments page in frontend/app/admin/payments/page.tsx (DataTable with PaymentFilters, display member name, amount, status, date, Stripe payment ID)

### Testing & Validation

- [ ] T077 [US5] Test payments list: verify all payments displayed with correct amounts and statuses
- [ ] T078 [US5] Test status filter: filter by SUCCEEDED → verify only successful payments shown
- [ ] T079 [US5] Test date range filter: select date range → verify payments within range displayed
- [ ] T080 [US5] Verify revenue calculation: compare dashboard total revenue with sum of SUCCEEDED payments

**Checkpoint**: All user stories complete - full admin dashboard and payment processing functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

- [ ] T081 [P] Add loading states to all admin pages (skeleton loaders for tables, stats cards)
- [ ] T082 [P] Add error handling and toast notifications for all admin operations (create, update, delete, filter)
- [ ] T083 [P] Implement responsive design for admin dashboard (test on 768px tablet, 375px mobile)
- [ ] T084 [P] Add loading spinner to StripeCheckoutButton during checkout session creation
- [ ] T085 [P] Enhance payment success page with booking details and next steps
- [ ] T086 [P] Add audit logging for admin actions in backend (log plan create/update/delete, booking views, payment views)
- [ ] T087 Verify all admin routes protected with ADMIN role middleware
- [ ] T088 Test webhook idempotency: send duplicate webhook → verify no duplicate Payment records created
- [ ] T089 Test concurrent checkout sessions: simulate 10 simultaneous checkouts → verify all process correctly
- [ ] T090 Update README.md with Stripe setup instructions, environment variables, and testing procedures per quickstart.md
- [ ] T091 Code cleanup: remove console.logs, add comments to complex logic, ensure consistent error messages
- [ ] T092 Final end-to-end test: complete payment flow + admin dashboard review + all filters working

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (Payment Processing): Can start after Foundational - No dependencies on other stories
  - US2 (Admin Dashboard): Can start after Foundational - No dependencies on other stories
  - US3 (Plans Management): Can start after Foundational - No dependencies on other stories
  - US4 (Bookings Management): Can start after Foundational - No dependencies on other stories
  - US5 (Payments Management): Can start after Foundational - No dependencies on other stories
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

All user stories are independently implementable after Foundational phase:
- **US1 (P1)**: Independent - Core payment processing
- **US2 (P2)**: Independent - Dashboard displays data from US1 but doesn't require it
- **US3 (P3)**: Independent - Plan management works standalone
- **US4 (P4)**: Independent - Booking management works standalone
- **US5 (P5)**: Independent - Payment management works standalone

### Within Each User Story

- Backend before frontend (API must exist before UI calls it)
- Models/schemas before services
- Services before controllers
- Controllers before routes
- Routes registered before testing
- Core implementation before testing & validation

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T002, T003 (install dependencies in parallel)
- T004, T005 (configure env vars in parallel)

**Foundational Phase (Phase 2)**:
- T011, T012, T013, T014 (all can run in parallel after T010)

**User Story 1 (Phase 3)**:
- T015, T016 (schemas and service in parallel)
- T020, T025, T026, T027 (webhook middleware, Stripe.js, service, hooks in parallel)
- T028, T029, T030, T031 (all frontend components in parallel)

**User Story 2 (Phase 4)**:
- T039, T040, T041, T042, T043 (all frontend components in parallel)

**User Story 3 (Phase 5)**:
- T052, T053 (PlanForm and DataTable in parallel)

**User Story 4 (Phase 6)**:
- T062, T063, T064 (filters, service, hook in parallel)

**User Story 5 (Phase 7)**:
- T073, T074, T075 (filters, service, hook in parallel)

**Polish Phase (Phase 8)**:
- T081, T082, T083, T084, T085, T086 (all polish tasks in parallel)

**Cross-Story Parallelization**:
Once Foundational phase completes, all 5 user stories can be worked on in parallel by different developers.

---

## Parallel Example: User Story 1

```bash
# After Foundational phase completes, launch these in parallel:

# Backend team:
Task T015: "Create payment validation schemas"
Task T016: "Create Stripe service wrapper"
Task T020: "Create webhook signature verification middleware"

# Frontend team (simultaneously):
Task T025: "Initialize Stripe.js"
Task T026: "Create payment service"
Task T027: "Create payment hooks"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T014) - CRITICAL
3. Complete Phase 3: User Story 1 (T015-T034)
4. **STOP and VALIDATE**: Test payment flow end-to-end with test cards
5. Deploy/demo if ready - **Revenue generation enabled!**

### Incremental Delivery

1. Setup + Foundational (T001-T014) → Foundation ready
2. Add US1 (T015-T034) → Test independently → **Deploy/Demo (MVP - Payment Processing Live!)**
3. Add US2 (T035-T048) → Test independently → Deploy/Demo (Admin Dashboard Added)
4. Add US3 (T049-T058) → Test independently → Deploy/Demo (Plan Management Added)
5. Add US4 (T059-T069) → Test independently → Deploy/Demo (Booking Management Added)
6. Add US5 (T070-T080) → Test independently → Deploy/Demo (Payment Management Added)
7. Polish (T081-T092) → Final production release

### Parallel Team Strategy

With multiple developers after Foundational phase completes:

- **Developer A**: User Story 1 (Payment Processing) - T015-T034
- **Developer B**: User Story 2 (Admin Dashboard) - T035-T048
- **Developer C**: User Story 3 (Plans Management) - T049-T058
- **Developer D**: User Story 4 (Bookings Management) - T059-T069
- **Developer E**: User Story 5 (Payments Management) - T070-T080

All stories integrate independently and can be deployed incrementally.

---

## Task Summary

**Total Tasks**: 92 tasks across 8 phases

**Tasks by Phase**:
- Phase 1 (Setup): 7 tasks
- Phase 2 (Foundational): 7 tasks
- Phase 3 (US1 - Payment Processing): 20 tasks
- Phase 4 (US2 - Admin Dashboard): 14 tasks
- Phase 5 (US3 - Plans Management): 10 tasks
- Phase 6 (US4 - Bookings Management): 11 tasks
- Phase 7 (US5 - Payments Management): 11 tasks
- Phase 8 (Polish): 12 tasks

**Parallel Opportunities**: 35 tasks marked [P] can run in parallel within their phase

**Independent Stories**: All 5 user stories can be implemented and tested independently after Foundational phase

**MVP Scope**: Phases 1-3 (34 tasks) deliver payment processing - the core revenue-generating feature

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Tests are manual using Stripe test mode (no automated test tasks)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Stripe CLI must remain running during development for webhook testing
- Use test cards from quickstart.md for payment testing
- Verify admin role protection on all admin routes before production
