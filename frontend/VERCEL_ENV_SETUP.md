# Vercel Environment Variables Setup

## The Problem

The error "Missing Supabase environment variables" occurs because Vercel deployments don't use local `.env` files. Environment variables must be configured in the Vercel project settings.

## Solution: Configure in Vercel Dashboard

### Step 1: Access Vercel Dashboard
1. Go to https://vercel.com/
2. Navigate to your project (frontend)
3. Click **Settings** → **Environment Variables**

### Step 2: Add Required Variables

Add these environment variables for **Production**, **Preview**, and **Development** environments:

| Variable Name | Value | Environments |
|--------------|--------|--------------|
| `VITE_SUPABASE_URL` | `https://vnkvdnagnkvlyrnkeczh.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZua3ZkbmFnbmt2bHlybmtlY3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjU2NDYsImV4cCI6MjA5MzIwMTY0Nn0.hiQj72oMfM4smSzbDBKcxIJnIdcUZ9RrGVdOpq8lSbE` | Production, Preview, Development |
| `VITE_API_URL` | `https://arms-c56l.onrender.com` | Production, Preview |
| `VITE_API_URL` | `http://localhost:3001` | Development |
| `VITE_GEOAPIFY_API_KEY` | `b420e94b0c8a46d39bc3c7e2dda83811` | All |
| `VITE_PAYSTACK_PUBLIC_KEY` | `pk_test_fa6746bb37adf4c948f664f6c5f828232212ca8e` | All |
| `VITE_ENABLE_ADMIN_SIGNUP` | `false` | All |
| `VITE_ENABLE_PAYOUTS` | `true` | All |

### Step 3: Redeploy
After adding variables, trigger a new deployment:
- Click **Deployments** tab
- Click on the latest deployment
- Click **Redeploy**

OR push a new commit to trigger automatic deployment.

---

## Alternative: Vercel CLI Method

If you prefer using the CLI:

```bash
cd frontend

# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Add environment variables (run each command)
vercel env add VITE_SUPABASE_URL
# When prompted: enter value and select environments

# Or use the provided script
chmod +x setup-vercel-env.sh
./setup-vercel-env.sh

# Deploy
vercel --prod
```

---

## Why Local .env Files Don't Work

- `.env.local` - Only for local development
- `.env.production` - Vite uses this during local build, not Vercel
- `.env.vercel` / `.env.vercel.production` - For Vercel CLI local development only

**Vercel cloud deployments always pull from dashboard settings.**

---

## Verification

After redeployment, check the build logs for:
```
✓ Environment variables loaded
```

And verify the app loads without Supabase errors.
