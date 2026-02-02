const User = require('../models/user');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const generateToken = require('../utils/generateToken');
const verifyGoogleToken = require('../utils/verifyGoogleToken');
const sendEmail = require('../utils/sendEmail');

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

    // ── Superadmin: skip 2FA ───────────────────────────────
    if (user.role === 'superadmin') {
      const token = generateToken(user);
      return res.status(200).json({ token, user });
    }

    // ── Admin 2FA Logic ────────────────────────────────────
    if (user.role === 'admin') {
      // Ensure secret exists only once
      if (!user.twoFactorSecret || user.twoFactorSecret === 'undefined') {
        const secret = speakeasy.generateSecret();
        user.twoFactorSecret = secret.base32;
        user.twoFactorEnabled = true;
        await user.save();
      }

      // Send 2FA code if not provided yet
      if (!twoFactorCode) {
        const code = speakeasy.totp({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          step: 60, // valid for 60s
        });

        await sendEmail(
          user.email,
          'Your 2FA Code',
          `Your verification code is: ${code}\n\nValid for 60 seconds.`
        );

        return res.status(200).json({
          need2FA: true,
          message: '2FA code sent to your email. Please enter it to continue.',
        });
      }

      // Verify 2FA code
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        step: 60,
        window: 3,
      });

      if (!verified) {
        return res.status(401).json({ message: 'Invalid or expired 2FA code' });
      }
    }

    // ── Login Success (after 2FA or superadmin bypass)
    const token = generateToken(user);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name || user.username,
        email: user.email,
        role: user.role,
      },
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

    // ── Superadmin bypass ──────────────────────────────────
    if (user.role === 'superadmin') {
      const jwtToken = generateToken(user);
      return res.status(200).json({
        token: jwtToken,
        user: { id: user._id, name: user.name || name, email, role: user.role },
      });
    }

    // ── Admin 2FA Logic ────────────────────────────────────
    if (user.role === 'admin') {
      if (!user.twoFactorSecret || user.twoFactorSecret === 'undefined') {
        const secret = speakeasy.generateSecret();
        user.twoFactorSecret = secret.base32;
        user.twoFactorEnabled = true;
        await user.save();
      }

      // Send 2FA if no code yet
      if (!twoFactorCode) {
        const code = speakeasy.totp({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          step: 60,
        });

        await sendEmail(
          user.email,
          'Your 2FA Code',
          `Your verification code is: ${code}\n\nValid for 60 seconds.`
        );

        return res.status(200).json({
          need2FA: true,
          message: '2FA code sent to your email. Please enter it to continue.',
        });
      }

      // Verify code
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        step: 60,
        window: 3,
      });

      if (!verified) {
        return res.status(401).json({ message: 'Invalid or expired 2FA code' });
      }
    }

    // ── Login Success ──────────────────────────────────────
    const jwtToken = generateToken(user);
    res.status(200).json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name || name,
        email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Google login error:', err.message);
    return res.status(401).json({ message: 'Invalid Google token' });
  }
};
