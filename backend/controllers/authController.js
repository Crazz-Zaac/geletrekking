const User = require('../models/user');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const generateToken = require('../utils/generateToken');
const verifyGoogleToken = require('../utils/verifyGoogleToken');

const TOTP_VERIFY_WINDOW = 1;

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

const toSafeUser = (user) => ({
  id: user._id,
  name: user.name || user.username,
  email: user.email,
  role: user.role,
});

// ─────────────────────────────────────────────
//  EMAIL + PASSWORD LOGIN CONTROLLER
// ─────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password, twoFactorCode } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return res.status(401).json({ message: 'Access denied' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({
          need2FA: true,
          message: 'Enter the 6-digit code from your authenticator app.',
        });
      }

      const verified = verifyTotpCode({
        secret: user.twoFactorSecret,
        token: twoFactorCode,
      });

      if (!verified) {
        return res.status(401).json({ message: 'Invalid or expired 2FA code' });
      }
    }

    const token = generateToken(user);
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
    const user = await User.findOne({ email });

    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ message: 'Not an authorized admin' });
    }

    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({
          need2FA: true,
          message: 'Enter the 6-digit code from your authenticator app.',
        });
      }

      const verified = verifyTotpCode({
        secret: user.twoFactorSecret,
        token: twoFactorCode,
      });

      if (!verified) {
        return res.status(401).json({ message: 'Invalid or expired 2FA code' });
      }
    }

    const jwtToken = generateToken(user);
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
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ message: 'Not authorized for 2FA setup.' });
    }

    const issuer = encodeURIComponent('Gele Trekking Admin');
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `${issuer}:${user.email}`,
      issuer: 'Gele Trekking Admin',
    });

    user.twoFactorTempSecret = secret.base32;
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
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ message: 'Not authorized for 2FA setup.' });
    }

    if (!user.twoFactorTempSecret) {
      return res.status(400).json({ message: '2FA setup has not been initialized.' });
    }

    const verified = verifyTotpCode({
      secret: user.twoFactorTempSecret,
      token: code,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    user.twoFactorSecret = user.twoFactorTempSecret;
    user.twoFactorEnabled = true;
    user.twoFactorTempSecret = null;
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
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ message: 'Not authorized for 2FA disable.' });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA is not currently enabled.' });
    }

    const verified = verifyTotpCode({
      secret: user.twoFactorSecret,
      token: code,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorTempSecret = null;
    await user.save();

    return res.status(200).json({ message: 'Two-factor authentication has been disabled.' });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to disable 2FA.' });
  }
};
