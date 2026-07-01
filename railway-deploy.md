# 🚀 Deploy ARMS Backend to Railway (5 Minutes)

## Why Railway Over Render?
- ✅ Better reliability and uptime
- ✅ Faster builds and deployments  
- ✅ Built-in PostgreSQL database
- ✅ No configuration needed
- ✅ Free tier with good limits

## Quick Deployment Steps:

### 1. **Create Railway Account**
- Go to [railway.app](https://railway.app)
- Click "Login with GitHub"
- Authorize Railway to access your repositories

### 2. **Deploy Backend**
- Click "New Project" 
- Select "Deploy from GitHub repo"
- Choose your `arms` repository
- Railway will automatically detect the Node.js backend in `/backend` folder

### 3. **Configure Environment Variables**
In Railway dashboard, go to Variables tab and add:

```env
NODE_ENV=production
PORT=3000

# Database (Railway will provide PostgreSQL automatically)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Supabase (copy from your current .env)
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-key]

# JWT
JWT_SECRET=[your-jwt-secret]

# Paystack
PAYSTACK_SECRET_KEY=[your-paystack-secret]

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[your-email]
SMTP_PASS=[your-app-password]

# Redis (Railway provides if needed)
REDIS_URL=${{Redis.REDIS_URL}}
```

### 4. **Add PostgreSQL Database**
- In Railway project, click "Add Service"
- Select "PostgreSQL"
- Railway will automatically provide the DATABASE_URL variable

### 5. **Update Frontend API URL**
Update your frontend environment variables:

```env
# frontend/.env.production
VITE_API_URL=https://[your-app-name].railway.app
```

### 6. **Deploy and Test**
- Railway automatically deploys when you push to main branch
- Your backend will be available at: `https://[your-app-name].railway.app`
- Test the API endpoints to ensure everything works

## Migration Benefits:
- 🎯 **Zero Code Changes**: Your existing PostgreSQL setup works as-is
- ⚡ **Fast Deployment**: Railway builds and deploys in ~2 minutes
- 💾 **Database Included**: Free PostgreSQL database with automatic backups
- 🔄 **Auto-Deploy**: Connects to your GitHub repo for automatic deployments
- 📊 **Better Monitoring**: Built-in logs, metrics, and alerts

## Cost Comparison:
- **Railway**: Free tier → $5/month (more generous than Render)
- **Render**: Free tier → $7/month  
- **Railway Benefits**: Better performance, reliability, and developer experience

Your ARMS backend will be more stable on Railway! 🚀