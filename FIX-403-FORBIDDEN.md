# Fix 403 Forbidden Error - Admin Testimonials

## Problem
403 Forbidden error on `/api/v1/testimonials/admin/all`

## Root Cause
Old JWT token in browser localStorage still has `role: "MEMBER"` even though database was updated to `role: "ADMIN"`

## Solution

### Option 1: Logout & Login (Recommended)
1. Go to: http://localhost:3000
2. Click Logout button (top right)
3. Login again: admin@ironpulse.com / admin123
4. New token will have correct role: "ADMIN"
5. Admin pages will work

### Option 2: Clear Browser Storage
1. Press F12 (open DevTools)
2. Go to "Application" tab
3. Click "Local Storage" → "http://localhost:3000"
4. Delete "token" and "user" keys
5. Refresh page
6. Login again

### Option 3: Clear All Site Data
1. Press F12
2. Go to "Application" tab
3. Click "Clear site data" button
4. Refresh page
5. Login again

## Verification

After fresh login, check token in DevTools:
1. F12 → Application → Local Storage
2. Click on "token" key
3. Copy token value
4. Go to: https://jwt.io
5. Paste token
6. Check payload - should show: `"role": "ADMIN"`

## Why This Happens

JWT tokens are stateless and contain user info at the time of login:
- Login time: role was "MEMBER" → token has "MEMBER"
- Database updated: role changed to "ADMIN"
- But token still has old "MEMBER" role
- Backend checks token role, sees "MEMBER", returns 403

Solution: Get fresh token by logging in again!
