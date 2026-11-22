const User = require('../models/user');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const generateToken = require('../utils/generateToken');
const { encrypt, decrypt } = require('../utils/crypto');
const { logAudit } = require('../utils/auditLogger');
const QRCode = require('qrcode');
const { setSessionCookie, clearSessionCookie } = require('../utils/sessionCookie');

const TOTP_VERIFY_WINDOW = 1;
const TWO_FACTOR_BYPASS_ENABLED = process.env.ALLOW_2FA_BYPASS === 'true';
const TWO_FACTOR_BYPASS_IPS = (process.env.ALLOW_2FA_BYPASS_IPS || '')
  .split(',')
  .map((ip) => ip.trim())
  .filter(Boolean);
const MAX_FAILED_LOGINS = Number(process.env.AUTH_MAX_FAILED_LOGINS || 5);
const LOCKOUT_MINUTES = Number(process.env.AUTH_LOCKOUT_MINUTES || 15);

// Precomputed bcrypt hash used to equalize execution time when an email does not exist,
// neutralizing timing-based account enumeration.
const DUMMY_PASSWORD_HASH = '$2b$12$e8Y5M5cO1y3E2p9c0zYy6O4q3V8r8u9y1x4w2v1t0s9r8q7p6o5n4';
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';

const isTwoFactorBypassAllowed = (req) => {
  // Never permit 2FA bypass in production under any circumstance
  if (process.env.NODE_ENV === 'production') return false;
  if (!TWO_FACTOR_BYPASS_ENABLED) return false;
  // An explicit non-empty IP allowlist is mandatory
  if (TWO_FACTOR_BYPASS_IPS.length === 0) return false;
  return TWO_FACTOR_BYPASS_IPS.includes(req.ip);
};

const verifyTotpCode = ({ secret, token }) => {
  if (!secret || !token) return false;
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: token.toString().trim(),
    step: 30,
    window: TOTP_VERIFY_WINDOW,
  });
};

const normalizeRole = (role) => (role === 'admin' ? 'editor' : role);

const toSafeUser = (user) => ({
  id: user._id,
  name: user.name || user.username,
  email: user.email,
  role: normalizeRole(user.role),
  twoFactorEnabled: !!user.twoFactorEnabled,
  requiresTwoFactorSetup: normalizeRole(user.role) === 'superadmin' && !user.twoFactorEnabled,
});

const getDecryptedSecret = (user) => {
  if (user.twoFactorSecretEnc) {
    return decrypt(user.twoFactorSecretEnc);
  }
  return user.twoFactorSecret || null;
};

const getDecryptedTempSecret = (user) => {
  if (user.twoFactorTempSecretEnc) {
    return decrypt(user.twoFactorTempSecretEnc);
  }
  return user.twoFactorTempSecret || null;
};

const enforceAccountStatus = (user) => {
  if (!user) return { ok: false, message: 'Access denied' };
  if (user.status && user.status !== 'active') {
    return { ok: false, message: 'Account is not active' };
  }
  if (user.lockUntil && user.lockUntil > new Date()) {
    return { ok: false, message: 'Account temporarily locked. Try again later.' };
  }
  return { ok: true };
};

