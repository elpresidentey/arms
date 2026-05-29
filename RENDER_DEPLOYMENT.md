# Render Deployment Guide for ARMS Backend

This guide will help you deploy the ARMS backend to Render (Free Tier).

## Why Render?

- ✅ **Free tier** with 750 hours/month (enough for 24/7 operation)
- ✅ Automatic HTTPS
- ✅ Easy GitHub integration
- ✅ Supports NestJS perfectly
- ✅ No credit card required for free tier

## Prerequisites

- GitHub account (you already have this)
- Render account (free)

## Step 1: Create Render Account

1. Go to https://render.com
2. Click "Get Started" or "Sign Up"
3. Sign up with your GitHub account
4. Authorize Render to access your GitHub repositories

## Step 2: Create New Web Service

1. Click "New +" button in the top right
2. Select "Web Service"
3. Connect your GitHub repository: `elpresidentey/arms`
4. Render will show your repository

## Step 3: Configure the Service

Fill in these settings:

### Basic Settings
- **Name**: `arms-backend` (or any name you prefer)
- **Region**: Choose closest to you (e.g., Oregon, Frankfurt, Singapore)
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ **VERY IMPORTANT**
- **Runtime**: `Node`
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm run start:prod`

### Instance Type
- Select **Free** (this gives you 512MB RAM, 0.1 CPU)

## Step 4: Add Environment Variables

Click "Advanced" and add these environment variables:

### Database Configuration
```
DB_PROVIDER = postgres
DATABASE_URL = postgresql://postgres.vnkvdnagnkvlyrnkeczh:HmNB2wnzzNkF2lOb@aws-1-eu-central-2.pooler.supabase.com:5432/postgres
DB_HOST = aws-1-eu-central-2.pooler.supabase.com
DB_PORT = 5432
DB_USERNAME = postgres.vnkvdnagnkvlyrnkeczh
DB_PASSWORD = HmNB2wnzzNkF2lOb
DB_NAME = postgres
DB_SSL = true
DB_SYNC = false
DB_SEED = false
```

### JWT Configuration
```
JWT_SECRET = QhwfbSHzMd5wVLWZMs6+GQYmk73NSUVJyt3iD91jVgA=
JWT_EXPIRES_IN = 7d
```

### Frontend URL
```
FRONTEND_URL = https://frontend-psi-weld-dh3z0pv6q4.vercel.app
ALLOWED_ORIGINS = https://frontend-psi-weld-dh3z0pv6q4.vercel.app
```

### Email Configuration
```
RESEND_API_KEY = re_E96Nd4bN_E7mXeytykUvgZFUwahfv4AJW
RESEND_FROM_EMAIL = onboarding@resend.dev
SUPPORT_EMAIL = support@your-verified-domain.com
```

### Node Environment
```
NODE_ENV = production
PORT = 3001
```

### Geoapify Configuration
```
GEOAPIFY_API_KEY = b420e94b0c8a46d39bc3c7e2dda83811
```

### Supabase Configuration
```
SUPABASE_URL = https://vnkvdnagnkvlyrnkeczh.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZua3ZkbmFnbmt2bHlybmtlY3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjU2NDYsImV4cCI6MjA5MzIwMTY0Nn0.hiQj72oMfM4smSzbDBKcxIJnIdcUZ9RrGVdOpq8lSbE
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZua3ZkbmFnbmt2bHlybmtlY3poIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNTY0NiwiZXhwIjoyMDkzMjAxNjQ2fQ.3pgRYnYaFP-NZsafr5GtZm1MqnEq6vVDdvectc1V8bo
SUPABASE_PASSWORD_REDIRECT_URL = https://frontend-psi-weld-dh3z0pv6q4.vercel.app/reset-password
```

### Sentry Configuration (Optional)
```
SENTRY_DSN = https://f6562ffa926a4392a4955bf1902388ea@o4511359747293184.ingest.us.sentry.io/4511359766036480
```

### Paystack Configuration
```
PAYSTACK_SECRET_KEY = sk_test_2123289e6435a7fd496da2597503940b8c38d3b1
PAYSTACK_TEST_MODE = true
```

### Bootstrap Admin Token
```
BOOTSTRAP_ADMIN_TOKEN = arms_bootstrap_2026_secure_token_xyz
```

## Step 5: Deploy

1. Click "Create Web Service" at the bottom
2. Render will:
   - Clone your repository
   - Install dependencies
   - Build the project
   - Start the server
3. Wait for deployment (usually 3-7 minutes for first deploy)

## Step 6: Get Your Backend URL

1. Once deployed, you'll see your service dashboard
2. At the top, you'll see your URL: `https://arms-backend.onrender.com`
3. Copy this URL

