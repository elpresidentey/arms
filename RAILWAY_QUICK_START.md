# 🚀 Railway Deployment - Quick Start

## The Fastest Way to Deploy

### Option 1: Use the Deployment Script (Easiest)
```powershell
# Run the automated deployment script
.\deploy-backend.ps1
```

### Option 2: Manual Commands (Fast)
```bash
# 1. Login
railway login

# 2. Go to backend
cd backend

# 3. Initialize/Link project
railway init
# OR
railway link

# 4. Deploy
railway up

# 5. Generate domain
railway domain
```

That's it! 🎉

---

## Important URLs

After deployment, you'll need:

1. **Your Railway Backend URL** (from `railway domain`)
   - Example: `https://arms-backend-production.up.railway.app`

2. **Your Vercel Frontend URL** 
   - Example: `https://frontend-psi-weld-dh3z0pv6q4.vercel.app`

---

## Post-Deployment (Critical!)

### Update Frontend to Use Railway Backend

**Via Vercel Dashboard:**
1. Go to https://vercel.com
2. Select your frontend project
3. Settings → Environment Variables
4. Update `VITE_API_URL` to your Railway URL
5. Redeploy

**Via Vercel CLI:**
```bash
# Update environment variable
vercel env rm VITE_API_URL production
echo "https://your-backend.up.railway.app" | vercel env add VITE_API_URL production

# Redeploy
cd frontend
vercel --prod
```

### Update Railway Backend CORS

**Via Railway Dashboard:**
1. `railway open`
2. Go to Variables tab
3. Update these variables:
   - `FRONTEND_URL` = your Vercel URL
   - `ALLOWED_ORIGINS` = your Vercel URL
   - `SUPABASE_PASSWORD_REDIRECT_URL` = `your-vercel-url/reset-password`

**Via Railway CLI:**
```bash
railway variables set FRONTEND_URL="https://your-frontend.vercel.app"
railway variables set ALLOWED_ORIGINS="https://your-frontend.vercel.app"
```

---

## Testing

```bash
# Test backend health
curl https://your-backend.up.railway.app/health/ping

# Expected: {"pong":true}
```

---

## Troubleshooting

### View Logs
```bash
railway logs
# or
railway logs --follow
```

### Check Variables
```bash
railway variables
```

### Open Dashboard
```bash
railway open
```

### Redeploy
```bash
cd backend
railway up
```

---

## Key Environment Variables

Make sure these are set in Railway (either via .env or dashboard):

**Required:**
- `DATABASE_URL` - Your Supabase connection string
- `JWT_SECRET` - Your JWT secret key
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `PAYSTACK_SECRET_KEY` - Your Paystack key
- `NODE_ENV=production`

**Update After Deployment:**
- `FRONTEND_URL` - Your Vercel frontend URL
- `ALLOWED_ORIGINS` - Your Vercel frontend URL

---

## Cost

Railway Free Tier: **$5 credit/month**
- Should be enough for development/testing
- Upgrade to Developer ($5/month) or Team ($20/month) for production

---

## Quick Commands

```bash
railway login          # Login to Railway
railway init           # Create new project
railway link           # Link existing project
railway up             # Deploy
railway domain         # Generate/show domain
railway logs           # View logs
railway logs --follow  # Stream logs
railway open           # Open dashboard
railway status         # Check status
railway variables      # List variables
```

---

## Architecture

```
Frontend (Vercel)
    ↓ HTTPS
Backend (Railway) ← You are here
    ↓ PostgreSQL
Database (Supabase)
```

---

## Need More Help?

See detailed guide: `DEPLOY_TO_RAILWAY.md`
