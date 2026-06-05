# 📋 Render Deployment Checklist

## Before You Start

✅ All items below are VERIFIED and ready:

### Configuration Files
- [x] ✅ `backend/render.yaml` - Configured correctly
- [x] ✅ `backend/package.json` - Has `start:prod` script
- [x] ✅ `backend/.env` - Has all required variables
- [x] ✅ Health check endpoint exists at `/health/ping`

### Local Verification
- [x] ✅ Backend runs locally (`npm run start:dev`)
- [x] ✅ Backend builds successfully (`npm run build`)
- [x] ✅ Production mode works (`npm run start:prod`)
- [x] ✅ Database connection works (Supabase)

### GitHub Repository
- [ ] ⏳ Changes committed to git
- [ ] ⏳ Changes pushed to GitHub

---

## Deployment Steps

### Step 1: Commit & Push (Do this now!)

```bash
git add .
git commit -m "Configure backend for Render deployment"
git push origin main
```

### Step 2: Sign in to Render
1. Go to https://render.com
2. Sign in with GitHub (elpresidentey account)

### Step 3: Create Web Service
1. Click "New +" → "Web Service"
2. Connect repository: elpresidentey/arms
3. Click "Connect"

### Step 4: Configure Service
Fill in these EXACTLY:

| Field | Value |
|-------|-------|
| Name | `arms-backend` |
| Region | Choose closest (Oregon/Frankfurt) |
| Branch | `main` |
| **Root Directory** | `backend` ⚠️ CRITICAL! |
| Environment | `Node` |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm run start:prod` |
| Plan | **Free** |

### Step 5: Add Environment Variables

Click "Advanced" → Add these environment variables:

**Quick paste (copy all at once):**
```env
NODE_ENV=production
DB_PROVIDER=postgres
DATABASE_URL=postgresql://postgres.vnkvdnagnkvlyrnkeczh:HmNB2wnzzNkF2lOb@aws-1-eu-central-2.pooler.supabase.com:5432/postgres
DB_HOST=aws-1-eu-central-2.pooler.supabase.com
DB_PORT=5432
DB_USERNAME=postgres.vnkvdnagnkvlyrnkeczh
DB_PASSWORD=HmNB2wnzzNkF2lOb
DB_NAME=postgres
DB_SSL=true
DB_SYNC=false
DB_SEED=false
JWT_SECRET=QhwfbSHzMd5wVLWZMs6+GQYmk73NSUVJyt3iD91jVgA=
JWT_EXPIRES_IN=7d
SUPABASE_URL=https://vnkvdnagnkvlyrnkeczh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZua3ZkbmFnbmt2bHlybmtlY3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjU2NDYsImV4cCI6MjA5MzIwMTY0Nn0.hiQj72oMfM4smSzbDBKcxIJnIdcUZ9RrGVdOpq8lSbE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZua3ZkbmFnbmt2bHlybmtlY3poIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNTY0NiwiZXhwIjoyMDkzMjAxNjQ2fQ.3pgRYnYaFP-NZsafr5GtZm1MqnEq6vVDdvectc1V8bo
PAYSTACK_SECRET_KEY=sk_test_2123289e6435a7fd496da2597503940b8c38d3b1
PAYSTACK_TEST_MODE=true
GEOAPIFY_API_KEY=b420e94b0c8a46d39bc3c7e2dda83811
RESEND_API_KEY=re_E96Nd4bN_E7mXeytykUvgZFUwahfv4AJW
RESEND_FROM_EMAIL=onboarding@resend.dev
SUPPORT_EMAIL=support@arms-waste.com
SENTRY_DSN=https://f6562ffa926a4392a4955bf1902388ea@o4511359747293184.ingest.us.sentry.io/4511359766036480
BOOTSTRAP_ADMIN_TOKEN=arms_bootstrap_2026_secure_token_xyz
FRONTEND_URL=https://frontend-psi-weld-dh3z0pv6q4.vercel.app
ALLOWED_ORIGINS=https://frontend-psi-weld-dh3z0pv6q4.vercel.app
SUPABASE_PASSWORD_REDIRECT_URL=https://frontend-psi-weld-dh3z0pv6q4.vercel.app/reset-password
```

### Step 6: Click "Create Web Service" 

Wait 5-10 minutes. Watch the logs!

---

## What to Watch For (In Logs)

### ✅ Success Indicators:
```
==> Installing dependencies...
==> Building application...
webpack compiled successfully
==> Starting service...
Nest application successfully started
ARMS Backend running on port 10000
Your service is live! 🎉
```

### ❌ Error Indicators:
```
ERROR: Cannot find module
ERROR: Build failed
ERROR: Health check failed
```

**If you see errors:** Copy the error message and I'll help you fix it!

---

## After Deployment Success

### Step 1: Copy Your Backend URL
It will look like: `https://arms-backend-xxxx.onrender.com`

