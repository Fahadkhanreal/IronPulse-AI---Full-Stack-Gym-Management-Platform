# Research & Technical Decisions

**Feature**: Admin Dashboard & Stripe Payment Integration  
**Date**: 2026-04-21  
**Status**: Complete

## Overview

This document captures technical research and decisions made during the planning phase for integrating Stripe payment processing and building an admin dashboard for IronPulse Gym.

## Research Task 1: Stripe Checkout Sessions vs Payment Intents

### Question
Which Stripe API pattern best fits the membership purchase flow?

### Options Evaluated

**Option A: Checkout Sessions (Hosted Page)**
- Stripe hosts the entire payment page
- Redirect user to Stripe, then back to app
- Stripe handles PCI compliance completely
- Limited UI customization
- Faster implementation (no custom payment form)

**Option B: Payment Intents (Custom UI)**
- Build custom payment form in app
- Use Stripe Elements for card input
- Full UI control and branding
- More complex implementation
- Still PCI compliant (Stripe Elements)

### Decision: Checkout Sessions (Option A)

**Rationale**:
1. **PCI Compliance**: Zero PCI burden - Stripe handles all card data
2. **Development Speed**: Significantly faster to implement (days vs weeks)
3. **Security**: Reduced attack surface - no payment form in our app
4. **Maintenance**: Stripe updates checkout page automatically
5. **Mobile Optimization**: Stripe's checkout is mobile-optimized out of the box
6. **Sufficient for MVP**: Hosted page provides good UX for membership purchases

**Trade-offs Accepted**:
- Less control over payment page branding
- User leaves our site temporarily (acceptable for payment security)
- Cannot customize checkout flow extensively

**Implementation Notes**:
- Use `mode: 'payment'` for one-time purchases
- Use `mode: 'subscription'` for recurring memberships (future enhancement)
- Configure success_url and cancel_url for proper redirects
- Pass metadata (userId, planId) for webhook processing

---

## Research Task 2: Webhook Idempotency Handling

### Question
How to handle duplicate webhook notifications from Stripe?

### Options Evaluated

**Option A: Idempotency Keys in Database**
- Store Stripe event ID in database
- Check if event already processed before handling
- Requires additional database query per webhook

**Option B: Database Transaction with Unique Constraint**
- Use stripePaymentId as unique constraint on Payment model
- Rely on database to prevent duplicates
- Simpler implementation

**Option C: In-Memory Cache**
- Cache processed event IDs in Redis/memory
- Fast lookup but requires cache infrastructure
- Risk of cache invalidation issues

### Decision: Database Transaction with Unique Constraint (Option B)

**Rationale**:
1. **Simplicity**: No additional infrastructure (Redis) required
2. **Reliability**: Database guarantees uniqueness
3. **Persistence**: Event processing state survives server restarts
4. **Performance**: Single database transaction handles both check and insert
5. **Stripe Best Practice**: Stripe recommends using event IDs for idempotency

**Implementation Pattern**:
```typescript
// Webhook handler
try {
  await prisma.$transaction(async (tx) => {
    // Check if payment already exists
    const existing = await tx.payment.findUnique({
      where: { stripePaymentId: session.id }
    });
    
    if (existing) {
      // Already processed, return success
      return;
    }
    
    // Create payment and confirm booking
    await tx.payment.create({ ... });
    await tx.booking.update({ status: 'CONFIRMED' });
  });
} catch (error) {
  // Handle duplicate key error gracefully
}
```

**Trade-offs Accepted**:
- Slightly more database load (query before insert)
- Acceptable given low webhook volume (<100/day expected)

---

## Research Task 3: Admin Dashboard Data Fetching Strategy

### Question
Real-time queries vs cached aggregations for dashboard statistics?

### Options Evaluated

**Option A: Real-time Aggregation Queries**
- Query database on every dashboard load
- Always current data
- May be slow with 10,000+ records

**Option B: Materialized Views**
- Pre-computed aggregations in database
- Fast reads, periodic refresh
- Requires database support and maintenance

**Option C: Application-Level Caching**
- Cache aggregation results in Redis/memory
- Invalidate on data changes
- Adds complexity and infrastructure

**Option D: Hybrid Approach**
- Real-time queries with database indexes
- Client-side caching (TanStack Query)
- Acceptable staleness (5 minutes)

### Decision: Hybrid Approach (Option D)

**Rationale**:
1. **Performance**: Database indexes make aggregations fast enough (<2s target)
2. **Simplicity**: No additional infrastructure required
3. **Freshness**: Data is reasonably current (5-minute cache acceptable)
4. **Scalability**: Can migrate to materialized views if needed later
5. **Cost-Effective**: Leverages existing TanStack Query caching

