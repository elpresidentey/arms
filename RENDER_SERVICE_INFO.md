# Render Service Information

## Service Details
- **Service ID**: `srv-d8cpsas2m8qs73d9d2hg`
- **Expected URL**: `https://srv-d8cpsas2m8qs73d9d2hg.onrender.com` (or custom domain if set)

## Quick Health Check

Test your backend is running:
```bash
curl https://srv-d8cpsas2m8qs73d9d2hg.onrender.com/health/ping
```

Expected response:
```json
{"pong":true}
```

## Next Steps Checklist

### 1. ✅ Verify Deployment Status
Go to: https://dashboard.render.com/web/srv-d8cpsas2m8qs73d9d2hg
- Check if status shows "Live" (green)
- Review deployment logs for any errors

### 2. 🔍 Test Health Endpoint
Open in browser or curl:
```
https://srv-d8cpsas2m8qs73d9d2hg.onrender.com/health/ping
```

### 3. 📝 Update Frontend Environment Variable

Your backend URL is: `https://srv-d8cpsas2m8qs73d9d2hg.onrender.com`

#### Option A: Via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your frontend project
3. Settings → Environment Variables
4. Find `VITE_API_URL`
5. Update to: `https://srv-d8cpsas2m8qs73d9d2hg.onrender.com`
6. Save and redeploy

#### Option B: Via Vercel CLI
```bash
# Remove old variable
vercel env rm VITE_API_URL production

# Add new Render URL
echo "https://srv-d8cpsas2m8qs73d9d2hg.onrender.com" | vercel env add VITE_API_URL production

# Redeploy frontend
cd frontend
vercel --prod
```

### 4. 🔄 Update Backend CORS Settings

Update these environment variables in Render dashboard:

1. Go to: https://dashboard.render.com/web/srv-d8cpsas2m8qs73d9d2hg
2. Click "Environment" tab
3. Update these variables:
   - `FRONTEND_URL` → `https://frontend-psi-weld-dh3z0pv6q4.vercel.app`
   - `ALLOWED_ORIGINS` → `https://frontend-psi-weld-dh3z0pv6q4.vercel.app`
   - `SUPABASE_PASSWORD_REDIRECT_URL` → `https://frontend-psi-weld-dh3z0pv6q4.vercel.app/reset-password`
4. Click "Save Changes" (will trigger auto-redeploy)

### 5. ✅ Final Tests

After both frontend and backend are updated:

1. **Test Registration**
   - Go to your frontend
   - Try to register a new user
   - Check if it works

2. **Test Login**
   - Login with your credentials
   - Verify dashboard loads

3. **Test WebSocket Connection**
   - Open browser console (F12)
   - Look for: "Socket connected" message
   - Check notification bell appears

4. **Test Real-time Notifications**
   - Create a waste collection request
   - Watch for real-time notification popup

## Troubleshooting

### If health check fails:
1. Check Render dashboard logs for errors
2. Verify DATABASE_URL is correct
3. Check if service is "Live" (green status)
4. Wait 30-60 seconds if service was sleeping (cold start)

### If frontend can't connect:
1. Verify VITE_API_URL is correct in Vercel
2. Check browser console for CORS errors
3. Verify FRONTEND_URL is updated in Render
4. Redeploy frontend after env var changes

### If WebSockets don't work:
1. Check browser console for connection errors
2. Verify Render service is running (not sleeping)
3. Check CORS settings in backend
4. Test with: `wscat -c wss://srv-d8cpsas2m8qs73d9d2hg.onrender.com`

## Useful Links

- **Render Dashboard**: https://dashboard.render.com/web/srv-d8cpsas2m8qs73d9d2hg
- **Logs**: https://dashboard.render.com/web/srv-d8cpsas2m8qs73d9d2hg/logs
- **Environment**: https://dashboard.render.com/web/srv-d8cpsas2m8qs73d9d2hg/env
- **Settings**: https://dashboard.render.com/web/srv-d8cpsas2m8qs73d9d2hg/settings

## Quick Commands

```bash
# Test health endpoint
curl https://srv-d8cpsas2m8qs73d9d2hg.onrender.com/health/ping

# Test full health check
curl https://srv-d8cpsas2m8qs73d9d2hg.onrender.com/health

# Update frontend env and redeploy
vercel env rm VITE_API_URL production
echo "https://srv-d8cpsas2m8qs73d9d2hg.onrender.com" | vercel env add VITE_API_URL production
cd frontend && vercel --prod
```

## Expected Timeline

- ✅ Backend deployed: Done!
- ⏳ Update frontend env: 2 minutes
- ⏳ Redeploy frontend: 3 minutes
- ⏳ Update backend CORS: 2 minutes
- ⏳ Test everything: 5 minutes

**Total: ~10-15 minutes remaining**
