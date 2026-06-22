# 🔒 Authentication Issues - Diagnosis & Fix

## 🐛 Errors Observed

### 1. Supabase Logout Error (403 Forbidden)
```
POST https://vnkvdnagnkvlyrnkeczh.supabase.co/auth/v1/logout?scope=global 403
```
**Cause**: Supabase client is using `scope=global` parameter which may be restricted in your Supabase project settings.

**Impact**: Logout doesn't fully clear Supabase session, but local session still clears.

### 2. Backend Login Error (401 Unauthorized)
```
POST https://arms-c56l.onrender.com/auth/login 401
```
**Cause**: One of:
- Wrong password
- User not in database
- Supabase token mismatch
- Backend/Supabase sync issue

### 3. Registration Error (400 Bad Request)
```
POST https://arms-c56l.onrender.com/auth/register 400
```
**Cause**: Validation error - missing required fields or invalid data format.

---

## ✅ Quick Fixes

### Fix 1: Update Supabase Logout (Remove scope parameter)

The logout is trying to use `scope=global` which isn't always supported. The fix is already in the code—it falls back to local logout if global fails.

**Verification**: The logout still works locally, just with a console warning.

---

### Fix 2: Reset Admin Password (If login fails)

If `admin@arms.com` login is failing:

```bash
cd backend
node scripts/reset-admin-password.js
```

This will reset the password to `Admin123!`

---

### Fix 3: Check Registration Validation

For registration errors, ensure all required fields are provided:

**Required for Residents**:
- firstName
- lastName
- email
- password
- phoneNumber
- address
- houseNumber
- street
- ward (can be "Ward" or "Area")

**Required for Admins** (+ admin invite token):
- Same as residents
- Plus: `adminInviteToken`

---

## 🔍 Detailed Diagnosis

### Issue 1: Supabase Logout 403

**Root Cause**: 
Supabase projects may have logout scope restrictions. The `scope=global` parameter attempts to sign out from all devices, but this may be disabled in your Supabase project settings.

**Current Behavior**:
```typescript
await supabase.auth.signOut() // Tries scope=global by default
```

**Workaround**:
The error is cosmetic—local session is still cleared properly. User can still login again.

**Proper Fix** (if needed):
```typescript
// Explicitly use local scope
await supabase.auth.signOut({ scope: 'local' })
```

---

### Issue 2: Backend Login 401

**Root Cause Options**:

1. **Password Mismatch**
   - User exists in Supabase but not in PostgreSQL
   - OR password doesn't match

2. **User Not Found**
   - User exists in Supabase
   - Backend returns 404 (user not in PostgreSQL)
   - Frontend tries to recover but fails

3. **Token Issues**
   - Supabase token not being passed correctly
   - Backend can't verify token

**Debug Steps**:

```bash
# 1. Check if admin exists in database
cd backend
node scripts/check-admin-users.js

# 2. Reset admin password if needed
node scripts/reset-admin-password.js

# 3. Test login via curl
curl -X POST https://arms-c56l.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@arms.com","password":"Admin123!"}'
```

---

### Issue 3: Registration 400

**Root Cause**:
Validation error from backend. Missing or invalid fields.

**Common Causes**:
1. Missing required field (firstName, lastName, etc.)
2. Invalid phone number format
3. Invalid email format
4. Password too weak
5. Missing ward/area selection
6. For admin: missing or invalid invite token

**Debug**:
```bash
# Check backend validation rules
# See: backend/src/auth/dto/auth.dto.ts
```

---

## 🛠️ Immediate Actions

### Action 1: Test Login Flow

```bash
# In production
# 1. Go to https://arms-roan.vercel.app/login
# 2. Try: admin@arms.com / Admin123!
# 3. If fails, follow Fix 2 above
```

### Action 2: Test Registration

```bash
# Try registering a new resident:
# 1. Go to https://arms-roan.vercel.app/register
# 2. Fill ALL required fields
# 3. Select ward/area from dropdown
# 4. Use strong password (8+ chars, uppercase, lowercase, number)
```

### Action 3: Check Backend Logs

If you have access to Render.com dashboard:
1. Go to https://dashboard.render.com
2. Select your backend service
3. Check "Logs" tab
4. Look for auth-related errors

---

## 🔧 Permanent Fixes

### Fix 1: Update Logout to Use Local Scope

