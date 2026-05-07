---

description: "Task list for IronPulse Gym Frontend implementation"
---

# Tasks: IronPulse Gym Frontend

**Input**: Design documents from `/specs/001-gym-frontend/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL for this feature - not explicitly requested in specification. Focus on implementation and manual testing.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend project**: `frontend/` at repository root
- All paths relative to `frontend/` directory
- Next.js App Router structure with `app/` directory

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create Next.js 15 project with TypeScript, App Router, and Tailwind CSS in frontend/ directory
- [x] T002 Install core dependencies: @tanstack/react-query, zustand, axios, react-hook-form, zod, @hookform/resolvers, framer-motion, lucide-react, sonner in frontend/package.json
- [x] T003 [P] Initialize ShadCN/UI and add components: button, card, input, label, dialog, calendar, select, toast in frontend/components/ui/
- [x] T004 [P] Create folder structure: frontend/components/{ui,layout,common,features,forms}, frontend/lib, frontend/hooks, frontend/store, frontend/types
- [x] T005 [P] Configure Tailwind for dark theme with red/orange accents in frontend/tailwind.config.ts
- [x] T006 [P] Create gym aesthetic styles in frontend/app/globals.css with dark background (#0a0a0a), gradient utilities
- [x] T007 [P] Create environment variables file frontend/.env.local with NEXT_PUBLIC_API_BASE_URL
- [x] T008 [P] Define TypeScript interfaces in frontend/types/index.ts (User, Plan, Booking, Trainer, ContactSubmission, API response types)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create TanStack Query provider in frontend/app/providers.tsx with QueryClientProvider and Toaster
- [x] T010 [P] Create Axios instance with interceptors in frontend/lib/api.ts (base URL, token attachment, 401 handling)
- [x] T011 [P] Create Zustand auth store in frontend/store/authStore.ts (user, token, isAuthenticated, login, logout, updateUser)
- [x] T012 [P] Create utility functions in frontend/lib/utils.ts (cn helper for class merging)
- [x] T013 [P] Define Zod validation schemas in frontend/lib/schemas.ts (loginSchema, signupSchema, bookingSchema, contactSchema, profileSchema)
- [x] T014 Update root layout in frontend/app/layout.tsx to include Providers wrapper and dark theme class
- [x] T015 Create Navbar component in frontend/components/layout/Navbar.tsx with logo, navigation links, auth-conditional buttons
- [x] T016 [P] Create Footer component in frontend/components/layout/Footer.tsx with copyright and links
- [x] T017 [P] Create MobileNav component in frontend/components/layout/MobileNav.tsx with hamburger menu
- [x] T018 Update root layout in frontend/app/layout.tsx to include Navbar and Footer
- [x] T019 [P] Create LoadingSpinner component in frontend/components/common/LoadingSpinner.tsx
- [x] T020 [P] Create ErrorMessage component in frontend/components/common/ErrorMessage.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Guest Browsing & Information Discovery (Priority: P1) 🎯 MVP

**Goal**: Enable potential gym members to browse public pages (Home, Plans, Trainers, Contact) and learn about IronPulse Gym offerings

**Independent Test**: Navigate through all public pages without authentication, verify content displays correctly and responsively at 375px, 768px, and 1440px breakpoints

### Implementation for User Story 1

- [x] T021 [P] [US1] Create home page in frontend/app/page.tsx with hero section, about section, feature highlights
- [x] T022 [P] [US1] Add trainers preview section to home page in frontend/app/page.tsx with 3-4 trainer cards
- [x] T023 [P] [US1] Add testimonials carousel to home page in frontend/app/page.tsx using Framer Motion
- [x] T024 [P] [US1] Add final CTA section to home page in frontend/app/page.tsx
- [x] T025 [P] [US1] Create Plans page in frontend/app/plans/page.tsx with page header
- [x] T026 [P] [US1] Create PlanCard component in frontend/components/features/PlanCard.tsx with title, price, duration, features list, hover animation
- [x] T027 [US1] Add plans grid to Plans page in frontend/app/plans/page.tsx displaying 3 plan tiers (Basic, Premium, Elite)
- [x] T028 [P] [US1] Create Trainers page in frontend/app/trainers/page.tsx with page header
- [x] T029 [P] [US1] Create TrainerCard component in frontend/components/features/TrainerCard.tsx with image, name, specialization, experience, bio
- [x] T030 [US1] Add trainers grid to Trainers page in frontend/app/trainers/page.tsx with 4-6 trainer profiles
- [x] T031 [P] [US1] Create Contact page in frontend/app/contact/page.tsx with page header and contact details
- [x] T032 [P] [US1] Create ContactForm component in frontend/components/forms/ContactForm.tsx with React Hook Form + Zod validation
- [x] T033 [US1] Add ContactForm, WhatsApp button, and Google Map embed to Contact page in frontend/app/contact/page.tsx
- [x] T034 [US1] Implement responsive design for all US1 pages (test at 375px, 768px, 1440px breakpoints)
- [x] T035 [US1] Add Framer Motion page transitions and scroll animations to all US1 pages

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (MVP complete!)

---

## Phase 4: User Story 2 - User Registration & Authentication (Priority: P2)

**Goal**: Enable users to create accounts, login, and access protected features with secure JWT authentication

**Independent Test**: Complete signup with valid credentials, logout, login again, verify dashboard access and token persistence

### Implementation for User Story 2

- [x] T036 [P] [US2] Create login page in frontend/app/(auth)/login/page.tsx with centered card layout
- [x] T037 [P] [US2] Create signup page in frontend/app/(auth)/signup/page.tsx with centered card layout
- [x] T038 [P] [US2] Create LoginForm component in frontend/components/forms/LoginForm.tsx with React Hook Form + Zod validation (email, password)
- [x] T039 [P] [US2] Create SignupForm component in frontend/components/forms/SignupForm.tsx with React Hook Form + Zod validation (name, email, password, confirmPassword)
- [x] T040 [US2] Integrate LoginForm with POST /auth/login API in frontend/components/forms/LoginForm.tsx using Axios (mock for now)
- [x] T041 [US2] Integrate SignupForm with POST /auth/signup API in frontend/components/forms/SignupForm.tsx using Axios (mock for now)
- [x] T042 [US2] Implement login success flow: store token in localStorage, update Zustand store, redirect to /dashboard in frontend/components/forms/LoginForm.tsx
- [x] T043 [US2] Implement signup success flow: store token in localStorage, update Zustand store, redirect to /dashboard in frontend/components/forms/SignupForm.tsx
- [x] T044 [US2] Add loading states (button disabled, spinner) to LoginForm in frontend/components/forms/LoginForm.tsx
- [x] T045 [US2] Add loading states (button disabled, spinner) to SignupForm in frontend/components/forms/SignupForm.tsx
- [x] T046 [US2] Add error handling with toast notifications (Sonner) to LoginForm in frontend/components/forms/LoginForm.tsx
- [x] T047 [US2] Add error handling with toast notifications (Sonner) to SignupForm in frontend/components/forms/SignupForm.tsx
- [x] T048 [US2] Implement logout functionality in Navbar: clear localStorage, reset Zustand store, redirect to home in frontend/components/layout/Navbar.tsx
- [x] T049 [US2] Add client-side route protection: redirect authenticated users from /login and /signup to /dashboard
- [x] T050 [US2] Add client-side route protection: redirect unauthenticated users from /dashboard to /login
- [x] T051 [US2] Update Navbar to show Dashboard link when authenticated, Login/Signup when not in frontend/components/layout/Navbar.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently (authentication complete)

---

## Phase 5: User Story 3 - Member Dashboard & Profile Management (Priority: P3)

**Goal**: Provide authenticated members with personalized dashboard showing active plan, bookings, and profile management

**Independent Test**: Login as member, verify dashboard displays user data, bookings list, and allows profile updates

### Implementation for User Story 3

- [x] T052 [P] [US3] Create dashboard page in frontend/app/dashboard/page.tsx with protected route wrapper
- [x] T053 [P] [US3] Create useAuth hook in frontend/hooks/useAuth.ts to access Zustand auth store
- [x] T054 [P] [US3] Create useBookings hook in frontend/hooks/useBookings.ts using TanStack Query to fetch GET /bookings
- [x] T055 [US3] Add welcome section to dashboard with user name in frontend/app/dashboard/page.tsx
- [x] T056 [US3] Add active plan card to dashboard (displays plan details if user has active booking) in frontend/app/dashboard/page.tsx
- [x] T057 [US3] Add upcoming bookings section to dashboard using useBookings hook in frontend/app/dashboard/page.tsx
- [x] T058 [US3] Add booking history table to dashboard (past bookings with date, plan, status) in frontend/app/dashboard/page.tsx
- [x] T059 [P] [US3] Create profile edit form component in frontend/app/dashboard/page.tsx with React Hook Form + Zod (name, email fields)
- [x] T060 [US3] Integrate profile update with PUT /user/profile API in frontend/app/dashboard/page.tsx
- [x] T061 [US3] Add loading states (skeletons) for dashboard data fetching in frontend/app/dashboard/page.tsx
- [x] T062 [US3] Add error handling with toast notifications for profile updates in frontend/app/dashboard/page.tsx
- [x] T063 [US3] Add "Book New Session" button to dashboard that opens BookingModal (placeholder for US4) in frontend/app/dashboard/page.tsx

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently (dashboard complete)

---

## Phase 6: User Story 4 - Membership Plan Selection & Booking (Priority: P4)

**Goal**: Enable authenticated members to select plans and book gym sessions with date selection

**Independent Test**: Login, click "Select Plan" on Plans page, choose date in modal, confirm booking, verify it appears in dashboard

### Implementation for User Story 4

- [x] T064 [P] [US4] Create usePlans hook in frontend/hooks/usePlans.ts using TanStack Query to fetch GET /plans
- [x] T065 [US4] Update Plans page to fetch plans using usePlans hook in frontend/app/plans/page.tsx
- [x] T066 [P] [US4] Create BookingModal component in frontend/components/features/BookingModal.tsx with Dialog from ShadCN
- [x] T067 [P] [US4] Add selected plan display section to BookingModal in frontend/components/features/BookingModal.tsx
- [x] T068 [P] [US4] Add date picker (Calendar component) to BookingModal in frontend/components/features/BookingModal.tsx
- [x] T069 [P] [US4] Add time slot selection (optional, can be placeholder) to BookingModal in frontend/components/features/BookingModal.tsx
- [x] T070 [P] [US4] Add booking form with React Hook Form + Zod validation to BookingModal in frontend/components/features/BookingModal.tsx
- [x] T071 [US4] Integrate BookingModal with POST /bookings API in frontend/components/features/BookingModal.tsx
- [x] T072 [US4] Add "Select Plan" button to PlanCard that opens BookingModal with pre-selected plan in frontend/components/features/PlanCard.tsx
- [x] T073 [US4] Add booking success flow: show toast, close modal, invalidate bookings query in frontend/components/features/BookingModal.tsx
- [x] T074 [US4] Add loading state (button disabled, spinner) during booking creation in frontend/components/features/BookingModal.tsx
- [x] T075 [US4] Add error handling with toast notifications for booking failures in frontend/components/features/BookingModal.tsx
- [x] T076 [US4] Add validation: prevent booking dates in the past in frontend/components/features/BookingModal.tsx
- [x] T077 [US4] Connect "Book New Session" button in Dashboard to open BookingModal in frontend/app/dashboard/page.tsx
- [ ] T078 [US4] Test complete booking flow: Plans page → Select Plan → BookingModal → Confirm → Dashboard shows new booking

**Checkpoint**: At this point, all core user stories (1-4) should work independently (booking flow complete)

---

## Phase 7: User Story 5 - Contact & Communication (Priority: P5)

**Goal**: Enable users (guest or member) to contact gym through form submission and WhatsApp

**Independent Test**: Fill contact form with valid data, submit, verify success notification; test WhatsApp button opens correct link

### Implementation for User Story 5

- [x] T079 [US5] Integrate ContactForm with POST /contact API in frontend/components/forms/ContactForm.tsx
- [x] T080 [US5] Add loading state (button disabled, spinner) during form submission in frontend/components/forms/ContactForm.tsx
- [x] T081 [US5] Add success toast notification after successful submission in frontend/components/forms/ContactForm.tsx
- [x] T082 [US5] Add error handling with toast notifications for submission failures in frontend/components/forms/ContactForm.tsx
- [x] T083 [US5] Add WhatsApp button with pre-filled message link to Contact page in frontend/app/contact/page.tsx
- [x] T084 [US5] Add Google Maps embed (iframe) to Contact page in frontend/app/contact/page.tsx
- [x] T085 [US5] Test complete contact flow: fill form → submit → success notification

**Checkpoint**: All user stories (1-5) should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T086 [P] Add loading skeletons for Plans page in frontend/app/plans/page.tsx
- [ ] T087 [P] Add loading skeletons for Trainers page in frontend/app/trainers/page.tsx
- [ ] T088 [P] Add loading skeletons for Dashboard bookings in frontend/app/dashboard/page.tsx
- [ ] T089 [P] Improve Framer Motion animations across all pages (page transitions, card hover effects, modal animations)
- [ ] T090 [P] Add scroll animations to home page sections using Framer Motion in frontend/app/page.tsx
- [ ] T091 [P] Verify responsive design at all breakpoints (375px, 768px, 1440px) for all pages
- [ ] T092 [P] Add focus indicators for keyboard navigation on all interactive elements
- [ ] T093 [P] Add ARIA labels to all custom components for screen reader accessibility
- [ ] T094 [P] Optimize images using Next.js Image component across all pages
- [ ] T095 [P] Implement lazy loading for below-fold content on home page
- [ ] T096 [P] Add error boundaries for graceful error handling in frontend/app/layout.tsx
- [ ] T097 [P] Configure TanStack Query staleTime and cacheTime appropriately in frontend/app/providers.tsx
- [ ] T098 Code cleanup: remove console.logs, unused imports, format with Prettier
- [ ] T099 Run TypeScript type checking: npm run type-check (ensure no errors)
- [ ] T100 Run ESLint: npm run lint (fix all warnings)
- [ ] T101 Manual testing: Complete user journey from homepage → signup → booking → dashboard
- [ ] T102 Accessibility audit: Run Lighthouse and achieve 90% accessibility score

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P3)**: Depends on User Story 2 (authentication required for dashboard access)
- **User Story 4 (P4)**: Depends on User Story 2 (authentication required) and benefits from User Story 3 (dashboard to view bookings)
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - No dependencies on other stories (works for guests and members)

### Within Each User Story

- Setup tasks (Phase 1) can run in parallel
- Foundational tasks (Phase 2) marked [P] can run in parallel within the phase
- Within user story phases: tasks marked [P] can run in parallel
- Tasks without [P] depend on previous tasks in the same story completing
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T008)
- All Foundational tasks marked [P] can run in parallel (T010-T013, T016-T017, T019-T020)
- Once Foundational phase completes, User Stories 1, 2, and 5 can start in parallel (independent)
- User Story 3 can start once User Story 2 completes
- User Story 4 can start once User Story 2 completes (or wait for US3 for better UX)
- Within each user story, tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all parallel tasks for User Story 1 together:
Task T021: Create home page structure
Task T022: Add trainers preview section
Task T023: Add testimonials carousel
Task T024: Add CTA section
Task T025: Create Plans page
Task T026: Create PlanCard component
Task T028: Create Trainers page
Task T029: Create TrainerCard component
Task T031: Create Contact page
Task T032: Create ContactForm component

# Then sequential tasks:
Task T027: Add plans grid (depends on T025, T026)
Task T030: Add trainers grid (depends on T028, T029)
Task T033: Add form and map to Contact page (depends on T031, T032)
Task T034: Implement responsive design (depends on all pages)
Task T035: Add animations (depends on all pages)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Guest Browsing)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Authentication added)
4. Add User Story 3 → Test independently → Deploy/Demo (Dashboard added)
5. Add User Story 4 → Test independently → Deploy/Demo (Booking flow added)
6. Add User Story 5 → Test independently → Deploy/Demo (Contact added)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Guest Browsing)
   - Developer B: User Story 2 (Authentication)
   - Developer C: User Story 5 (Contact - independent)
3. After US2 completes:
   - Developer B: User Story 3 (Dashboard)
   - Developer A: User Story 4 (Booking)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are OPTIONAL - not explicitly requested in spec, focus on manual testing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths are relative to `frontend/` directory
- Use Next.js App Router conventions (app/ directory, page.tsx files)
- Follow constitution principles: TypeScript strict mode, Zod validation, responsive design, accessibility
