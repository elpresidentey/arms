# Fix: Onboarding After Deleting Supabase Users

## Problem

You deleted users from Supabase Auth but the user profiles still exist in your PostgreSQL database. This causes registration to fail because:

1. **Auth Sync Issue**: Supabase Auth has no record of the user
2. **Database Conflict**: PostgreSQL still has the user profile with that email
3. **ID Mismatch**: New registration creates a different user ID in Supabase, but the email is already taken in PostgreSQL

## Symptoms

- Users can't register with their email (even though you deleted them from Supabase)
- Error: "Email already exists" or "User already registered"
- Login fails for previously deleted users
- New registrations create auth users but fail to create profiles

## Solutions

### Option 1: Quick Fix - Clean Up Orphaned Users (RECOMMENDED)

This removes database records for users that no longer exist in Supabase Auth.

**Step 1: Check for orphaned users**
```bash
cd backend
node scripts/cleanup-deleted-users.js
```

This shows you which users are orphaned (dry run, doesn't delete anything).

**Step 2: Force delete orphaned users**
```bash
node scripts/force-cleanup-users.js
```

This will:
- ✅ Find all users in PostgreSQL without Supabase Auth accounts
- ✅ Delete them and all related data (wallets, reports, bills, etc.)
- ✅ Preserve users that still exist in Supabase Auth

**After cleanup, users can register again with their email addresses!**

### Option 2: Nuclear Reset - Start Fresh (For Testing Only)

⚠️ **WARNING: Deletes EVERYTHING!**

If you want a completely clean slate:

```bash
cd backend
node scripts/reset-all-users.js
```

This will:
- 💥 Delete ALL users from Supabase Auth
- 💥 Delete ALL users from PostgreSQL
- 💥 Delete ALL related data (wallets, reports, bills, etc.)

After this, you'll have a completely empty system and can:
1. Create a bootstrap admin
2. Register new test users from scratch

### Option 3: Manual Database Cleanup

If you want more control, manually delete specific users:

**Connect to your database:**
```bash
# Using psql
psql "postgresql://postgres.vnkvdnagnkvlyrnkeczh:HmNB2wnzzNkF2lOb@aws-1-eu-central-2.pooler.supabase.com:5432/postgres"
```

**Check for orphaned users:**
```sql
-- List all users in database
SELECT id, email, role, "firstName", "lastName", "createdAt" 
FROM users 
ORDER BY "createdAt" DESC;
```

**Delete specific user by email:**
```sql
-- This will cascade delete all related data
DELETE FROM users WHERE email = 'user@example.com';
```

**Delete all users:**
```sql
-- Nuclear option
DELETE FROM users;
```

## Step-by-Step Recovery Process

### For Individual Test Users

1. **Check Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/vnkvdnagnkvlyrnkeczh/auth/users
   - Note which users exist in Auth

2. **Run cleanup script**
   ```bash
   cd backend
   node scripts/force-cleanup-users.js
   ```

3. **Try registering again**
   - Go to: http://localhost:3000/register
   - Use the same email address
   - Should work now!

### For Complete Testing Reset

1. **Delete everything**
   ```bash
   cd backend
   node scripts/reset-all-users.js
   ```

2. **Create bootstrap admin**
   ```bash
   curl -X POST http://localhost:3001/auth/bootstrap \
     -H "Content-Type: application/json" \
     -d '{
       "bootstrapToken": "arms_bootstrap_2026_secure_token_xyz",
       "email": "admin@arms.test",
       "password": "Admin123!Test",
       "firstName": "Test",
       "lastName": "Admin",
       "phoneNumber": "+2348012345678",
       "address": "Admin Office",
       "ward": "Operations",
       "houseNumber": "1",
       "street": "Admin Street"
     }'
   ```

3. **Register test residents**
   - Go to: http://localhost:3000/register
   - Register with fresh email addresses

## Prevention

To avoid this issue in the future:

### Option A: Use the cleanup scripts before deleting from Supabase
```bash
# Before deleting users from Supabase dashboard:
node scripts/force-cleanup-users.js  # Clean database first
# Then delete from Supabase dashboard
```

### Option B: Delete properly through code

Create a proper user deletion endpoint that cleans both:

**Backend endpoint (future enhancement):**
```typescript
// DELETE /users/:id (admin only)
async deleteUser(userId: string) {
  // Delete from database first
  await this.usersService.delete(userId);
  
  // Then delete from Supabase Auth
  await this.supabase.auth.admin.deleteUser(userId);
}
```

### Option C: Use soft deletes

Instead of actually deleting users, mark them as deleted:

```typescript
// Add deletedAt column to users table
ALTER TABLE users ADD COLUMN "deletedAt" timestamp NULL;

// Soft delete instead of hard delete
UPDATE users SET "deletedAt" = NOW() WHERE id = ?;

// Filter out soft-deleted users in queries
WHERE "deletedAt" IS NULL
```

## Verification

After cleanup, verify everything is working:

### 1. Check database
```sql
-- Should show clean list of active users
SELECT id, email, role FROM users;
```

### 2. Check Supabase Auth
- Dashboard → Authentication → Users
- Should match the database users

### 3. Test registration
- Resident: http://localhost:3000/register
- Should complete successfully

### 4. Test login
- After registration, try logging in
- Should work without errors

## Quick Reference

| Script | Purpose | Safety |
|--------|---------|--------|
| `cleanup-deleted-users.js` | Dry run - shows orphans | ✅ Safe (no deletion) |
| `force-cleanup-users.js` | Delete orphaned users only | ⚠️ Deletes orphans |
| `reset-all-users.js` | Delete ALL users | ❌ Nuclear option |

## Common Errors After Deletion

### Error: "Email already exists"
**Cause**: Database still has the user profile  
**Fix**: Run `force-cleanup-users.js`

### Error: "User not found"
**Cause**: Auth user exists but no profile in database  
**Fix**: The auth recovery in AuthContext should handle this, but you can also run `reset-all-users.js`

### Error: "Invalid credentials"
**Cause**: User deleted from Auth but trying to login  
**Fix**: Register again after running cleanup script

## Need Help?

1. **Check logs**
   ```bash
   # Backend logs
   cd backend
   npm run start:dev
   
   # Browser console
   F12 → Console tab
   ```

2. **Check database state**
   ```bash
   node scripts/cleanup-deleted-users.js
   ```

3. **Verify Supabase Auth**
   - Dashboard → Authentication → Users
   - Check which users actually exist

## Production Warning

⚠️ **NEVER run these scripts in production without:**
1. ✅ Full database backup
2. ✅ Exporting user data
3. ✅ User notification plan
4. ✅ Rollback strategy
5. ✅ Testing in staging first

For production, always implement proper user deletion flows that maintain data integrity.

---

**Current Status**: Scripts are ready to run  
**Recommended Action**: Run `force-cleanup-users.js` to clean orphaned users  
**Result**: Users can register again with their email addresses
