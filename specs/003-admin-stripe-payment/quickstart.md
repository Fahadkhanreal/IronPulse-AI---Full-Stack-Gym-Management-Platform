# Quickstart Guide

**Feature**: Admin Dashboard & Stripe Payment Integration  
**Date**: 2026-04-21  
**Status**: Complete

## Overview

This guide provides step-by-step instructions for setting up Stripe payment processing and admin dashboard functionality in IronPulse Gym.

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database (Neon) configured
- Stripe account (test mode)
- Git repository cloned
- Existing IronPulse Gym application running

## Phase 0: Stripe Account Setup

### Step 1: Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a new account or log in
3. Verify your email address
4. **Important**: Stay in Test Mode for development

### Step 2: Get API Keys

1. Navigate to **Developers** → **API keys** in Stripe Dashboard
2. Copy the following keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)
3. Keep these keys secure - you'll add them to environment variables

### Step 3: Create Products and Prices

For each membership plan (Basic, Premium, Elite):

1. Go to **Products** → **Add product**
2. Fill in product details:
   - **Name**: "Basic Membership" (or Premium, Elite)
   - **Description**: Plan features
   - **Pricing**: One-time or recurring
   - **Amount**: $29.99 (or plan price)
   - **Currency**: USD
3. Click **Save product**
4. Copy the **Price ID** (starts with `price_...`)
5. Repeat for all plans

**Note**: You'll need these Price IDs when creating plans in the admin dashboard.

---

## Phase 1: Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install stripe
```

### Step 2: Configure Environment Variables

Edit `backend/.env`:

```env
# Existing variables...
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
PORT=5000
FRONTEND_URL="http://localhost:3000"

# NEW: Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
STRIPE_WEBHOOK_SECRET=""  # Leave empty for now, will be set after webhook setup
```

### Step 3: Update Database Schema

Edit `backend/prisma/schema.prisma` and add the Payment model and enhancements (see data-model.md for complete schema).

Run migration:

```bash
cd backend
npx prisma db push
npx prisma generate
```

Verify migration:

```bash
npx prisma studio
# Check that Payment table exists with correct columns
```

### Step 4: Create Admin User

You need at least one admin user to access the admin dashboard:

```bash
# Option 1: Using Prisma Studio
npx prisma studio
# Navigate to User table, create new user with role: ADMIN

# Option 2: Using seed script (create backend/prisma/seed-admin.ts)
npx ts-node prisma/seed-admin.ts
```

**Admin User Example**:
- Email: `admin@ironpulse.com`
- Password: `Admin123!` (hash with bcrypt)
- Role: `ADMIN`

---

## Phase 2: Frontend Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install @stripe/stripe-js
```

### Step 2: Configure Environment Variables

Edit `frontend/.env.local`:

```env
# Existing variables...
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1

# NEW: Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
```

### Step 3: Restart Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## Phase 3: Webhook Setup (Local Development)

### Step 1: Install Stripe CLI

**Windows**:
```bash
# Using Scoop
scoop install stripe

# Or download from https://github.com/stripe/stripe-cli/releases
```

**Mac/Linux**:
```bash
brew install stripe/stripe-cli/stripe
```

### Step 2: Login to Stripe CLI

```bash
stripe login
# Follow the browser prompt to authenticate
```

### Step 3: Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```

**Output**:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

### Step 4: Update Environment Variable

Copy the webhook signing secret and add to `backend/.env`:

```env
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
```

Restart backend server to load new environment variable.

### Step 5: Test Webhook

In another terminal:

```bash
stripe trigger checkout.session.completed
```

Check backend logs for webhook processing confirmation.

---

## Phase 4: Testing Payment Flow

### Step 1: Login as Member

1. Open browser: `http://localhost:3000`
2. Login with a member account (or create new account)

### Step 2: Select a Plan

1. Navigate to **Plans** page
2. Click **Select Plan** on any plan
3. In booking modal, click **Pay Now** button

### Step 3: Complete Test Payment

You'll be redirected to Stripe Checkout page.

**Test Card Numbers**:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

**Test Card Details**:
- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### Step 4: Verify Payment Success

1. After payment, you should be redirected to success page
2. Check member dashboard - new booking should appear
3. Check backend logs - webhook should be processed
4. Check Prisma Studio - Payment record should exist with status SUCCEEDED

---

## Phase 5: Testing Admin Dashboard

### Step 1: Login as Admin

1. Logout from member account
2. Login with admin credentials
3. Navigate to: `http://localhost:3000/admin/dashboard`

### Step 2: Verify Dashboard Statistics

Dashboard should display:
- **Total Revenue**: Sum of successful payments
- **Active Members**: Count of users with confirmed bookings
- **Total Bookings**: Count of all bookings
- **Recent Payments**: Last 10 successful payments

### Step 3: Test Plans Management

1. Navigate to **Admin** → **Plans**
2. Click **Add Plan**
3. Fill in plan details:
   - Title: "Test Plan"
   - Price: 39.99
   - Duration: 1 month
   - Features: ["Feature 1", "Feature 2"]
   - Stripe Price ID: `price_...` (from Stripe Dashboard)
