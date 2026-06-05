# 🚀 Render.com Deployment Guide - ARMS Backend

## ✅ Pre-Deployment Checklist (Already Done!)

- [x] ✅ `render.yaml` configured and optimized
- [x] ✅ Health check endpoint exists (`/health/ping`)
- [x] ✅ Build command uses `npm ci` (faster, more reliable)
- [x] ✅ Start command uses `npm run start:prod`
- [x] ✅ Backend runs successfully locally
- [x] ✅ Database (Supabase) is accessible
- [x] ✅ All environment variables identified

---

## 🎯 Deployment Steps (Follow Carefully)

### Step 1: Commit and Push to GitHub

First, let's commit our changes:

```bash
# Check what files changed
git status

# Add all changes
git add .

# Commit with a clear message
git commit -m "Configure backend for Render deployment"

# Push to GitHub
git push origin main
```

### Step 2: Sign Up / Login to Render

1. Go to https://render.com
2. Click "Get Started" or "Sign In"
3. Sign in with your **GitHub account** (elpresidentey)
4. Authorize Render to access your repositories

### Step 3: Create New Web Service

1. Click "New +" button (top right)
2. Select "Web Service"
3. Connect your GitHub repository: **elpresidentey/arms**
4. Click "Connect" next to the repository

### Step 4: Configure the Service

Render will show you a configuration form. Fill it in:

#### Basic Settings:
- **Name**: `arms-backend` (or any name you prefer)
- **Region**: Choose closest to you (e.g., `Oregon` for US West)
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ **CRITICAL - DON'T MISS THIS!**
- **Environment**: `Node`
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm run start:prod`

#### Plan:
- Select **"Free"** plan
- Note: Free plan spins down after 15 mins of inactivity (acceptable)

### Step 5: Add Environment Variables

Click "Advanced" or scroll down to "Environment Variables" section.

⚠️ **IMPORTANT**: Add ALL of these variables:

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
SUPPORT_EMAIL=support@your-verified-domain.com
SENTRY_DSN=https://f6562ffa926a4392a4955bf1902388ea@o4511359747293184.ingest.us.sentry.io/4511359766036480
BOOTSTRAP_ADMIN_TOKEN=arms_bootstrap_2026_secure_token_xyz
FRONTEND_URL=https://your-frontend.vercel.app
ALLOWED_ORIGINS=https://your-frontend.vercel.app
SUPABASE_PASSWORD_REDIRECT_URL=https://your-frontend.vercel.app/reset-password
```

**Tip**: You can use "Add from .env" if Render provides that option, or paste them one by one.

### Step 6: Click "Create Web Service"

Render will now:
1. Clone your repository
2. Install dependencies (takes 2-3 minutes)
3. Build your application (takes 1-2 minutes)
4. Start the server
5. Run health checks

**Total time: 5-10 minutes**

---

## 📊 Monitoring the Deployment

### Watch the Logs

In the Render dashboard, you'll see real-time logs:

#### ✅ Good Signs (Deployment is working):
```
==> Downloading cache...
==> Installing dependencies...
==> Building application...
webpack 5.97.1 compiled successfully
==> Starting service...
Sentry initialized for error monitoring
[Nest] Nest application successfully started
ARMS Backend running on port 10000
Health check passed
==> Your service is live! 🎉
```

#### ❌ Bad Signs (Something went wrong):
```
ERROR: Cannot find module...
ERROR: Build failed
ERROR: Health check failed
ERROR: listen EADDRINUSE
```

---

## 🔍 Common Issues & Solutions

### Issue 1: "Root Directory not set"
**Symptom**: Build tries to install from wrong location  
**Solution**: Make sure "Root Directory" is set to `backend`

### Issue 2: "Module not found"
**Symptom**: Build fails with missing module errors  
**Solution**: 
- Check that all dependencies are in `package.json`
- Use `npm ci` instead of `npm install` (already set)

### Issue 3: "Health check failed"
**Symptom**: Service built but health check times out  
**Solution**: 
- Verify `/health/ping` endpoint works locally
- Check if DATABASE_URL is accessible from Render
- Look for errors in logs

### Issue 4: "Database connection failed"
**Symptom**: App starts but crashes when accessing database  
**Solution**:
- Verify DATABASE_URL is correct
- Check if DB_SSL=true is set
- Ensure Supabase allows connections from Render IPs

### Issue 5: "Port binding error"
**Symptom**: Error: listen EADDRINUSE  
**Solution**: 
- Remove PORT from environment variables (Render sets it automatically)
- Make sure your code uses `process.env.PORT` (already done in `main.ts`)

---

## ✅ Post-Deployment Verification

### Step 1: Get Your Backend URL

After deployment succeeds:
1. Go to your service dashboard on Render
2. Copy the URL (looks like: `https://arms-backend-xxxx.onrender.com`)

### Step 2: Test Health Endpoint

```bash
# Test in browser or curl
curl https://your-backend-url.onrender.com/health/ping

# Expected response:
{"pong":true}
```

### Step 3: Test Database Connection

```bash
# Test an authenticated endpoint
curl https://your-backend-url.onrender.com/health

# Should return health status with database info
```

### Step 4: Test WebSocket Connection

Open browser console on your frontend and check:
```javascript
// Should see in console:
"Socket connected to: https://your-backend-url.onrender.com"
```

---

## 🔄 Update Frontend to Use Render Backend

### Method 1: Via Vercel Dashboard

1. Go to https://vercel.com
2. Select your frontend project
3. Settings → Environment Variables
4. Find `VITE_API_URL`
5. Update to: `https://your-backend-url.onrender.com`
6. Click "Save"
7. Go to Deployments → Click "..." → "Redeploy"

