# Feature Specification: Admin Dashboard & Stripe Payment Integration

**Feature Branch**: `003-admin-stripe-payment`  
**Created**: 2026-04-21  
**Status**: Draft  
**Input**: Admin Dashboard and Stripe Payment Integration for IronPulse Gym - Add full admin dashboard with plans/bookings/payments management, integrate Stripe checkout sessions and webhooks for payment processing

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Member Payment Processing (Priority: P1)

A gym member selects a membership plan and completes payment through a secure checkout process. The system processes the payment, confirms the booking, and provides immediate feedback on payment status.

**Why this priority**: Payment processing is the core revenue-generating functionality. Without it, the business cannot monetize memberships. This is the foundation that enables all other admin features to have meaningful data to manage.

**Independent Test**: Can be fully tested by selecting a plan, completing checkout with test payment credentials, and verifying booking confirmation and payment record creation. Delivers immediate business value by enabling revenue collection.

**Acceptance Scenarios**:

1. **Given** a logged-in member views available plans, **When** they click "Pay Now" on a plan, **Then** they are redirected to a secure payment checkout page
2. **Given** a member is on the checkout page, **When** they enter valid payment details and submit, **Then** payment is processed and they receive confirmation
3. **Given** a payment is successful, **When** the system processes the webhook notification, **Then** a booking is created with CONFIRMED status and payment record is stored
4. **Given** a payment fails, **When** the checkout process completes, **Then** the member sees an error message and can retry payment
5. **Given** a member completes payment, **When** they return to their dashboard, **Then** they see their new booking with payment confirmation
6. **Given** a member abandons checkout, **When** they navigate away, **Then** no booking or payment record is created

---

### User Story 2 - Admin Dashboard Overview (Priority: P2)

An administrator accesses a centralized dashboard to view key business metrics including total revenue, active memberships, recent bookings, and member statistics. This provides at-a-glance insights into gym performance.

**Why this priority**: After payment processing enables revenue, admins need visibility into business performance. This is the entry point for all admin functions and provides critical business intelligence for decision-making.

**Independent Test**: Can be tested by logging in as admin, viewing dashboard statistics, and verifying accuracy of displayed metrics against actual database records. Delivers value by providing business insights without requiring other admin features.

**Acceptance Scenarios**:

1. **Given** an admin logs in, **When** they access the admin dashboard, **Then** they see total revenue, active member count, total bookings, and recent activity
2. **Given** the dashboard displays statistics, **When** new payments or bookings occur, **Then** statistics update to reflect current data
3. **Given** an admin views the dashboard, **When** they see revenue metrics, **Then** revenue is calculated from all successful payments
4. **Given** an admin views recent bookings, **When** they click on a booking, **Then** they see detailed booking and payment information
5. **Given** a non-admin user attempts to access admin dashboard, **When** they navigate to admin routes, **Then** they are denied access with appropriate error message

---

### User Story 3 - Admin Plans Management (Priority: P3)

An administrator creates, updates, and manages membership plans including pricing, duration, and features. They can also link plans to payment processing configurations for automated billing.

**Why this priority**: Plan management enables admins to adjust offerings based on business needs. This depends on payment processing (P1) being functional so plans can be properly monetized, and benefits from dashboard visibility (P2) to inform pricing decisions.

**Independent Test**: Can be tested by creating a new plan, updating existing plans, and verifying changes are reflected in member-facing plan listings. Delivers value by giving admins control over product offerings.

**Acceptance Scenarios**:

1. **Given** an admin accesses plan management, **When** they create a new plan with title, price, duration, and features, **Then** the plan is saved and appears in member plan listings
2. **Given** an admin views existing plans, **When** they edit a plan's details, **Then** changes are saved and reflected immediately
3. **Given** an admin updates a plan, **When** members view plans, **Then** they see the updated information
4. **Given** an admin deletes a plan, **When** the plan has existing bookings, **Then** the system prevents deletion and shows warning message
5. **Given** an admin creates a plan, **When** they configure payment settings, **Then** the plan is linked to payment processing for automated billing

---

### User Story 4 - Admin Bookings Management (Priority: P4)

An administrator views all member bookings across the system with filtering and search capabilities. They can see booking status, associated payments, and member details to manage gym capacity and member relationships.

**Why this priority**: Booking management helps admins oversee gym operations and member activity. This depends on payment processing (P1) creating bookings and benefits from dashboard context (P2). It's operational rather than revenue-critical.

**Independent Test**: Can be tested by viewing all bookings, filtering by status or date, and verifying displayed information matches actual booking records. Delivers value by providing operational visibility.

**Acceptance Scenarios**:

