# Research: IronPulse Gym Backend API

**Feature**: 002-gym-backend  
**Date**: 2026-04-20  
**Purpose**: Document technical decisions, best practices, and research findings for backend implementation

## Overview

This document captures research findings and technical decisions made during the planning phase for the IronPulse Gym backend API.

## Key Technical Decisions

### 1. Authentication Strategy: JWT with bcrypt

**Decision**: Use stateless JWT tokens with bcrypt password hashing

**Rationale**:
- **Stateless**: No server-side session storage required, enabling horizontal scaling
- **Industry standard**: JWT is widely adopted and well-understood
- **Frontend compatibility**: Easy to integrate with Next.js frontend (localStorage or httpOnly cookies)
- **Security**: bcrypt with 10+ rounds provides strong password protection against brute force

**Alternatives Considered**:
- **Session-based auth**: Rejected due to need for session storage (Redis/database) and scaling complexity
- **OAuth2 only**: Rejected as out of scope for MVP; can be added later
- **Passport.js**: Rejected as unnecessary abstraction for simple JWT implementation

**Implementation Notes**:
- JWT secret stored in environment variable (JWT_SECRET)
- Token expiration configurable (default: 24 hours)
- Password minimum 8 characters with complexity requirements (uppercase, lowercase, number)
- bcrypt rounds: 10 (balance between security and performance)

---

### 2. Database ORM: Prisma

**Decision**: Use Prisma ORM for database access

**Rationale**:
- **Type safety**: Auto-generated TypeScript types from schema
- **Migration management**: Built-in migration system with version control
- **Developer experience**: Excellent autocomplete and compile-time error checking
- **SQL injection prevention**: Parameterized queries by default
- **Performance**: Efficient query generation and connection pooling

**Alternatives Considered**:
- **TypeORM**: Rejected due to decorator-heavy syntax and less intuitive API
- **Sequelize**: Rejected due to weaker TypeScript support
- **Raw SQL**: Rejected due to lack of type safety and manual migration management

**Implementation Notes**:
- Prisma Client singleton pattern in `src/config/prisma.ts`
- Database indexes on: email (unique), userId (bookings), planId (bookings)
- Cascading deletes: User deletion cascades to bookings
- Connection pooling: Default Prisma settings (10 connections)

---

### 3. Validation Strategy: Zod

**Decision**: Use Zod for runtime validation of all API inputs

**Rationale**:
- **TypeScript integration**: Infer TypeScript types from Zod schemas
- **Composable**: Reuse schemas across multiple endpoints
- **Clear error messages**: Detailed validation errors for debugging
- **Performance**: Fast validation with minimal overhead
- **Constitution compliance**: Matches frontend validation approach

**Alternatives Considered**:
- **Joi**: Rejected due to weaker TypeScript integration
- **Yup**: Rejected due to less active maintenance
- **class-validator**: Rejected due to decorator-based approach (less functional)

**Implementation Notes**:
- Validation middleware wraps Zod schema validation
- Schemas defined in `src/schemas/` directory
- Error messages customized for user-friendly feedback
- Validation runs before controller logic

---

### 4. API Response Format

**Decision**: Consistent JSON response format across all endpoints

**Success Response**:
```typescript
{
  success: true,
  message: string,
  data: T
}
```

**Error Response**:
```typescript
{
  success: false,
  message: string,
  error?: string
}
```

**Rationale**:
- **Consistency**: Frontend can handle all responses uniformly
- **Type safety**: TypeScript interfaces for response types
- **Debugging**: Clear distinction between success and error cases
- **Constitution compliance**: Matches API Contract Integrity principle

**HTTP Status Codes**:
- 200: Success (GET, PUT)
- 201: Created (POST)
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error (unexpected errors)

---

### 5. Error Handling Strategy

**Decision**: Global error handling middleware with custom error classes

**Rationale**:
- **Centralized**: All errors handled in one place
- **Consistent**: Same error format across all endpoints
- **Logging**: Errors logged for monitoring and debugging
- **Security**: Stack traces hidden in production

