# 🔍 Email Not Sending - Debug Guide

**Issue**: Password reset email not being received
**Status**: Investigating

---

## 🚨 Most Likely Issue: Brevo Sender Verification

### Problem
Aapka `BREVO_FROM_EMAIL` = `fahad.khan2100900@gmail.com` hai, lekin yeh Brevo mein **verified nahi hai**.

Brevo emails sirf **verified sender addresses** se hi bhejta hai.

---

## ✅ Solution: Brevo Sender Verification

### Step 1: Login to Brevo
1. Go to: https://app.brevo.com
2. Login with your account

### Step 2: Check Senders
1. Click **"Senders, Domains & Dedicated IPs"** (left sidebar)
2. Or go to: https://app.brevo.com/senders
3. Check if `fahad.khan2100900@gmail.com` is listed
4. Check if it has a **green checkmark** (verified)

### Step 3A: If Email NOT Verified
1. Click **"Add a Sender"**
2. Enter: `fahad.khan2100900@gmail.com`
3. Brevo will send verification email to this address
4. Open Gmail inbox
5. Find email from Brevo
6. Click verification link
7. Wait for confirmation

### Step 3B: If Email Already Verified
Then the issue is something else (see below).

---

## 🔧 Alternative Solutions

### Option 1: Use Brevo's Default Sender (Recommended)

Instead of Gmail, use a Brevo-provided email:

1. **Go to Brevo Dashboard**
2. **Check "Senders"** section
3. **Look for pre-verified email** like:
   - `noreply@yourdomain.com` (if you have custom domain)
   - Or use Brevo's default sender

4. **Update Render Environment Variables**:
   ```
   BREVO_FROM_EMAIL=noreply@yourdomain.com
   ```

### Option 2: Use Different Email Service

If Brevo is not working, use alternative:

#### A. Gmail SMTP (Quick Fix)
```env
# Gmail SMTP (less secure, but works for testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=fahad.khan2100900@gmail.com
SMTP_PASS=your-gmail-app-password  # NOT your regular password!
FROM_EMAIL=fahad.khan2100900@gmail.com
```

**Note**: You need to enable "App Passwords" in Gmail:
1. Go to: https://myaccount.google.com/apppasswords
2. Generate app password
3. Use that password (not your regular Gmail password)

#### B. SendGrid (Professional)
```env
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=verified@yourdomain.com
```

---

## 🔍 Check Render Logs

### How to Check Logs:
1. Go to: https://dashboard.render.com
2. Click your backend service
3. Click **"Logs"** tab
4. Look for these messages:

#### Success Messages:
```
✅ Email sent successfully!
📧 Message ID: <message-id>
```

#### Error Messages:
```
❌ Email sending failed: <error>
```

### Common Errors:

#### Error 1: "Sender not verified"
```
❌ Email sending failed: Sender email not verified
```
**Solution**: Verify sender email in Brevo (see above)

#### Error 2: "Invalid credentials"
```
❌ Email sending failed: Invalid login
```
**Solution**: Check SMTP_USER and SMTP_PASS

#### Error 3: "Connection timeout"
```
❌ Email sending failed: timeout
```
**Solution**: Check SMTP_HOST and SMTP_PORT

---

## 🧪 Test Email Locally

### Step 1: Clone and Setup
```bash
cd backend
npm install
```

### Step 2: Create `.env` File
```env
DATABASE_URL=your-database-url
JWT_SECRET=test-secret-key
FRONTEND_URL=http://localhost:3000

# Brevo Config (Get these from Brevo dashboard)
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-brevo-smtp-user
BREVO_SMTP_PASS=your-brevo-smtp-key-from-dashboard
BREVO_FROM_EMAIL=your-verified-email@domain.com
BREVO_FROM_NAME=IronPulse Gym
```

### Step 3: Run Backend
```bash
npm run dev
```

### Step 4: Test Password Reset
1. Open Postman or use curl:
```bash
curl -X POST http://localhost:5000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@gmail.com"}'
```

2. Check terminal logs for errors

---

## 🔧 Fix: Better Error Logging

Current code hides email errors. Let's add better logging:

### File: `backend/src/controllers/auth.controller.ts`

Add this after line 150:
```typescript
if (emailResult.success) {
  console.log('✅ Password reset email sent successfully');
} else {
  console.error('❌ Email failed with error:', emailResult.error);
  console.error('📧 Email config check:');
  console.error('  - SMTP Host:', process.env.BREVO_SMTP_HOST);
  console.error('  - SMTP Port:', process.env.BREVO_SMTP_PORT);
  console.error('  - SMTP User:', process.env.BREVO_SMTP_USER ? 'SET' : 'NOT SET');
  console.error('  - SMTP Pass:', process.env.BREVO_SMTP_PASS ? 'SET' : 'NOT SET');
  console.error('  - From Email:', process.env.BREVO_FROM_EMAIL);
}
```

---

## 📋 Checklist

### Brevo Account Setup
- [ ] Logged into Brevo dashboard
- [ ] Checked "Senders" section
- [ ] Verified sender email has green checkmark
- [ ] If not verified, clicked verification link in email
- [ ] Waited for verification confirmation

### Environment Variables
- [ ] BREVO_SMTP_HOST = smtp-relay.brevo.com
- [ ] BREVO_SMTP_PORT = 587
- [ ] BREVO_SMTP_USER = correct value from Brevo
- [ ] BREVO_SMTP_PASS = correct SMTP key from Brevo
- [ ] BREVO_FROM_EMAIL = verified email address
- [ ] All variables set in Render dashboard

### Testing
- [ ] Tested locally first
- [ ] Checked Render logs for errors
- [ ] Tried sending test email
- [ ] Checked spam folder
- [ ] Verified email received

---

## 🎯 Quick Fix Steps

### 1. Verify Sender Email (5 minutes)
```
1. Login to Brevo
2. Go to Senders section
3. Verify fahad.khan2100900@gmail.com
4. Check email and click verification link
```

### 2. Update Render (2 minutes)
```
1. Go to Render dashboard
2. Click backend service
3. Go to Environment tab
4. Verify all BREVO_* variables are set correctly
5. Click "Save Changes"
6. Wait for redeploy
```

### 3. Test (1 minute)
```
1. Go to your frontend
2. Click "Forgot Password"
3. Enter email
4. Submit
5. Check Render logs
6. Check email inbox (and spam folder)
```

---

## 🆘 If Still Not Working

### Check These:

1. **Brevo Account Status**
   - Is account active?
   - Any sending limits?
   - In sandbox mode?

2. **SMTP Credentials**
   - SMTP_USER should be from Brevo dashboard
   - SMTP_PASS should be SMTP key (not account password)
   - Copy-paste carefully (no extra spaces)

3. **Email Deliverability**
   - Check spam folder
   - Check Gmail "All Mail"
   - Check Gmail filters

4. **Render Logs**
   - Any error messages?
   - Connection timeouts?
   - Authentication failures?

---

## 📞 Contact Support

If nothing works:

1. **Brevo Support**: https://help.brevo.com
2. **Render Support**: https://render.com/support
3. **Check Status Pages**:
   - Brevo: https://status.brevo.com
   - Render: https://status.render.com

---

**Created**: 2026-05-13  
**Status**: Debugging in progress
