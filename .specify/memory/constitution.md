<!--
Sync Impact Report:
- Version Change: Initial → 1.0.0
- Modified Principles: N/A (initial creation)
- Added Sections: All core principles, Technology Standards, Development Workflow, Governance
- Removed Sections: None
- Templates Status:
  ✅ constitution.md (this file)
  ⚠ plan-template.md (review recommended)
  ⚠ spec-template.md (review recommended)
  ⚠ tasks-template.md (review recommended)
- Follow-up TODOs: None
-->

# IronPulse Gym Constitution

## Core Principles

### I. Security-First Development
All authentication, authorization, and data handling MUST follow security best practices. This includes:
- Password hashing with bcrypt (minimum 10 rounds)
- JWT token-based authentication with secure secret keys
- Input validation on both frontend and backend using Zod schemas
- Protected API routes with middleware verification
- Environment variables for all secrets (never hardcoded)
- CORS configured to allow only trusted frontend origins
- SQL injection prevention through Prisma ORM parameterized queries

**Rationale**: Security vulnerabilities can compromise user data and trust. A breach in a gym management system exposes personal information, payment details, and booking history.

### II. Type Safety & Validation
TypeScript MUST be used throughout the stack with strict mode enabled. All data crossing boundaries (API requests, database queries, form inputs) MUST be validated.
- Frontend: Zod schemas for form validation before submission
- Backend: Zod schemas for request body/params validation
- Database: Prisma schema as single source of truth for data models
- No `any` types except when interfacing with untyped third-party libraries (must be documented)
- API response types shared between frontend and backend

**Rationale**: Type safety catches errors at compile time, reduces runtime bugs, and improves developer experience. Validation prevents malformed data from corrupting the system.

### III. User Experience Excellence
Every user interaction MUST provide clear feedback and handle edge cases gracefully.
- Loading states for all async operations (skeletons, spinners)
- Error messages that are user-friendly and actionable
- Toast notifications for success/error feedback
- Responsive design tested on mobile (375px), tablet (768px), and desktop (1440px)
- Smooth animations using Framer Motion (max 300ms duration)
- Form validation with inline error messages
- Accessibility: semantic HTML, ARIA labels, keyboard navigation

**Rationale**: Users expect modern web applications to be fast, responsive, and intuitive. Poor UX leads to abandonment and negative reviews.

### IV. API Contract Integrity
All API endpoints MUST have explicit contracts defined before implementation.
- Request/response schemas documented in code comments or OpenAPI spec
- Consistent error response format: `{ success: false, error: string, code?: string }`
- Consistent success response format: `{ success: true, data: T }`
- HTTP status codes used correctly (200, 201, 400, 401, 403, 404, 500)
- Versioning strategy: `/api/v1/...` for future-proofing
- No breaking changes to existing endpoints without version bump

**Rationale**: Clear contracts prevent frontend-backend miscommunication, enable parallel development, and make debugging easier.

### V. Test-Driven Development (TDD)
Critical paths MUST have automated tests before deployment to production.
- Authentication flows (signup, login, token refresh)
- Booking creation and validation logic
- Admin CRUD operations for plans
- Database constraints and cascading deletes
- API endpoint integration tests
- Frontend component tests for forms and critical UI

**Rationale**: Tests catch regressions early, document expected behavior, and enable confident refactoring. For a portfolio/freelancing project, tests demonstrate professionalism.

### VI. Performance & Scalability
The application MUST load quickly and handle concurrent users efficiently.
- Frontend: Code splitting, lazy loading, image optimization
- Backend: Database indexes on frequently queried fields (email, userId, planId)
- API response time target: <200ms for simple queries, <500ms for complex operations
- Database connection pooling configured
- TanStack Query for client-side caching and request deduplication
- Pagination for list endpoints (bookings, plans if >20 items)

**Rationale**: Slow applications frustrate users and hurt SEO. Scalability ensures the system can grow from MVP to production without rewrites.

## Technology Standards

### Mandatory Stack Components
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, ShadCN/UI
- **Backend**: Node.js, Express.js, Prisma ORM, PostgreSQL (Neon)
- **Authentication**: JWT with bcryptjs
- **Validation**: Zod (both frontend and backend)
- **State Management**: TanStack Query (server state), Zustand (client state)
- **Deployment**: Vercel (frontend), Render/Railway (backend), Neon (database)

### Code Style & Formatting
- ESLint + Prettier configured and enforced
- Consistent naming: camelCase (variables/functions), PascalCase (components/types), UPPER_SNAKE_CASE (constants)
- File naming: kebab-case for utilities, PascalCase for React components
- Maximum function length: 50 lines (extract helpers if longer)
- Maximum file length: 300 lines (split into modules if longer)

### Git Workflow
- Branch naming: `feature/description`, `fix/description`, `refactor/description`
- Commit messages: Conventional Commits format (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`)
- No direct commits to `main` branch
- Pull requests require: passing tests, code review, no merge conflicts

## Development Workflow

### Feature Development Process
1. **Specification**: Write or update spec in `specs/<feature>/spec.md`
2. **Planning**: Create architecture plan in `specs/<feature>/plan.md`
3. **Tasks**: Break down into testable tasks in `specs/<feature>/tasks.md`
4. **Implementation**: Follow TDD cycle (Red → Green → Refactor)
5. **Review**: Self-review checklist + peer review
6. **Deployment**: Merge to main → auto-deploy to staging → manual promotion to production

### Code Review Checklist
- [ ] TypeScript strict mode passes with no errors
- [ ] All new code has corresponding tests
- [ ] API contracts match documentation
- [ ] Error handling covers edge cases
- [ ] Loading states implemented for async operations
- [ ] Responsive design verified on mobile/tablet/desktop
- [ ] No hardcoded secrets or sensitive data
- [ ] Database migrations tested (up and down)
- [ ] Performance: no N+1 queries, proper indexes used

### Quality Gates
- **Pre-commit**: ESLint, Prettier, TypeScript compilation
- **Pre-push**: Unit tests pass
- **Pre-merge**: Integration tests pass, code review approved
- **Pre-production**: Manual QA on staging environment

## Governance

This constitution is the authoritative source for all development decisions in the IronPulse Gym project. All code, architecture, and process decisions MUST align with these principles.

### Amendment Process
1. Propose amendment with rationale in GitHub issue or team discussion
2. Document impact on existing code and templates
3. Update constitution with version bump (semantic versioning)
4. Update dependent templates and documentation
5. Communicate changes to all team members
6. Create migration plan if breaking changes introduced

### Versioning Policy
- **MAJOR** (X.0.0): Backward-incompatible principle changes, removed principles
- **MINOR** (x.Y.0): New principles added, significant expansions to existing principles
- **PATCH** (x.y.Z): Clarifications, typo fixes, non-semantic refinements

### Compliance Review
- All pull requests MUST reference this constitution in review comments
- Monthly constitution review to ensure principles remain relevant
- Violations of security or validation principles block merge
- Violations of UX or performance principles require justification and tracking issue

### Runtime Guidance
For day-to-day development guidance and agent instructions, refer to `CLAUDE.md` in the project root. The constitution defines WHAT we build; CLAUDE.md defines HOW we build it.

**Version**: 1.0.0 | **Ratified**: 2026-04-20 | **Last Amended**: 2026-04-20