1. **Given** an admin accesses bookings management, **When** they view the bookings list, **Then** they see all bookings with member name, plan, date, status, and payment status
2. **Given** an admin views bookings, **When** they filter by status (PENDING, CONFIRMED, CANCELLED, COMPLETED), **Then** only matching bookings are displayed
3. **Given** an admin views bookings, **When** they filter by date range, **Then** only bookings within that range are shown
4. **Given** an admin views bookings, **When** they search by member name or email, **Then** matching bookings are displayed
5. **Given** an admin views a booking, **When** they click for details, **Then** they see complete booking information including payment details and member contact information

---

### User Story 5 - Admin Payments Management (Priority: P5)

An administrator views all payment transactions with details including amount, status, member information, and associated bookings. They can track revenue, identify failed payments, and monitor payment processing health.

**Why this priority**: Payment management provides financial oversight and troubleshooting capabilities. While important for accounting and support, it's less critical than the core payment processing (P1) and operational dashboards (P2-P4).

**Independent Test**: Can be tested by viewing payment records, filtering by status, and verifying payment details match actual transactions. Delivers value by providing financial transparency and audit trail.

**Acceptance Scenarios**:

1. **Given** an admin accesses payments management, **When** they view the payments list, **Then** they see all payments with member name, amount, status, date, and associated plan
2. **Given** an admin views payments, **When** they filter by status (PENDING, SUCCEEDED, FAILED, REFUNDED), **Then** only matching payments are displayed
3. **Given** an admin views payments, **When** they filter by date range, **Then** only payments within that range are shown
4. **Given** an admin views a payment, **When** they click for details, **Then** they see complete payment information including transaction ID, member details, and associated booking
5. **Given** an admin views failed payments, **When** they identify patterns, **Then** they can take action to resolve payment processing issues

---

### Edge Cases

- What happens when a member's payment succeeds but webhook notification fails to reach the system?
- How does the system handle duplicate webhook notifications from the payment processor?
- What happens when an admin tries to delete a plan that has pending payments?
- How does the system handle concurrent admin users modifying the same plan?
- What happens when a member closes the browser during payment processing?
- How does the system handle payment processor downtime or API failures?
- What happens when a webhook arrives before the member returns from checkout?
- How does the system handle partial refunds or payment disputes?
- What happens when an admin's session expires while viewing sensitive payment data?
- How does the system handle time zone differences in payment timestamps?

## Requirements *(mandatory)*

### Functional Requirements

**Payment Processing:**

- **FR-001**: System MUST allow authenticated members to initiate payment for selected membership plans
- **FR-002**: System MUST redirect members to secure hosted checkout page for payment processing
- **FR-003**: System MUST support both one-time payment and subscription-based payment modes
- **FR-004**: System MUST create payment records with status tracking (PENDING, SUCCEEDED, FAILED, REFUNDED)
- **FR-005**: System MUST receive and verify webhook notifications from payment processor
- **FR-006**: System MUST create confirmed bookings only after successful payment verification
- **FR-007**: System MUST handle payment success and failure scenarios with appropriate user feedback
- **FR-008**: System MUST redirect members to success page after completed payment
- **FR-009**: System MUST redirect members to cancellation page if they abandon checkout
- **FR-010**: System MUST link payment records to specific members and plans
- **FR-011**: System MUST store payment transaction identifiers for reference and reconciliation
- **FR-012**: System MUST prevent duplicate payment processing for the same checkout session

**Admin Dashboard:**

- **FR-013**: System MUST restrict admin dashboard access to users with ADMIN role only
- **FR-014**: System MUST display total revenue calculated from all successful payments
- **FR-015**: System MUST display count of active members (users with confirmed bookings)
- **FR-016**: System MUST display total booking count across all statuses
- **FR-017**: System MUST display recent bookings with member and plan information
- **FR-018**: System MUST provide navigation to all admin management sections
- **FR-019**: System MUST update dashboard statistics when new data is created

**Admin Plans Management:**

- **FR-020**: System MUST allow admins to create new membership plans with title, price, duration, and features
- **FR-021**: System MUST allow admins to update existing plan details
- **FR-022**: System MUST allow admins to delete plans that have no associated bookings
- **FR-023**: System MUST prevent deletion of plans with existing bookings
- **FR-024**: System MUST display all plans in admin interface with full details
- **FR-025**: System MUST link plans to payment processor configuration for automated billing
- **FR-026**: System MUST validate plan data before saving (positive price, valid duration, non-empty features)

**Admin Bookings Management:**

- **FR-027**: System MUST display all bookings across all members in admin interface
- **FR-028**: System MUST show booking details including member name, plan, date, status, and payment status
- **FR-029**: System MUST allow filtering bookings by status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- **FR-030**: System MUST allow filtering bookings by date range
- **FR-031**: System MUST allow searching bookings by member name or email
- **FR-032**: System MUST display detailed booking information including associated payment data
- **FR-033**: System MUST show member contact information for each booking

**Admin Payments Management:**

