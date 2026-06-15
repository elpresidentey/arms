# ARMS Secure Admin Setup Guide

## Overview

ARMS now uses a secure bootstrap process for creating the first administrator account. This eliminates the security risk of having public admin signup links while ensuring proper initial setup.

## Security Architecture

### Bootstrap Process Flow
1. **System Administrator** generates a secure bootstrap token
2. **Bootstrap token** is configured in the backend environment
3. **First Admin** uses the bootstrap URL to create their account
4. **Subsequent Admins** are invited through the admin panel (existing invite system)

### Key Security Features
- **No public admin signup** - Admin registration requires secure tokens
- **Single-use bootstrap** - Bootstrap only works when no admin exists
- **Cryptographically secure tokens** - Generated using crypto.randomBytes()
- **Environment-based validation** - Tokens must match server configuration
- **Audit logging** - All bootstrap attempts are logged

## Initial Setup Process

### Step 1: Generate Bootstrap Token

Run the token generation script on your server:

```bash
# Generate a bootstrap token
node backend/scripts/generate-bootstrap-token.js

# Generate and automatically update .env file
node backend/scripts/generate-bootstrap-token.js --env

# Generate with custom length
node backend/scripts/generate-bootstrap-token.js --length=64 --env
```

**Example Output:**
```
🔐 ARMS Bootstrap Token Generated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Token: a1b2c3d4e5f6789...
Length: 48 bytes (96 characters)
Generated: 2026-06-13T10:30:00.000Z

🔗 Bootstrap URL:
   https://your-domain.com/bootstrap?token=a1b2c3d4e5f6789...

📋 Environment Variable:
   BOOTSTRAP_ADMIN_TOKEN=a1b2c3d4e5f6789...
```

### Step 2: Configure Environment

Ensure your backend `.env` file contains the bootstrap token:

```env
# Bootstrap token for initial admin setup
BOOTSTRAP_ADMIN_TOKEN=your_generated_token_here

# Other required environment variables
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# ... other config
```

### Step 3: Restart Backend Server

```bash
# Restart your backend server to load the new token
npm run start:prod
# or
yarn start:prod
```

### Step 4: Create First Admin

Send the bootstrap URL to your first administrator:

```
https://your-domain.com/bootstrap?token=your_generated_token_here
```

The admin will fill out the bootstrap form with:
- **Bootstrap Token** (pre-filled from URL)
- **Personal Information** (name, email, phone)
- **Account Credentials** (email, secure password)
- **Location Details** (address, ward, etc.)

### Step 5: Verify Admin Creation

After successful bootstrap:
- Admin is automatically logged in
- Bootstrap token becomes invalid
- Admin can now invite other admins through the panel

## Adding Additional Admins

### Through Admin Panel

Once the first admin is created, they can invite additional admins:

1. **Login** as admin
2. **Navigate** to Settings → Admin Invites
3. **Create Invite** with email and expiration
4. **Share invite link** with new admin
5. **New admin** uses invite link to register

### Admin Invite Flow
```
Admin Panel → Create Invite → Generate Link → Send to User → User Registers
```

## Security Considerations

### Bootstrap Token Security
- **Keep tokens private** - Never expose in public repositories
- **Use HTTPS** - Always access bootstrap URLs over secure connections
- **Single admin check** - Bootstrap fails if any admin already exists
- **Environment validation** - Tokens must match server configuration
- **Audit logging** - All bootstrap attempts are logged for security

### Production Deployment
```bash
# Generate production token
node scripts/generate-bootstrap-token.js --length=64 --env

# Deploy with secure token
BOOTSTRAP_ADMIN_TOKEN=your_secure_production_token

# Remove token after admin creation (optional)
# BOOTSTRAP_ADMIN_TOKEN=
```

### Token Rotation
```bash
# Generate new token
node scripts/generate-bootstrap-token.js --env

# Update production environment
# Deploy new token

# First admin can still invite others
```

## Troubleshooting

### Common Issues

