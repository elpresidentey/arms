# Vercel Deployment Notes for ARMS Backend

## ⚠️ Critical Issues with Vercel Deployment

### 1. WebSocket Support - **BLOCKER**
**Status:** ❌ **Not Compatible**

Your backend uses WebSocket Gateway (`@WebSocketGateway`) in the notifications module. **Vercel serverless functions do NOT support WebSockets** because:
- Serverless functions are stateless and short-lived
- WebSockets require persistent, long-running connections
- Functions timeout after 10-60 seconds (depending on plan)

**Location:** `backend/src/notifications/notifications.gateway.ts`

### 2. Long-Running Processes
**Status:** ⚠️ **Potential Issue**

Vercel has execution time limits:
- **Hobby plan:** 10 seconds
- **Pro plan:** 60 seconds (serverless), 15 minutes (cron)
- **Enterprise:** Configurable

Any operations taking longer than these limits will fail.

---

## 🎯 Recommended Solutions

### Option 1: Use Railway or Render (Recommended)
Deploy to platforms that support persistent connections:
- **Railway** ✅ (You already have `railway.toml`)
- **Render** ✅ (You already have `render.yaml`)
- **Heroku** ✅
- **DigitalOcean App Platform** ✅

These platforms support:
- WebSockets
- Long-running processes
- Traditional Node.js servers

### Option 2: Hybrid Approach
- **Vercel:** Deploy REST API endpoints only
- **Railway/Render:** Deploy WebSocket server separately
- Update frontend to connect to different URLs for REST vs WebSocket

**Changes needed:**
1. Split backend into two deployments:
   - `backend-api` (Vercel) - REST endpoints only
   - `backend-ws` (Railway) - WebSocket server only

2. Remove WebSocket gateway from Vercel deployment
3. Configure frontend to use both endpoints:
   ```typescript
   // REST API
   const API_URL = 'https://your-backend.vercel.app';
   
   // WebSocket
   const WS_URL = 'https://your-backend-ws.railway.app';
   ```

### Option 3: Replace WebSockets with Polling/SSE
- Remove WebSocket gateway
- Implement Server-Sent Events (SSE) or polling for real-time updates
- SSE works on Vercel but has limitations

---

## 🔧 Current Vercel Configuration Analysis

### ✅ What's Correct:
1. **Serverless Entry Point:** `api/index.ts` properly exports handler
2. **Build Configuration:** `vercel.json` correctly configured
3. **Environment Variables:** Should be set in Vercel dashboard
4. **Database:** PostgreSQL (Supabase) works fine with serverless
5. **Caching:** Express app caching implemented

### ⚠️ Potential Issues:
1. **WebSockets:** Won't work (see above)
2. **File Uploads:** Limited to 4.5MB request body size
3. **Response Size:** Limited to 4.5MB
4. **Execution Time:** Limited based on plan
5. **Cold Starts:** First request after inactivity will be slower
6. **Cron Jobs:** Require separate Vercel Cron configuration

---

## 📋 Pre-Deployment Checklist for Vercel

If you decide to proceed with Vercel (REST API only):

### 1. Remove or Disable WebSocket Module
```bash
# Option A: Comment out in app.module.ts
# Option B: Create separate build without notifications module
```

### 2. Environment Variables
Set these in Vercel dashboard (Project Settings → Environment Variables):
- `DATABASE_URL`
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_SSL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYSTACK_SECRET_KEY`
- `RESEND_API_KEY`
- `GEOAPIFY_API_KEY`
- `SENTRY_DSN`
- `NODE_ENV=production`
- `PAYSTACK_TEST_MODE`
- `BOOTSTRAP_ADMIN_TOKEN`

### 3. Remove Problematic Configurations
```bash
# These won't be needed on Vercel:
- Remove PORT environment variable (Vercel assigns dynamically)
- Remove NODE_TLS_REJECT_UNAUTHORIZED=0 (security risk)
```

### 4. Optimize for Serverless
- Minimize dependencies to reduce bundle size
- Use connection pooling for database (Supabase Pooler is good)
- Implement proper caching strategies
- Consider edge runtime for faster responses

### 5. Test Locally in Serverless Mode
```bash
# Install Vercel CLI
npm i -g vercel

# Run local serverless simulation
cd backend
vercel dev
```

---

## 🚀 Recommended Deployment Strategy

### Best Choice: Railway (Full Feature Support)
```bash
# Your railway.toml is already configured
cd backend
railway up
```

**Why Railway?**
- ✅ WebSockets supported
- ✅ Long-running processes
- ✅ No request size limits
- ✅ No execution time limits
- ✅ Better for NestJS applications
- ✅ Free tier available

### Alternative: Render
```bash
# Your render.yaml is already configured
# Deploy via Render Dashboard
```

### Last Resort: Vercel (with modifications)
Only if you:
1. Remove WebSocket functionality
2. Accept serverless limitations
3. Need Vercel's specific features (Edge Network, etc.)

---

## 📊 Feature Compatibility Matrix

| Feature | Vercel | Railway | Render |
|---------|--------|---------|--------|
| REST API | ✅ | ✅ | ✅ |
| WebSockets | ❌ | ✅ | ✅ |
| Long-running processes | ❌ | ✅ | ✅ |
| File uploads | ⚠️ (4.5MB) | ✅ | ✅ |
| Cron jobs | ⚠️ (separate config) | ✅ | ✅ |
| Cold starts | ⚠️ (yes) | ✅ (minimal) | ✅ (minimal) |
| Free tier | ✅ | ✅ | ⚠️ (limited) |

---

## 🔍 What Will Fail on Vercel

1. **Real-time notifications** via WebSocket
2. **File uploads > 4.5MB**
3. **Long database migrations** or operations > 10s/60s
4. **Background jobs** that need to run continuously
5. **Scheduled tasks** without separate cron config

---

## 💡 Recommendation

**Deploy to Railway instead of Vercel** for the backend. Your configuration files are already ready!

Keep Vercel for the **frontend** React app - that's what Vercel excels at.

```bash
# Frontend → Vercel
cd frontend
vercel

# Backend → Railway
cd backend
railway up
```

This gives you the best of both worlds! 🎉