### Method 2: Via Vercel CLI

```bash
# Remove old variable
vercel env rm VITE_API_URL production

# Add new Render URL
echo "https://your-backend-url.onrender.com" | vercel env add VITE_API_URL production

# Redeploy frontend
cd frontend
vercel --prod
```

---

## 🔄 Update Render Backend CORS

After getting your Vercel frontend URL, update these environment variables on Render:

1. Go to Render dashboard → Your service
2. Click "Environment"
3. Update these variables:
   - `FRONTEND_URL` = your Vercel URL
   - `ALLOWED_ORIGINS` = your Vercel URL
   - `SUPABASE_PASSWORD_REDIRECT_URL` = your-vercel-url/reset-password
4. Click "Save Changes"
5. Render will automatically redeploy

---

## 📈 Understanding Render Free Tier

### What You Get:
- ✅ 750 hours/month (enough for 1 service running 24/7)
- ✅ 512 MB RAM
- ✅ 0.1 CPU
- ✅ WebSockets supported
- ✅ Automatic HTTPS
- ✅ Custom domains (optional)

### Limitations:
- ⚠️ Service spins down after 15 minutes of inactivity
- ⚠️ First request after spin-down takes 30-60 seconds (cold start)
- ⚠️ Slower than paid plans
- ⚠️ No SLA guarantee

### Acceptable For:
- ✅ Development and testing
- ✅ Side projects
- ✅ Low-traffic applications
- ✅ MVP/demos
- ✅ Applications where 30s cold start is acceptable

### Upgrade to Starter ($7/month) for:
- No cold starts
- Faster performance
- Better reliability
- Priority support

---

## 🎯 Architecture After Deployment

```
Users
  ↓
Frontend (Vercel)
  ↓ HTTPS + WebSocket
Backend (Render) ← Your NestJS app
  ↓ PostgreSQL
Database (Supabase)
```

---

## 🛠️ Useful Render Commands & Features

### View Logs
- Dashboard → Your Service → Logs (real-time)
- Filter by "Error", "Warn", etc.

### Manual Deploy
- Dashboard → Manual Deploy → "Clear build cache & deploy"

### Restart Service
- Dashboard → Manual Deploy → "Suspend" then "Resume"

### Shell Access
- Dashboard → Shell (opens terminal to your container)
- Useful for debugging: `ls`, `cat .env`, `npm list`

### Metrics
- Dashboard → Metrics
- View CPU, Memory, Request rates

---

## 🚨 Troubleshooting Checklist

If deployment fails, check:

- [ ] Root Directory is set to `backend`
- [ ] All environment variables are added
- [ ] DATABASE_URL is accessible
- [ ] GitHub repository is up to date
- [ ] `package.json` has all dependencies
- [ ] `npm run build` works locally
- [ ] `npm run start:prod` works locally
- [ ] Health check endpoint `/health/ping` works
- [ ] No sensitive files in git (check `.gitignore`)

---

## 💡 Pro Tips

### 1. Keep GitHub in Sync
Render deploys from GitHub. Always push changes before expecting updates.

### 2. Use Build Cache
Render caches `node_modules`. Don't clear unless necessary.

### 3. Monitor Logs
Keep the logs tab open during first deployment to catch issues early.

### 4. Test Locally First
Always run `npm run build && npm run start:prod` locally before deploying.

### 5. Environment Variables
Store secrets in Render, not in code. Never commit `.env` files.

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ Build completes without errors
- ✅ Health check passes (green checkmark)
- ✅ Service shows "Live" status
- ✅ `/health/ping` returns `{"pong":true}`
- ✅ Frontend can connect to backend
- ✅ WebSocket connection works
- ✅ Database queries work
- ✅ Authentication works
- ✅ Real-time notifications appear

---

## 📞 Getting Help

If you encounter issues:

1. **Check Logs First**: Dashboard → Logs
2. **Render Docs**: https://render.com/docs
3. **Render Community**: https://community.render.com
4. **Render Support**: help@render.com (free tier has limited support)
5. **Your logs**: Save deployment logs for debugging

---

## 🔄 Redeployment

To redeploy after code changes:

```bash
# 1. Make your changes
# 2. Commit and push
git add .
git commit -m "Your changes"
git push origin main

# 3. Render auto-deploys on push!
# Watch progress in Render dashboard
```

---

## ⚙️ Alternative: Deploy via render.yaml

You can also deploy using the `render.yaml` file:

1. Push `backend/render.yaml` to GitHub
2. On Render dashboard: New + → Blueprint
3. Connect repository
4. Render reads the YAML and configures automatically
5. Still need to manually add environment variable values

---

## 📋 Quick Reference

| Task | Command/Action |
|------|----------------|
| View logs | Dashboard → Logs |
| Restart service | Manual Deploy → Suspend/Resume |
| Update env vars | Environment → Edit → Save |
| Manual deploy | Manual Deploy → Clear cache & deploy |
| Shell access | Dashboard → Shell |
| View metrics | Dashboard → Metrics |
| Custom domain | Settings → Custom Domains |

---

## ✅ Final Checklist Before Going Live

- [ ] Backend deployed and health check passes
- [ ] Frontend updated with Render backend URL
- [ ] Frontend redeployed with new URL
- [ ] Backend CORS updated with frontend URL
- [ ] Test user registration works
- [ ] Test user login works
- [ ] Test WebSocket connection works
- [ ] Test database operations work
- [ ] Test file uploads work
- [ ] Test notifications appear
- [ ] Monitor logs for errors
- [ ] Set up error monitoring (Sentry is configured)

---

**Ready to deploy! Follow the steps carefully and you'll be live in 10 minutes! 🚀**