### Step 2: Test Health Check
Open in browser:
```
https://your-backend-url.onrender.com/health/ping
```

Should see: `{"pong":true}`

### Step 3: Update Frontend (Vercel)
1. Go to vercel.com
2. Your project → Settings → Environment Variables
3. Update `VITE_API_URL` to your Render URL
4. Redeploy frontend

### Step 4: Update Backend CORS
1. Go back to Render dashboard
2. Your service → Environment
3. Update these variables:
   - `FRONTEND_URL` = your actual Vercel URL
   - `ALLOWED_ORIGINS` = your actual Vercel URL  
   - `SUPABASE_PASSWORD_REDIRECT_URL` = your-vercel-url/reset-password
4. Save (will auto-redeploy)

### Step 5: Test Everything!
- [ ] Can register new user
- [ ] Can login
- [ ] Dashboard loads
- [ ] Can create waste collection request
- [ ] Notifications appear in real-time
- [ ] WebSocket connection shows "connected"

---

## 🆘 If Something Goes Wrong

### Build Fails
1. Check logs for specific error
2. Verify "Root Directory" is set to `backend`
3. Check all dependencies are in package.json
4. Try "Clear build cache & deploy"

### Health Check Fails
1. Check if `/health/ping` endpoint exists
2. Verify DATABASE_URL is correct
3. Check logs for startup errors
4. Make sure DB_SSL=true

### Can't Connect from Frontend
1. Check CORS settings (FRONTEND_URL, ALLOWED_ORIGINS)
2. Verify frontend has correct backend URL
3. Check browser console for errors
4. Test health endpoint directly in browser

---

## 🎯 Expected Timeline

- **Commit & Push**: 1 minute
- **Create service on Render**: 2 minutes
- **Build & Deploy**: 5-10 minutes
- **Test & Verify**: 3 minutes
- **Update frontend**: 5 minutes

**Total: ~15-20 minutes**

---

## ✅ Final Success Check

Your deployment is successful when ALL of these work:

- [ ] Render shows "Live" status (green)
- [ ] Health check passes: `/health/ping` returns `{"pong":true}`
- [ ] Frontend can reach backend
- [ ] User can register/login
- [ ] Dashboard loads with data
- [ ] Real-time notifications work
- [ ] No errors in Render logs
- [ ] No errors in browser console

---

## 🎉 You're Done!

Once all checks pass:
- ✅ Backend is deployed on Render (free)
- ✅ WebSockets work (real-time notifications)
- ✅ Frontend connects to backend
- ✅ All features work 100%

**Next steps:**
- Monitor the logs for a few days
- Consider upgrading to Starter ($7/mo) if cold starts are annoying
- Set up custom domain (optional)
- Add monitoring/alerts

---

## 📞 Need Help?

If anything fails:
1. Copy the error from Render logs
2. Share it with me
3. Check the detailed guide: `RENDER_DEPLOYMENT_GUIDE.md`

**Remember:** First deployment after free tier spin-down takes 30-60 seconds. This is normal!
