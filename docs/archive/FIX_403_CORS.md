# Fix 403 CORS Error

## Problem
Getting 403 error when trying to login or register because the backend (Render) doesn't recognize the frontend (Vercel) origin.

## Root Cause
The backend's `FRONTEND_URL` environment variable is set to `http://localhost:3000` but your production frontend is on Vercel.

## Solution: Update Render Environment Variables

### 1. Get Your Vercel Frontend URL
1. Go to Vercel Dashboard: https://vercel.com/ekenes-projects-c08862f30
2. Click on your **frontend** project
3. Find your production URL (looks like `https://frontend-xxx.vercel.app`)

### 2. Update Render Environment Variables
1. Go to Render Dashboard: https://dashboard.render.com
2. Select your **backend** service
3. Go to **Environment** tab
4. Update/Add these variables:

```bash
# Update this with your actual Vercel URL
FRONTEND_URL=https://your-frontend-url.vercel.app

# Optional: Allow multiple origins (comma-separated)
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app,http://localhost:3000

# Make sure NODE_ENV is set to production
NODE_ENV=production
```

### 3. Save and Redeploy
1. Click **Save Changes**
2. Render will automatically redeploy
3. Wait ~2-3 minutes for deployment

## Quick Fix (Alternative)

The backend already allows ALL Vercel apps by default:
```typescript
// In bootstrap.ts - this regex allows any *.vercel.app domain
if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
  return true;
}
```

So the issue might be:
1. **Missing CORS headers** - Check if request includes `Origin` header
2. **Wrong URL format** - Make sure you're using `https://` not `http://`
3. **Authentication issue** - 403 could be auth-related, not CORS

## Test CORS Configuration

### From Browser Console:
```javascript
fetch('https://arms-c56l.onrender.com/health', {
  method: 'GET',
  headers: {
    'Origin': window.location.origin
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

Expected: `{status: "ok", timestamp: "..."}`  
If error: CORS issue confirmed

## Check Backend Logs

1. Go to Render Dashboard → Your Service → Logs
2. Look for CORS errors like:
   ```
   Not allowed by CORS
   ```
3. Or authentication errors:
   ```
   Unauthorized
   Forbidden
   ```

## Common Causes of 403

### 1. CORS Issue (Most Likely)
**Symptoms**: 
- Error appears in browser console
- "CORS policy" mentioned in error
- Request doesn't reach backend

**Fix**: Add `FRONTEND_URL` or `ALLOWED_ORIGINS` to Render env vars

### 2. Rate Limiting
**Symptoms**:
- Works first few times, then fails
- Error message: "Too many requests"

**Fix**: Wait 15 minutes or temporarily increase rate limit

### 3. Authentication Token Issue
**Symptoms**:
- 403 on protected routes
- "Forbidden" or "Unauthorized" in response

**Fix**: Check if token is being sent in Authorization header

### 4. Helmet CSP (Content Security Policy)
**Symptoms**:
- Works locally, fails in production
- CSP errors in browser console

**Fix**: Already handled - CSP is disabled in non-production

## Verify Fix

After updating Render environment variables:

1. **Wait for redeploy** (~2-3 minutes)
2. **Clear browser cache** (Ctrl + Shift + R)
3. **Try to login/register again**
4. **Check browser console** for any remaining errors

## Still Not Working?

### Check Request Headers
Open DevTools → Network → Select failed request → Headers

Look for:
```
Request URL: https://arms-c56l.onrender.com/auth/login
Request Method: POST
Origin: https://your-frontend.vercel.app
```

### Check Response Headers
Should include:
```
Access-Control-Allow-Origin: https://your-frontend.vercel.app
Access-Control-Allow-Credentials: true
```

If missing → CORS issue confirmed

## Temporary Development Workaround

If you need to test immediately:

1. Use **localhost** for frontend:
   ```bash
   cd frontend
   npm run dev
   # Access at http://localhost:3000
   ```

2. Or add `*` to ALLOWED_ORIGINS temporarily (NOT for production):
   ```bash
   ALLOWED_ORIGINS=*
   ```

## Expected Render Environment Variables

Your Render backend should have:
```bash
DATABASE_URL=postgresql://postgres...
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
JWT_SECRET=QhwfbSHzMd5wVLWZMs6+GQYmk73NSUVJyt3iD91jVgA=
SUPABASE_URL=https://vnkvdnagnkvlyrnkeczh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PAYSTACK_SECRET_KEY=sk_test_...
# ... other vars
```

---

**Most likely fix**: Just add your Vercel URL to `FRONTEND_URL` on Render!
