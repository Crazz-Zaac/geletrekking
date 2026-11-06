const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { readSessionCookie, clearSessionCookie } = require('../utils/sessionCookie');

const TWO_FACTOR_SETUP_PATHS = new Set([
  '/api/auth/me',
  '/api/admin/2fa/setup',
  '/api/admin/2fa/verify',
  '/api/admin/notifications',
]);

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const isLocalDevOrigin = (origin) =>
  process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

// Defense in depth against CSRF for cookie-authenticated writes (SameSite=Lax
// already blocks most cases): a browser always sends Origin on these requests.
const isTrustedOrigin = (req) => {
  const origin = req.get('origin');
  if (!origin) return true;
  return allowedOrigins.includes(origin) || isLocalDevOrigin(origin);
};

const getRequestToken = (req) => {
  const cookieToken = readSessionCookie(req);
  if (cookieToken) return { token: cookieToken, fromCookie: true };

  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    const token = header.slice(7).trim();
    if (token) return { token, fromCookie: false };
  }
  return { token: null, fromCookie: false };
};

const protect = async (req, res, next) => {
  const { token, fromCookie } = getRequestToken(req);
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  if (fromCookie && !SAFE_METHODS.has(req.method) && !isTrustedOrigin(req)) {
    return res.status(403).json({ message: 'Origin not allowed' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.JWT_ISSUER || 'gele-trekking-admin',
      audience: process.env.JWT_AUDIENCE || 'gele-trekking-admin',
    });

    const userId = decoded.sub || decoded.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      if (fromCookie) clearSessionCookie(req, res);
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.status && user.status !== 'active') {
      if (fromCookie) clearSessionCookie(req, res);
      return res.status(403).json({ message: 'Account is not active' });
    }

    // Superadmins must finish 2FA setup before using any other admin API.
    const role = user.role === 'admin' ? 'editor' : user.role;
    if (role === 'superadmin' && !user.twoFactorEnabled) {
      const path = (req.originalUrl || '').split('?')[0];
      if (!TWO_FACTOR_SETUP_PATHS.has(path)) {
        return res.status(403).json({
          code: '2FA_SETUP_REQUIRED',
          message: 'Set up two-factor authentication before continuing.',
        });
      }
    }

    req.user = user;
    next();
  } catch (err) {
    if (fromCookie) clearSessionCookie(req, res);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired' });
    }
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = protect;
