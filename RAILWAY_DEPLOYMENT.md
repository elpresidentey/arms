# Railway Deployment Guide for ARMS Backend

This guide will help you deploy the ARMS backend to Railway.

## Prerequisites

- GitHub account (you already have this)
- Railway account (free tier available)

## Step 1: Create Railway Account

1. Go to https://railway.app
2. Click "Login" or "Start a New Project"
3. Sign in with your GitHub account
4. Authorize Railway to access your GitHub repositories

## Step 2: Create New Project

1. Click "New Project" on the Railway dashboard
2. Select "Deploy from GitHub repo"
3. Choose your repository: `elpresidentey/arms`
4. Railway will detect it's a monorepo

## Step 3: Configure the Backend Service

1. After selecting the repo, Railway will ask which service to deploy
2. Click "Add variables" or go to the Variables tab
3. Set the **Root Directory** to `backend` (very important!)
4. Railway will automatically detect it's a Node.js/NestJS project

## Step 4: Add Environment Variables

Add all these environment variables in the Railway dashboard (Variables tab):

### Database Configuration
```
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
```

### JWT Configuration
```
JWT_SECRET=QhwfbSHzMd5wVLWZMs6+GQYmk73NSUVJyt3iD91jVgA=
JWT_EXPIRES_IN=7d
```

### Frontend URL (Update after Railway deployment)
```
FRONTEND_URL=https://frontend-psi-weld-dh3z0pv6q4.vercel.app
ALLOWED_ORIGINS=https://frontend-psi-weld-dh3z0pv6q4.vercel.app
```

### Email Configuration
```
RESEND_API_KEY=re_E96Nd4bN_E7mXeytykUvgZFUwahfv4AJW
RESEND_FROM_EMAIL=onboarding@resend.dev
SUPPORT_EMAIL=support@your-verified-domain.com
```

### Node Environment
```
NODE_ENV=production
PORT=3001
```

### Geoapify Configuration
```
GEOAPIFY_API_KEY=b420e94b0c8a46d39bc3c7e2dda83811
```

### Supabase Configuration
```
SUPABASE_URL=https://vnkvdnagnkvlyrnkeczh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZua3ZkbmFnbmt2bHlybmtlY3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjU2NDYsImV4cCI6MjA5MzIwMTY0Nn0.hiQj72oMfM4smSzbDBKcxIJnIdcUZ9RrGVdOpq8lSbE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZua3ZkbmFnbmt2bHlybmtlY3poIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNTY0NiwiZXhwIjoyMDkzMjAxNjQ2fQ.3pgRYnYaFP-NZsafr5GtZm1MqnEq6vVDdvectc1V8bo
SUPABASE_PASSWORD_REDIRECT_URL=https://frontend-psi-weld-dh3z0pv6q4.vercel.app/reset-password
```

### Sentry Configuration (Optional)
```
SENTRY_DSN=https://f6562ffa926a4392a4955bf1902388ea@o4511359747293184.ingest.us.sentry.io/4511359766036480
```

### Paystack Configuration
```
PAYSTACK_SECRET_KEY=sk_test_2123289e6435a7fd496da2597503940b8c38d3b1
PAYSTACK_TEST_MODE=true
```

### Bootstrap Admin Token
```
BOOTSTRAP_ADMIN_TOKEN=arms_bootstrap_2026_secure_token_xyz
```

## Step 5: Deploy

1. After adding all environment variables, click "Deploy"
2. Railway will:
   - Install dependencies (`npm ci`)
   - Build the project (`npm run build`)
   - Start the server (`npm run start:prod`)
3. Wait for the deployment to complete (usually 2-5 minutes)

## Step 6: Get Your Backend URL

1. Once deployed, go to the "Settings" tab
2. Scroll down to "Domains"
3. Click "Generate Domain"
4. Railway will give you a URL like: `https://arms-backend-production.up.railway.app`
5. Copy this URL

## Step 7: Update Frontend Environment Variable

Now update the frontend on Vercel to use the Railway backend URL:

```bash
# Remove old API URL
vercel env rm VITE_API_URL production --cwd frontend --yes

# Add new Railway URL (replace with your actual Railway URL)
echo "https://your-backend.up.railway.app" | vercel env add VITE_API_URL production --cwd frontend

# Redeploy frontend
vercel --prod --cwd frontend --force
```

## Step 8: Test the Deployment

1. Visit your frontend URL: https://frontend-psi-weld-dh3z0pv6q4.vercel.app
2. Try to register or login
3. Check if the backend is responding

## Troubleshooting

### Check Logs
- Go to Railway dashboard
- Click on your backend service
- Click "Deployments" tab
- Click on the latest deployment
- View the logs to see any errors

### Common Issues

1. **Build fails**: Check that all dependencies are in `package.json`
2. **Database connection fails**: Verify DATABASE_URL is correct
3. **CORS errors**: Make sure FRONTEND_URL and ALLOWED_ORIGINS are set correctly
4. **Port issues**: Railway automatically assigns a PORT, the app should use `process.env.PORT`

## Cost

Railway offers:
- **Free tier**: $5 credit per month (enough for development)
- **Hobby plan**: $5/month for more resources
- **Pro plan**: $20/month for production apps

## Alternative: Using Railway CLI

If you prefer using the CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
railway up
```

## Next Steps

After successful deployment:
1. Test all API endpoints
2. Monitor logs for any errors
3. Set up custom domain (optional)
4. Configure health checks
5. Set up monitoring and alerts

## Support

If you encounter issues:
- Check Railway documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Create an issue in your repository
