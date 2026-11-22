const test = require('node:test');
const assert = require('node:assert/strict');

test('password complexity requirements', () => {
  const isComplex = (password) => {
    if (typeof password !== 'string' || password.length < 10) return false;
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9\W]/.test(password)) return false;
    return true;
  };

  assert.equal(isComplex('short'), false);
  assert.equal(isComplex('alllowercase123!'), false);
  assert.equal(isComplex('ALLUPPERCASE123!'), false);
  assert.equal(isComplex('NoNumbersOrSymbols'), false);
  assert.equal(isComplex('ValidPass123!'), true);
  assert.equal(isComplex('P@ssw0rd2026'), true);
});

test('2FA bypass logic rejects empty IP list and production environment', () => {
  const evaluateBypass = ({ env, bypassEnabled, bypassIps, clientIp }) => {
    if (env === 'production') return false;
    if (!bypassEnabled) return false;
    if (bypassIps.length === 0) return false;
    return bypassIps.includes(clientIp);
  };

  // Rejects in production even if enabled
  assert.equal(evaluateBypass({ env: 'production', bypassEnabled: true, bypassIps: ['127.0.0.1'], clientIp: '127.0.0.1' }), false);

  // Rejects when bypass IPs is empty
  assert.equal(evaluateBypass({ env: 'development', bypassEnabled: true, bypassIps: [], clientIp: '127.0.0.1' }), false);

  // Rejects when client IP not in list
  assert.equal(evaluateBypass({ env: 'development', bypassEnabled: true, bypassIps: ['10.0.0.1'], clientIp: '192.168.1.1' }), false);

  // Allows only in dev with matched IP
  assert.equal(evaluateBypass({ env: 'development', bypassEnabled: true, bypassIps: ['127.0.0.1'], clientIp: '127.0.0.1' }), true);
});
