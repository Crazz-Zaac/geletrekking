const User = require('../models/user');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const generateToken = require('../utils/generateToken');
const verifyGoogleToken = require('../utils/verifyGoogleToken');
const sendEmail = require('../utils/sendEmail');

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
    console.log('2FA check:', user.role, user.twoFactorEnabled, twoFactorCode);

    // Skip 2FA for superadmin
    if (user.role === 'superadmin') {
      console.log('Superadmin login - skipping 2FA');
      const token = generateToken(user);
      return res.json({ token, user });
    }

    // For admins with 2FA enabled
    if (user.role === 'admin' && user.twoFactorEnabled) {
      if (!twoFactorCode) {
        const token = speakeasy.totp({
          secret: user.twoFactorSecret,
          encoding: 'base32',
        });
        console.log(`Sending 2FA code to ${user.email}:`, token);

        await sendEmail(
          user.email,
          'Your 2FA Code',
          `Your 2FA verification code is: ${token}`
        );

        return res.status(401).json({ message: '2FA code sent to your email' });
      }

      console.log('Verifying 2FA code:', twoFactorCode);
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 1,
      });

      if (!verified) {
        console.log('Invalid 2FA code:', twoFactorCode);
        return res.status(401).json({ message: 'Invalid 2FA code' });
      }
      console.log('2FA code verified successfully');
    }

    // Passed 2FA or no 2FA needed
    const token = generateToken(user);
    res.json({
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

exports.googleLogin = async (req, res) => {
  const { token, twoFactorCode } = req.body;
  console.log('Google login attempt');

  try {
    const payload = await verifyGoogleToken(token);
    const { email, name } = payload;

    const user = await User.findOne({ email });

    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ message: 'Not an authorized admin' });
    }

    // Superadmin - skip 2FA
    if (user.role === 'superadmin') {
      const jwtToken = generateToken(user);
      return res.json({
        token: jwtToken,
        user: {
          id: user._id,
          name: user.name || name,
          email: user.email,
          role: user.role,
        },
      });
    }

    // Admin with 2FA enabled
    if (user.role === 'admin' && user.twoFactorEnabled) {
      if (!twoFactorCode) {
        // Generate TOTP code
        const code = speakeasy.totp({
          secret: user.twoFactorSecret,
          encoding: 'base32',
        });
        console.log(`Sending 2FA code to ${user.email}:`, code);

        await sendEmail(
          user.email,
          'Your 2FA Code',
          `Your 2FA verification code is: ${code}`
        );

        return res.status(401).json({ message: '2FA code sent to your email' });
      }

      // Verify 2FA code submitted by user
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

    // Passed 2FA (or 2FA not required), issue token
    const jwtToken = generateToken(user);

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name || name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Google login error:', err.message);
    return res.status(401).json({ message: 'Invalid Google token' });
  }
};
