# Data Model

**Feature**: Admin Dashboard & Stripe Payment Integration  
**Date**: 2026-04-21  
**Status**: Complete

## Overview

This document defines the data model for payment processing and admin dashboard functionality, including new entities, enhancements to existing entities, relationships, and validation rules.

## Entity Definitions

### Payment (New Entity)

**Purpose**: Represents a financial transaction linking a member to a plan purchase through Stripe payment processor.

**Attributes**:
- `id` (String, CUID): Unique identifier for the payment record
- `userId` (String): Foreign key to User who made the payment
- `planId` (String): Foreign key to Plan that was purchased
- `stripePaymentId` (String, Unique): Stripe Checkout Session ID or Payment Intent ID
- `amount` (Float): Payment amount in dollars (e.g., 29.99)
- `currency` (String): Currency code (default: "usd")
- `status` (PaymentStatus Enum): Current payment status
- `createdAt` (DateTime): Timestamp when payment record was created

**Relationships**:
- Belongs to User (many-to-one)
- Belongs to Plan (many-to-one)

**Indexes**:
- `userId` - for querying user's payment history
- `planId` - for querying payments by plan
- `stripePaymentId` (unique) - for idempotency and Stripe reconciliation
- `status` - for filtering by payment status
- `createdAt` - for date range queries

**Validation Rules**:
- `amount` must be positive (> 0)
- `currency` must be valid ISO 4217 code (enforced as "usd" for MVP)
- `stripePaymentId` must be unique across all payments
- `userId` must reference existing User
- `planId` must reference existing Plan

**State Machine**:
```
PENDING → SUCCEEDED (payment completed successfully)
PENDING → FAILED (payment declined or error)
SUCCEEDED → REFUNDED (payment refunded by admin)
```

---

### User (Enhanced Entity)

**Purpose**: Existing user entity enhanced with Stripe customer identifier for payment processing.

**New Attributes**:
- `stripeCustomerId` (String, Optional, Unique): Stripe Customer ID (e.g., "cus_...")

**New Relationships**:
- Has many Payments (one-to-many)

**Validation Rules**:
- `stripeCustomerId` must be unique if provided
- `stripeCustomerId` format must match Stripe Customer ID pattern (cus_...)

**Migration Notes**:
- Existing users will have `stripeCustomerId` as null
- Customer ID is created on first payment and stored for future use
- Enables recurring billing and payment history tracking in Stripe

---

### Plan (Enhanced Entity)

**Purpose**: Existing plan entity enhanced with Stripe price identifier for payment processing.

**New Attributes**:
- `stripePriceId` (String, Optional, Unique): Stripe Price ID (e.g., "price_...")

**New Relationships**:
- Has many Payments (one-to-many)

**Validation Rules**:
- `stripePriceId` must be unique if provided
- `stripePriceId` format must match Stripe Price ID pattern (price_...)
- `stripePriceId` must reference active Stripe Price (validated via API)

**Migration Notes**:
- Existing plans will have `stripePriceId` as null
- Admin must link Stripe Price ID to enable payment processing for plan
- Plans without `stripePriceId` cannot be purchased (payment button disabled)

---

### Booking (Enhanced Entity)

**Purpose**: Existing booking entity enhanced to track associated payment.

**New Attributes**:
- `paymentId` (String, Optional): Foreign key to Payment record

**New Relationships**:
- Belongs to Payment (many-to-one, optional)

**Validation Rules**:
- `paymentId` must reference existing Payment if provided
- Booking status should be CONFIRMED only if payment exists and is SUCCEEDED

**State Transition Enhancement**:
```
PENDING → CONFIRMED (when payment succeeds via webhook)
PENDING → CANCELLED (if payment fails or user cancels)
```

**Migration Notes**:
- Existing bookings will have `paymentId` as null (free bookings or pre-payment era)
- New bookings created via payment flow will have `paymentId` populated
- Booking confirmation depends on payment success

---

## Enums

### PaymentStatus

**Values**:
- `PENDING`: Payment initiated but not yet completed
- `SUCCEEDED`: Payment completed successfully
- `FAILED`: Payment declined or error occurred
- `REFUNDED`: Payment was refunded

