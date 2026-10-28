const { timingSafeEqual } = require('node:crypto');

// Only public content reads from the frontend's server may use this credential.
const publicContentPath = /^\/(?:treks|about|activities|blogs|reviews|gallery|guides|faq|alerts|settings|hero)(?:\/|$)/;

const isTrustedContentRequest = (req) => {
  if (req.method !== 'GET' || !publicContentPath.test(req.path) || /\/admin(?:\/|$)/.test(req.path)) return false;
  const expected = process.env.INTERNAL_API_TOKEN || '';
  const supplied = req.get('x-internal-api-token') || '';
  if (expected.length < 32 || !supplied) return false;
  const expectedBytes = Buffer.from(expected);
  const suppliedBytes = Buffer.from(supplied);
  return expectedBytes.length === suppliedBytes.length && timingSafeEqual(expectedBytes, suppliedBytes);
};

module.exports = { isTrustedContentRequest };
