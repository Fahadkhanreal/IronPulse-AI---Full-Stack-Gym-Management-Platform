# 🐛 Password Reset 400 Error - Debug Guide

## Issue
```
POST https://ironpulse-ai-backend.onrender.com/api/v1/auth/reset-password 400 (Bad Request)
```

## Possible Causes

### 1. Token Expired (Most Likely)
Reset tokens expire after **1 hour**. If you took too long to click the email link, token expired.

### 2. Token Invalid
Token doesn't exist in database or was already used.

### 3. Password Validation Failed
Password doesn't meet minimum requirements (6 characters).

---

## 🔍 Check Render Logs

**Go to Render Dashboard**:
```
https://dashboard.render.com
→ ironpulse-ai-backend
→ Logs tab
```

**Look for error when you submit reset form**:

### If Token Expired:
```
❌ Password reset failed
❌ Error: Invalid or expired reset token
```

### If Password Too Short:
```
❌ Validation error
❌ Password must be at least 6 characters
```

---

## ✅ Quick Fix - Get Fresh Reset Link

### Step 1: Request New Reset Email
```
https://iron-pulse-ai-full-stack-gym-manage.vercel.app/forgot-password
→ Enter: fahad.khan2100900@gmail.com
→ Click "Send Reset Link"
```

### Step 2: Check Gmail
- Open Gmail immediately
- Find reset email
- Click reset link **within 5 minutes**

### Step 3: Reset Password
- Enter new password (min 6 characters)
- Confirm password
- Submit

### Step 4: Should Work Now ✅

---

## 🔧 Better Error Handling (Code Fix)

The frontend isn't showing the exact error message from backend. Let me fix this:
