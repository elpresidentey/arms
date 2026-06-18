# Fix: Bin Collection Not Loading

## Diagnosis Complete ✅

**Backend Status:** ✅ Working fine
- Health check: http://localhost:3001/health responds
- Database: 24 collection routes exist
- Endpoint: `/collection-routes` requires authentication (401 Unauthorized without token)

**The Problem:** The bin collection schedules page isn't loading. This is an **authentication or frontend connectivity issue**, not a backend problem.

## Common Causes & Solutions

### 1. Not Logged In (Most Likely)

**Symptoms:**
- Bin collection page shows loading spinner indefinitely
- Browser console shows 401 Unauthorized errors
- Page shows "Couldn't load schedules" error

**Solution:**
```bash
# Make sure you're logged in
# Go to: http://localhost:3000/login
# Or: http://localhost:3000/admin/login (for admin)
```

**Test accounts (from database):**
- Check which emails exist in your database
- Use those to login

### 2. Session Expired

**Symptoms:**
- You were logged in before
- Now the page won't load
- Browser console shows 401 errors

**Solution:**
1. Clear your browser's session storage:
   - Open DevTools (F12)
   - Go to Application tab
   - Click "Session Storage"
   - Delete `arms-supabase-auth`
2. Logout and login again
3. Refresh the page

### 3. Wrong API URL

**Symptoms:**
- Network errors in browser console
- "Failed to fetch" errors
- Connection refused errors

**Check your environment:**
```bash
# Frontend should connect to:
VITE_API_URL=http://localhost:3001

# Verify backend is running:
curl http://localhost:3001/health
```

**Solution:**
1. Make sure backend is running:
   ```bash
   cd backend
   npm run start:dev
   ```

2. Make sure frontend is using correct API URL:
   ```bash
   # Check frontend/.env
   # Should have: VITE_API_URL=http://localhost:3001
   ```

3. Restart frontend:
   ```bash
   cd frontend
   npm run dev
   ```

### 4. CORS Issues

**Symptoms:**
- Browser console shows CORS errors
- "Access-Control-Allow-Origin" errors

**Solution:**
Backend CORS is configured to allow `http://localhost:3000`. Make sure:
1. Frontend is running on `http://localhost:3000`
2. Not using a different port
3. Not using `127.0.0.1` instead of `localhost`

### 5. Auth Token Not Being Sent

**Symptoms:**
- Logged in but still getting 401 errors
- Token exists in storage but API calls fail

**Debug steps:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try loading bin collection page
4. Look for request to `/collection-routes`
5. Check request headers - should have `Authorization: Bearer <token>`

**If token is missing:**
```javascript
// Check in browser console:
sessionStorage.getItem('arms-supabase-auth')
// Should return auth data with token

// If null or invalid, logout and login again
```

## Quick Diagnostic Checklist

Run through this checklist:

- [ ] Backend is running: `curl http://localhost:3001/health`
- [ ] Frontend is running: Open `http://localhost:3000`
- [ ] You are logged in (check top right corner for user menu)
- [ ] Browser console has no 401 errors (F12 → Console tab)
- [ ] Network tab shows `/collection-routes` request succeeds (F12 → Network tab)
- [ ] Session storage has auth token (F12 → Application → Session Storage)

## Step-by-Step Fix

### For Development (Local):

**Step 1: Make sure backend is running**
```bash
cd backend
npm run start:dev
```

You should see:
```
Application is running on: http://localhost:3001
```

**Step 2: Make sure frontend is running**
```bash
cd frontend  
npm run dev
```

You should see:
```
Local: http://localhost:3000
```

**Step 3: Login**
1. Go to: http://localhost:3000/login
2. Login with valid credentials
3. You should be redirected to dashboard

**Step 4: Navigate to bin collection**
1. Click "Schedules" in the sidebar
2. Or go directly to: http://localhost:3000/app/schedules

**Expected result:** You should see 24 collection routes displayed

### For Production (Vercel):

