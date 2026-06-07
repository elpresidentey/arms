# Final Deployment Steps

## Current Status
✅ Code pushed to GitHub
✅ Text contrast fix applied
✅ Auth sync fix script available
⚠️ Vercel environment variables need configuration
⚠️ Auth sync issue needs resolution

## Step 1: Fix Auth Sync Issue (Required First)

The "account profile out of sync" error must be fixed before users can log in.

### Run the fix script:
```bash
cd backend
node scripts/fix-auth-sync.js
```

This will:
- Identify mismatched user IDs between Supabase auth and database
- Update database IDs to match Supabase auth IDs
- Fix the login issue for affected users

## Step 2: Configure Vercel Environment Variables (Critical)

The "Missing Supabase environment variables" error needs these added to Vercel:

### Go to Vercel Dashboard:
1. Navigate to: https://vercel.com/
2. Select your project: **ekenes-projects-c08862f30/frontend**
3. Go to: **Settings** → **Environment Variables**

### Add these variables for Production, Preview, and Development:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://vnkvdnagnkvlyrnkeczh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZua3ZkbmFnbmt2bHlybmtlY3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjU2NDYsImV4cCI6MjA5MzIwMTY0Nn0.hiQj72oMfM4smSzbDBKcxIJnIdcUZ9RrGVdOpq8lSbE` |
| `VITE_API_URL` | `https://arms-c56l.onrender.com` (Production/Preview)<br>`http://localhost:3001` (Development) |
| `VITE_GEOAPIFY_API_KEY` | `b420e94b0c8a46d39bc3c7e2dda83811` |
| `VITE_PAYSTACK_PUBLIC_KEY` | `pk_test_fa6746bb37adf4c948f664f6c5f828232212ca8e` |
| `VITE_ENABLE_ADMIN_SIGNUP` | `false` |
| `VITE_ENABLE_PAYOUTS` | `true` |

### After adding variables:
- Click **Save**
- Go to **Deployments** tab
- Click **Redeploy** on the latest deployment

## Step 3: Verify Backend Deployment (Render)

Check that backend is running:

```bash
curl https://arms-c56l.onrender.com/health
```

Expected response: `{"status":"ok","timestamp":"..."}`

If backend is down:
1. Go to Render dashboard: https://dashboard.render.com/
2. Select your backend service
3. Check logs for errors
4. Verify environment variables are set
5. Manually trigger redeploy if needed

## Step 4: Verify Frontend Deployment (Vercel)

After Vercel redeploys with new environment variables:

1. Visit your frontend URL
2. Open browser DevTools → Console
3. Check for errors
4. Try to log in with a test account

Expected: No "Missing Supabase environment variables" error

## Step 5: Test Complete Flow

### Test Resident Account:
1. Go to `/register`
2. Create a new resident account
3. Confirm email (check Supabase email logs)
4. Log in at `/login`
5. Verify dashboard loads

### Test Admin Account:
1. Go to backend and run: `node scripts/generate-sample-bills.js` (if needed)
2. Go to `/admin/login`
3. Create admin invite from Operations page
4. Use invite link to register admin account
5. Log in and verify admin dashboard

## Step 6: Post-Deployment Checks

### Database Health:
```bash
cd backend
node scripts/apply-sql.js
```

### Check Services:
- ✅ Frontend: https://[your-vercel-url].vercel.app
- ✅ Backend: https://arms-c56l.onrender.com
- ✅ Database: Supabase PostgreSQL (check connection)
- ✅ Auth: Supabase Auth (check users exist)

### Monitor Logs:
- Vercel: Check Functions logs for frontend errors
- Render: Check backend logs for API errors
- Supabase: Check Auth logs for login issues

## Troubleshooting

### If users still can't log in:
```bash
cd backend
node scripts/fix-auth-sync.js
```

### If frontend shows blank page:
- Check Vercel environment variables
- Check browser console for errors
- Verify backend URL is correct

### If backend returns 500 errors:
- Check Render logs
- Verify DATABASE_URL is correct
- Check Supabase connection

## Optional: Monitoring Setup

### Sentry (Error Tracking):
If you want to enable Sentry, uncomment in `frontend/.env.production`:
```bash
VITE_SENTRY_DSN=https://a1fc65af594a3386f9be1b52b4596ab6@o4511359747293184.ingest.us.sentry.io/4511359759745024
```

Then redeploy frontend.

## Deployment URLs

- **Frontend (Vercel)**: [Your Vercel URL]
- **Backend (Render)**: https://arms-c56l.onrender.com
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth

## Quick Commands Reference

```bash
# Fix auth sync
cd backend && node scripts/fix-auth-sync.js

# Clean everything (dev only)
cd backend && node cleanup-all.js

# Generate test data
cd backend && node scripts/generate-sample-bills.js

# Check backend health
curl https://arms-c56l.onrender.com/health
```

## Success Criteria

✅ Frontend loads without errors
✅ Users can register new accounts
✅ Users can log in successfully
✅ Dashboard displays data correctly
✅ Backend API responds to requests
✅ Database connection is stable
✅ No "out of sync" errors
✅ No "Missing Supabase" errors

## Next Steps After Deployment

1. Test all major features (collections, wallet, reports)
2. Create initial admin account
3. Configure collection routes
4. Set up service schedules
5. Invite team members
6. Onboard first residents