## Step 7: Update Frontend Environment Variable

Update the frontend on Vercel to use the Render backend URL:

```bash
# Remove old API URL
vercel env rm VITE_API_URL production --cwd frontend --yes

# Add new Render URL
echo "https://arms-backend.onrender.com" | vercel env add VITE_API_URL production --cwd frontend

# Redeploy frontend
vercel --prod --cwd frontend --force
```

## Step 8: Test the Deployment

1. Visit your backend URL: `https://arms-backend.onrender.com`
2. You should see a response (might be 404 or a welcome message)
3. Visit your frontend: https://frontend-psi-weld-dh3z0pv6q4.vercel.app
4. Try to register or login

## Important Notes About Free Tier

### ⚠️ Free Tier Limitations

1. **Spin Down**: Free services spin down after 15 minutes of inactivity
2. **Spin Up**: Takes 30-60 seconds to wake up when accessed
3. **750 hours/month**: Enough for continuous operation
4. **512MB RAM**: Sufficient for NestJS apps

### 💡 Handling Spin Down

The first request after inactivity will be slow (30-60 seconds). Subsequent requests will be fast.

**Solutions:**
1. **Accept it**: For development/demo, this is fine
2. **Upgrade to paid**: $7/month for always-on service
3. **Use a ping service**: Free services like UptimeRobot can ping your backend every 5 minutes to keep it awake

## Troubleshooting

### Check Logs
1. Go to your service dashboard on Render
2. Click "Logs" tab
3. View real-time logs to see any errors

### Common Issues

1. **Build fails**: 
   - Check that Root Directory is set to `backend`
   - Verify all dependencies are in package.json

2. **Database connection fails**: 
   - Verify DATABASE_URL is correct
   - Check if Supabase allows connections from Render IPs

3. **CORS errors**: 
   - Make sure FRONTEND_URL and ALLOWED_ORIGINS are set correctly
   - Check that frontend URL matches exactly (no trailing slash)

4. **Service won't start**:
   - Check logs for errors
   - Verify PORT environment variable is set
   - Ensure start command is correct: `npm run start:prod`

### Health Check

Render automatically checks if your service is healthy. If it fails to respond, Render will restart it.

## Monitoring

### View Metrics
- Go to your service dashboard
- Click "Metrics" tab
- See CPU, Memory, and Request metrics

### Set Up Alerts
- Go to "Settings" → "Notifications"
- Add email or Slack notifications for:
  - Deploy failures
  - Service crashes
  - High resource usage

## Upgrading

If you need more resources:

### Starter Plan ($7/month)
- Always on (no spin down)
- 512MB RAM
- 0.5 CPU

### Standard Plan ($25/month)
- 2GB RAM
- 1 CPU
- Better performance

## Alternative: Using Render Blueprint

You can also deploy using the `render.yaml` file I created:

1. Go to Render Dashboard
2. Click "New +" → "Blueprint"
3. Connect your repository
4. Render will detect the `render.yaml` file
5. Fill in the environment variables
6. Deploy

## Cost Comparison

| Platform | Free Tier | Paid Tier |
|----------|-----------|-----------|
| Render | 750hrs/month, spins down | $7/month always-on |
| Railway | $5 credit/month | $5/month + usage |
| Heroku | No free tier | $7/month |
| DigitalOcean | No free tier | $5/month |

## Next Steps

After successful deployment:
1. ✅ Test all API endpoints
2. ✅ Monitor logs for errors
3. ✅ Set up custom domain (optional)
4. ✅ Configure health checks
5. ✅ Set up monitoring alerts
6. ✅ Consider upgrading if you need always-on service

## Support

If you encounter issues:
- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- GitHub Issues: Create an issue in your repository

## Quick Commands Reference

```bash
# Update frontend API URL
vercel env rm VITE_API_URL production --cwd frontend --yes
echo "YOUR_RENDER_URL" | vercel env add VITE_API_URL production --cwd frontend
vercel --prod --cwd frontend --force

# Check Render service status
curl https://your-service.onrender.com

# View logs (from Render dashboard)
# Logs tab → Real-time logs
```
