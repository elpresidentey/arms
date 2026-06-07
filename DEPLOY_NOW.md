# Deploy ARMS - Quick Guide

## System Status
✅ **Backend**: Live at https://arms-c56l.onrender.com  
✅ **Database**: 9 active users, all data synced  
✅ **Auth**: All accounts working  
⚠️ **Frontend**: Needs Vercel environment variables

## ONE STEP TO COMPLETE DEPLOYMENT

### Configure Vercel Environment Variables

1. **Go to Vercel Dashboard**:  
   https://vercel.com/ekenes-projects-c08862f30/frontend/settings/environment-variables

2. **Add these 7 variables** for Production, Preview, and Development:

```
VITE_SUPABASE_URL
https://vnkvdnagnkvlyrnkeczh.supabase.co

VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZua3ZkbmFnbmt2bHlybmtlY3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjU2NDYsImV4cCI6MjA5MzIwMTY0Nn0.hiQj72oMfM4smSzbDBKcxIJnIdcUZ9RrGVdOpq8lSbE

VITE_API_URL
https://arms-c56l.onrender.com

VITE_GEOAPIFY_API_KEY
b420e94b0c8a46d39bc3c7e2dda83811

VITE_PAYSTACK_PUBLIC_KEY
pk_test_fa6746bb37adf4c948f664f6c5f828232212ca8e

VITE_ENABLE_ADMIN_SIGNUP
false

VITE_ENABLE_PAYOUTS
true
```

3. **Save and Redeploy**:
   - Save each variable
   - Go to Deployments tab
   - Click Redeploy
   - Wait ~2 minutes

## Test Accounts

After deployment, test with:
- **Admin**: admin@arms.com (go to `/admin/login`)
- **Resident**: conceptsandcontexts@gmail.com (go to `/login`)

## Deployment URLs

- **Frontend**: https://[your-vercel-url].vercel.app
- **Backend**: https://arms-c56l.onrender.com
- **Health Check**: https://arms-c56l.onrender.com/health

## That's It!

Once you add the Vercel environment variables and redeploy:
- ✅ All 9 users can log in
- ✅ New users can register
- ✅ System is fully operational
- ✅ Ready for production

**Time to complete**: 5 minutes
