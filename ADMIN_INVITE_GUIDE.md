# Admin Invite System - User Guide

## Overview
The ARMS admin invite system allows existing admins to securely invite new staff members (admins, supervisors, ward officers, etc.) without sharing a permanent signup code. Each invite is single-use and has an expiration time.

## How to Issue Admin Invites

### Step 1: Access the Operations Page
1. Log in to ARMS as an **admin** user
2. Navigate to **Operations** from the sidebar menu
3. Scroll down to the **"Staff invite issuance"** section

### Step 2: Fill Out the Invite Form
The invite form has three fields:

1. **Invite email** (Required)
   - Enter the email address of the person you want to invite
   - Example: `john.doe@arms.local`
   - This email will receive the invite link (if email is configured)

2. **Expires in hours** (Required)
   - Set how long the invite link will be valid
   - Default: 72 hours (3 days)
   - Range: 1-168 hours (1 hour to 7 days)
   - Example: `72` for 3 days

3. **Internal note** (Optional)
   - Add a note for your records
   - Example: "New ward officer for Festac Town"
   - This note is only visible to admins, not the invitee

### Step 3: Issue the Invite
1. Click the **"Issue invite"** button
2. Wait for the system to process the request

### Step 4: Share the Invite Link
After creating the invite, you'll see a green success box with:

**If email is configured:**
- Message: "Invite email sent. Keep this link as a backup."
- The invite link is automatically sent to the email address
- Copy the link as a backup in case the email doesn't arrive

**If email is NOT configured:**
- Message: "Invite created, but the system could not send the email. Share this link manually."
- You MUST copy and share the link manually with the invitee

**To copy the link:**
1. Click the **"Copy link"** button in the green box
2. Share the link via:
   - Email (manually)
   - WhatsApp
   - SMS
   - Any secure messaging platform

### Step 5: Invitee Registration Process
Once the invitee receives the link:

1. They click the invite link
2. They're taken to the admin registration page
3. The form is pre-filled with their email and invite token
4. They complete the registration form:
   - Password
   - First name
   - Last name
   - Phone number
   - Address details
5. They click "Accept invite"
6. Their account is created with admin privileges

## Managing Invites

### View All Invites
Below the invite form, you'll see a list of recent invites showing:
- Email address
- Status (active, used, expired, revoked)
- Creation date
- Expiration date
- Internal note (if any)

### Revoke an Invite
If you need to cancel an unused invite:
1. Find the invite in the list
2. Click the **"Revoke invite"** button
3. The invite link will no longer work
4. Status changes to "revoked"

**Note:** You can only revoke invites with "active" status. Used or expired invites cannot be revoked.

## Invite Link Format

The invite link looks like this:
```
http://localhost:3000/admin/register?email=john.doe@arms.local&token=abc123xyz789
```

**Important:**
- The link contains the email and a unique token
- The token is single-use only
- Once used, the link becomes invalid
- The link expires after the specified hours

## Security Best Practices

### Do:
✅ Set appropriate expiration times (24-72 hours is recommended)
✅ Verify the email address before issuing an invite
✅ Use the internal note field to track why the invite was issued
✅ Revoke unused invites if the person no longer needs access
✅ Share invite links through secure channels
✅ Keep a backup of the invite link in case email fails

### Don't:
❌ Share invite links publicly or on unsecured platforms
❌ Set very long expiration times (more than 7 days)
❌ Reuse the same invite link for multiple people
❌ Share your admin credentials instead of using invites
❌ Forget to revoke invites if plans change

## Troubleshooting

### Problem: "Could not create admin invite"
**Solutions:**
- Check that you're logged in as an admin
- Verify the email format is correct
- Ensure the backend server is running
- Check browser console for error details

### Problem: Email not received
**Solutions:**
- Copy the invite link from the green success box
- Share the link manually with the invitee
- Check spam/junk folder
- Verify email configuration in backend `.env` file

### Problem: Invite link doesn't work
**Possible causes:**
- Link has expired (check expiration time)
- Link was already used (single-use only)
- Link was revoked by an admin
- Email in the link doesn't match the one used during registration

**Solutions:**
- Issue a new invite with a fresh link
- Ensure the invitee uses the correct email address

### Problem: "This staff account is missing its invite link"
**Solution:**
- The registration was attempted without a valid invite token
- Issue a new invite and ensure the invitee clicks the full link
- Don't manually navigate to `/admin/register` - use the invite link

## Email Configuration (For System Administrators)

To enable automatic email delivery of invites, configure these environment variables in `backend/.env`:

```env
# Email Configuration
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=ARMS <notifications@your-domain.com>
SUPPORT_EMAIL=support@your-domain.com
```

Without email configuration, invites still work but must be shared manually.

## Invite Lifecycle

```
1. CREATED (active)
   ↓
2. EMAIL SENT (if configured)
   ↓
3. INVITEE CLICKS LINK
   ↓
4. INVITEE COMPLETES REGISTRATION
   ↓
5. INVITE MARKED AS "USED"
```

**Alternative paths:**
- Admin revokes → Status: "revoked"
- Time expires → Status: "expired"

## Example Workflow

### Scenario: Hiring a new Ward Officer

1. **Admin creates invite:**
   - Email: `jane.smith@arms.local`
   - Expires: 48 hours
   - Note: "Ward Officer - Festac Town"

2. **System sends email** (or admin shares link manually)

3. **Jane receives email** with subject: "You're invited to join ARMS"

4. **Jane clicks the invite link** in the email

5. **Jane completes registration:**
   - Password: (creates secure password)
   - Name: Jane Smith
   - Phone: 08012345678
   - Address: Festac Town, Lagos

6. **Account created** with admin role

7. **Jane can now log in** at `/admin/login`

8. **Invite status** changes to "used"

## API Endpoints (For Developers)

### Create Invite
```http
POST /admin-invites
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "user@example.com",
  "expiresInHours": 72,
  "note": "Optional internal note"
}
```

### List Invites
```http
GET /admin-invites
Authorization: Bearer <admin-token>
```

### Revoke Invite
```http
PATCH /admin-invites/:id/revoke
Authorization: Bearer <admin-token>
```

### Validate Invite (Public)
```http
POST /admin-invites/validate
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "invite-token-here"
}
```

## Frequently Asked Questions

### Q: Can I invite multiple people at once?
**A:** No, each invite is for one person. Issue separate invites for each new staff member.

### Q: Can I change the expiration time after creating an invite?
**A:** No, you need to revoke the old invite and create a new one with the desired expiration.

### Q: What happens if someone tries to use an expired invite?
**A:** They'll see an error message. Issue a new invite for them.

### Q: Can residents use admin invites?
**A:** No, admin invites are only for staff accounts (admin, supervisor, ward officer, etc.). Residents register directly without invites.

### Q: How many invites can I create?
**A:** There's no limit. Create as many as needed.

### Q: Can I see who created an invite?
**A:** Currently, the system tracks which admin created each invite (stored in the database).

### Q: What roles can be invited?
**A:** Admin invites create accounts with admin privileges. Role assignment (admin, supervisor, ward officer, etc.) can be managed after account creation.

## Support

If you encounter issues with the invite system:
1. Check this guide for troubleshooting steps
2. Verify backend and frontend servers are running
3. Check browser console for error messages
4. Contact system administrator for technical support

---

**Last Updated:** May 25, 2026
**Version:** 1.0
