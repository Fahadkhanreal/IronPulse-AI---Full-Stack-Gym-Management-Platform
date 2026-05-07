# Implementation Plan: IronPulse Gym Frontend

**Branch**: `001-gym-frontend` | **Date**: 2026-04-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-gym-frontend/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a modern, dark-themed, responsive frontend for IronPulse Gym using Next.js 15 App Router with TypeScript. The application enables guest users to browse gym information (home, plans, trainers, contact), authenticated members to signup/login, view their dashboard with active plans and booking history, and book gym sessions by selecting membership plans and dates. Technical approach: Component-based architecture with ShadCN/UI for consistent design system, Zustand for client state (auth), TanStack Query for server state (plans, bookings), Axios with interceptors for API communication, React Hook Form + Zod for form validation, and Framer Motion for smooth animations. Mobile-first responsive design targeting 375px (mobile), 768px (tablet), and 1440px+ (desktop) breakpoints.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 15 (App Router), React 18+  
**Primary Dependencies**: Next.js 15, Tailwind CSS 3.x, ShadCN/UI, Framer Motion, TanStack Query (React Query), Zustand, Axios, React Hook Form, Zod, Sonner (toast notifications), Lucide React (icons)  
**Storage**: N/A (frontend only - backend API handles data persistence)  
**Testing**: Jest + React Testing Library for component tests, Playwright for E2E tests (constitution requires tests for critical paths)  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - last 2 versions), responsive design for mobile/tablet/desktop
**Project Type**: Web application (frontend only - single-page application with client-side routing)  
**Performance Goals**: <2s initial page load on 3G, <300ms interaction response time, 60fps animations, <45s complete signup-to-booking flow  
**Constraints**: Mobile-first responsive (375px/768px/1440px breakpoints), dark theme only, JWT token-based auth with localStorage, client-side route protection, accessibility (90% Lighthouse score)  
**Scale/Scope**: ~6 main pages (Home, Plans, Trainers, Contact, Login/Signup, Dashboard), ~15-20 reusable components, 5 user stories (P1-P5), authentication + booking flows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Security-First Development
- ✅ **PASS**: JWT tokens stored in localStorage (acceptable for MVP, httpOnly cookies noted as future improvement)
- ✅ **PASS**: Zod validation on all forms before API submission
- ✅ **PASS**: No secrets in frontend code (API base URL from environment variables)
- ✅ **PASS**: Axios interceptors handle token attachment and 401 auto-logout
- ⚠️ **REVIEW**: Client-side route protection (acceptable for UX, backend must enforce authorization)

### Principle II: Type Safety & Validation
- ✅ **PASS**: TypeScript strict mode throughout
- ✅ **PASS**: Zod schemas for all form validation (signup, login, booking, contact, profile)
- ✅ **PASS**: Shared types for API request/response (types/index.ts)
- ✅ **PASS**: No `any` types policy enforced

### Principle III: User Experience Excellence
- ✅ **PASS**: Loading states required for all async operations (skeletons, spinners)
- ✅ **PASS**: Toast notifications for success/error feedback (Sonner)
- ✅ **PASS**: Responsive design at 375px/768px/1440px breakpoints
- ✅ **PASS**: Framer Motion animations (max 300ms duration per constitution)
- ✅ **PASS**: Form validation with inline error messages (React Hook Form)
- ✅ **PASS**: Accessibility requirements (semantic HTML, ARIA labels, keyboard navigation, 90% Lighthouse target)

### Principle IV: API Contract Integrity
- ✅ **PASS**: API contracts defined in spec (auth, plans, bookings, profile, contact endpoints)
- ✅ **PASS**: Consistent error/success response formats expected from backend
- ✅ **PASS**: Axios instance with base URL configuration
- ⚠️ **REVIEW**: API versioning (/api/v1/) - frontend should use versioned endpoints

### Principle V: Test-Driven Development
- ⚠️ **REVIEW**: Tests required for authentication flows, booking logic, critical forms
- ⚠️ **REVIEW**: Component tests for forms (LoginForm, SignupForm, BookingModal, ContactForm)
- ⚠️ **REVIEW**: E2E tests for complete user journeys (signup → login → booking)
- **ACTION**: Test strategy must be defined in Phase 1 (quickstart.md)

### Principle VI: Performance & Scalability
- ✅ **PASS**: Next.js Image component for optimization
- ✅ **PASS**: Code splitting and lazy loading (Next.js App Router default)
- ✅ **PASS**: TanStack Query for caching and request deduplication
- ✅ **PASS**: Performance targets defined (<2s load, <300ms interaction, 60fps)
- ✅ **PASS**: Responsive images and lazy loading for below-fold content

