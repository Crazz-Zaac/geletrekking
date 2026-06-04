const User = require('../models/user');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const generateToken = require('../utils/generateToken');
const { encrypt, decrypt } = require('../utils/crypto');
const { logAudit } = require('../utils/auditLogger');
const verifyGoogleToken = require('../utils/verifyGoogleToken');

const TOTP_VERIFY_WINDOW = 1;
const TWO_FACTOR_BYPASS_ENABLED = process.env.ALLOW_2FA_BYPASS === 'true';
const TWO_FACTOR_BYPASS_IPS = (process.env.ALLOW_2FA_BYPASS_IPS || '')
  .split(',')
  .map((ip) => ip.trim())
  .filter(Boolean);
const MAX_FAILED_LOGINS = Number(process.env.AUTH_MAX_FAILED_LOGINS || 5);
const LOCKOUT_MINUTES = Number(process.env.AUTH_LOCKOUT_MINUTES || 15);

const isTwoFactorBypassAllowed = (req) => {
  if (!TWO_FACTOR_BYPASS_ENABLED) return false;
  if (TWO_FACTOR_BYPASS_IPS.length === 0) return true;
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
      return res.status(401).json({ message: 'Access denied' });
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
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const role = normalizeRole(user.role);
    if (role === 'superadmin' && !user.twoFactorEnabled) {
      return res.status(403).json({ message: 'Superadmin must enable 2FA before logging in.' });
    }

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
        const secret = getDecryptedSecret(user);
        const verified = verifyTotpCode({
          secret,
          token: twoFactorCode,
        });

        if (!verified) {
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

    res.status(200).json({
      token,
      user: toSafeUser(user),
    });
  } catch (err) {
    console.error('Login error:', err.stack || err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────
//  GOOGLE LOGIN CONTROLLER
// ─────────────────────────────────────────────
exports.googleLogin = async (req, res) => {
  const { token, twoFactorCode } = req.body;

  try {
    const payload = await verifyGoogleToken(token);
    const { email, name } = payload;
    const normalizedEmail = (email || '').toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !['editor', 'superadmin', 'admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Not an authorized admin' });
    }

    const statusCheck = enforceAccountStatus(user);
    if (!statusCheck.ok) {
      return res.status(403).json({ message: statusCheck.message });
    }

    const role = normalizeRole(user.role);
    if (role === 'superadmin' && !user.twoFactorEnabled) {
      return res.status(403).json({ message: 'Superadmin must enable 2FA before logging in.' });
    }

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
        const secret = getDecryptedSecret(user);
        const verified = verifyTotpCode({
          secret,
          token: twoFactorCode,
        });

        if (!verified) {
          await logAudit({
            actor: user._id,
            actorEmail: user.email,
            action: 'admin.login.google',
            outcome: 'failure',
            ip: req.ip,
            userAgent: req.get('user-agent'),
            meta: { reason: 'invalid_2fa' },
          });
          return res.status(401).json({ message: 'Invalid or expired 2FA code' });
        }

        if (user.twoFactorSecret && !user.twoFactorSecretEnc) {
          user.twoFactorSecretEnc = encrypt(user.twoFactorSecret);
          user.twoFactorSecret = null;
        }
      }
    }

    const jwtToken = generateToken(user);
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    user.lastLoginIp = req.ip;
    await user.save();

    await logAudit({
      actor: user._id,
      actorEmail: user.email,
      action: 'admin.login.google',
      outcome: 'success',
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      token: jwtToken,
      user: {
        ...toSafeUser(user),
        name: user.name || name,
      },
    });
  } catch (err) {
    console.error('Google login error:', err.message);
    return res.status(401).json({ message: 'Invalid Google token' });
  }
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
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(secret.otpauth_url)}`,
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

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
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
