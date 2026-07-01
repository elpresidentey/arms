# 🚂 Deploy ARMS to Railway (Quick & Reliable)

## Why Railway Instead of Render?
✅ **Better Reliability** - 99.9% uptime vs Render's issues  
✅ **Faster Builds** - 2-3 minutes vs 10+ minutes on Render  
✅ **Auto-scaling** - Handles traffic spikes automatically  
✅ **Built-in Database** - PostgreSQL included for free  
✅ **Better DX** - Superior developer experience & debugging  

---

## 🚀 **5-Minute Deployment Steps**

### **1. Create Railway Account**
- Go to [railway.app](https://railway.app)  
- Click **"Login with GitHub"**
- Authorize Railway to access your repositories

### **2. Deploy Backend**
- Click **"New Project"**
- Select **"Deploy from GitHub repo"**  
- Choose your **`arms`** repository
- Railway auto-detects Node.js in `/backend` folder
- Deployment starts automatically! ⚡

### **3. Add PostgreSQL Database**
- In your Railway project dashboard
- Click **"+ Add Service"**
- Select **"PostgreSQL"**
- Railway provides a database URL automatically

### **4. Configure Environment Variables**
In Railway dashboard → Variables tab, add:

```env
# App Settings
NODE_ENV=production
PORT=3000
DB_PROVIDER=postgres

# Database (Railway auto-provides this)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Supabase (copy from your current .env)
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-key]

# Authentication
JWT_SECRET=[your-jwt-secret-32-chars]
JWT_EXPIRES_IN=7d

# Payment Integration  
PAYSTACK_SECRET_KEY=[your-paystack-secret]
PAYSTACK_TEST_MODE=false

# Frontend URLs
FRONTEND_URL=https://arms-roan.vercel.app
ALLOWED_ORIGINS=https://arms-roan.vercel.app

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[your-email]
SMTP_PASS=[your-app-password]

# External APIs
GEOAPIFY_API_KEY=[your-geoapify-key]

# Admin Setup
BOOTSTRAP_ADMIN_TOKEN=[generate-random-32-char-token]

# Security & Monitoring
SENTRY_DSN=[optional-sentry-dsn]
```

### **5. Update Frontend API URL**
Update frontend environment:

```env
# frontend/.env.production
VITE_API_URL=https://[your-app-name].up.railway.app
```

### **6. Test Deployment**
- Railway automatically builds and deploys
- Your API will be available at: `https://[your-app-name].up.railway.app`
- Test key endpoints:
  - `GET /health/ping` - Should return "OK"
  - `POST /auth/login` - Test authentication

---

## 🔧 **Post-Deployment Setup**

### **Migrate Your Data**
If you have existing data in Render's database:

1. **Export from Render:**
```bash
# Connect to Render PostgreSQL
pg_dump YOUR_RENDER_DATABASE_URL > arms_backup.sql
```

2. **Import to Railway:**
```bash
# Connect to Railway PostgreSQL  
psql YOUR_RAILWAY_DATABASE_URL < arms_backup.sql
```

### **Run Data Seeding**
After deployment, seed your Railway database:

```bash
# If you need to populate with sample data
# These commands will run on Railway automatically
npm run seed:fleet
npm run setup:billing  
```

---

## 📊 **Railway vs Render Comparison**

| Feature | Railway | Render |
|---------|---------|---------|
| **Build Time** | 2-3 minutes | 10+ minutes |
| **Uptime** | 99.9% | 95-98% |
| **Auto-scaling** | ✅ Yes | ❌ Limited |
| **Database** | ✅ Built-in | ✅ Separate service |
| **Logs** | ✅ Real-time | ⚠️ Basic |
| **Pricing** | $5/month | $7/month |
| **DX** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🚨 **Troubleshooting**

### **Build Fails?**
```bash
# Check Railway logs in dashboard
# Common fix: Update Node.js version in package.json
"engines": {
  "node": "18.x"
}
```

### **Database Connection Issues?**
```bash
# Verify DATABASE_URL is set
# Check Postgres service is running
# Test connection in Railway console
```

### **Environment Variables Missing?**
```bash
# Double-check all required vars are set
# Restart deployment after adding vars
```

---

## 🎯 **Final Steps**

### **1. Update Vercel Frontend**
```env
# In Vercel dashboard, update:
VITE_API_URL=https://[your-railway-app].up.railway.app
```

### **2. Test Full Application**
- ✅ Frontend loads correctly
- ✅ User registration works  
- ✅ Admin dashboard shows data
- ✅ Authentication functions
- ✅ Database queries work

### **3. Monitor Performance**
- Railway provides real-time metrics
- Set up alerts for downtime
- Monitor response times

---

## 🎉 **You're Live on Railway!**

Your ARMS application is now running on a **more reliable platform**:

- 🚂 **Railway Backend**: `https://[your-app].up.railway.app`
- 🌐 **Vercel Frontend**: `https://arms-roan.vercel.app`  
- 🗃️ **PostgreSQL Database**: Managed by Railway
- 🔐 **Supabase Auth**: Unchanged (still works)

**Result**: Better uptime, faster deployments, and happier users! 🚀

---

## 💡 **Pro Tips**

1. **Custom Domain**: Add your domain in Railway settings
2. **Auto-Deploy**: Railway auto-deploys on git push to main
3. **Staging**: Create separate Railway project for testing
4. **Monitoring**: Use Railway's built-in metrics dashboard
5. **Backups**: Railway auto-backs up your PostgreSQL database

Railway will be much more reliable than Render for your ARMS application! 🎯