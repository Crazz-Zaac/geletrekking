const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isTrustedContentRequest } = require('../utils/trustedContentRequest');

test('only authenticated public GET reads bypass the shared server IP quota', () => {
  const previous = process.env.INTERNAL_API_TOKEN;
  const token = 'test-only-internal-credential-123456789';
  process.env.INTERNAL_API_TOKEN = token;
  const request = (path, method = 'GET', supplied = token) => ({ path, method, get: () => supplied });
  try {
    assert.equal(isTrustedContentRequest(request('/guides/slug/key-preparations')), true);
    assert.equal(isTrustedContentRequest(request('/guides')), true);
    assert.equal(isTrustedContentRequest(request('/settings')), true);
    assert.equal(isTrustedContentRequest(request('/guides/slug/key-preparations', 'GET', '')), false);
    assert.equal(isTrustedContentRequest(request('/guides/slug/key-preparations', 'GET', 'incorrect')), false);
    for (const path of ['/admin', '/guides/admin', '/contact', '/security/risk-health', '/auth/login', '/guides-extra']) {
      assert.equal(isTrustedContentRequest(request(path)), false, path);
    }
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      assert.equal(isTrustedContentRequest(request('/guides', method)), false, method);
    }
    delete process.env.INTERNAL_API_TOKEN;
    assert.equal(isTrustedContentRequest(request('/guides')), false);
  } finally {
    if (previous === undefined) delete process.env.INTERNAL_API_TOKEN;
    else process.env.INTERNAL_API_TOKEN = previous;
  }
});
