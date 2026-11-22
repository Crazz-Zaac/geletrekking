# Admin Authentication & Login Security Issues

Tracking list for security vulnerabilities and hardening items identified in the admin login flow.
**Overall Status:** All issues resolved and merged into `main` (`commit 3379526`).

---

### [AUTH-01] Fix Admin Account Enumeration & Timing Discrepancy
- **Severity:** High
- **Status:** Resolved & Merged (Main)
- **Description:** Non-existent emails returned `401 "Access denied"` immediately without bcrypt, whereas valid emails returned `401 "Invalid credentials"` after bcrypt.compare (~100ms delay). This allowed attackers to enumerate valid admin emails.
- **Resolution:**
  - Standardized error message to `"Invalid email or password"` across both cases.
  - Implemented dummy password hashing via `bcrypt.compare` when user is not found to equalize response times.

### [AUTH-02] Harden Login Rate Limiting (Dual IP & Email Protection)
- **Severity:** High
- **Status:** Resolved & Merged (Main)
- **Description:** Rate limiting only keyed on `${ip}:${email}`, allowing an attacker to password-spray thousands of emails from a single IP without triggering rate limits.
- **Resolution:**
  - Added `authLoginIpLimiter` (30 attempts / 15m strictly per IP) alongside `authLoginLimiter` (10 attempts / 15m per IP+email).

### [AUTH-03] Eliminate 2FA Bypass Vulnerability (`ALLOW_2FA_BYPASS`)
- **Severity:** High
- **Status:** Resolved & Merged (Main)
- **Description:** If `ALLOW_2FA_BYPASS=true` was enabled and `ALLOW_2FA_BYPASS_IPS` was empty, the code allowed any IP to bypass 2FA for non-superadmin accounts.
- **Resolution:**
  - Enforced that 2FA bypass is strictly ignored in production (`NODE_ENV === 'production'`).
  - Required that `ALLOW_2FA_BYPASS_IPS` contains valid explicit IP addresses; empty IP list now denies bypass.

### [AUTH-04] Enforce Backend Password Complexity on Invite Acceptance
- **Severity:** Medium
- **Status:** Resolved & Merged (Main)
- **Description:** `acceptInvite` accepted any non-empty password string without length or character complexity requirements.
- **Resolution:**
  - Enforced minimum length of 10 characters and required a mix of uppercase, lowercase, and numeric or special characters.

### [AUTH-05] Prevent TOTP Code Replay Attacks
- **Severity:** Medium
- **Status:** Resolved & Merged (Main)
- **Description:** Speakeasy TOTP verification accepted codes across a 90-second window without recording used time steps, allowing intercepted 2FA codes to be replayed.
- **Resolution:**
  - Added `lastUsedTotpStep` to the `User` schema.
  - Reject verification if the code matches a previously consumed TOTP time step.

### [AUTH-06] Remove Insecure Legacy Superadmin Route & Model
- **Severity:** Medium
- **Status:** Resolved & Merged (Main)
- **Description:** `/api/superadmin/addadmin` created accounts with unencrypted, unconfirmed 2FA secrets, permanently locking out created admins and bypassing the invite flow. Unused `models/Admin.js` was also present.
- **Resolution:**
  - Deprecated and removed `/api/superadmin/addadmin` in favor of the secure invite workflow.
  - Removed unused `models/Admin.js`.
