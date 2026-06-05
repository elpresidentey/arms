# Deploy ARMS Backend to Railway - Quick Guide

## 🚀 Deployment Options

Choose one of these methods:

### Option 1: Railway CLI (Fastest) ✅ Recommended
### Option 2: Railway Dashboard (Web Interface)

---

## 📋 Pre-Deployment Checklist

- [x] Railway CLI installed (`railway --version` → 4.11.0)
- [x] Backend is working locally on port 3001
- [x] Railway configuration file exists (`backend/railway.toml`)
- [ ] Railway account created and logged in
- [ ] Git repository is clean and committed

---

## Option 1: Deploy via Railway CLI (Recommended)

### Step 1: Login to Railway
```bash
railway login
```
This will open your browser for authentication.

### Step 2: Navigate to Backend Directory
```bash
cd backend
```

### Step 3: Initialize Railway Project (First Time Only)
```bash
# Create a new project
railway init

# Or link to existing project
railway link
```

### Step 4: Set Environment Variables

**Option A: Copy from .env file**
```bash
# Railway can automatically use your .env file
railway up
```

**Option B: Set variables manually**
```bash
# Database
railway variables set DATABASE_URL="postgresql://postgres.vnkvdnagnkvlyrnkeczh:HmNB2wnzzNkF2lOb@aws-1-eu-central-2.pooler.supabase.com:5432/postgres"
railway variables set DB_PROVIDER="postgres"
railway variables set DB_HOST="aws-1-eu-central-2.pooler.supabase.com"
railway variables set DB_PORT="5432"
railway variables set DB_USERNAME="postgres.vnkvdnagnkvlyrnkeczh"
railway variables set DB_PASSWORD="HmNB2wnzzNkF2lOb"
railway variables set DB_NAME="postgres"
railway variables set DB_SSL="true"
railway variables set DB_SYNC="false"

# JWT
railway variables set JWT_SECRET="QhwfbSHzMd5wVLWZMs6+GQYmk73NSUVJyt3iD91jVgA="
railway variables set JWT_EXPIRES_IN="7d"

# Supabase
railway variables set SUPABASE_URL="https://vnkvdnagnkvlyrnkeczh.supabase.co"
railway variables set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZua3ZkbmFnbmt2bHlybmtlY3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjU2NDYsImV4cCI6MjA5MzIwMTY0Nn0.hiQj72oMfM4smSzbDBKcxIJnIdcUZ9RrGVdOpq8lSbE"
railway variables set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZua3ZkbmFnbmt2bHlybmtlY3poIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNTY0NiwiZXhwIjoyMDkzMjAxNjQ2fQ.3pgRYnYaFP-NZsafr5GtZm1MqnEq6vVDdvectc1V8bo"

# Paystack
railway variables set PAYSTACK_SECRET_KEY="sk_test_2123289e6435a7fd496da2597503940b8c38d3b1"
railway variables set PAYSTACK_TEST_MODE="true"

# Other Services
railway variables set GEOAPIFY_API_KEY="b420e94b0c8a46d39bc3c7e2dda83811"
railway variables set RESEND_API_KEY="re_E96Nd4bN_E7mXeytykUvgZFUwahfv4AJW"
railway variables set RESEND_FROM_EMAIL="onboarding@resend.dev"
railway variables set SENTRY_DSN="https://f6562ffa926a4392a4955bf1902388ea@o4511359747293184.ingest.us.sentry.io/4511359766036480"

# Security
railway variables set BOOTSTRAP_ADMIN_TOKEN="arms_bootstrap_2026_secure_token_xyz"

# Environment
railway variables set NODE_ENV="production"

# Frontend URL (update this after getting Railway URL)
railway variables set FRONTEND_URL="https://your-frontend.vercel.app"
railway variables set ALLOWED_ORIGINS="https://your-frontend.vercel.app"
railway variables set SUPABASE_PASSWORD_REDIRECT_URL="https://your-frontend.vercel.app/reset-password"
```

### Step 5: Deploy!
```bash
railway up
```

### Step 6: Generate Public Domain
```bash
railway domain
```

This will give you a URL like: `https://arms-backend-production.up.railway.app`

### Step 7: View Logs
```bash
railway logs
```

---

## Option 2: Deploy via Railway Dashboard

### Step 1: Login to Railway
1. Go to https://railway.app
2. Click "Login" and sign in with GitHub

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your repository
4. Railway will detect it's a Node.js app

