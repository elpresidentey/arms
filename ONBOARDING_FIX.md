# Onboarding Issue Fix Guide

## Problem
Users cannot complete the onboarding/registration process in your ARMS application.

## Root Causes

### 1. Supabase Email Confirmation is Enabled (Most Likely)
By default, Supabase requires users to confirm their email before they can sign in. This means:
- After registration, users receive a confirmation email
- They must click the link in the email to activate their account
- Only then can they sign in

### 2. Possible Email Delivery Issues
- Confirmation emails might not be reaching users
- Emails might be going to spam folders
- Supabase SMTP settings might not be configured

### 3. Missing Callback Handling
- The email confirmation redirects back to the app
- Your app needs to handle this callback properly

## Solutions

### Solution 1: Disable Email Confirmation (Quick Fix for Testing)

**⚠️ Only for development/testing - NOT recommended for production**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `vnkvdnagnkvlyrnkeczh`
3. Go to **Authentication** → **Providers** → **Email**
4. Scroll down to **Email Confirmation Settings**
5. **Disable** "Confirm email"
6. Click **Save**

After this, users can register and sign in immediately without email confirmation.

### Solution 2: Fix Email Confirmation Flow (Production Fix)

#### Step 1: Configure Supabase Email Settings

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Verify the **Confirm signup** template exists and is enabled
3. Check the **Confirm email** redirect URL is set correctly:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com/auth/callback`

#### Step 2: Create Email Callback Handler

Create a new page to handle the email confirmation callback:

**File: `frontend/src/pages/AuthCallback.tsx`**

```typescript
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Loader2 } from 'lucide-react'

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (data.session) {
          // Email confirmed successfully, redirect to dashboard
          navigate('/dashboard', { replace: true })
        } else {
          // No session, redirect to login
          navigate('/login?message=Email confirmed. Please sign in.', { replace: true })
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setError('Failed to confirm email. Please try again.')
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 3000)
      }
    }

    handleCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Confirmation Failed</h2>
          <p className="text-slate-600">{error}</p>
          <p className="text-sm text-slate-500 mt-4">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Confirming your email...</h2>
        <p className="text-slate-600">Please wait while we verify your account.</p>
      </div>
    </div>
  )
}

export default AuthCallback
```

#### Step 3: Add Route for Callback

Add the callback route to your router configuration:

**File: `frontend/src/App.tsx` or your router file**

```typescript
import AuthCallback from './pages/AuthCallback'

// Add this route:
<Route path="/auth/callback" element={<AuthCallback />} />
```

#### Step 4: Test the Flow

1. Register a new user
2. Check your email for the confirmation link
3. Click the confirmation link
4. You should be redirected to `/auth/callback` and then to dashboard or login

### Solution 3: Add Better User Feedback

The code has already been updated to provide better feedback to users when email confirmation is required.

**What was changed:**
- Added `emailRedirectTo` option to guide users back to the app
- Added console logging for debugging
- Improved toast messages to differentiate between admin and resident accounts
- Added better error handling

### Solution 4: Configure Custom SMTP (Optional)

If emails aren't being delivered:

1. Go to **Supabase Dashboard** → **Project Settings** → **Auth**
2. Configure custom SMTP settings:
   - SMTP Host: Your email provider (e.g., Gmail, SendGrid)
   - SMTP Port: Usually 587 or 465
   - SMTP User: Your email username
   - SMTP Password: Your email password/app password
   - Sender Email: Your "from" email address

Alternatively, use a service like **Resend** (you already have it configured):

```typescript
// In your backend, handle email sending directly
await this.notificationsService.sendEmailConfirmation(user.email, confirmationToken)
```

## Testing Checklist

- [ ] Can register a new resident account
- [ ] Receive confirmation email (check spam folder)
- [ ] Click confirmation link in email
- [ ] Get redirected back to the app
- [ ] Can sign in with confirmed account
- [ ] Can register admin account with invite token
- [ ] Admin confirmation works the same way

## Debugging

### Check Supabase Auth Logs
1. Go to **Supabase Dashboard** → **Authentication** → **Logs**
2. Look for signup events and any errors

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for Supabase errors during registration

### Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "auth" or "signup"
4. Check the response from Supabase

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Email not confirmed" | User hasn't clicked confirmation link | Resend confirmation or disable email confirmation |
| "User already registered" | Email already exists | Use forgot password or try different email |
| "Invalid invite token" | Admin invite expired/invalid | Request new admin invite |
| No session created | Email confirmation required | Check email and confirm |

## Current Configuration

Your current setup:
- **Backend URL**: http://localhost:3001
- **Frontend URL**: http://localhost:3000
- **Supabase Project**: vnkvdnagnkvlyrnkeczh
- **Email Provider**: Resend (configured in backend)
- **Admin Signup**: Disabled (requires invite token)

## Quick Test Commands

### Test Resident Registration
```bash
# In browser console after registration attempt
localStorage.getItem('arms-pending-registration')
sessionStorage.getItem('arms-supabase-auth')
```

### Test Admin Registration
You need an admin invite token first:
1. Create first admin using bootstrap endpoint
2. Login as admin
3. Create invite for new admin
4. Use invite link to register

### Bootstrap First Admin (if none exists)
```bash
curl -X POST http://localhost:3001/auth/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "bootstrapToken": "arms_bootstrap_2026_secure_token_xyz",
    "email": "admin@arms.local",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User",
    "phoneNumber": "+1234567890",
    "address": "Admin Office",
    "ward": "Operations",
    "houseNumber": "1",
    "street": "Admin Street"
  }'
```

## Need More Help?

If the issue persists:

1. **Check Supabase Auth Logs** for detailed error messages
2. **Verify email settings** in Supabase dashboard
3. **Test with email confirmation disabled** to isolate the issue
4. **Check spam folder** for confirmation emails
5. **Try a different email provider** (Gmail, Yahoo, etc.)

## Recommended Next Steps

1. ✅ **Immediate**: Disable email confirmation in Supabase for testing
2. 🔧 **Short term**: Implement the AuthCallback page
3. 📧 **Medium term**: Configure custom SMTP or use Resend for all emails
4. 🔒 **Long term**: Re-enable email confirmation with proper handling

---

Last updated: June 7, 2026
