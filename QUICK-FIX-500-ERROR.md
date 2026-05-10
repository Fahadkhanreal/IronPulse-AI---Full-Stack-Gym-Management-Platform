# Quick Fix Guide - Testimonials 500 Error

## Problem
Backend is throwing 500 errors on `/api/v1/testimonials` because:
- Backend code expects new schema (userId, status, etc.)
- Database still has old schema (name, role, etc.)
- Migration not applied yet

## Solution - Run Database Migration

### Step 1: Stop Backend Server
```bash
# Press Ctrl+C in the terminal where backend is running
# Or close the terminal
```

### Step 2: Run Migration (Force Reset)
```bash
cd "D:\Governor Sindh It Initiative\code\full-stack-gym-website\backend"

# This will delete all data and apply new schema
npx prisma db push --force-reset --skip-generate

# Then generate Prisma client
npx prisma generate
```

### Step 3: Restart Backend
```bash
npm run dev
```

### Step 4: Verify
Open browser and check:
- Homepage: http://localhost:3000 (should work now)
- Admin testimonials: http://localhost:3000/admin/testimonials (should work)

## What This Does
- Deletes all existing data (including 3 old testimonials)
- Applies new schema with userId, status, etc.
- Generates new Prisma client
- Backend will work correctly after restart

## Note
⚠️ This will delete ALL data in database (users, bookings, payments, etc.)
If you want to keep data, use manual migration instead (see TESTIMONIALS-ARCHITECTURE-FIX.md)
