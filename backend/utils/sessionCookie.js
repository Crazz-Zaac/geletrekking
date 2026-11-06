const jwt = require('jsonwebtoken');

// The admin JWT lives only in this httpOnly cookie, so page scripts (and any
// injected script) cannot read it.
const SESSION_COOKIE = 'gele_admin_session';

const isSecureRequest = (req) =>
  req.secure || req.get('x-forwarded-proto') === 'https' || process.env.NODE_ENV === 'production';

const cookieAttributes = (req, maxAgeSeconds) => {
  const parts = [
    'Path=/',
    'HttpOnly',
    // Lax: sent on normal navigation to /admin, but not on cross-site
    // POST/PUT/PATCH/DELETE, which blocks CSRF on state-changing requests.
    'SameSite=Lax',
    `Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`,
  ];
  if (isSecureRequest(req)) parts.push('Secure');
  return parts.join('; ');
};

const setSessionCookie = (req, res, token) => {
  const decoded = jwt.decode(token);
  const maxAgeSeconds = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 24 * 60 * 60;
  res.append('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; ${cookieAttributes(req, maxAgeSeconds)}`);
};

const clearSessionCookie = (req, res) => {
  res.append('Set-Cookie', `${SESSION_COOKIE}=; ${cookieAttributes(req, 0)}`);
};

const readSessionCookie = (req) => {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    if (part.slice(0, index).trim() === SESSION_COOKIE) {
      const value = part.slice(index + 1).trim();
      try {
        return decodeURIComponent(value) || null;
      } catch {
        return null;
      }
    }
  }
  return null;
};

module.exports = {
  SESSION_COOKIE,
  setSessionCookie,
  clearSessionCookie,
  readSessionCookie,
};