// ─────────────────────────────────────────────
//  EMAIL + PASSWORD LOGIN CONTROLLER
// ─────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password, twoFactorCode } = req.body;

  try {
    const normalizedEmail = (email || '').toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !['editor', 'superadmin', 'admin'].includes(user.role)) {
      // Execute dummy bcrypt comparison to neutralize timing attacks
      await bcrypt.compare(password || '', DUMMY_PASSWORD_HASH);
      return res.status(401).json({ message: INVALID_CREDENTIALS_MESSAGE });
    }

    const statusCheck = enforceAccountStatus(user);
    if (!statusCheck.ok) {
      return res.status(403).json({ message: statusCheck.message });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= MAX_FAILED_LOGINS) {
        user.lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      }
      await user.save();

      await logAudit({
        actor: user._id,
        actorEmail: user.email,
        action: 'admin.login',
        outcome: 'failure',
        ip: req.ip,
        userAgent: req.get('user-agent'),
        meta: { reason: 'invalid_password' },
      });
      return res.status(401).json({ message: INVALID_CREDENTIALS_MESSAGE });
    }

    const role = normalizeRole(user.role);
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        if (role !== 'superadmin' && isTwoFactorBypassAllowed(req)) {
          console.warn(`2FA bypass used for ${user.email} from ${req.ip}`);
        } else {
          return res.status(200).json({
            need2FA: true,
            message: 'Enter the 6-digit code from your authenticator app.',
          });
        }
      }

      if (twoFactorCode) {
        // Enforce anti-replay: each 30-second TOTP step may only be consumed once
        const currentStep = Math.floor(Date.now() / 1000 / 30);
        if (user.lastUsedTotpStep && user.lastUsedTotpStep >= currentStep) {
          return res.status(401).json({ message: 'This code was already used. Please wait for the next 6-digit code.' });
        }

        const secret = getDecryptedSecret(user);
        const verified = verifyTotpCode({
          secret,
          token: twoFactorCode,
        });

        if (!verified) {
          user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
          if (user.failedLoginAttempts >= MAX_FAILED_LOGINS) {
            user.lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
          }
          await user.save();

          await logAudit({
            actor: user._id,
            actorEmail: user.email,
            action: 'admin.login',
            outcome: 'failure',
            ip: req.ip,
            userAgent: req.get('user-agent'),
            meta: { reason: 'invalid_2fa' },
          });
          return res.status(401).json({ message: 'Invalid or expired 2FA code' });
        }

        user.lastUsedTotpStep = currentStep;

        if (user.twoFactorSecret && !user.twoFactorSecretEnc) {
          user.twoFactorSecretEnc = encrypt(user.twoFactorSecret);
          user.twoFactorSecret = null;
        }
      }
    }

    const token = generateToken(user);
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    user.lastLoginIp = req.ip;
    await user.save();

    await logAudit({
      actor: user._id,
      actorEmail: user.email,
      action: 'admin.login',
      outcome: 'success',
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    // The token is delivered only as an httpOnly cookie, never to page scripts.
    setSessionCookie(req, res, token);
    res.status(200).json({
      user: toSafeUser(user),
    });
  } catch (err) {
    console.error('Login error:', process.env.NODE_ENV === 'production' ? err.message : (err.stack || err));
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = (req, res) => {
  clearSessionCookie(req, res);
  res.status(200).json({ message: 'Logged out' });
};

exports.beginTwoFactorSetup = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !['editor', 'superadmin', 'admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Not authorized for 2FA setup.' });
    }

    const issuer = encodeURIComponent('Gele Trekking Admin');
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `${issuer}:${user.email}`,
      issuer: 'Gele Trekking Admin',
    });

    user.twoFactorTempSecretEnc = encrypt(secret.base32);
    user.twoFactorTempSecret = null;
    await user.save();

    return res.status(200).json({
      message: 'Scan this secret in your authenticator app and verify with a 6-digit code.',
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
      qrUrl: await QRCode.toDataURL(secret.otpauth_url, { width: 220, margin: 1 }),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to start 2FA setup.' });
  }
};

exports.verifyTwoFactorSetup = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user || !['editor', 'superadmin', 'admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Not authorized for 2FA setup.' });
    }

    const tempSecret = getDecryptedTempSecret(user);
    if (!tempSecret) {
      return res.status(400).json({ message: '2FA setup has not been initialized.' });
    }

    const verified = verifyTotpCode({
      secret: tempSecret,
      token: code,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    user.twoFactorSecretEnc = encrypt(tempSecret);
    user.twoFactorEnabled = true;
    user.twoFactorTempSecretEnc = null;
    user.twoFactorTempSecret = null;
    user.twoFactorSecret = null;
    await user.save();

    return res.status(200).json({ message: 'Two-factor authentication has been enabled.' });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to verify 2FA setup.' });
  }
};

exports.disableTwoFactor = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user || !['editor', 'superadmin', 'admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Not authorized for 2FA disable.' });
    }

    if (user.role === 'superadmin') {
      return res.status(400).json({ message: 'Two-factor authentication is mandatory and cannot be disabled for superadmin accounts.' });
    }

    if (!user.twoFactorEnabled || !(user.twoFactorSecretEnc || user.twoFactorSecret)) {
      return res.status(400).json({ message: '2FA is not currently enabled.' });
    }

    const secret = getDecryptedSecret(user);
    const verified = verifyTotpCode({
      secret,
      token: code,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecretEnc = null;
    user.twoFactorTempSecretEnc = null;
    user.twoFactorSecret = null;
    user.twoFactorTempSecret = null;
    await user.save();

    return res.status(200).json({ message: 'Two-factor authentication has been disabled.' });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to disable 2FA.' });
  }
};
