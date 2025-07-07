const User = require('../models/user');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const generateToken = require('../utils/generateToken');
const verifyGoogleToken = require('../utils/verifyGoogleToken');

// 🔐 Email/password login with 2FA
exports.login = async (req, res) => {
  const { email, password, twoFactorCode } = req.body;
  console.log('Login attempt:', { email });

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
        return res.status(401).json({ message: '2FA code required' });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 1,
      });

      if (!verified) {
        return res.status(401).json({ message: 'Invalid 2FA code' });
      }
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name || user.username,
        email: user.email,
        role: user.role,
      }
    });

  } catch (err) {
    console.error('Login error:', err.stack || err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 🔐 Google Login for Admins
exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const payload = await verifyGoogleToken(token);
    const { email, name } = payload;

    const user = await User.findOne({ email });

    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ message: 'Not an authorized admin' });
    }

    const jwtToken = generateToken(user);

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name || name,
        email: user.email,
        role: user.role,
      }
    });

  } catch (err) {
    console.error('Google login error:', err.message);
    return res.status(401).json({ message: 'Invalid Google token' });
  }
};