### Technology Standards Compliance
- ✅ **PASS**: Next.js 15 (App Router), TypeScript, Tailwind CSS, ShadCN/UI (all mandatory stack components)
- ✅ **PASS**: TanStack Query (server state), Zustand (client state) as specified
- ✅ **PASS**: Vercel deployment target (frontend)

### Gate Summary
**Status**: ✅ **CONDITIONAL PASS** - Proceed with Phase 0 research

**Conditions**:
1. Define test strategy in Phase 1 (unit tests for forms, E2E tests for critical flows)
2. Document API versioning approach in contracts/
3. Clarify backend authorization enforcement (frontend route protection is UX only)

**No Complexity Violations**: All architecture decisions align with constitution principles

## Project Structure

### Documentation (this feature)

```text
specs/001-gym-frontend/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── auth.yaml        # Authentication endpoints
│   ├── plans.yaml       # Membership plans endpoints
│   ├── bookings.yaml    # Booking endpoints
│   ├── profile.yaml     # User profile endpoints
│   └── contact.yaml     # Contact form endpoint
├── checklists/
│   └── requirements.md  # Spec quality validation (already created)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
frontend/
├── app/
│   ├── (auth)/                    # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── signup/
│   │       └── page.tsx          # Signup page
│   ├── dashboard/
│   │   └── page.tsx              # Protected dashboard page
│   ├── plans/
│   │   └── page.tsx              # Membership plans page
│   ├── trainers/
│   │   └── page.tsx              # Trainers showcase page
│   ├── contact/
│   │   └── page.tsx              # Contact page
│   ├── layout.tsx                # Root layout with Navbar/Footer
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles + dark theme
├── components/
│   ├── ui/                       # ShadCN/UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── calendar.tsx
│   │   └── ...                   # Other ShadCN components
│   ├── layout/
│   │   ├── Navbar.tsx            # Main navigation
│   │   ├── Footer.tsx            # Site footer
│   │   └── MobileNav.tsx         # Mobile hamburger menu
│   ├── common/
│   │   ├── LoadingSpinner.tsx    # Loading indicator
│   │   ├── ErrorMessage.tsx      # Error display
│   │   └── PageHeader.tsx        # Page title component
│   ├── features/
│   │   ├── PlanCard.tsx          # Membership plan card
│   │   ├── TrainerCard.tsx       # Trainer profile card
│   │   ├── BookingModal.tsx      # Booking dialog
│   │   └── TestimonialCard.tsx   # Testimonial display
│   └── forms/
│       ├── LoginForm.tsx         # Login form with validation
│       ├── SignupForm.tsx        # Signup form with validation
│       └── ContactForm.tsx       # Contact form with validation
├── lib/
│   ├── api.ts                    # Axios instance + interceptors
│   ├── utils.ts                  # Utility functions (cn, etc.)
│   └── constants.ts              # App constants
├── hooks/
│   ├── useAuth.ts                # Authentication hook
│   ├── useBookings.ts            # Bookings data hook (TanStack Query)
│   └── usePlans.ts               # Plans data hook (TanStack Query)
├── store/
│   └── authStore.ts              # Zustand auth state
├── types/
│   └── index.ts                  # TypeScript interfaces/types
├── __tests__/                    # Test files
│   ├── components/
│   │   ├── LoginForm.test.tsx
│   │   ├── SignupForm.test.tsx
│   │   └── BookingModal.test.tsx
│   └── e2e/
│       ├── auth-flow.spec.ts
│       └── booking-flow.spec.ts
├── public/
│   └── images/                   # Static assets
├── .env.local                    # Environment variables
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

**Structure Decision**: Selected Next.js 15 App Router structure (web application, frontend only). This structure follows Next.js conventions with:
- **App Router** (`app/`) for file-based routing with layouts
- **Route groups** (`(auth)/`) for organizing related pages without affecting URL structure
- **Component organization** by purpose (ui, layout, common, features, forms) for maintainability
- **Separation of concerns**: hooks for data fetching, store for client state, lib for utilities
- **Type safety**: Centralized types in `types/index.ts` shared across components
- **Testing structure**: Mirrors component structure with unit and E2E tests

This is a frontend-only implementation. Backend API is separate and out of scope for this feature.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations** - All architecture decisions align with constitution principles. No complexity tracking required.