**Usage**:
- Set to PENDING when checkout session is created
- Updated to SUCCEEDED when webhook confirms payment
- Updated to FAILED if payment fails
- Updated to REFUNDED if admin processes refund

---

## Relationships Diagram

```
User (Enhanced)
├── id
├── stripeCustomerId (NEW)
├── bookings (existing)
└── payments (NEW)
    └── Payment[]

Plan (Enhanced)
├── id
├── stripePriceId (NEW)
├── bookings (existing)
└── payments (NEW)
    └── Payment[]

Payment (NEW)
├── id
├── userId → User
├── planId → Plan
├── stripePaymentId (unique)
├── amount
├── currency
├── status
└── createdAt

Booking (Enhanced)
├── id
├── userId → User
├── planId → Plan
├── paymentId → Payment (NEW, optional)
├── bookingDate
├── status
└── createdAt
```

---

## Prisma Schema

```prisma
// Enhanced User model
model User {
  id               String    @id @default(cuid())
  name             String
  email            String    @unique
  password         String
  role             Role      @default(MEMBER)
  stripeCustomerId String?   @unique  // NEW
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  bookings         Booking[]
  payments         Payment[]  // NEW

  @@index([email])
}

// Enhanced Plan model
model Plan {
  id            String    @id @default(cuid())
  title         String
  price         Float
  duration      Int
  features      String[]
  stripePriceId String?   @unique  // NEW
  createdAt     DateTime  @default(now())

  bookings      Booking[]
  payments      Payment[]  // NEW
}

// Enhanced Booking model
model Booking {
  id          String        @id @default(cuid())
  userId      String
  planId      String
  paymentId   String?       // NEW
  bookingDate DateTime
  status      BookingStatus @default(PENDING)
  createdAt   DateTime      @default(now())

  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan        Plan          @relation(fields: [planId], references: [id], onDelete: Cascade)
  payment     Payment?      @relation(fields: [paymentId], references: [id])  // NEW

  @@index([userId])
  @@index([planId])
  @@index([paymentId])  // NEW
  @@index([userId, bookingDate])
}

// NEW Payment model
model Payment {
  id              String        @id @default(cuid())
  userId          String
  planId          String
  stripePaymentId String        @unique
  amount          Float
  currency        String        @default("usd")
  status          PaymentStatus @default(PENDING)
  createdAt       DateTime      @default(now())

  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan            Plan          @relation(fields: [planId], references: [id], onDelete: Cascade)
  bookings        Booking[]     // One payment can have one booking

  @@index([userId])
  @@index([planId])
  @@index([status])
  @@index([createdAt])
  @@index([stripePaymentId])
}

// NEW PaymentStatus enum
enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
}

// Existing enums (unchanged)
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

// Existing Trainer model (unchanged)
model Trainer {
  id             String  @id @default(cuid())
  name           String
  specialization String
  experience     Int
  image          String
  bio            String?
}
```

---

## Database Migration Strategy

### Step 1: Add New Columns (Non-Breaking)
```sql
-- Add optional columns to existing tables
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT UNIQUE;
ALTER TABLE "Plan" ADD COLUMN "stripePriceId" TEXT UNIQUE;
ALTER TABLE "Booking" ADD COLUMN "paymentId" TEXT;
```

### Step 2: Create Payment Table
```sql
-- Create Payment table with indexes
CREATE TABLE "Payment" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "stripePaymentId" TEXT UNIQUE NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT DEFAULT 'usd' NOT NULL,
  "status" "PaymentStatus" DEFAULT 'PENDING' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE
);

CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX "Payment_planId_idx" ON "Payment"("planId");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");
CREATE UNIQUE INDEX "Payment_stripePaymentId_key" ON "Payment"("stripePaymentId");
```

### Step 3: Add Foreign Key Constraint
```sql
-- Add foreign key from Booking to Payment
ALTER TABLE "Booking" 
  ADD CONSTRAINT "Booking_paymentId_fkey" 
  FOREIGN KEY ("paymentId") REFERENCES "Payment"("id");

CREATE INDEX "Booking_paymentId_idx" ON "Booking"("paymentId");
```

### Step 4: Create PaymentStatus Enum
```sql
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');
```

**Rollback Strategy**:
- All new columns are optional (nullable)
- Existing data remains unchanged
- Can drop Payment table and new columns if needed
- No data loss for existing bookings

