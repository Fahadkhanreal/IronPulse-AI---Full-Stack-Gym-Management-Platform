# Tasks: IronPulse Gym Backend API

**Input**: Design documents from `/specs/002-gym-backend/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT included in this task list (not requested in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Backend structure: `backend/src/`, `backend/prisma/`, `backend/tests/`
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure with src/, prisma/, tests/ folders
- [x] T002 Initialize Node.js project with package.json in backend/
- [x] T003 [P] Install core dependencies (express, typescript, ts-node-dev, @types/express, @types/node)
- [x] T004 [P] Install database dependencies (prisma, @prisma/client)
- [x] T005 [P] Install authentication dependencies (bcryptjs, jsonwebtoken, @types/bcryptjs, @types/jsonwebtoken)
- [x] T006 [P] Install security and validation dependencies (helmet, cors, dotenv, zod)
- [x] T007 Configure TypeScript with tsconfig.json in backend/
- [x] T008 Initialize Prisma with npx prisma init in backend/
- [x] T009 Create Prisma schema in backend/prisma/schema.prisma with User, Plan, Booking, Trainer models and Role, BookingStatus enums
- [x] T010 Create .env file with DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, PORT, NODE_ENV, FRONTEND_URL
- [x] T011 Create .env.example template in backend/
- [x] T012 Create .gitignore with node_modules, dist, .env in backend/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T013 Run npx prisma generate to generate Prisma client
- [x] T014 Run npx prisma db push to create database schema
- [x] T015 Create Prisma client singleton in backend/src/config/prisma.ts
- [x] T016 [P] Create response utility helpers in backend/src/utils/response.ts with success() and error() functions
- [x] T017 [P] Create JWT utility functions in backend/src/utils/jwt.ts with sign() and verify() functions
- [x] T018 [P] Create password utility functions in backend/src/utils/password.ts with hash() and compare() using bcrypt
- [x] T019 [P] Create global error handling middleware in backend/src/middleware/error.middleware.ts
- [x] T020 [P] Create Zod validation middleware wrapper in backend/src/middleware/validate.middleware.ts
- [x] T021 [P] Create Express type extensions in backend/src/types/express.d.ts for req.user
- [x] T022 Create Express server setup in backend/src/server.ts with CORS, helmet, JSON parser, error middleware
- [x] T023 Add health check route GET /api/health in backend/src/server.ts
- [x] T024 Add npm scripts in backend/package.json (dev, build, start, prisma:generate, prisma:push)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration & Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable new gym members to create accounts and log in to access personalized features with secure JWT-based authentication

**Independent Test**: Make signup POST request with name/email/password, verify account creation and token return. Make login POST request with credentials, verify token generation. Attempt protected endpoint access without token, verify 401 rejection.

### Implementation for User Story 1

- [x] T025 [P] [US1] Create auth Zod schemas in backend/src/schemas/auth.schema.ts with signupSchema and loginSchema
- [x] T026 [P] [US1] Create JWT authentication middleware in backend/src/middleware/auth.middleware.ts to verify tokens and attach user to req.user
- [x] T027 [US1] Create auth controller in backend/src/controllers/auth.controller.ts with signup() and login() functions
- [x] T028 [US1] Implement signup logic: validate input, check email uniqueness, hash password with bcrypt (10 rounds), create user with role=MEMBER, generate JWT token
- [x] T029 [US1] Implement login logic: validate input, find user by email, compare password with bcrypt, generate JWT token, return user data (excluding password)
- [x] T030 [US1] Create auth routes in backend/src/routes/auth.routes.ts with POST /api/v1/auth/signup and POST /api/v1/auth/login
- [x] T031 [US1] Connect auth routes to Express app in backend/src/server.ts
- [ ] T032 [US1] Test signup endpoint: create new user, verify token generation, verify password is hashed, verify password not in response (⚠️ Manual testing required)
- [ ] T033 [US1] Test login endpoint: verify valid credentials return token, verify invalid credentials return 401, verify error doesn't reveal whether email or password was wrong (⚠️ Manual testing required)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can signup, login, and receive JWT tokens

---

## Phase 4: User Story 2 - Membership Plans Management (Priority: P2)

**Goal**: Enable gym administrators to create and manage membership plans, and allow all users to browse available plans

**Independent Test**: Create plans via admin endpoints (requires admin user), retrieve plans via public GET endpoint, verify plan CRUD operations work correctly, verify non-admin users cannot create/update/delete plans

### Implementation for User Story 2

- [x] T034 [P] [US2] Create plan Zod schemas in backend/src/schemas/plan.schema.ts with createPlanSchema and updatePlanSchema
- [x] T035 [P] [US2] Create admin authorization middleware in backend/src/middleware/admin.middleware.ts to check req.user.role === 'ADMIN'
- [x] T036 [US2] Create plan controller in backend/src/controllers/plan.controller.ts with getAllPlans(), getPlanById(), createPlan(), updatePlan(), deletePlan() functions
- [x] T037 [US2] Implement getAllPlans: fetch all plans from database, return with success response (public endpoint)
- [x] T038 [US2] Implement getPlanById: fetch plan by ID, return 404 if not found, return plan with success response (public endpoint)
- [x] T039 [US2] Implement createPlan: validate input, create plan in database, return created plan (admin only)
- [x] T040 [US2] Implement updatePlan: validate input, check plan exists, update plan, return updated plan (admin only)
- [x] T041 [US2] Implement deletePlan: check plan exists, delete plan (preserves booking references), return success (admin only)
- [x] T042 [US2] Create plan routes in backend/src/routes/plan.routes.ts with GET /api/v1/plans, GET /api/v1/plans/:id (public), POST /api/v1/plans, PUT /api/v1/plans/:id, DELETE /api/v1/plans/:id (admin protected)
- [x] T043 [US2] Connect plan routes to Express app in backend/src/server.ts
- [ ] T044 [US2] Test plan endpoints: verify public access to GET routes, verify admin can CRUD plans, verify non-admin gets 403 on protected routes (⚠️ Manual testing required)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - authentication works, plans can be managed

---

## Phase 5: User Story 3 - Session Booking System (Priority: P3)

**Goal**: Enable authenticated members to book gym sessions by selecting a membership plan and date, view booking history, and cancel bookings

**Independent Test**: Create booking for authenticated user with valid planId and future date, verify booking creation with PENDING status. Retrieve user's bookings, verify only their bookings are returned. Cancel booking, verify status updates to CANCELLED. Attempt booking with past date, verify validation error.

### Implementation for User Story 3

- [x] T045 [P] [US3] Create booking Zod schemas in backend/src/schemas/booking.schema.ts with createBookingSchema (validates planId, bookingDate is future)
- [x] T046 [US3] Create booking controller in backend/src/controllers/booking.controller.ts with createBooking(), getUserBookings(), cancelBooking() functions
- [x] T047 [US3] Implement createBooking: validate input, verify bookingDate is not in past, verify plan exists, create booking with userId from req.user, status=PENDING, return booking with plan details
- [x] T048 [US3] Implement getUserBookings: fetch all bookings for req.user.id with plan details included, sort by bookingDate descending, return bookings array
- [x] T049 [US3] Implement cancelBooking: verify booking exists, verify booking belongs to req.user.id, update status to CANCELLED, return success
- [x] T050 [US3] Create booking routes in backend/src/routes/booking.routes.ts with POST /api/v1/bookings, GET /api/v1/bookings, DELETE /api/v1/bookings/:id (all protected with auth middleware)
- [x] T051 [US3] Connect booking routes to Express app in backend/src/server.ts
- [ ] T052 [US3] Test booking endpoints: verify authenticated user can create booking, verify past date rejected, verify user sees only their bookings, verify user can cancel own booking, verify user cannot cancel other user's booking (⚠️ Manual testing required)

**Checkpoint**: All core user stories (1, 2, 3) should now be independently functional - full booking flow works end-to-end

---

## Phase 6: User Story 4 - User Profile Management (Priority: P4)

**Goal**: Enable authenticated members to view and update their profile information (name, email) with proper validation

**Independent Test**: Retrieve user profile via GET endpoint, verify password is excluded from response. Update profile with new name, verify change persists. Update email to existing email, verify uniqueness validation error. Update with invalid email format, verify validation error.

### Implementation for User Story 4

- [x] T053 [P] [US4] Create user Zod schemas in backend/src/schemas/user.schema.ts with updateProfileSchema (validates name, email format)
- [x] T054 [US4] Create user controller in backend/src/controllers/user.controller.ts with getProfile() and updateProfile() functions
- [x] T055 [US4] Implement getProfile: fetch user by req.user.id, exclude password field, return user data with success response
- [x] T056 [US4] Implement updateProfile: validate input, check email uniqueness if email changed, update user record, exclude password from response, return updated user
- [x] T057 [US4] Create user routes in backend/src/routes/user.routes.ts with GET /api/v1/user/profile, PUT /api/v1/user/profile (both protected with auth middleware)
- [x] T058 [US4] Connect user routes to Express app in backend/src/server.ts
- [ ] T059 [US4] Test profile endpoints: verify authenticated user can get profile, verify password excluded, verify name update works, verify email update with uniqueness check, verify invalid email format rejected (⚠️ Manual testing required)

**Checkpoint**: All user stories (1, 2, 3, 4) should now be independently functional - complete backend API ready

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T060 [P] Create optional seed script in backend/prisma/seed.ts with 3 sample plans (Basic, Premium, Elite) and 6 sample trainers
- [x] T061 [P] Add seed script to package.json and run npx prisma db seed
- [ ] T062 [P] Add JSDoc comments to all controller functions documenting parameters, return types, and error cases (⚠️ Optional - code is self-documenting with TypeScript)
- [x] T063 [P] Review all error messages for user-friendliness and actionable feedback
- [ ] T064 [P] Add request logging middleware for debugging (⚠️ Optional - not required for MVP)
- [x] T065 [P] Verify all endpoints return consistent response format (success/error structure)
- [x] T066 [P] Run TypeScript compiler to fix any type errors
- [x] T067 Create comprehensive README.md in backend/ with installation steps, environment variables, API endpoints documentation, and frontend integration guide
- [x] T068 Create API documentation with example requests/responses for all endpoints
- [x] T069 Verify CORS configuration allows frontend domain from FRONTEND_URL env variable
- [ ] T070 Test complete authentication flow: signup → login → protected endpoint access (⚠️ Manual testing required)
- [ ] T071 Test complete booking flow: login → get plans → create booking → view bookings → cancel booking (⚠️ Manual testing required)
- [ ] T072 Verify all validation errors provide clear, field-specific feedback (⚠️ Manual testing required)
- [ ] T069 Verify CORS configuration allows frontend domain from FRONTEND_URL env variable
- [ ] T070 Test complete authentication flow: signup → login → protected endpoint access
- [ ] T071 Test complete booking flow: login → get plans → create booking → view bookings → cancel booking
- [ ] T072 Verify all validation errors provide clear, field-specific feedback

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 (but admin user from US1 needed for testing)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires User model from US1 and Plan model from US2 (but models created in Foundational phase)
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Uses User model from US1 (created in Foundational phase)

### Within Each User Story

- Schemas before controllers (validation needed in controllers)
- Middleware before routes (routes use middleware)
- Controllers before routes (routes call controllers)
- Routes before integration with server (server imports routes)
- Implementation before testing

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T006)
- All Foundational utility/middleware tasks marked [P] can run in parallel (T016-T021)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within US1: T025 and T026 can run in parallel (different files)
- Within US2: T034 and T035 can run in parallel (different files)
- Within US3: T045 can run independently
- Within US4: T053 can run independently
- All Polish tasks marked [P] can run in parallel (T060-T066)

---

## Parallel Example: User Story 1

```bash
# Launch schema and middleware for User Story 1 together:
Task: "Create auth Zod schemas in backend/src/schemas/auth.schema.ts"
Task: "Create JWT authentication middleware in backend/src/middleware/auth.middleware.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T012)
2. Complete Phase 2: Foundational (T013-T024) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T025-T033)
4. **STOP and VALIDATE**: Test signup and login independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T024)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!) (T025-T033)
3. Add User Story 2 → Test independently → Deploy/Demo (T034-T044)
4. Add User Story 3 → Test independently → Deploy/Demo (T045-T052)
5. Add User Story 4 → Test independently → Deploy/Demo (T053-T059)
6. Add Polish → Final production-ready API (T060-T072)

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T024)
2. Once Foundational is done:
   - Developer A: User Story 1 (T025-T033)
   - Developer B: User Story 2 (T034-T044)
   - Developer C: User Story 3 (T045-T052)
   - Developer D: User Story 4 (T053-T059)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend structure: backend/src/ for all source code
- All endpoints use /api/v1/ prefix for versioning
- Consistent response format: { success, message, data } or { success, message, error }
- Password hashing: bcrypt with 10 rounds
- JWT expiration: configurable via JWT_EXPIRES_IN env variable
- Admin users must be created manually (no public admin signup endpoint)
- Trainer model is read-only (seeded manually, no CRUD endpoints in MVP)
