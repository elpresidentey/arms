# Deploy ARMS - Final Steps

## ✅ Completed
- [x] Code pushed to GitHub
- [x] Auth sync issues fixed for all existing users
- [x] Text contrast fix applied
- [x] Backend running on Render

## ⚠️ CRITICAL: Configure Vercel Environment Variables

**This is the ONLY step blocking deployment.**

### 1. Go to Vercel Dashboard
Visit: https://vercel.com/ekenes-projects-c08862f30/frontend/settings/environment-variables

### 2. Add These 7 Variables

For **Production**, **Preview**, AND **Development** environments:

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

### 3. Save and Redeploy
1. Click **Save** after adding each variable
2. Go to **Deployments** tab
3. Click **Redeploy** on the latest deployment
4. Wait ~2 minutes for deployment to complete

## Quick Status Check

### Backend (Render)
```bash
curl https://arms-c56l.onrender.com/health
```
Expected: `{"status":"ok","timestamp":"..."}`

### Frontend (Vercel)
After adding env vars and redeploying:
- Visit your Vercel URL
- Should load without "Missing Supabase" error
- Try logging in with: `conceptsandcontexts@gmail.com`

## Deployment URLs

- **Frontend**: https://[your-project].vercel.app (check Vercel dashboard)
- **Backend**: https://arms-c56l.onrender.com
- **Database**: Supabase PostgreSQL (connected)
- **Auth**: Supabase Auth (working)

## Test Accounts

After deployment, test with these existing accounts:

1. **Admin Account**
   - Email: `admin@arms.com`
   - Go to: `/admin/login`

2. **Resident Accounts**
   - Email: `conceptsandcontexts@gmail.com`
   - Email: `iduweekeneleonard@gmail.com` (fresh start, data cleared)
   - Go to: `/login`

## Post-Deployment Verification

1. ✅ Frontend loads without errors
2. ✅ Users can log in successfully
3. ✅ Dashboard displays correctly
4. ✅ No "out of sync" errors
5. ✅ No "Missing Supabase" errors

## If You Need Help

- **Missing env vars**: Error will show in browser console
- **Backend down**: Check Render logs at dashboard.render.com
- **Login fails**: Verify auth sync by running `node scripts/fix-auth-sync.js` in backend

## Success! 🎉

Once Vercel environment variables are configured and the frontend redeploys:
- All 3 existing users can log in
- New users can register
- Full system is operational
- Ready for production use

---

**Time to complete**: ~5 minutes (just Vercel config)
