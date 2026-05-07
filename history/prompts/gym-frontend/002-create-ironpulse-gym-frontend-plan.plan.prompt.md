---
id: 002
title: Create IronPulse Gym Frontend Plan
stage: plan
date: 2026-04-20
surface: agent
model: claude-sonnet-4-6
feature: gym-frontend
branch: 001-gym-frontend
user: Fahadkhanreal
command: /sp.plan
labels: ["plan", "architecture", "frontend", "nextjs", "design"]
links:
  spec: specs/001-gym-frontend/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-gym-frontend/plan.md
  - specs/001-gym-frontend/research.md
  - specs/001-gym-frontend/data-model.md
  - specs/001-gym-frontend/quickstart.md
  - specs/001-gym-frontend/contracts/auth.yaml
  - specs/001-gym-frontend/contracts/plans.yaml
  - specs/001-gym-frontend/contracts/bookings.yaml
  - specs/001-gym-frontend/contracts/profile.yaml
  - specs/001-gym-frontend/contracts/contact.yaml
  - CLAUDE.md (updated with tech stack)
tests:
  - none
---

## Prompt

[User provided detailed development plan in Urdu/English mix describing 8 phases of frontend development with timeline, best practices, and recommendations for Claude CLI usage]

## Response snapshot

Created comprehensive implementation plan for IronPulse Gym frontend with complete Phase 0 (Research) and Phase 1 (Design & Contracts) artifacts.

**Technical Context Defined**:
- Language: TypeScript 5.x with Next.js 15 (App Router), React 18+
- Stack: Tailwind CSS, ShadCN/UI, Framer Motion, TanStack Query, Zustand, Axios, React Hook Form, Zod, Sonner, Lucide React
- Testing: Jest + React Testing Library (unit), Playwright (E2E)
- Performance: <2s load on 3G, <300ms interaction, 60fps animations, <45s signup-to-booking
- Constraints: Mobile-first (375px/768px/1440px), dark theme, JWT localStorage, 90% Lighthouse accessibility

**Constitution Check Results**: ✅ CONDITIONAL PASS
- All 6 principles validated (Security, Type Safety, UX, API Contracts, TDD, Performance)
- 3 conditions: Define test strategy, document API versioning, clarify backend authorization
- No complexity violations

**Project Structure**: Next.js 15 App Router with organized component hierarchy (ui, layout, common, features, forms), hooks for data fetching, Zustand store for auth, centralized types, test structure mirroring components.

**Phase 0 - Research.md**: Documented 8 technology decisions with rationale and alternatives:
1. Next.js 15 App Router (vs Pages Router, Vite+React, Remix)
2. Tailwind + ShadCN/UI (vs Material-UI, Chakra, CSS Modules)
3. Zustand + TanStack Query (vs Redux, Context API, SWR)
4. React Hook Form + Zod (vs Formik, Yup, manual validation)
5. Axios with interceptors (vs Fetch API, ky)
6. Framer Motion (vs CSS transitions, GSAP, React Spring)
7. JWT localStorage (vs httpOnly cookies - noted as future improvement)
8. Jest + Playwright testing (vs other frameworks)

Also documented architecture patterns (component organization, data fetching, authentication), performance optimizations (image optimization, code splitting, caching), accessibility requirements (WCAG 2.1 AA), development workflow, and risk mitigations.

**Phase 1 - Design Artifacts**:

1. **data-model.md**: Defined 5 core entities (User, Plan, Booking, Trainer, ContactSubmission) with TypeScript interfaces, validation rules, relationships, API response types, form input types, client state types (Zustand), Zod validation schemas, type guards, and data flow diagrams.

2. **API Contracts** (5 OpenAPI 3.0 specs):
   - auth.yaml: POST /auth/signup, POST /auth/login
   - plans.yaml: GET/POST/PUT/DELETE /plans, GET /plans/:id
   - bookings.yaml: GET/POST /bookings, GET/DELETE /bookings/:id
   - profile.yaml: GET/PUT /user/profile
   - contact.yaml: POST /contact
   
   All contracts include request/response schemas, error formats, status codes, authentication requirements, and examples.

3. **quickstart.md**: Complete setup guide with 12 steps for Phase 0 (project setup), detailed instructions for Phase 1 (layout & navigation), development workflow, testing strategy, git workflow, troubleshooting, performance optimization, accessibility checklist, and resources.

**Agent Context Updated**: CLAUDE.md updated with TypeScript, Next.js 15, and full frontend stack for context-aware assistance.

## Outcome

- ✅ Impact: Created production-ready implementation plan with complete research, data models, API contracts, and quickstart guide for IronPulse Gym frontend
- 🧪 Tests: Test strategy defined in research.md (Jest + React Testing Library for unit/component, Playwright for E2E, 80% coverage target for critical paths)
- 📁 Files: Created plan.md, research.md, data-model.md, quickstart.md, 5 API contract files (auth, plans, bookings, profile, contact), updated CLAUDE.md
- 🔁 Next prompts: /sp.tasks to generate detailed task breakdown with dependencies and execution order
- 🧠 Reflection: Planning phase successfully translates technology-agnostic spec into concrete technical architecture. Constitution check identified 3 conditions (test strategy, API versioning, backend authorization) - all addressed in research and contracts. Technology choices align with constitution principles (security, type safety, UX, performance). Ready for task generation.

## Evaluation notes (flywheel)

- Failure modes observed: None - planning completed successfully with all required artifacts
- Graders run and results (PASS/FAIL): Constitution Check CONDITIONAL PASS (3 conditions addressed in Phase 0/1), all 6 principles validated, no complexity violations
- Prompt variant (if applicable): Standard /sp.plan workflow with detailed user input providing development roadmap
- Next experiment (smallest change to try): Monitor whether task generation (/sp.tasks) properly maps user stories from spec to implementation phases from plan, maintaining traceability and ensuring no scope gaps
