# 🚨 URGENT FIX: Update Frontend to Use Render Backend

## Problem Identified
Your frontend is trying to connect to:
❌ `https://backend-seven-chi-51.vercel.app` (OLD - doesn't exist/work)

Should be connecting to:
✅ `https://arms-c56l.onrender.com` (NEW - your Render backend)

---

## ✅ Solution: Update Vercel Environment Variable

### Step-by-Step Instructions:

1. **Go to Vercel Dashboard**
   - Open: https://vercel.com/dashboard
   - Find your frontend project (should be listed)
   - Click on it

2. **Go to Settings**
   - Click the "Settings" tab at the top

3. **Open Environment Variables**
   - Click "Environment Variables" in the left sidebar

4. **Find VITE_API_URL**
   - Scroll down to find `VITE_API_URL`
   - Current value: `https://backend-seven-chi-51.vercel.app` (or similar)

5. **Edit the Variable**
   - Click the three dots (...) on the right side
   - Click "Edit"
   - **Change the value to**: `https://arms-c56l.onrender.com`
   - Make sure there's NO trailing slash
   - Click "Save"

6. **Redeploy Frontend**
   - Go to "Deployments" tab
   - Find the latest deployment
   - Click the three dots (...) menu
   - Click "Redeploy"
   - Wait 3-5 minutes for deployment to complete

---

## ✅ Verify It Worked

After redeployment:

1. **Open your frontend** in browser
2. **Open browser console** (Press F12)
3. **Look at Network tab**
4. **Refresh the page**
5. **Check the requests** - they should now go to:
   - ✅ `https://arms-c56l.onrender.com/...`
   - NOT ❌ `https://backend-seven-chi-51.vercel.app/...`

---

## Alternative: Use Vercel CLI (If Dashboard Doesn't Work)

```bash
# Go to frontend directory
cd frontend

# List current env vars
vercel env ls production

# Pull current env to see values
vercel env pull

# Remove old VITE_API_URL (type 'yes' when prompted)
vercel env rm VITE_API_URL production

# Add new VITE_API_URL
# When prompted for value, enter: https://arms-c56l.onrender.com
vercel env add VITE_API_URL production

# Redeploy
vercel --prod
```

---

## 🎯 What This Will Fix

After updating VITE_API_URL to Render backend:

- ✅ Socket.io will connect to correct backend
- ✅ API calls will go to Render instead of old Vercel
- ✅ Real-time notifications will work
- ✅ All features will function properly
- ✅ No more 404 errors

---

## 📊 Correct Configuration

```
Frontend (Vercel)
├── VITE_API_URL = https://arms-c56l.onrender.com ✅
└── Connects to ↓

Backend (Render)
└── https://arms-c56l.onrender.com ✅
    └── WebSocket server running
```

---

## ⏱️ Timeline

- Update environment variable: 1 minute
- Redeploy frontend: 3-5 minutes
- Test: 1 minute

**Total: ~5-7 minutes**

---

## 🔍 How to Check Current Value (Before Changing)

If you want to see what value is currently set:

```bash
cd frontend
vercel env ls production
```

This will show all environment variables (values are encrypted but you can see they exist).

---

## ✅ Success Indicators

After the fix:

- ✅ No more 404 errors for socket.io in console
- ✅ Console shows: "Socket connected" or similar
- ✅ Network tab shows requests to `arms-c56l.onrender.com`
- ✅ Notification bell appears and works
- ✅ All API calls succeed

---

## 🚨 Important Notes

1. **Environment variables only update after redeploy**
   - Changing the variable isn't enough
   - You MUST redeploy for changes to take effect

2. **Clear browser cache if needed**
   - After redeploy, do a hard refresh: `Ctrl + F5`
   - Or clear cache and reload

3. **Check multiple environments**
   - Make sure you updated PRODUCTION environment
   - Not just preview or development

---

**Go to Vercel dashboard NOW and update VITE_API_URL! This will fix all the 404 errors! 🚀**