### Step 3: Configure Service
1. Click on the service that was created
2. Go to "Settings" tab
3. Set **Root Directory** to `backend`
4. Verify these settings:
   - **Build Command**: Detected automatically (npm run build)
   - **Start Command**: npm run start:prod
   - **Watch Paths**: backend/**

### Step 4: Add Environment Variables
1. Go to "Variables" tab
2. Click "RAW Editor"
3. Paste all your environment variables:

```env
DATABASE_URL=postgresql://postgres.vnkvdnagnkvlyrnkeczh:HmNB2wnzzNkF2lOb@aws-1-eu-central-2.pooler.supabase.com:5432/postgres
DB_PROVIDER=postgres
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
SENTRY_DSN=https://f6562ffa926a4392a4955bf1902388ea@o4511359747293184.ingest.us.sentry.io/4511359766036480
BOOTSTRAP_ADMIN_TOKEN=arms_bootstrap_2026_secure_token_xyz
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
ALLOWED_ORIGINS=https://your-frontend.vercel.app
SUPABASE_PASSWORD_REDIRECT_URL=https://your-frontend.vercel.app/reset-password
```

4. Click "Update Variables"

### Step 5: Generate Domain
1. Go to "Settings" tab
2. Scroll to "Networking" section
3. Click "Generate Domain"
4. Copy the generated URL (e.g., `https://arms-backend-production.up.railway.app`)

### Step 6: Deploy
1. Railway will automatically deploy after you save environment variables
2. Go to "Deployments" tab to monitor progress
3. Click on the active deployment to view logs

---

## 📝 Post-Deployment Steps

### 1. Get Your Backend URL
```bash
# Via CLI
railway domain

# Via Dashboard: Settings → Networking → Public Domain
```

### 2. Update Frontend Environment Variables

You need to update the frontend to point to your new Railway backend URL.

**Option A: Via Vercel CLI**
```bash
# Set the new backend URL (replace with your Railway URL)
vercel env add VITE_API_URL production

# When prompted, paste: https://your-backend.up.railway.app

# Redeploy frontend
cd ../frontend
vercel --prod
```

**Option B: Via Vercel Dashboard**
1. Go to your project on https://vercel.com
2. Go to Settings → Environment Variables
3. Find `VITE_API_URL`
4. Update it to your Railway URL
5. Redeploy the frontend

### 3. Update Backend CORS Settings

Now update the Railway backend environment variables with your frontend URL:

```bash
# Via CLI
railway variables set FRONTEND_URL="https://your-actual-frontend.vercel.app"
railway variables set ALLOWED_ORIGINS="https://your-actual-frontend.vercel.app"
railway variables set SUPABASE_PASSWORD_REDIRECT_URL="https://your-actual-frontend.vercel.app/reset-password"
```

Or update via Railway Dashboard → Variables tab.

### 4. Test the Deployment

```bash
# Test health endpoint
curl https://your-backend.up.railway.app/health/ping

# Expected response: {"pong":true}
```

### 5. Monitor Your Deployment

```bash
# Watch logs in real-time
railway logs --follow

# Or view in dashboard: Deployments → Active Deployment → Logs
```

---

## 🔧 Troubleshooting

### Build Fails
```bash
# Check logs
railway logs

# Common fixes:
# 1. Ensure all dependencies are in package.json
# 2. Check Node version compatibility
# 3. Verify railway.toml is correct
```

### Database Connection Fails
```bash
# Test database connection locally with Railway variables
railway run npm run start:dev

# Check if DATABASE_URL is set correctly
railway variables
```

### CORS Errors
- Make sure `FRONTEND_URL` and `ALLOWED_ORIGINS` match your actual frontend URL
- Check that frontend is using the correct backend URL

### Port Issues
Railway automatically assigns a `PORT` environment variable. Your app should use `process.env.PORT || 3001` (which it already does in `main.ts`).

---

## 💰 Costs

- **Starter (Free)**: $5/month usage credits
- **Developer**: $5/month base + usage
- **Team**: $20/month base + usage

Your app should fit comfortably in the free tier for development/testing.

---

## 🎯 Quick Commands Reference

```bash
# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# View logs
railway logs

# View logs (follow mode)
railway logs --follow

# Generate domain
railway domain

# View variables
railway variables

# Set variable
railway variables set KEY="value"

# Open dashboard
railway open

# Check service status
railway status
```

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Backend is accessible at Railway URL
- [ ] Health endpoint responds: `https://your-backend.up.railway.app/health/ping`
- [ ] Database connection works (check logs)
- [ ] Frontend can communicate with backend
- [ ] WebSockets work properly (real-time features)
- [ ] Authentication works (login/register)
- [ ] File uploads work
- [ ] All API endpoints respond correctly

---

## 🚀 Next Steps

1. Set up custom domain (optional)
2. Configure Railway health checks
3. Set up monitoring alerts
4. Enable automatic deployments from GitHub
5. Set up staging environment (optional)

---

## 📚 Resources

- Railway Docs: https://docs.railway.app
- Railway CLI: https://docs.railway.app/develop/cli
- Railway Discord: https://discord.gg/railway
- Your backend config: `backend/railway.toml`

---

## 🆘 Need Help?

If you run into issues:
1. Check Railway logs: `railway logs`
2. Verify environment variables: `railway variables`
3. Test locally with Railway env: `railway run npm run start:dev`
4. Check Railway status page: https://status.railway.app