**Step 1: Check if you're logged in**
- Look for user menu in top right
- If not logged in, go to login page

**Step 2: Check environment variables**
Vercel needs these environment variables:
```env
VITE_API_URL=https://arms-c56l.onrender.com
VITE_SUPABASE_URL=https://vnkvdnagnkvlyrnkeczh.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Step 3: Check backend is accessible**
Visit: https://arms-c56l.onrender.com/health

Should respond with:
```json
{"status":"ok","timestamp":"...","uptime":...}
```

**Step 4: Clear cache and retry**
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Or clear browser cache completely
3. Login again
4. Try accessing bin collection

## Debugging Tools

### Check Backend Connectivity
```bash
# Test health endpoint
curl http://localhost:3001/health

# Count routes in database
cd backend
node check-routes.js
```

### Check Frontend API Configuration
```bash
# In browser console (F12):
console.log(import.meta.env.VITE_API_URL)
# Should show: http://localhost:3001
```

### Check Authentication
```bash
# In browser console:
const authData = sessionStorage.getItem('arms-supabase-auth')
console.log(JSON.parse(authData))
# Should show user and token data
```

### Test API Endpoint Manually
```bash
# Get a token first (login through UI)
# Then in browser console:
fetch('http://localhost:3001/collection-routes', {
  headers: {
    'Authorization': `Bearer ${JSON.parse(sessionStorage.getItem('arms-supabase-auth')).token}`
  }
})
.then(r => r.json())
.then(console.log)
```

## Still Not Working?

If you've tried everything above and it still doesn't work:

### 1. Check Browser Console
Press F12 → Console tab, look for errors:

| Error Type | Cause | Fix |
|------------|-------|-----|
| `401 Unauthorized` | Not logged in / expired session | Login again |
| `Failed to fetch` | Backend not running | Start backend |
| `CORS error` | Wrong origin | Check CORS settings |
| `Network error` | Wrong API URL | Check VITE_API_URL |

### 2. Check Network Tab
Press F12 → Network tab:

- Look for request to `/collection-routes`
- Check request status (should be 200)
- Check response (should be array of routes)
- Check request headers (should have Authorization)

### 3. Test with Different Browser
Sometimes browser extensions or cache cause issues:
- Try Chrome Incognito mode
- Try a different browser
- Disable browser extensions

### 4. Check Backend Logs
```bash
cd backend
# Look at console output for errors
# Should show incoming requests and any errors
```

## Production-Specific Issues

If this issue is on your deployed site (Vercel):

### Check Environment Variables
1. Go to Vercel Dashboard
2. Select your frontend project
3. Settings → Environment Variables
4. Verify `VITE_API_URL` points to your backend
5. Redeploy if you changed anything

### Check Backend is Up
- Render backend: https://arms-c56l.onrender.com/health
- Should respond without errors
- If backend is sleeping, first request wakes it up (takes ~30 seconds)

### Check CORS Configuration
Backend must allow your Vercel domain:
```typescript
// backend/src/main.ts
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://arms-roan.vercel.app',  // Add your Vercel URL
    'https://frontend-psi-weld-dh3z0pv6q4.vercel.app',
  ],
  credentials: true,
});
```

## Summary

**Most Common Fix:**
1. Make sure you're logged in
2. Make sure backend is running (http://localhost:3001/health)
3. Make sure frontend is running (http://localhost:3000)
4. Refresh the page
5. Clear session storage if needed

**Quick Test:**
```bash
# 1. Check backend
curl http://localhost:3001/health

# 2. Check routes exist
cd backend && node check-routes.js

# 3. Login to frontend
# Go to http://localhost:3000/login

# 4. Navigate to schedules
# Go to http://localhost:3000/app/schedules
```

**If still broken, provide:**
- Browser console errors (F12 → Console)
- Network tab for /collection-routes request (F12 → Network)
- Backend console logs
- Whether you're logged in or not

---

**Status:** Backend ✅ | Database ✅ | Issue: Frontend authentication/connectivity  
**Next Action:** Login and check browser console for specific errors
