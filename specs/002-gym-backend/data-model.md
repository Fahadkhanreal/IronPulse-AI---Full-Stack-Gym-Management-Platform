# Data Model: IronPulse Gym Backend API

**Feature**: 002-gym-backend  
**Date**: 2026-04-20  
**Purpose**: Define database schema and entity relationships

## Overview

This document defines the data models for the IronPulse Gym backend API. All models are implemented using Prisma ORM with PostgreSQL.

## Entity Relationship Diagram

```
User (1) ──────< (N) Booking
                      │
                      │
Plan (1) ──────< (N) Booking

Trainer (standalone, no relationships)
```

## Models

### User

Represents a gym member or administrator with authentication credentials.

**Fields**:
- `id`: String (CUID) - Primary key
- `name`: String - User's full name
- `email`: String (unique) - Email address for login
- `password`: String - Bcrypt hashed password
- `role`: Enum (Role) - User role (MEMBER or ADMIN)
- `createdAt`: DateTime - Account creation timestamp
- `updatedAt`: DateTime - Last update timestamp

**Relationships**:
- `bookings`: One-to-many with Booking (user can have multiple bookings)

**Indexes**:
- Unique index on `email` (for login lookup)

**Validation Rules**:
- `name`: 2-100 characters, required
- `email`: Valid email format, unique, required
- `password`: Minimum 8 characters, must contain uppercase, lowercase, and number
- `role`: Defaults to MEMBER

**Security Notes**:
- Password is hashed with bcrypt (10 rounds) before storage
- Password field never included in API responses
- Email uniqueness enforced at database level

---

### Plan

Represents a gym membership offering with pricing and features.

**Fields**:
- `id`: String (CUID) - Primary key
- `title`: String - Plan name (e.g., "Basic", "Premium", "Elite")
- `price`: Float - Monthly price in currency units
- `duration`: Int - Plan duration in months
- `features`: String[] - Array of feature descriptions
- `createdAt`: DateTime - Plan creation timestamp

**Relationships**:
- `bookings`: One-to-many with Booking (plan can have multiple bookings)

**Indexes**:
- None required (small dataset, infrequent queries)

**Validation Rules**:
- `title`: 2-50 characters, required
- `price`: Positive number, required
- `duration`: Positive integer (1-12 months typical), required
- `features`: Array of strings, at least 1 feature required

**Business Rules**:
- Plans can be deleted, but existing bookings are preserved (soft reference)
- Plan updates do not affect existing bookings (historical data preserved)

---

### Booking

Represents a member's gym session reservation.

**Fields**:
- `id`: String (CUID) - Primary key
- `userId`: String - Foreign key to User
- `planId`: String - Foreign key to Plan
- `bookingDate`: DateTime - Date of the booked session
- `status`: Enum (BookingStatus) - Booking status
- `createdAt`: DateTime - Booking creation timestamp

**Relationships**:
- `user`: Many-to-one with User (booking belongs to one user)
- `plan`: Many-to-one with Plan (booking belongs to one plan)

**Indexes**:
- Index on `userId` (for user's booking history queries)
- Index on `planId` (for plan popularity queries)
- Composite index on `userId` + `bookingDate` (for duplicate prevention)

**Validation Rules**:
- `userId`: Valid CUID, required
- `planId`: Valid CUID, required
- `bookingDate`: Must be present or future date, required
- `status`: Enum value, defaults to PENDING

**Business Rules**:
- User can book multiple sessions for different dates
- User can book multiple plans for the same date (no restriction in MVP)
- Booking date cannot be in the past
- User can only view/cancel their own bookings
- Cascading delete: If user is deleted, their bookings are deleted

**Status Lifecycle**:
1. `PENDING`: Initial state after booking creation
2. `CONFIRMED`: Admin or system confirmed the booking
3. `CANCELLED`: User or admin cancelled the booking
4. `COMPLETED`: Session completed (past date)

---

### Trainer

Represents a gym trainer profile (read-only for MVP).

**Fields**:
- `id`: String (CUID) - Primary key
- `name`: String - Trainer's full name
- `specialization`: String - Area of expertise
- `experience`: Int - Years of experience
- `image`: String - Profile image URL or path
- `bio`: String (optional) - Detailed biography

**Relationships**:
- None (standalone entity)

**Indexes**:
- None required (small dataset, read-only)

**Validation Rules**:
- `name`: 2-100 characters, required
- `specialization`: 2-100 characters, required
- `experience`: Non-negative integer, required
- `image`: Valid URL or path, required
- `bio`: Optional, max 500 characters

**Business Rules**:
- Trainers are seeded manually (no CRUD operations in MVP)
- Read-only access via GET endpoint
- No relationship to bookings (future enhancement)

---

## Enums

### Role

User role designation.

**Values**:
- `MEMBER`: Regular gym member (default)
- `ADMIN`: Administrator with elevated permissions

**Usage**:
- Determines access to admin-only endpoints (plan CRUD)
- Checked by admin middleware

---

### BookingStatus

Booking lifecycle status.

**Values**:
- `PENDING`: Initial state after creation
- `CONFIRMED`: Booking confirmed by admin/system
- `CANCELLED`: Booking cancelled by user/admin
- `COMPLETED`: Session completed (past date)

**Usage**:
- Tracks booking lifecycle
- Filters for upcoming vs past bookings
- Prevents modification of completed bookings

---

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String    @id @default(cuid())
  name      String
  email     String    @unique
  password  String
  role      Role      @default(MEMBER)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  bookings  Booking[]

  @@index([email])
}

