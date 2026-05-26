# 🚀 ARMS Quick Start Guide

## Current Status

✅ **Both servers are running:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

✅ **Database is clean** (0 users)
✅ **Supabase Auth is clean** (0 auth users)
✅ **Onboarding system is ready**

---

## 🎯 Test the Onboarding Flow Now!

### Step 1: Clear Browser Storage

**Option A: Use Incognito Mode (Easiest)**
- Open a new incognito/private window
- Go to http://localhost:3000

**Option B: Clear Storage Manually**
- Press F12 to open DevTools
- Go to Application tab
- Click "Clear site data"
- Refresh the page

### Step 2: Register a New Account

1. Go to http://localhost:3000/register
2. Fill in the form:
   - Email: your-email@example.com
   - Password: (at least 8 characters, 1 uppercase, 1 lowercase, 1 number)
   - First Name: Your name
   - Last Name: Your surname
   - Phone: Your phone number
   - Address: Your address
   - Ward: Your ward
   - House Number: Your house number
   - Street: Your street
3. Click "Register"

### Step 3: Experience the Onboarding

After registration, you'll automatically:

1. **See the Welcome Modal** 🎉
   - 4-step interactive tour
   - Learn about ARMS features
   - Can skip or complete

2. **See the Onboarding Checklist** ✅
   - 5 tasks to get started
   - Progress bar
   - Direct action links

3. **Explore the Dashboard** 📊
   - Clean, modern interface
   - Real-time updates
   - All features accessible

---

## 🧹 If You See "Account Out of Sync" Error

This means there's old data. Run the cleanup:

```bash
cd backend
npm run cleanup:all
```

Then:
1. Clear browser storage (F12 > Application > Clear)
2. Open new incognito window
3. Register again

See `CLEANUP_GUIDE.md` for detailed instructions.

---

## 📁 Important Files

### Documentation
- `MVP_LAUNCH_READY.md` - Complete MVP status
- `ONBOARDING_IMPLEMENTATION.md` - Technical docs
- `ONBOARDING_SUMMARY.md` - User-friendly summary
- `ONBOARDING_FLOW.txt` - Visual flow diagram
- `CLEANUP_GUIDE.md` - Fix sync issues
- `QUICK_START.md` - This file

### Onboarding Components
- `frontend/src/components/WelcomeModal.tsx`
- `frontend/src/components/OnboardingChecklist.tsx`
- `frontend/src/hooks/useOnboarding.ts`
- `frontend/src/components/EmptyState.tsx`

### Cleanup Scripts
- `backend/cleanup-all.js` - Complete cleanup
- `backend/cleanup-demo.js` - Database only
- `backend/cleanup-supabase-auth.js` - Auth only

---

## 🎨 What You'll See

### Welcome Modal
```
┌─────────────────────────────────────┐
│  Welcome to ARMS, [Your Name]!     │
│                                     │
│  🚛  Your automated refuse          │
│      management system is ready.    │
│                                     │
│  [Skip tour]          [Next →]     │
└─────────────────────────────────────┘
```

### Onboarding Checklist
```
┌─────────────────────────────────────┐
│  Getting Started                    │
│  Progress: 0 of 5 completed    0%   │
│  ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                     │
│  ○ Complete your profile            │
│  ○ Schedule your first collection   │
│  ○ Log recyclable items             │
│  ○ Know how to report issues        │
│  ○ Check your wallet                │
└─────────────────────────────────────┘
```

---

## 🔧 Development Commands

### Start Servers
```bash
# Frontend (already running)
cd frontend
npm run dev

# Backend (already running)
cd backend
npm run start:dev
```

### Cleanup Commands
```bash
cd backend

# Complete cleanup (database + auth)
npm run cleanup:all

# Database only
npm run cleanup:db

# Auth only
npm run cleanup:auth
```

### Check Status
```bash
# Check database users
cd backend
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./arms-dev.sqlite'); db.all('SELECT COUNT(*) as count FROM users', (err, rows) => { console.log('Users:', rows[0].count); db.close(); });"

# Check auth users
cd backend
node cleanup-supabase-auth.js
```

---

## 🎯 Testing Checklist

- [ ] Open http://localhost:3000 in incognito mode
- [ ] Register a new account
- [ ] Welcome modal appears automatically
- [ ] Complete or skip the 4-step tour
- [ ] Onboarding checklist appears on dashboard
- [ ] Click through checklist tasks
- [ ] Progress bar updates
- [ ] Explore dashboard features
- [ ] Log out and log back in
- [ ] Welcome modal doesn't appear again
- [ ] Checklist state is preserved

---

## 💡 Tips

### For Testing
- Always use incognito mode for fresh tests
- Run `npm run cleanup:all` before each test session
- Clear browser storage between tests

### For Development
- Backend auto-reloads on code changes
- Frontend auto-reloads on code changes
- Check browser console for errors
- Check backend terminal for API logs

### For Debugging
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls
- Check Application tab for localStorage

---

## 🚀 Ready to Launch!

Your ARMS system is fully functional and ready for MVP launch:

✅ User registration & authentication  
✅ Welcome modal for new users  
✅ Onboarding checklist  
✅ Dashboard with real-time updates  
✅ Waste collection tracking  
✅ Recyclables management  
✅ Wallet & rewards  
✅ Issue reporting with images  
✅ Error monitoring (Sentry)  
✅ Image storage (Supabase)  

---

## 🆘 Need Help?

1. Check `CLEANUP_GUIDE.md` for sync issues
2. Check `ONBOARDING_IMPLEMENTATION.md` for technical details
3. Check `MVP_LAUNCH_READY.md` for complete status
4. Check browser console for errors
5. Check backend terminal for API logs

---

**Last Updated**: May 20, 2026  
**Status**: ✅ Ready to Test  
**Servers**: ✅ Running  
**Database**: ✅ Clean
