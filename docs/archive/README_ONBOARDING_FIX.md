# 🎯 Onboarding Issue - SOLVED

## Problem Summary

You were getting a **403 Forbidden** error when trying to login/register because:
1. Running production build locally (connects to production backend)
2. User accounts don't exist in production database
3. Possible email confirmation requirement

## ✅ Solution Applied

I've fixed the onboarding flow and created helpful tools for you.

## 🚀 Quick Start (Just Run This!)

### Windows:
Double-click: **`start-local-dev.bat`**

### Or manually:
```bash
# Terminal 1
cd backend
npm run start:dev

# Terminal 2  
cd frontend
npm run dev
```

Then open: **http://localhost:3000**

## 📦 What Was Fixed

### Code Changes:
1. ✅ **AuthContext.tsx** - Better error handling & email confirmation flow
2. ✅ **AuthCallback.tsx** (NEW) - Handles email confirmation redirects  
3. ✅ **AppRoutes.tsx** - Added `/auth/callback` route
4. ✅ **Login.tsx** - Added confirmation message support

### Documentation Created:
1. 📄 **FIX_ONBOARDING_NOW.md** - Quick start guide (START HERE!)
2. 📄 **ONBOARDING_FIX.md** - Comprehensive onboarding guide
3. 📄 **TROUBLESHOOT_LOGIN.md** - Login error troubleshooting
4. 📄 **README_ONBOARDING_FIX.md** - This file

### Scripts Created:
1. 🔧 **start-local-dev.bat** - Start both servers with one click (Windows)
2. 🔧 **diagnose-onboarding.js** - Diagnostic tool for issues
3. 🔧 **switch-environment.ps1** - Switch between local/production

## 🎓 Understanding the Issue

### What You Were Doing:
- Running `npm run build` then `npm run preview` (production mode)
- Frontend connected to: `https://arms-c56l.onrender.com`
- User accounts existed in LOCAL database, not PRODUCTION

### What You Should Do:
- Run `npm run dev` (development mode)
- Frontend connects to: `http://localhost:3001`  
- Use LOCAL database where your users already exist

## 📋 Testing Checklist

### Resident Registration:
- [ ] Go to http://localhost:3000/register
- [ ] Fill in all resident details (name, email, phone, address)
- [ ] Click "Create Account"
- [ ] Should see success message
- [ ] Should automatically login or prompt to check email
- [ ] Can login at http://localhost:3000/login

### Admin Registration:
- [ ] First, bootstrap admin (see below)
- [ ] Login as admin
- [ ] Create admin invite
- [ ] Use invite link to register new admin
- [ ] New admin can login

## 🔐 Bootstrap First Admin (If Needed)

### Local:
```bash
curl -X POST http://localhost:3001/auth/bootstrap -H "Content-Type: application/json" -d "{\"bootstrapToken\":\"arms_bootstrap_2026_secure_token_xyz\",\"email\":\"admin@arms.local\",\"password\":\"Admin123!\",\"firstName\":\"Admin\",\"lastName\":\"User\",\"phoneNumber\":\"+1234567890\",\"address\":\"Admin Office\",\"ward\":\"Operations\",\"houseNumber\":\"1\",\"street\":\"Admin\"}"
```

### Production:
```bash
curl -X POST https://arms-c56l.onrender.com/auth/bootstrap -H "Content-Type: application/json" -d "{\"bootstrapToken\":\"arms_bootstrap_2026_secure_token_xyz\",\"email\":\"admin@arms.prod\",\"password\":\"AdminProd123!\",\"firstName\":\"Admin\",\"lastName\":\"Prod\",\"phoneNumber\":\"+1234567890\",\"address\":\"Admin Office\",\"ward\":\"Operations\",\"houseNumber\":\"1\",\"street\":\"Admin\"}"
```

## 🔧 Disable Email Confirmation (For Testing)

If you want instant registration without email confirmation:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. **Authentication** → **Providers** → **Email**
4. **Uncheck** "Confirm email"
5. Click **Save**

Now users can register and login immediately!

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Cannot connect to backend" | Make sure `npm run start:dev` is running |
| "403 Forbidden on login" | You're in production mode, switch to local dev |
| "User not found" | Register new user in the current environment |
| "Email not confirmed" | Check email or disable confirmation in Supabase |
| Port already in use | Kill process: `npx kill-port 3000 3001` |

## 📚 Documentation Guide

1. **START HERE**: `FIX_ONBOARDING_NOW.md` - Quick solution
2. **Full Details**: `ONBOARDING_FIX.md` - Everything about onboarding
3. **Login Issues**: `TROUBLESHOOT_LOGIN.md` - 403/401 errors
4. **This File**: Overview and quick reference

## ⚡ Quick Reference

### Start Local Development:
```bash
# Easy way
start-local-dev.bat

# Or manually
cd backend && npm run start:dev
cd frontend && npm run dev
```

### Check Which Environment:
```javascript
// In browser console (F12)
console.log(import.meta.env.VITE_API_URL)
```

### Test Registration:
1. http://localhost:3000/register
2. Fill form completely
3. Submit
4. Check browser console for errors
5. Check backend terminal for logs

### Test Login:
1. http://localhost:3000/login
2. Enter registered email/password
3. Should redirect to dashboard

## 🎯 Success Indicators

You'll know it's working when:
- ✅ Backend starts without errors
- ✅ Frontend loads at http://localhost:3000
- ✅ Can register new user without errors
- ✅ Can login with registered user
- ✅ Can access dashboard after login
- ✅ No 403 errors in browser console

## 🆘 Still Having Issues?

1. **Stop all servers** (Ctrl+C in all terminals)
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Delete node_modules and reinstall**:
   ```bash
   cd backend && rmdir /s /q node_modules && npm install
   cd frontend && rmdir /s /q node_modules && npm install
   ```
4. **Check Supabase is reachable**:
   ```bash
   curl https://vnkvdnagnkvlyrnkeczh.supabase.co/rest/v1/
   ```
5. **Run diagnostic script**:
   ```bash
   node diagnose-onboarding.js
   ```

## 📞 Getting Help

When asking for help, provide:
1. ✅ Which commands you ran
2. ✅ Browser console errors (F12 → Console)
3. ✅ Backend terminal output
4. ✅ Which environment (local vs production)
5. ✅ Supabase email confirmation setting

---

## 🎉 You're All Set!

Just run **`start-local-dev.bat`** and you should be able to register and login users!

**Quick Test:**
1. Run `start-local-dev.bat`
2. Wait 10 seconds for servers to start
3. Go to http://localhost:3000/register
4. Register a new resident user
5. Login with that user
6. 🎊 Success!

---

Last updated: June 7, 2026