**Implementation Strategy**:
```typescript
// Backend: Optimized aggregation queries
const stats = await prisma.$transaction([
  prisma.payment.aggregate({
    where: { status: 'SUCCEEDED' },
    _sum: { amount: true }
  }),
  prisma.booking.count({
    where: { status: 'CONFIRMED' }
  }),
  // ... other queries
]);

// Frontend: TanStack Query with caching
const { data: stats } = useQuery({
  queryKey: ['admin', 'stats'],
  queryFn: adminService.getStats,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

**Database Indexes Required**:
- `Payment(status, amount)` - for revenue aggregation
- `Booking(status, createdAt)` - for active member count
- `Payment(createdAt)` - for recent activity queries

**Trade-offs Accepted**:
- Statistics may be up to 5 minutes stale (acceptable for admin dashboard)
- Database load increases with dashboard usage (mitigated by caching)

---

## Research Task 4: Stripe Price Management

### Question
Create Stripe Prices programmatically or manually in dashboard?

### Options Evaluated

**Option A: Programmatic Price Creation**
- Create Stripe Price via API when admin creates plan
- Automatic synchronization
- Requires error handling for API failures

**Option B: Manual Price Creation**
- Admin creates Price in Stripe Dashboard
- Admin enters Price ID when creating plan in app
- Simpler implementation, manual process

**Option C: Hybrid Approach**
- Admin can choose: create new or link existing
- Flexibility but more complex UI

### Decision: Manual Price Creation (Option B) for MVP

**Rationale**:
1. **Simplicity**: No Stripe API calls during plan creation
2. **Reliability**: No API failure scenarios to handle
3. **Control**: Admin has full control in Stripe Dashboard
4. **Validation**: Can verify Price configuration before linking
5. **MVP Scope**: Manual process acceptable for low-frequency operation

**Admin Workflow**:
1. Admin creates Product and Price in Stripe Dashboard
2. Admin copies Price ID (e.g., `price_1234...`)
3. Admin creates plan in IronPulse admin panel
4. Admin pastes Price ID into `stripePriceId` field
5. System validates Price ID exists via Stripe API

**Future Enhancement**:
- Add programmatic Price creation for convenience
- Implement in Phase 2 if manual process proves cumbersome

**Implementation Notes**:
```typescript
// Validation during plan creation
const validateStripePrice = async (priceId: string) => {
  try {
    const price = await stripe.prices.retrieve(priceId);
    if (!price.active) {
      throw new Error('Price is not active');
    }
    return price;
  } catch (error) {
    throw new Error('Invalid Stripe Price ID');
  }
};
```

**Trade-offs Accepted**:
- Manual step in admin workflow (acceptable for MVP)
- Risk of admin error (mitigated by validation)

---

## Research Task 5: Payment Failure Recovery

### Question
How to handle scenarios where payment succeeds but webhook fails?

### Options Evaluated

**Option A: Webhook Retry + Manual Reconciliation**
- Rely on Stripe's automatic webhook retries (up to 3 days)
- Provide admin tool to manually reconcile orphaned payments
- Requires building reconciliation interface

**Option B: Polling Stripe API**
- Periodically poll Stripe for payment status
- Automatic recovery without webhooks
- Increased API usage and complexity

**Option C: Webhook + Background Job**
- Process webhooks normally
- Background job checks for orphaned payments
- Automatic recovery with minimal API usage

### Decision: Webhook Retry + Manual Reconciliation (Option A)

**Rationale**:
1. **Stripe Best Practice**: Webhooks are the recommended pattern
2. **Reliability**: Stripe retries webhooks automatically for 3 days
3. **Simplicity**: No background job infrastructure required
4. **Rare Occurrence**: Payment success + webhook failure is uncommon
5. **Manual Fallback**: Admin can resolve edge cases when they occur

**Stripe Webhook Retry Behavior**:
- Immediate retry on failure
- Exponential backoff (1 hour, 2 hours, 4 hours, etc.)
- Continues for up to 3 days
- Admin receives email notification after multiple failures

**Manual Reconciliation Process**:
1. Admin views "Orphaned Payments" report in admin dashboard
2. Report shows Stripe payments without corresponding booking
3. Admin clicks "Reconcile" to create booking manually
4. System verifies payment status with Stripe before creating booking

**Implementation Priority**:
- Phase 1: Webhook processing with retry reliance
- Phase 2: Manual reconciliation tool (if needed based on failure rate)

**Monitoring**:
- Log all webhook processing attempts
- Alert on repeated webhook failures
- Track orphaned payment rate (<1% acceptable)

**Trade-offs Accepted**:
- Temporary inconsistency during webhook retry period (acceptable)
- Manual intervention required for persistent failures (rare)

---

## Summary of Decisions

| Decision Area | Choice | Key Benefit |
|---------------|--------|-------------|
| Payment API | Checkout Sessions | PCI compliance, faster development |
| Idempotency | Database unique constraint | Simple, reliable, persistent |
| Dashboard Data | Real-time + client cache | Good performance, no extra infrastructure |
| Price Management | Manual creation | Simple, reliable, sufficient for MVP |
| Failure Recovery | Webhook retry + manual tool | Stripe best practice, handles edge cases |

## Implementation Priorities

**Phase 1 (MVP)**:
1. Checkout Sessions integration
2. Webhook processing with idempotency
3. Admin dashboard with real-time queries
4. Manual Stripe Price linking
5. Webhook retry reliance

**Phase 2 (Enhancements)**:
1. Manual reconciliation tool for orphaned payments
2. Programmatic Price creation option
3. Materialized views if performance degrades
4. Subscription mode for recurring memberships

## Technical Constraints Confirmed

- **Webhook Endpoint**: Must be publicly accessible (use ngrok for local dev)
- **Database Indexes**: Required for admin dashboard performance
- **Stripe Test Mode**: Use for all development and testing
- **Environment Variables**: Separate keys for test/live modes
- **Webhook Signature**: Must verify on every webhook request

## Next Steps

Proceed to Phase 1: Design & Contracts
- Define Payment data model in Prisma schema
- Create API contracts for payment and admin endpoints
- Document setup and testing procedures in quickstart.md
