# Quick Fix: Authentication Issues

## Current Problem

Getting 400/401/404 errors when trying to login or register on production (Vercel).

## Root Cause: Email Confirmation

**Supabase has email confirmation enabled**, which means:
1. When you register, Supabase creates a user but **NO SESSION**
2. You must click the email confirmation link
3. Only after confirmation can you login

## Quick Fix: Disable Email Confirmation (Testing Only)

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard/project/vnkvdnagnkvlyrnkeczh
2. Go to: **Authentication** → **Providers** → **Email**
3. Scroll down to **Email Confirmation Settings**
4. **Uncheck** "Confirm email"
5. Click **Save**

### Step 2: Try Registration Again
1. Go to: https://arms-roan.vercel.app/register
2. Fill in the form
3. Should work immediately without email confirmation!

## Alternative: Use Email Confirmation Properly

If you want to keep email confirmation enabled:

### Step 1: Complete the Registration
1. Register at https://arms-roan.vercel.app/register
2. Check your email inbox (and spam folder)
3. Click the confirmation link
4. You'll be redirected to `/auth/callback`

### Step 2: Login
1. After email confirmation, go to login page
2. Login with your credentials
3. Should work!

## Test with Existing Users

You have 3 active users in the database. Try logging in with one of them:

**From your database:**
- Check which users exist by running: `node backend/check-routes.js` (shows active users)
- Use those credentials to login

## Common Errors Explained

| Error | Status | Cause | Fix |
|-------|--------|-------|-----|
| Bad Request | 400 | Invalid data format or validation failed | Check email format, password requirements |
| Unauthorized | 401 | Wrong credentials or no session | Use correct credentials, confirm email first |
| Not Found | 404 | User profile doesn't exist in PostgreSQL | Complete registration after email confirmation |
| Too Many Requests | 429 | Exceeded rate limit (fixed now) | Wait 15 min or restart backend |

## Test Login Locally

### Step 1: Start Backend
```bash
cd backend
npm run start:dev
```

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```

### Step 3: Test Login
1. Go to: http://localhost:3000/login
2. Try with existing user credentials
3. Check browser console (F12) for detailed errors

## Check Supabase Auth Users

1. Go to: https://supabase.com/dashboard/project/vnkvdnagnkvlyrnkeczh/auth/users
2. See which users exist
3. Check their email confirmation status
4. Delete test users if needed

## Create Test User

### Option 1: Use Bootstrap Admin
```bash
curl -X POST https://arms-c56l.onrender.com/auth/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "bootstrapToken": "arms_bootstrap_2026_secure_token_xyz",
    "email": "testadmin@arms.local",
    "password": "Admin123!Test",
    "firstName": "Test",
    "lastName": "Admin",
    "phoneNumber": "+2348012345678",
    "address": "Test Address",
    "ward": "Test Ward",
    "houseNumber": "1",
    "street": "Test Street"
  }'
```

### Option 2: Register Resident (after disabling email confirmation)
1. Go to https://arms-roan.vercel.app/register
2. Fill form with valid data
3. Should create account immediately

## Verify Configuration

### Check Frontend Environment (Vercel)
```env
VITE_API_URL=https://arms-c56l.onrender.com
VITE_SUPABASE_URL=https://vnkvdnagnkvlyrnkeczh.supabase.co
VITE_SUPABASE_ANON_KEY=<your-key>
```

### Check Backend Environment (Render)
```env
FRONTEND_URL=https://arms-roan.vercel.app
SUPABASE_URL=https://vnkvdnagnkvlyrnkeczh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-key>
DATABASE_URL=<your-connection-string>
```

## Debug Steps

### 1. Check Browser Console
Press F12 and look at:
- **Console tab**: JavaScript errors
- **Network tab**: API request/response details

### 2. Check Request Details
In Network tab, click on the failed request and check:
- **Headers**: Authorization header present?
- **Payload**: Data being sent
- **Response**: Error message from server

### 3. Check Supabase Session
In browser console, run:
```javascript
// Check if you have a Supabase session
const { data, error } = await window.supabase.auth.getSession()
console.log('Session:', data)
console.log('Error:', error)
```

### 4. Check Auth Token
In browser console:
```javascript
console.log('Auth token:', sessionStorage.getItem('arms-auth-token'))
console.log('Supabase auth:', sessionStorage.getItem('arms-supabase-auth'))
```

## Most Likely Solutions

### Scenario 1: Email Confirmation Enabled
**Problem**: Can't login after registration  
**Solution**: Disable email confirmation in Supabase OR check email and confirm

### Scenario 2: User Doesn't Exist
**Problem**: 404 error on login  
**Solution**: Complete registration first OR use existing user

### Scenario 3: Wrong Credentials
**Problem**: 401 unauthorized  
**Solution**: Check email/password, reset password if needed

### Scenario 4: Rate Limited
**Problem**: 429 too many requests  
**Solution**: Wait 15 minutes (already increased limit to 10)

## Recommended Action Plan

1. ✅ **Disable email confirmation** in Supabase (fastest fix for testing)
2. ✅ **Clear browser cache** and session storage
3. ✅ **Try registration** again
4. ✅ **Check it works** before re-enabling email confirmation
5. ✅ **Implement proper email confirmation** flow later

## Quick Test

Run this in browser console on your Vercel site:

```javascript
// Test backend connectivity
fetch('https://arms-c56l.onrender.com/health')
  .then(r => r.json())
  .then(d => console.log('Backend:', d))
  .catch(e => console.error('Backend error:', e))

// Test Supabase
const testAuth = async () => {
  const { data, error } = await window.supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'test123'
  })
  console.log('Supabase test:', { data, error })
}
testAuth()
```

---

**Quickest Fix**: Disable email confirmation in Supabase dashboard  
**Status**: Rate limit increased, CORS configured, just need to handle email confirmation