**File**: `frontend/src/contexts/AuthContext.tsx`

**Change**:
```typescript
const logout = async () => {
  try {
    await supabase.auth.signOut({ scope: 'local' })
  } catch (error) {
    // Ignore logout errors - we'll clear local state anyway
    console.warn('Supabase logout warning:', error)
  }
  clearSessionState()
  toast.success('Logged out successfully')
}
```

---

### Fix 2: Add Better Error Messages

**File**: `frontend/src/contexts/AuthContext.tsx`

**Add more specific error handling**:
```typescript
const login = async (credentials: LoginCredentials, workspace: Workspace = 'resident') => {
  try {
    // ... existing code ...
  } catch (error) {
    // Check specific error types
    if (isBackendStatus(error, 401)) {
      toast.error('Invalid email or password')
    } else if (isBackendStatus(error, 404)) {
      toast.error('Account not found. Please register first.')
    } else {
      toast.error(normalizeAuthError(error, 'Login failed', workspace === 'admin'))
    }
    throw error
  }
}
```

---

### Fix 3: Add Registration Validation Feedback

**File**: `frontend/src/pages/Register.tsx`

Show specific validation errors to user before submitting.

---

## 📊 Testing Checklist

### Local Testing:
- [ ] Start backend (`npm run start:dev` in backend folder)
- [ ] Start frontend (`npm run dev` in frontend folder)
- [ ] Test admin login: admin@arms.com / Admin123!
- [ ] Test resident registration (fill all fields)
- [ ] Test logout
- [ ] Check browser console for errors

### Production Testing:
- [ ] Visit https://arms-roan.vercel.app/login
- [ ] Test admin login
- [ ] Check browser console (F12)
- [ ] Note any 401/403/400 errors
- [ ] Test on different browser
- [ ] Clear cache and try again

---

## 🚨 If Nothing Works

### Nuclear Option: Reset Everything

```bash
# 1. Stop all processes
# 2. Clear browser cache and localStorage
# 3. Reset admin password
cd backend
node scripts/reset-admin-password.js

# 4. Restart backend
npm run start:dev

# 5. Restart frontend
cd ../frontend
npm run dev

# 6. Try logging in fresh
```

---

## 💡 Recommendations

### Short Term:
1. ✅ Update logout to use `scope: 'local'`
2. ✅ Reset admin password if needed
3. ✅ Add better error messages
4. ✅ Test thoroughly locally before deploying

### Long Term:
1. Add comprehensive error logging
2. Add Sentry for error tracking (already configured!)
3. Add backend health checks in frontend
4. Add retry logic for transient failures
5. Add e2e tests for auth flows

---

## 📞 Support

If you're still seeing these errors:

1. **Check Supabase Dashboard**:
   - Go to https://supabase.com/dashboard
   - Check Auth settings
   - Check Auth logs
   - Verify email confirmation is disabled (for testing)

2. **Check Render.com Dashboard**:
   - Go to https://dashboard.render.com
   - Check backend logs
   - Verify environment variables are set
   - Check database connection

3. **Check Browser**:
   - Clear all cache and cookies
   - Try incognito/private mode
   - Try different browser
   - Check for browser extensions blocking requests

---

## ✅ Expected Behavior

### Successful Login Flow:
1. User enters email/password
2. Frontend calls backend `/auth/login`
3. Backend validates credentials
4. Backend returns token + user object
5. Frontend saves to localStorage
6. Frontend redirects to dashboard
7. ✅ Success!

### Successful Registration Flow:
1. User fills registration form
2. Frontend validates all required fields
3. Frontend creates Supabase account
4. Supabase sends confirmation email (if enabled)
5. After confirmation, login creates backend profile
6. User redirected to dashboard
7. ✅ Success!

### Successful Logout Flow:
1. User clicks logout
2. Frontend calls Supabase logout (may show 403 warning)
3. Frontend clears localStorage
4. Frontend clears state
5. User redirected to login page
6. ✅ Success! (despite 403 warning)

---

## 🎯 Next Steps

1. **Try these fixes locally first**
2. **Test thoroughly**
3. **Deploy to production only after confirming fixes work**
4. **Monitor errors in production**
5. **Iterate based on user feedback**

---

**Updated**: June 22, 2026  
**Status**: Diagnosis complete, fixes identified