**Implementation Notes**:
- Custom error classes: `ValidationError`, `AuthenticationError`, `AuthorizationError`, `NotFoundError`
- Express error middleware catches all errors
- Development mode: Full stack traces
- Production mode: Generic error messages (no stack traces)

---

### 6. CORS Configuration

**Decision**: Restrict CORS to frontend domain only

**Rationale**:
- **Security**: Prevent unauthorized domains from accessing API
- **Constitution compliance**: Security-First Development principle
- **Flexibility**: Environment variable for frontend URL

**Implementation Notes**:
- CORS origin from environment variable (FRONTEND_URL)
- Credentials allowed (for cookies if needed)
- Preflight requests handled automatically

---

### 7. Rate Limiting

**Decision**: Infrastructure-level rate limiting (not application-level for MVP)

**Rationale**:
- **Simplicity**: Avoid adding complexity to application code
- **Performance**: Infrastructure-level limiting is more efficient
- **Deployment platform**: Render/Railway provide built-in rate limiting
- **Future enhancement**: Can add express-rate-limit if needed

**Implementation Notes**:
- Document rate limiting configuration in deployment guide
- Auth endpoints should have stricter limits (e.g., 5 requests/minute)
- General endpoints can have looser limits (e.g., 100 requests/minute)

---

### 8. Testing Strategy

**Decision**: Integration tests for API endpoints using Jest + Supertest

**Rationale**:
- **Coverage**: Tests cover full request/response cycle
- **Confidence**: Validates actual API behavior
- **Database**: Test database ensures isolation
- **Constitution compliance**: TDD principle

**Test Categories**:
1. **Authentication tests**: Signup, login, token validation
2. **Authorization tests**: Protected routes, admin-only routes
3. **Validation tests**: Invalid inputs, edge cases
4. **Business logic tests**: Booking date validation, duplicate email prevention
5. **Error handling tests**: 404, 401, 403, 500 responses

**Implementation Notes**:
- Separate test database (DATABASE_URL_TEST)
- Database reset before each test suite
- Mock JWT tokens for protected route tests
- Supertest for HTTP request testing

---

### 9. Environment Variables

**Decision**: Use dotenv for environment configuration

**Required Variables**:
- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `JWT_SECRET`: Secret key for JWT signing (min 32 characters)
- `JWT_EXPIRES_IN`: Token expiration time (default: "24h")
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend domain for CORS (e.g., http://localhost:3000)

**Security Notes**:
- `.env` file gitignored
- `.env.example` provided as template
- Production secrets managed via deployment platform
- Never commit secrets to version control

---

### 10. Database Schema Design

**Decision**: Four main models with clear relationships

**Models**:
1. **User**: Authentication and profile data
2. **Plan**: Membership offerings
3. **Booking**: User-Plan reservations
4. **Trainer**: Gym staff information (read-only)

**Key Design Decisions**:
- CUID for primary keys (better than UUID for database performance)
- Enums for Role (MEMBER, ADMIN) and BookingStatus (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- Cascading deletes: User deletion removes their bookings
- Array field for Plan features (PostgreSQL array support)
- Timestamps: createdAt, updatedAt for audit trail

---

## Best Practices

### Code Organization
- One controller per resource (auth, user, plan, booking)
- One route file per resource
- Middleware composed in route definitions
- Utilities extracted to separate files

### Security
- Never log sensitive data (passwords, tokens)
- Sanitize error messages in production
- Use helmet middleware for security headers
- Validate all inputs before processing

### Performance
- Database indexes on frequently queried fields
- Connection pooling via Prisma
- Avoid N+1 queries (use Prisma includes)
- Pagination for large result sets

### Maintainability
- TypeScript strict mode
- Consistent naming conventions
- JSDoc comments for complex logic
- README with setup instructions

---

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Zod Documentation](https://zod.dev)
- [bcrypt Best Practices](https://github.com/kelektiv/node.bcrypt.js#security-issues-and-concerns)
