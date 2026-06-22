# 🚀 Quick Fix for Auth Errors

## ✅ Fixed: Logout 403 Error

Updated `AuthContext.tsx` to use `scope: 'local'` instead of `scope: 'global'`.

**Status**: ✅ Fixed locally, needs deployment

---

## 🔧 Fix Remaining Issues

### Issue 1: Login 401 Error

**Likely Cause**: Admin password not matching in production database.

**Solution Options**:

#### Option A: Reset Password via Render (Recommended)

1. Go to https://dashboard.render.com
2. Select your backend service (arms-c56l.onrender.com)
3. Go to "Shell" tab
4. Run these commands:

```bash
cd /opt/render/project/src
node scripts/reset-admin-password.js
```

This will reset admin password to `Admin123!`

#### Option B: Use Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to "Authentication" → "Users"
4. Find admin@arms.com
5. Click "..." → "Reset Password"
6. Set password to `Admin123!`

#### Option C: Create New Admin (if admin doesn't exist)

If admin account doesn't exist at all, you need to register one:

1. Generate a bootstrap token:
```bash
# On Render shell
node scripts/generate-bootstrap-token.js
```

2. Use that token to register via:
```
https://arms-roan.vercel.app/bootstrap-admin?token=YOUR_TOKEN
```

---

### Issue 2: Registration 400 Error

**Likely Causes**:
1. Missing required fields
2. Invalid field format
3. Ward/area not selected
4. Password too weak

**Quick Test**:

Try registering with these exact values:
- First Name: Test
- Last Name: User
- Email: test@example.com
- Phone: +2348012345678
- Password: Test123!
- Address: 123 Test Street
- House Number: 123
- Street: Test Street
- Ward: **Select from dropdown** (don't leave as "Ward")
- Property Type: Residential

---

## 🚀 Deploy the Logout Fix

### Step 1: Commit Changes

```bash
git add frontend/src/contexts/AuthContext.tsx AUTH_ISSUES_FIX.md QUICK_FIX_SCRIPT.md
git commit -m "Fix Supabase logout 403 error by using local scope"
git push origin main
```

### Step 2: Deploy to Vercel

```bash
vercel --prod
```

---

## ✅ Testing After Fix

### Test Logout:
1. Login to https://arms-roan.vercel.app
2. Click logout
3. Check browser console (F12)
4. **Should NOT see** 403 error anymore
5. Should see success message
6. Should be redirected to login

### Test Login:
1. Try: admin@arms.com / Admin123!
2. If fails → Follow "Option A" above to reset password
3. Try again
4. Should work!

### Test Registration:
1. Fill ALL required fields
2. **Important**: Select ward from dropdown (don't leave as "Ward")
3. Use strong password (8+ chars, uppercase, lowercase, number)
4. Submit
5. Check email for confirmation (if enabled)

---

## 📊 Current Status

| Issue | Status | Action Needed |
|-------|--------|---------------|
| Logout 403 | ✅ Fixed | Deploy to production |
| Login 401 | 🔧 Needs fixing | Reset admin password on Render |
| Register 400 | ⚠️ User error | Ensure all fields filled correctly |

---

## 💡 Quick Commands

### Check Backend Health:
```bash
curl https://arms-c56l.onrender.com/health
```

### Check if Admin Exists (via Render Shell):
```bash
node scripts/check-admin-users.js
```

### Reset Admin Password (via Render Shell):
```bash
node scripts/reset-admin-password.js
```

---

## 🎯 Next Steps

1. **Deploy logout fix** (commit + push + vercel --prod)
2. **Reset admin password** via Render shell
3. **Test login** again
4. **Test registration** with all fields filled
5. ✅ All should work!

---

## 📞 Still Having Issues?

If you're still seeing errors after these fixes:

1. Clear browser cache completely
2. Try incognito/private mode
3. Try different browser
4. Check Render backend logs for detailed errors
5. Check Supabase Auth logs

---

**Let's fix this step by step!** 🛠️
