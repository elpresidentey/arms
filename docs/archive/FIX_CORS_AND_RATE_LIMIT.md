# Fix: CORS and Rate Limit Errors

## Current Errors

You're seeing two issues:

### 1. CORS Error ❌
```
Access to XMLHttpRequest at 'https://arms-c56l.onrender.com/auth/login' 
from origin 'https://arms-roan.vercel.app' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### 2. Rate Limit Error ❌
```
POST https://arms-c56l.onrender.com/auth/login 
net::ERR_FAILED 429 (Too Many Requests)
```

## Root Cause

### Rate Limit (Primary Issue)
You've tried to login **more than 5 times in 15 minutes**, triggering the auth rate limiter:

```typescript
// backend/src/bootstrap.ts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // Maximum 5 attempts
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts, please try again later.',
});
```

**When rate limited:**
- Backend returns 429 status
- No CORS headers are sent
- Browser interprets this as a CORS error

### CORS Configuration (Actually OK)
The backend CORS config already allows Vercel domains:
```typescript
if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
  return true;
}
```

So `https://arms-roan.vercel.app` should work!

## Quick Fix Options

### Option 1: Wait 15 Minutes ⏰
**Easiest Solution:**
1. Wait 15 minutes for rate limit to reset
2. Try logging in again
3. Should work!

### Option 2: Restart Backend Service 🔄
**Fast Solution (if you have access):**

**On Render:**
1. Go to https://dashboard.render.com
2. Select your backend service
3. Click "Manual Deploy" → "Clear build cache & deploy"
4. Or use "Restart" button
5. Rate limit resets immediately

### Option 3: Temporarily Disable Rate Limit 🚨
**For Development/Testing Only:**

Update `backend/src/bootstrap.ts`:

```typescript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 100,  // Higher limit in dev
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts, please try again later.',
});
```

Then redeploy backend.

### Option 4: Add Your IP to Whitelist 🎯
**Best for Testing:**

Update `backend/src/bootstrap.ts`:

```typescript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  skip: (req) => {
    // Skip rate limiting for specific IPs
    const allowedIPs = (process.env.RATE_LIMIT_WHITELIST || '').split(',');
    return allowedIPs.includes(req.ip);
  },
  message: 'Too many authentication attempts, please try again later.',
});
```

Add to backend environment:
```env
RATE_LIMIT_WHITELIST=your.ip.address
```

## Verify CORS is Working

Once rate limit clears, test CORS:

### Test 1: Check Backend Health from Browser Console
```javascript
fetch('https://arms-c56l.onrender.com/health', {
  method: 'GET',
  headers: {
    'Origin': 'https://arms-roan.vercel.app'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Test 2: Check CORS Headers
```bash
curl -I -X OPTIONS \
  -H "Origin: https://arms-roan.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  https://arms-c56l.onrender.com/auth/login
```

Should see:
```
Access-Control-Allow-Origin: https://arms-roan.vercel.app
Access-Control-Allow-Credentials: true
```

## Update Backend CORS (If Needed)

If CORS is still blocking after rate limit clears, explicitly add your Vercel domains to backend environment:

### On Render Dashboard:

1. Go to: https://dashboard.render.com
2. Select backend service
3. Environment → Edit
4. Add/Update:
   ```
   ALLOWED_ORIGINS=https://arms-roan.vercel.app,https://frontend-psi-weld-dh3z0pv6q4.vercel.app
   ```
5. Save and redeploy

## Increase Rate Limits (Recommended)

Current rate limits are very strict for development. Update `backend/src/bootstrap.ts`:

```typescript
// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,  // Already good
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter - INCREASE THIS
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 50,  // Increase from 5 to 10/50
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts, please try again later.',
});
```

### Even Better - Environment Variable Control:

```typescript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT || '10'),  // Configurable
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts, please try again later.',
});
```

Then set in Render:
```env
AUTH_RATE_LIMIT=20
```

## Prevention

To avoid this in the future:

### 1. Use Correct Credentials
- Double-check email and password
- Make sure caps lock is off
- Copy-paste carefully

### 2. Test Locally First
```bash
# Test login before deploying
cd backend
npm run start:dev

# In another terminal
cd frontend
npm run dev

# Test login at http://localhost:3000
```

### 3. Monitor Rate Limits
Add logging to see when rate limits are hit:

```typescript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts, please try again later.',
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many authentication attempts',
      retryAfter: '15 minutes',
    });
  },
});
```

### 4. Implement Better Error Messages
Update frontend to show clear messages:

```typescript
// In AuthContext.tsx
catch (error) {
  if (error.response?.status === 429) {
    toast.error('Too many login attempts. Please wait 15 minutes and try again.');
  } else {
    toast.error(normalizeAuthError(error, 'Login failed'));
  }
  throw error;
}
```

## Current Status

**Rate Limit:** Active for your IP  
**Reset Time:** 15 minutes from last attempt  
**CORS Config:** Should be working (regex pattern allows Vercel domains)  
**Quick Fix:** Wait 15 minutes OR restart backend service

## Recommended Actions

### Immediate (Right Now):
1. **Wait 15 minutes** before trying to login again
2. Or **restart backend** on Render to reset rate limits immediately

### Short Term (Next Deploy):
1. **Increase auth rate limit** from 5 to 10-20 attempts
2. **Add better error messages** for rate limiting
3. **Add retry-after header** to tell users when they can try again

### Long Term (Production):
1. **Keep rate limits** for security (but higher than 5)
2. **Add monitoring** for rate limit hits
3. **Implement account lockout** instead of IP-based limiting
4. **Add CAPTCHA** after multiple failed attempts

## Testing After Fix

Once rate limit clears:

```bash
# 1. Test health endpoint
curl https://arms-c56l.onrender.com/health

# 2. Try login from Vercel
# Go to https://arms-roan.vercel.app/login
# Enter credentials
# Should work!

# 3. Check browser console
# Should see successful 200 response
# No CORS errors
```

## Quick Commands

```bash
# Check current rate limit status (won't work from outside)
# But you can test if backend is responding:
curl -I https://arms-c56l.onrender.com/health

# Test CORS headers
curl -I -X OPTIONS \
  -H "Origin: https://arms-roan.vercel.app" \
  https://arms-c56l.onrender.com/auth/login

# Check when service last restarted (indicates rate limit reset)
# View in Render dashboard logs
```

---

**Summary:**  
✅ CORS config is correct  
❌ Rate limit exceeded (5 attempts in 15 min)  
🔧 Fix: Wait 15 min OR restart backend  
📝 Improvement: Increase rate limit to 10-20
