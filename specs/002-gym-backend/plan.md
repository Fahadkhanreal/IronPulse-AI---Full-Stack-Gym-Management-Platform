# Implementation Plan: IronPulse Gym Backend API

**Branch**: `002-gym-backend` | **Date**: 2026-04-20 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-gym-backend/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a secure, scalable RESTful API backend for IronPulse Gym using Node.js, Express.js, TypeScript, and Prisma ORM with PostgreSQL. The API provides JWT-based authentication, membership plan management, session booking system, and user profile management. Technical approach: Clean architecture with controllers, routes, and middleware layers; Zod validation for all inputs; bcrypt password hashing; stateless JWT authentication; Prisma for type-safe database operations; consistent JSON response format across all endpoints.

## Technical Context

**Language/Version**: TypeScript 5.x with Node.js LTS (v20+), strict mode enabled  
**Primary Dependencies**: Express.js 4.x, Prisma 5.x, Zod 3.x, bcryptjs, jsonwebtoken, helmet, cors, dotenv  
**Storage**: PostgreSQL 15+ (hosted on Neon cloud), Prisma ORM for database access  
**Testing**: Jest + Supertest for API integration tests, Prisma test database for isolated testing  
**Target Platform**: Node.js server environment (Linux/Docker), deployed on Render or Railway  
**Project Type**: Web API (backend only) - RESTful JSON API with Express.js  
**Performance Goals**: <500ms response time for simple queries, <2s for authentication operations, handle 100+ concurrent requests  
**Constraints**: Stateless authentication (JWT), no server-side session storage, CORS restricted to frontend domain, rate limiting on auth endpoints  
**Scale/Scope**: 4 main controllers (auth, user, plan, booking), ~15 API endpoints, 4 database models, JWT middleware for protected routes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Security-First Development
- ✅ **PASS**: Password hashing with bcrypt (minimum 10 rounds) - implemented in auth controller
- ✅ **PASS**: JWT token-based authentication with secure secret keys from environment variables
- ✅ **PASS**: Input validation using Zod schemas on all endpoints
- ✅ **PASS**: Protected API routes with JWT middleware verification
- ✅ **PASS**: Environment variables for all secrets (JWT_SECRET, DATABASE_URL)
- ✅ **PASS**: CORS configured to allow only trusted frontend origin
- ✅ **PASS**: SQL injection prevention through Prisma ORM parameterized queries

### Principle II: Type Safety & Validation
- ✅ **PASS**: TypeScript strict mode throughout backend
- ✅ **PASS**: Zod schemas for request body/params validation on all endpoints
- ✅ **PASS**: Prisma schema as single source of truth for data models
- ✅ **PASS**: No `any` types policy enforced
- ✅ **PASS**: API response types defined and consistent

### Principle III: User Experience Excellence
- ✅ **PASS**: Error messages are user-friendly and actionable (not technical stack traces)
- ✅ **PASS**: Consistent response format for success and error cases
- ✅ **PASS**: Clear validation error messages with field-specific feedback

### Principle IV: API Contract Integrity
- ✅ **PASS**: Request/response schemas documented in contracts/ directory
- ✅ **PASS**: Consistent error response format: `{ success: false, message: string, error?: string }`
- ✅ **PASS**: Consistent success response format: `{ success: true, message: string, data: T }`
- ✅ **PASS**: HTTP status codes used correctly (200, 201, 400, 401, 403, 404, 500)
- ✅ **PASS**: Versioning strategy: `/api/v1/...` prefix for all routes
- ✅ **PASS**: No breaking changes without version bump

### Principle V: Test-Driven Development
- ⚠️ **REVIEW**: Tests required for authentication flows (signup, login, token validation)
- ⚠️ **REVIEW**: Tests required for booking creation and validation logic
- ⚠️ **REVIEW**: Tests required for admin CRUD operations on plans
- ⚠️ **REVIEW**: Database constraints and cascading deletes must be tested
- **ACTION**: Test strategy must be defined in Phase 1 (quickstart.md)

### Principle VI: Performance & Scalability
- ✅ **PASS**: Database indexes on frequently queried fields (email, userId, planId)
- ✅ **PASS**: API response time target: <500ms for simple queries
- ✅ **PASS**: Database connection pooling configured via Prisma
- ✅ **PASS**: Pagination support planned for list endpoints (future enhancement)