- **FR-034**: System MUST display all payment transactions in admin interface
- **FR-035**: System MUST show payment details including member name, amount, currency, status, and date
- **FR-036**: System MUST allow filtering payments by status (PENDING, SUCCEEDED, FAILED, REFUNDED)
- **FR-037**: System MUST allow filtering payments by date range
- **FR-038**: System MUST display detailed payment information including transaction ID and associated booking
- **FR-039**: System MUST calculate and display total revenue from successful payments
- **FR-040**: System MUST show payment processor transaction identifiers for reconciliation

**Security & Access Control:**

- **FR-041**: System MUST verify user role before granting access to admin routes
- **FR-042**: System MUST verify webhook signatures to ensure authenticity of payment notifications
- **FR-043**: System MUST maintain audit trail of admin actions on plans, bookings, and payments
- **FR-044**: System MUST protect sensitive payment data from unauthorized access
- **FR-045**: System MUST handle authentication token expiry during admin sessions

### Key Entities

- **Payment**: Represents a financial transaction linking a member to a plan purchase. Contains transaction identifier from payment processor, amount, currency, status (PENDING, SUCCEEDED, FAILED, REFUNDED), timestamp, and references to member and plan. Serves as financial record and audit trail.

- **User (Enhanced)**: Existing user entity extended with payment processor customer identifier for linking member accounts to payment processor records. Enables recurring billing and payment history tracking.

- **Plan (Enhanced)**: Existing plan entity extended with payment processor price identifier for automated billing configuration. Links gym membership offerings to payment processing infrastructure.

- **Booking (Enhanced)**: Existing booking entity now associated with payment records. Booking confirmation depends on successful payment verification through webhook processing.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Members can complete payment checkout process in under 3 minutes from plan selection to confirmation
- **SC-002**: Payment success rate exceeds 95% for valid payment credentials (excluding user errors or insufficient funds)
- **SC-003**: Webhook notifications are processed and bookings confirmed within 5 seconds of payment completion
- **SC-004**: Admin dashboard loads with current statistics in under 2 seconds
- **SC-005**: Admins can view and filter up to 10,000 bookings without performance degradation
- **SC-006**: Admins can view and filter up to 10,000 payment records without performance degradation
- **SC-007**: Payment processing handles 100 concurrent checkout sessions without errors
- **SC-008**: Zero unauthorized access to admin routes by non-admin users
- **SC-009**: 100% of successful payments result in confirmed bookings (no orphaned payments)
- **SC-010**: Admin can create or update a plan in under 1 minute
- **SC-011**: Revenue calculations on dashboard are accurate to within 0.01% of actual payment totals
- **SC-012**: Failed payments are clearly identified with actionable error messages for members
- **SC-013**: Admin dashboard provides insights that reduce time spent on manual reporting by 80%
- **SC-014**: Payment dispute rate remains below 1% of total transactions
- **SC-015**: System maintains 99.9% uptime for payment processing during business hours

## Assumptions

- Payment processor (Stripe) account is configured with valid API credentials
- Payment processor supports webhook notifications for payment events
- Payment processor provides hosted checkout pages for secure payment collection
- Members have valid payment methods (credit/debit cards) for transactions
- Admin users are manually created with ADMIN role (not self-service admin registration)
- Currency is USD for all transactions (multi-currency support not required for MVP)
- Payment processor handles PCI compliance for card data (system never stores card details)
- Webhook endpoint is publicly accessible for payment processor notifications
- Payment processor provides test mode for development and testing
- Refund processing is handled manually through payment processor dashboard (not automated in system)
- Tax calculation is not required (prices are final amounts)
- Payment receipts are generated by payment processor (not by system)
- Member email notifications for payment confirmation are handled by payment processor
- Payment processor provides adequate fraud detection and prevention
- System operates in single time zone (UTC) for payment timestamps

## Dependencies

- Payment processor account must be active with API access enabled
- Payment processor webhook endpoint must be configured to point to system
- Payment processor products and prices must be created for each membership plan
- SSL/TLS certificate must be configured for secure webhook reception
- Admin user accounts must exist in database with ADMIN role
- Existing authentication system must support role-based access control
- Database must support transaction isolation for payment processing
- System must have public internet access for webhook reception

## Out of Scope

- Automated refund processing through system interface
- Multi-currency support and currency conversion
- Tax calculation and tax reporting
- Invoice generation and PDF receipts
- Email notification system for payment confirmations
- SMS notifications for payment status
- Payment plan installments or split payments
- Gift cards or promotional codes
- Loyalty points or rewards program
- Integration with accounting software
- Automated dunning for failed recurring payments
- Payment analytics and reporting dashboards
- Export functionality for payment data
- Bulk payment operations
- Payment dispute management interface
- Chargeback handling automation
- Multiple payment processor support
- Cryptocurrency payment options
- Mobile wallet integration (Apple Pay, Google Pay)
- Saved payment methods for members
- Automatic retry logic for failed payments
