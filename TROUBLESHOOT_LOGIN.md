# Login Error Troubleshooting Guide

## Current Error
```
POST https://arms-c56l.onrender.com/auth/login 403 (Forbidden)
```

## What This Means

A **403 Forbidden** error during login means:
- The backend received your request
- But **rejected it before checking credentials**
- This is NOT an "invalid email/password" error (that would be 401)

## Root Causes & Solutions

### 1. Running Production Build Locally ⚠️

**Problem**: You're running a production build that connects to production backend.

**Check**:
```bash
# In frontend directory
npm run dev
# NOT npm run build && npm run preview
```

**Solution**: Always use `npm run dev` for local development. This uses `.env` (not `.env.production`).

### 2. User Doesn't Exist in Production Database

**Problem**: The account you're trying to use exists in local database but not in production.

**Solution**: Create account in production:

#### Option A: Register New User (Resident)
1. Go to production: https://your-production-url.vercel.app/register
2. Complete registration
3. **Check email** for confirmation link (CRITICAL)
4. Click confirmation link
5. Try logging in

#### Option B: Bootstrap Admin in Production
```bash
# Use production API URL
curl -X POST https://arms-c56l.onrender.com/auth/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "bootstrapToken": "arms_bootstrap_2026_secure_token_xyz",
    "email": "admin@production.com",
    "password": "SecureAdmin123!",
    "firstName": "Admin",
    "lastName": "User",
    "phoneNumber": "+1234567890",
    "address": "Admin Office",
    "ward": "Operations",
    "houseNumber": "1",
    "street": "Admin Street"
  }'
```

### 3. Supabase Email Confirmation Required

**Problem**: Supabase requires email confirmation, and you haven't confirmed your email yet.

**Check**: Go to Supabase Dashboard → Authentication → Users
- Look for your email
- Check if "Email Confirmed" is ✅ or ❌

**Solution**:
1. **If not confirmed**: Check spam folder for confirmation email
2. **If no email received**: Resend confirmation or disable email confirmation

**Disable Email Confirmation (for testing)**:
1. Supabase Dashboard → Authentication → Providers → Email
2. Uncheck "Confirm email"
3. Save

### 4. Backend Configuration Issue

**Problem**: Production backend has different configuration than local.

**Check Backend Logs**:
1. Go to Render Dashboard
2. Open your backend service
3. Click "Logs"
4. Try logging in again
5. Look for error messages

**Common Issues**:
- Missing environment variables
- Database connection failure
- CORS configuration

### 5. CORS Configuration

**Problem**: Frontend domain is not allowed by backend.

**Check**: Look for CORS errors in browser console (F12)

**Solution**: Ensure backend allows your frontend domain in CORS settings.

## Quick Diagnostic Steps

### Step 1: Confirm Which Environment You're Using

Open browser console and run:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

**Expected**:
- Development: `http://localhost:3001`
- Production: `https://arms-c56l.onrender.com`

### Step 2: Check if Backend is Alive

```bash
curl https://arms-c56l.onrender.com/health
```

**Expected**: `{"status":"ok","timestamp":"..."}`

### Step 3: Try Registering a New User

1. Go to https://your-production-url.vercel.app/register
2. Fill in all details
3. Submit
4. **Check browser console for errors**
5. **Check email for confirmation**

### Step 4: Check Backend Logs

1. Render Dashboard → Your Service → Logs
2. Watch logs while attempting to login
3. Look for:
   - Database errors
   - Authentication errors
   - Stack traces

## Recommended Development Workflow

### For Local Development (Recommended)

```bash
# Terminal 1: Backend (local database)
cd backend
npm run start:dev

# Terminal 2: Frontend (connects to localhost:3001)
cd frontend
npm run dev
```

**Access**: http://localhost:3000

### For Production Testing

```bash
# Frontend only (connects to production backend)
cd frontend
npm run build
npm run preview
```

**Access**: http://localhost:4173 (or whatever Vite preview uses)

## Solutions Summary

| Scenario | Solution |
|----------|----------|
| Testing locally | Use `npm run dev` (not production build) |
| First production user | Bootstrap admin or register + confirm email |
| Email not confirmed | Check spam, click link, or disable confirmation |
| User doesn't exist | Register new account in production |
| Backend down | Check Render logs, restart service |
| CORS error | Configure backend to allow frontend domain |

## Next Steps

1. **Determine your goal**:
   - Testing locally? → Use `npm run dev` with local backend
   - Testing production? → Register new user + confirm email

2. **Check email confirmation** in Supabase Dashboard

3. **Check backend logs** on Render for specific error

4. **If still stuck**: Run the diagnostic script:
   ```bash
   node diagnose-onboarding.js
   ```

## Emergency Bypass (Development Only)

To bypass email confirmation temporarily:

1. **Supabase Dashboard** → Authentication → Providers → Email
2. **Disable** "Confirm email"  
3. **Save**

Now users can register and login immediately without email confirmation.

⚠️ **Re-enable email confirmation before actual production launch!**

---

## Detailed Error Investigation

### Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for detailed error message
4. Check Network tab → Failed request → Response

### Check Backend Response

The 403 error should have a response body with more details:

```javascript
// In browser console after failed login
// Check the actual error response
```

Common 403 responses:
- `"Admin invite is required"` → Need admin invite token
- `"Email not confirmed"` → Confirm email first
- `"User not found"` → Account doesn't exist in this database
- No message → CORS or middleware blocking request

---

## Contact Support

If none of these solutions work:

1. Share backend logs from Render
2. Share full browser console error
3. Confirm which database you're trying to connect to
4. Confirm user exists in that database

---

Last updated: June 7, 2026