---

## Data Integrity Rules

### Payment Creation
- Payment record created when Stripe Checkout Session is initiated
- Initial status: PENDING
- Must reference valid User and Plan
- stripePaymentId must be unique (prevents duplicate processing)

### Payment Confirmation (Webhook)
- Update Payment status to SUCCEEDED when webhook received
- Create or update Booking with CONFIRMED status
- Link Booking to Payment via paymentId
- All operations in database transaction (atomic)

### Payment Failure
- Update Payment status to FAILED
- Do not create Booking
- User can retry payment (new Payment record created)

### Booking Without Payment
- Existing bookings without paymentId remain valid (legacy data)
- New bookings require payment (enforced in application logic)
- Admin can create bookings without payment (manual override)

### Plan Deletion
- Cannot delete Plan if it has associated Payments
- Must check both bookings and payments before deletion
- Soft delete recommended (add isActive flag) instead of hard delete

---

## Query Patterns

### Admin Dashboard Statistics
```typescript
// Total revenue from successful payments
const totalRevenue = await prisma.payment.aggregate({
  where: { status: 'SUCCEEDED' },
  _sum: { amount: true }
});

// Active members (users with confirmed bookings)
const activeMembers = await prisma.user.count({
  where: {
    bookings: {
      some: {
        status: 'CONFIRMED',
        bookingDate: { gte: new Date() }
      }
    }
  }
});

// Recent payments
const recentPayments = await prisma.payment.findMany({
  where: { status: 'SUCCEEDED' },
  include: { user: true, plan: true },
  orderBy: { createdAt: 'desc' },
  take: 10
});
```

### User Payment History
```typescript
const userPayments = await prisma.payment.findMany({
  where: { userId: user.id },
  include: { plan: true, bookings: true },
  orderBy: { createdAt: 'desc' }
});
```

### Orphaned Payments (Reconciliation)
```typescript
const orphanedPayments = await prisma.payment.findMany({
  where: {
    status: 'SUCCEEDED',
    bookings: { none: {} }  // No associated booking
  },
  include: { user: true, plan: true }
});
```

---

## Validation Rules Summary

| Field | Rule | Error Message |
|-------|------|---------------|
| Payment.amount | > 0 | "Amount must be positive" |
| Payment.stripePaymentId | Unique | "Payment already processed" |
| Payment.currency | "usd" | "Only USD currency supported" |
| User.stripeCustomerId | Unique, optional | "Stripe customer ID already exists" |
| Plan.stripePriceId | Unique, optional | "Stripe price ID already exists" |
| Booking.paymentId | Valid Payment ID | "Invalid payment reference" |

---

## Performance Considerations

### Indexes
- All foreign keys indexed for join performance
- Payment.status indexed for filtering
- Payment.createdAt indexed for date range queries
- Unique indexes on stripePaymentId, stripeCustomerId, stripePriceId

### Query Optimization
- Use `include` for related data (avoid N+1 queries)
- Paginate admin tables (limit 50 records per page)
- Cache dashboard statistics (5-minute TTL)
- Use database transactions for payment confirmation

### Scalability
- Payment table can grow to millions of records
- Consider partitioning by createdAt if needed (future)
- Archive old payments (>2 years) to separate table (future)
- Materialized views for dashboard if performance degrades (future)

---

## Testing Data

### Seed Data for Development
```typescript
// Test payment records
await prisma.payment.createMany({
  data: [
    {
      userId: 'user1',
      planId: 'basic-plan',
      stripePaymentId: 'cs_test_123',
      amount: 29.99,
      status: 'SUCCEEDED'
    },
    {
      userId: 'user2',
      planId: 'premium-plan',
      stripePaymentId: 'cs_test_456',
      amount: 49.99,
      status: 'SUCCEEDED'
    }
  ]
});
```

### Test Scenarios
1. Successful payment → confirmed booking
2. Failed payment → no booking created
3. Duplicate webhook → idempotency check
4. Orphaned payment → manual reconciliation
5. Payment without Stripe Price ID → validation error

---

## Next Steps

1. Update Prisma schema file with new models
2. Run `npx prisma db push` to apply changes
3. Generate Prisma client: `npx prisma generate`
4. Create seed script for test data
5. Proceed to API contract definition
