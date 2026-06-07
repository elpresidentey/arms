# Auth Sync Issue Fix

## Problem
Error message: **"This account profile is out of sync with authentication. Contact support to complete account migration."**

This occurs when the Supabase authentication user ID doesn't match the user ID in the backend database, even though the email addresses are the same.

## When This Happens
- Database was cleared/reset but Supabase auth users weren't deleted
- User account was manually recreated with the same email
- Migration from old auth system to Supabase wasn't complete
- Database restore without corresponding auth restore

## Solution

### Option 1: Run the Fix Script (Recommended)

This script automatically updates database user IDs to match Supabase auth IDs:

```bash
cd backend
node scripts/fix-auth-sync.js
```

**What it does:**
1. Compares Supabase auth users with database users
2. Identifies mismatched IDs for the same email
3. Shows you what will be fixed
4. Updates database IDs to match auth IDs (with confirmation)
5. Related records (wallet, recyclables, etc.) update automatically via CASCADE

### Option 2: Manual Fix

If you know the specific user's email:

1. **Get the Supabase auth ID:**
   - Go to Supabase Dashboard → Authentication → Users
   - Find the user by email and copy their UUID

2. **Update the database:**
   ```sql
   UPDATE users 
   SET id = '<supabase-auth-id>' 
   WHERE LOWER(email) = '<user-email>';
   ```

### Option 3: Clean Slate (For Development)

If you want to start fresh:

```bash
cd backend

# Clear both database AND Supabase auth
node cleanup-all.js

# Then users can register fresh accounts
```

## Prevention

To avoid this issue:
- Always use `cleanup-all.js` to clear BOTH database and auth together
- Don't manually delete database records without clearing auth
- Keep Supabase auth and database in sync during migrations

## Technical Details

The error is thrown in `backend/src/auth/auth.service.ts`:

```typescript
// When getProfileByAuthIdentity finds:
// - Auth user with ID "abc-123"  
// - Database user with email match but ID "xyz-789"
// → Throws the "out of sync" error
```

The fix updates the database ID to match the auth ID, preserving all user data while fixing the mismatch.
