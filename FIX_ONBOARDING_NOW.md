# Fix Onboarding Issue - Quick Start Guide

## 🚨 Current Problem

You're getting a **403 Forbidden** error when trying to login, and users cannot complete onboarding.

## 🎯 Root Cause

You're running a **production build** locally that tries to connect to `https://arms-c56l.onrender.com` (production backend), but:
1. The user account doesn't exist in production database
2. OR email confirmation is required but not completed

## ✅ Immediate Solution (Choose One)

### Option 1: Switch to Local Development (RECOMMENDED)

This lets you test with your local database where users already exist.

#### Windows PowerShell:
```powershell
# Stop any running servers (Ctrl+C)

# Terminal 1: Start backend
cd backend
npm run start:dev

# Terminal 2 (new window): Start frontend  
cd frontend
npm run dev
```

#### Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

#### Why this works:
- Uses `.env` (not `.env.production`)
- Connects to `http://localhost:3001`
- Uses your local database with existing users
- No email confirmation required (if disabled in Supabase)

---

### Option 2: Fix Production Environment

If you must test production, follow these steps:

#### Step 1: Disable Email Confirmation (Temporary)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `vnkvdnagnkvlyrnkeczh`
3. **Authentication** → **Providers** → **Email**
4. **Uncheck** "Confirm email"
5. Click **Save**

#### Step 2: Bootstrap First Admin in Production

```bash
curl -X POST https://arms-c56l.onrender.com/auth/bootstrap ^
  -H "Content-Type: application/json" ^
  -d "{\"bootstrapToken\":\"arms_bootstrap_2026_secure_token_xyz\",\"email\":\"admin@arms.prod\",\"password\":\"AdminProd123!\",\"firstName\":\"Admin\",\"lastName\":\"Production\",\"phoneNumber\":\"+1234567890\",\"address\":\"Admin Office\",\"ward\":\"Operations\",\"houseNumber\":\"1\",\"street\":\"Admin\"}"
```

#### Step 3: Register Resident in Production

1. Go to your production URL (e.g., Vercel deployment)
2. Click "Create Account"
3. Fill in resident registration form
4. Submit
5. **If email confirmation is still enabled**, check email and confirm
6. Try logging in

---

## 🔧 Quick Environment Check

Run this in your browser console (F12) to see which backend you're connecting to:

```javascript
console.log('Backend URL:', import.meta.env.VITE_API_URL)
```

**Expected Results:**
- Development: `http://localhost:3001`
- Production: `https://arms-c56l.onrender.com`

---

## 📋 Files Updated

I've made the following changes to help with onboarding:

### 1. **AuthContext.tsx** ✅
- Added better error logging
- Added email redirect URL for confirmation emails
- Improved toast messages for admin vs resident

### 2. **AuthCallback.tsx** ✅ (NEW)
- Handles email confirmation redirects
- Shows loading/success/error states
- Automatically redirects after confirmation

### 3. **AppRoutes.tsx** ✅
- Added `/auth/callback` route for email confirmations

### 4. **Documentation** ✅
- `ONBOARDING_FIX.md` - Comprehensive onboarding guide
- `TROUBLESHOOT_LOGIN.md` - Login error troubleshooting
- `FIX_ONBOARDING_NOW.md` - This quick start guide
- `diagnose-onboarding.js` - Diagnostic script

---

## 🎬 Recommended Workflow

### For Daily Development:

```bash
# ALWAYS use these commands for local development
cd backend
npm run start:dev

# In another terminal
cd frontend  
npm run dev
```

### For Testing Production Build:

```bash
# Only when you need to test production build
cd frontend
npm run build
npm run preview
```

---

## 🐛 Debugging Steps

### 1. Check Backend Health

```bash
# Local
curl http://localhost:3001/health

# Production
curl https://arms-c56l.onrender.com/health
```

### 2. Check Browser Console

1. Press F12
2. Go to Console tab
3. Look for errors when registering/logging in
4. Check Network tab for failed requests

### 3. Check Backend Logs

**Local**: Look at terminal where `npm run start:dev` is running

**Production**: 
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your service
3. Click "Logs"

### 4. Check Supabase Users

1. [Supabase Dashboard](https://supabase.com/dashboard)
2. Authentication → Users
3. Check if user exists
4. Check if email is confirmed

---

## 🔑 Test Accounts

After setting up, you can use these test accounts:

### Local Development:
Use whatever accounts you've created locally

### Production (after bootstrap):
- Admin: `admin@arms.prod` / `AdminProd123!`
- Residents: Register new accounts via `/register`

---

## ⚡ Quick Commands

### Start Local Development (Recommended)
```bash
# Backend
cd backend && npm run start:dev

# Frontend (new terminal)
cd frontend && npm run dev
```

### Check Current Environment
```bash
# In frontend directory
npm run dev
# Then check browser console for VITE_API_URL
```

### Bootstrap Production Admin
```bash
curl -X POST https://arms-c56l.onrender.com/auth/bootstrap -H "Content-Type: application/json" -d "{\"bootstrapToken\":\"arms_bootstrap_2026_secure_token_xyz\",\"email\":\"admin@arms.prod\",\"password\":\"AdminProd123!\",\"firstName\":\"Admin\",\"lastName\":\"Prod\",\"phoneNumber\":\"+1234567890\",\"address\":\"Admin Office\",\"ward\":\"Operations\",\"houseNumber\":\"1\",\"street\":\"Admin\"}"
```

---

## 📞 Still Not Working?

If you're still having issues:

1. ✅ Confirm you're running `npm run dev` (not production build)
2. ✅ Confirm backend is running on http://localhost:3001
3. ✅ Check browser console for actual error message
4. ✅ Check backend terminal for error logs
5. ✅ Verify Supabase email confirmation is disabled (for testing)
6. ✅ Try registering a completely new user

---

## 🎯 Success Checklist

- [ ] Backend running on localhost:3001
- [ ] Frontend running on localhost:3000 (via `npm run dev`)
- [ ] Can access registration page
- [ ] Can fill out registration form
- [ ] Can submit registration successfully
- [ ] Can login with registered user
- [ ] Can access dashboard after login

---

**Next Steps:** Run the commands above and try registering a new user!

Last updated: June 7, 2026