**"Bootstrap admin token is invalid"**
- Check token in `.env` file matches URL parameter
- Verify backend server has restarted with new token
- Ensure token hasn't expired or been modified

**"An admin user already exists"**
- Bootstrap only works for initial setup
- Use admin invite system for additional admins
- Check if bootstrap was already completed

**"SUPABASE_SERVICE_ROLE_KEY is required"**
- Ensure service role key is configured in `.env`
- Bootstrap requires admin access to Supabase Auth
- Verify Supabase project configuration

### Debug Steps

1. **Check Environment Variables**
   ```bash
   # Verify token is loaded
   echo $BOOTSTRAP_ADMIN_TOKEN
   ```

2. **Check Database**
   ```sql
   -- Check if admin exists
   SELECT email, role FROM users WHERE role = 'admin';
   ```

3. **Check Logs**
   ```bash
   # Check backend logs for bootstrap attempts
   tail -f logs/app.log
   ```

## Migration from Old System

### If You Have Existing Admin Links

1. **Remove admin signup links** from login pages (already done)
2. **Generate bootstrap token** for initial admin
3. **Create first admin** via bootstrap process  
4. **Migrate existing admins** using invite system

### Update Frontend Routes

Remove any existing admin registration routes:
```typescript
// Remove these routes
// /admin/register
// /register?role=admin
```

Keep only:
```typescript
// Secure bootstrap route
/bootstrap?token=...

// Admin login (existing)
/admin/login

// Resident registration (existing)
/register
```

## API Endpoints

### Bootstrap Endpoint
```typescript
POST /auth/bootstrap
{
  "bootstrapToken": "string",
  "email": "string", 
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string",
  "address": "string",
  "ward": "string",
  "houseNumber": "string",
  "street": "string"
}
```

**Response:**
```typescript
{
  "access_token": "string",
  "token": "string", 
  "user": User,
  "message": "Bootstrap admin created successfully"
}
```

### Validation Rules

- **Bootstrap Token**: Must match `BOOTSTRAP_ADMIN_TOKEN` environment variable
- **No Existing Admin**: Bootstrap fails if any admin user exists
- **Service Role Key**: Required for Supabase admin operations
- **Password Requirements**: Minimum 8 characters, complexity rules
- **Email Validation**: Must be valid email format
- **Required Fields**: All personal and location fields are required

## Best Practices

### Security
- **Generate strong tokens** (minimum 48 bytes)
- **Use HTTPS everywhere** for bootstrap URLs
- **Rotate tokens regularly** for enhanced security
- **Remove tokens** after bootstrap completion (optional)
- **Monitor bootstrap attempts** through logs

### Operational
- **Document the process** for your team
- **Test bootstrap flow** in staging environment
- **Backup environment config** before changes
- **Train admins** on invite process for team growth
- **Regular security reviews** of admin access

### Development
- **Different tokens** for each environment
- **Never commit tokens** to version control
- **Use environment-specific** `.env` files
- **Test failure scenarios** (invalid tokens, existing admins)

## Example Deployment

### Production Setup
```bash
# 1. Generate production token
node scripts/generate-bootstrap-token.js --length=64

# 2. Update production .env
echo "BOOTSTRAP_ADMIN_TOKEN=prod_token_here" >> .env.production

# 3. Deploy and restart
pm2 restart arms-backend

# 4. Create first admin
# Share: https://arms.yourdomain.com/bootstrap?token=prod_token_here

# 5. Verify admin creation
# Login and check admin panel access
```

### Staging Setup
```bash
# 1. Generate staging token  
node scripts/generate-bootstrap-token.js --length=48

# 2. Update staging .env
echo "BOOTSTRAP_ADMIN_TOKEN=staging_token_here" >> .env.staging

# 3. Test bootstrap flow
# Access: https://staging-arms.yourdomain.com/bootstrap?token=staging_token_here
```

This secure bootstrap system ensures that admin access is properly controlled while maintaining ease of initial setup and ongoing admin management through the invite system.