model Plan {
  id        String    @id @default(cuid())
  title     String
  price     Float
  duration  Int
  features  String[]
  createdAt DateTime  @default(now())

  bookings  Booking[]
}

model Booking {
  id          String        @id @default(cuid())
  userId      String
  planId      String
  bookingDate DateTime
  status      BookingStatus @default(PENDING)
  createdAt   DateTime      @default(now())

  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan        Plan          @relation(fields: [planId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([planId])
  @@index([userId, bookingDate])
}

model Trainer {
  id             String  @id @default(cuid())
  name           String
  specialization String
  experience     Int
  image          String
  bio            String?
}

enum Role {
  MEMBER
  ADMIN
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}
```

---

## Data Flow

### Authentication Flow
1. User submits signup request with name, email, password
2. Backend hashes password with bcrypt
3. User record created in database with role=MEMBER
4. JWT token generated and returned to frontend
5. Frontend stores token and includes in Authorization header for protected requests

### Booking Flow
1. Frontend fetches available plans (GET /api/v1/plans)
2. User selects plan and date
3. Frontend sends booking request with planId and bookingDate
4. Backend validates: token, date (not past), plan exists
5. Booking created with status=PENDING, userId from token
6. Booking returned to frontend with plan details

### Profile Update Flow
1. Frontend sends profile update with name and/or email
2. Backend validates: token, email format, email uniqueness
3. User record updated in database
4. Updated user data returned (excluding password)

---

## Migration Strategy

### Initial Migration
1. Run `npx prisma migrate dev --name init` to create initial schema
2. Database tables created with indexes and constraints
3. Enums created in PostgreSQL

### Seed Data (Optional)
1. Create seed script in `prisma/seed.ts`
2. Seed 3 default plans (Basic, Premium, Elite)
3. Seed 6 trainers with sample data
4. Run `npx prisma db seed` to populate

### Future Migrations
1. Schema changes tracked in `prisma/migrations/` directory
2. Run `npx prisma migrate dev` for development
3. Run `npx prisma migrate deploy` for production
4. Always test migrations on staging before production

---

## Performance Considerations

### Indexes
- `User.email`: Unique index for fast login lookups
- `Booking.userId`: Index for user's booking history queries
- `Booking.planId`: Index for plan popularity queries
- `Booking.userId + bookingDate`: Composite index for duplicate prevention

### Query Optimization
- Use Prisma `include` to fetch related data in single query
- Avoid N+1 queries by including relations upfront
- Pagination for large result sets (future enhancement)

### Connection Pooling
- Prisma default: 10 connections
- Adjust based on deployment platform limits
- Monitor connection usage in production

---

## Security Considerations

### Password Storage
- Never store plain text passwords
- Bcrypt with 10 rounds (balance security and performance)
- Password field excluded from all API responses

### Data Access
- Users can only access their own bookings
- Admin role required for plan CRUD operations
- JWT middleware validates token on protected routes

### SQL Injection Prevention
- Prisma uses parameterized queries by default
- No raw SQL queries in application code
- Input validation with Zod before database operations

---

## Future Enhancements

### Phase 2+
- Add `Review` model for user reviews
- Add `Payment` model for payment processing
- Add `Session` model for detailed session tracking
- Add `Notification` model for real-time notifications
- Add soft delete functionality (deletedAt timestamp)
- Add audit logging (track all CRUD operations)
- Add booking capacity limits (maxCapacity field on Plan)
- Add trainer-booking relationship (assign trainer to booking)