4. Click **Save**
5. Verify plan appears in member plans page

### Step 4: Test Bookings Management

1. Navigate to **Admin** → **Bookings**
2. Verify all bookings are displayed
3. Test filters:
   - Filter by status (CONFIRMED, PENDING, etc.)
   - Filter by date range
   - Search by member name
4. Click on a booking to view details

### Step 5: Test Payments Management

1. Navigate to **Admin** → **Payments**
2. Verify all payments are displayed
3. Test filters:
   - Filter by status (SUCCEEDED, FAILED, etc.)
   - Filter by date range
4. Click on a payment to view details

---

## Troubleshooting

### Issue: "Invalid Stripe Price ID"

**Cause**: Price ID doesn't exist or is inactive in Stripe

**Solution**:
1. Go to Stripe Dashboard → Products
2. Verify Price ID is correct
3. Ensure Price is active (not archived)
4. Copy exact Price ID (starts with `price_`)

### Issue: "Webhook signature verification failed"

**Cause**: Webhook secret mismatch or not set

**Solution**:
1. Ensure Stripe CLI is running: `stripe listen --forward-to localhost:5000/api/webhooks/stripe`
2. Copy webhook secret from CLI output
3. Update `STRIPE_WEBHOOK_SECRET` in backend `.env`
4. Restart backend server

### Issue: "Payment succeeded but booking not created"

**Cause**: Webhook not processed or database error

**Solution**:
1. Check backend logs for webhook processing errors
2. Verify Stripe CLI is forwarding webhooks
3. Check database for Payment record (should exist)
4. Manually trigger webhook: `stripe trigger checkout.session.completed`

### Issue: "Admin dashboard shows 403 Forbidden"

**Cause**: User doesn't have ADMIN role

**Solution**:
1. Open Prisma Studio: `npx prisma studio`
2. Navigate to User table
3. Find your user and change `role` to `ADMIN`
4. Logout and login again

### Issue: "CORS error when calling backend"

**Cause**: Frontend URL not in CORS whitelist

**Solution**:
1. Verify `FRONTEND_URL` in backend `.env` matches frontend URL
2. Restart backend server
3. Clear browser cache

---

## Production Deployment

### Step 1: Switch to Live Mode

1. In Stripe Dashboard, toggle to **Live Mode**
2. Get new API keys (starts with `pk_live_...` and `sk_live_...`)
3. Update production environment variables

### Step 2: Configure Production Webhook

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter webhook URL: `https://api.yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy webhook signing secret
6. Update production `STRIPE_WEBHOOK_SECRET`

### Step 3: Update Environment Variables

**Backend Production**:
```env
STRIPE_SECRET_KEY="sk_live_your_live_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_production_webhook_secret"
FRONTEND_URL="https://yourdomain.com"
```

**Frontend Production**:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_live_publishable_key"
NEXT_PUBLIC_API_BASE_URL="https://api.yourdomain.com/api/v1"
```

### Step 4: Test Production Payment

1. Use real credit card (will be charged)
2. Verify payment appears in Stripe Dashboard
3. Verify booking is created in production database
4. Verify webhook is received and processed

---

## Security Checklist

- [ ] Stripe secret keys stored in environment variables (not committed to Git)
- [ ] Webhook signature verification enabled
- [ ] Admin routes protected with role middleware
- [ ] CORS configured to allow only trusted frontend domain
- [ ] HTTPS enabled for production (required for webhooks)
- [ ] Database connection uses SSL
- [ ] JWT tokens have reasonable expiry time
- [ ] Admin actions logged for audit trail

---

## Useful Commands

### Stripe CLI

```bash
# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# Trigger test webhook
stripe trigger checkout.session.completed

# View recent events
stripe events list

# Get event details
stripe events retrieve evt_xxxxx
```

### Prisma

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio

# Create migration
npx prisma migrate dev --name add-payment-model
```

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

---

## Next Steps

1. ✅ Complete Phase 0-2 setup
2. ✅ Test payment flow with test cards
3. ✅ Test admin dashboard functionality
4. ⏭️ Run `/sp.tasks` to generate implementation tasks
5. ⏭️ Begin implementation following task breakdown
6. ⏭️ Deploy to production after thorough testing

---

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Testing**: https://stripe.com/docs/testing
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Prisma Documentation**: https://www.prisma.io/docs
- **Next.js Documentation**: https://nextjs.org/docs

---

## Appendix: Test Data

### Test Stripe Price IDs (Test Mode)

Create these in your Stripe Dashboard for testing:

```
Basic Plan: price_test_basic_monthly
Premium Plan: price_test_premium_monthly
Elite Plan: price_test_elite_monthly
```

### Test Admin Credentials

```
Email: admin@ironpulse.com
Password: Admin123!
Role: ADMIN
```

### Test Member Credentials

```
Email: member@test.com
Password: Member123!
Role: MEMBER
```
