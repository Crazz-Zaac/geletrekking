# Quick Start Guide - Secure Admin Auth

## Setup (5 min)

### 1. Generate Encryption Key
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Update `.env`
```env
# JWT
JWT_ISSUER=gele-trekking-admin
JWT_AUDIENCE=gele-trekking-admin
JWT_EXPIRES_IN=1d

# Encryption (paste generated key above)
ADMIN_2FA_ENCRYPTION_KEY=<generated-key-here>

# Admin Config
ADMIN_APP_URL=http://localhost:3000
ADMIN_INVITE_EXPIRY_HOURS=48
AUTH_MAX_FAILED_LOGINS=5
AUTH_LOCKOUT_MINUTES=15
```

### 3. Restart Backend
```bash
npm run dev  # backend will auto-sync models
```

---

## Workflows

### Invite New Editor

**Via API (cURL):**
```bash
curl -X POST http://localhost:3000/api/admin/invites \
  -H "Authorization: Bearer {SUPERADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"email":"editor@example.com"}'
```

**Response:**
```json
{
  "message": "Invite created.",
  "inviteUrl": "http://localhost:3000/admin/invite?token=...",
  "expiresAt": "2026-05-27T10:00:00Z"
}
```

**Via UI:**
1. Go to `/admin/users`
2. Enter editor email
3. Click "Send Invite"
4. Share link with editor

---

### Editor Accepts Invite

1. Open invite link: `http://localhost:3000/admin/invite?token=...`
2. Enter email (auto-filled from invite)
3. Set password (min 8 chars)
4. Confirm password
5. Click "Create Account"
6. Redirected to dashboard
7. Done! ✅

---

### Enable 2FA for Superadmin

1. Go to `/admin/account-security`
2. Click "Set Up Two-Factor Authentication"
3. Scan QR code with Google Authenticator
4. Enter 6-digit code
5. Save backup codes
6. Done! (now mandatory on login) ✅

---

### Enable 2FA for Editor (Optional)

**Same as above**, but optional. Editor can skip.

---

### View Audit Logs

1. Go to `/admin/audit-logs` (superadmin only)
2. Filter by action (e.g., `auth.login`)
3. Filter by outcome (success/failure)
4. View IP, actor, resource, timestamp
5. Use pagination to browse

**API:**
```bash
curl http://localhost:3000/api/admin/audit-logs?action=auth.login&limit=50 \
  -H "Authorization: Bearer {TOKEN}"
```

---

### Suspend Editor

**Via API:**
```bash
curl -X PATCH http://localhost:3000/api/admin/users/{USER_ID}/status \
  -H "Authorization: Bearer {SUPERADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"status":"suspended","reason":"Suspicious activity"}'
```

**Status Options:**
- `active` - User can login
- `suspended` - User cannot login (temporary)
- `disabled` - User cannot login (permanent)

---

### Reset Failed Logins (Unlock Account)

**Via API:**
```bash
curl -X PATCH http://localhost:3000/api/admin/users/{USER_ID}/status \
  -H "Authorization: Bearer {SUPERADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"status":"active"}'
```

This resets `failedLoginAttempts` and `lockUntil`.

---

## Common Issues

### "Invalid 2FA code" on superadmin login
- Check system time sync
- Backup codes? Use one instead
- Regenerate 2FA (ask other superadmin to help)

### Account locked after 5 failed attempts
- Wait 15 minutes
- Or superadmin resets status to `active`

### Invite link expired
- Create new invite (48h default)
- Change `ADMIN_INVITE_EXPIRY_HOURS` if needed

### Can't find User Management page
- Only superadmin can access `/admin/users`
- Check login role: should be `superadmin`

### Audit logs empty
- Check `AuditLog` collection in MongoDB
- Verify middleware added to routes
- Check auth user captured correctly

---

## Testing Commands

### Login Superadmin
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@example.com",
    "password": "password123",
    "code": "123456"  # If 2FA enabled
  }'
```

### Create Invite
```bash
curl -X POST http://localhost:3000/api/admin/invites \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"email":"neweditor@example.com"}'
```

### Accept Invite
```bash
curl -X POST http://localhost:3000/api/admin/invites/accept \
  -H "Content-Type: application/json" \
  -d '{
    "token": "invite-token-here",
    "email": "neweditor@example.com",
    "password": "MyPassword123"
  }'
```

### List Audit Logs
```bash
curl http://localhost:3000/api/admin/audit-logs?limit=10 \
  -H "Authorization: Bearer {SUPERADMIN_TOKEN}"
```

---

## Security Reminders

✅ **Do:**
- Store `ADMIN_2FA_ENCRYPTION_KEY` in secure vault
- Rotate encryption keys annually
- Review audit logs weekly
- Monitor failed login attempts
- Require strong passwords
- Use 2FA for superadmin always

❌ **Don't:**
- Commit secrets to git
- Share superadmin credentials
- Disable 2FA for superadmin
- Create too many invites
- Ignore suspicious audit logs
- Leave accounts locked indefinitely

---

## Performance Tips

- Audit logs indexed by `action` and `actor` (fast queries)
- AuditLog entries auto-expire (optional TTL index)
- JWT expiry default 1d (adjustable)
- Invite token hashed (prevents token enumeration)

---

## Next Steps

1. ✅ Superadmin invites editor
2. ✅ Editor accepts invite
3. ✅ Editor manages content
4. ✅ Superadmin reviews audit logs
5. ✅ Superadmin disables inactive editors

**Ready to go!** 🚀