### Technology Standards Compliance
- ✅ **PASS**: Backend uses Node.js, Express.js, Prisma ORM, PostgreSQL (Neon) as specified
- ✅ **PASS**: JWT with bcryptjs for authentication
- ✅ **PASS**: Zod for validation
- ✅ **PASS**: Deployment target: Render/Railway

### Gate Summary
**Status**: ✅ **CONDITIONAL PASS** - Proceed with Phase 0 research

**Conditions**:
1. Define test strategy in Phase 1 (integration tests for critical paths)
2. Document rate limiting approach (infrastructure vs application level)
3. Clarify admin user creation process (manual database seeding vs admin endpoint)

**No Complexity Violations**: All architecture decisions align with constitution principles

## Project Structure

### Documentation (this feature)

```text
specs/002-gym-backend/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── auth.yaml        # Authentication endpoints (signup, login)
│   ├── plans.yaml       # Plans CRUD endpoints
│   ├── bookings.yaml    # Bookings CRUD endpoints
│   └── user.yaml        # User profile endpoints
├── checklists/
│   └── requirements.md  # Spec quality validation (already created)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts      # Signup, login logic
│   │   ├── user.controller.ts      # Profile get/update
│   │   ├── plan.controller.ts      # Plans CRUD (admin)
│   │   └── booking.controller.ts   # Bookings CRUD
│   ├── routes/
│   │   ├── auth.routes.ts          # POST /api/v1/auth/signup, /login
│   │   ├── user.routes.ts          # GET/PUT /api/v1/user/profile
│   │   ├── plan.routes.ts          # CRUD /api/v1/plans
│   │   └── booking.routes.ts       # CRUD /api/v1/bookings
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT verification
│   │   ├── error.middleware.ts     # Global error handler
│   │   ├── validate.middleware.ts  # Zod validation wrapper
│   │   └── admin.middleware.ts     # Admin role check
│   ├── utils/
│   │   ├── response.ts             # Standard response helpers
│   │   ├── jwt.ts                  # JWT sign/verify utilities
│   │   └── password.ts             # Bcrypt hash/compare utilities
│   ├── schemas/
│   │   ├── auth.schema.ts          # Zod schemas for signup/login
│   │   ├── user.schema.ts          # Zod schemas for profile update
│   │   ├── plan.schema.ts          # Zod schemas for plan CRUD
│   │   └── booking.schema.ts       # Zod schemas for booking CRUD
│   ├── config/
│   │   └── prisma.ts               # Prisma client singleton
│   ├── types/
│   │   └── express.d.ts            # Extended Express types (req.user)
│   └── server.ts                   # Express app setup and startup
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── migrations/                 # Auto-generated migrations
│   └── seed.ts                     # Optional seed data (plans, trainers)
├── tests/
│   ├── integration/
│   │   ├── auth.test.ts            # Auth endpoints tests
│   │   ├── plans.test.ts           # Plans endpoints tests
│   │   ├── bookings.test.ts        # Bookings endpoints tests
│   │   └── user.test.ts            # User profile tests
│   └── setup.ts                    # Test database setup
├── .env                            # Environment variables (gitignored)
├── .env.example                    # Environment template
├── .gitignore
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies and scripts
├── jest.config.js                  # Jest test configuration
└── README.md                       # Setup and run instructions
```

**Structure Decision**: Selected **Web API (backend only)** structure. This is a standalone RESTful API that will be consumed by the Next.js frontend. The structure follows clean architecture principles with clear separation of concerns:
- **Controllers**: Business logic and request handling
- **Routes**: Endpoint definitions and middleware composition
- **Middleware**: Cross-cutting concerns (auth, validation, errors)
- **Schemas**: Zod validation schemas for type-safe input validation
- **Utils**: Reusable helper functions (JWT, password hashing, responses)
- **Config**: Singleton instances (Prisma client)
- **Prisma**: Database schema and migrations

This structure enables:
- Easy testing (controllers can be unit tested, routes integration tested)
- Clear separation between routing and business logic
- Reusable middleware across multiple routes
- Type safety from database to API response
- Independent deployment from frontend

## Complexity Tracking

**No violations** - All architecture decisions align with constitution principles. No complexity tracking required.
