const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');

// ── Stub the controller's DB/session dependencies, keep bcrypt + speakeasy real ──
const db = { users: [] };

const matches = (doc, filter) =>
  Object.entries(filter).every(([key, cond]) => {
    if (key === '$or') return cond.some((sub) => matches(doc, sub));
    const value = doc[key];
    if (cond && typeof cond === 'object' && '$lt' in cond) return value != null && value < cond.$lt;
    if (cond === null) return value == null;
    return String(value) === String(cond);
  });

const UserStub = {
  findOne: async ({ email }) => db.users.find((u) => u.email === email) || null,
  updateOne: async (filter, update) => {
    const doc = db.users.find((u) => matches(u, filter));
    if (!doc) return { modifiedCount: 0 };
    Object.assign(doc, update.$set);
    return { modifiedCount: 1 };
  },
};

const stub = (rel, exports) => {
  const file = require.resolve(path.join(__dirname, '..', rel));
  require.cache[file] = { id: file, filename: file, loaded: true, exports };
};
stub('models/user', UserStub);
stub('utils/generateToken', () => 'token');
stub('utils/crypto', { encrypt: (v) => v, decrypt: (v) => v });
stub('utils/auditLogger', { logAudit: async () => {} });
stub('utils/sessionCookie', { setSessionCookie: () => {}, clearSessionCookie: () => {} });

const { login } = require('../controllers/authController');

const PASSWORD = 'CorrectHorse123!';
let passwordHash;
const secret = speakeasy.generateSecret().base32;
const realNow = Date.now;

const makeUser = (overrides = {}) => {
  const user = {
    _id: 'u1',
    email: 'admin@example.com',
    role: 'superadmin',
    password: passwordHash,
    status: 'active',
    twoFactorEnabled: true,
    twoFactorSecretEnc: secret,
    lastUsedTotpStep: null,
    failedLoginAttempts: 0,
    ...overrides,
    save: async () => {},
  };
  db.users = [user];
  return user;
};

const call = async (body) => {
  const res = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
  await login({ body, ip: '127.0.0.1', get: () => 'test' }, res);
  return res;
};

const atTime = (ms) => { Date.now = () => ms; };

beforeEach(async () => {
  passwordHash ||= await bcrypt.hash(PASSWORD, 4);
});
afterEach(() => { Date.now = realNow; });

test('AUTH-01: locked account responds like an unknown email, whatever the password', async () => {
  const unknown = await call({ email: 'nobody@example.com', password: 'x' });

  makeUser({ lockUntil: new Date(realNow() + 60_000) });
  const lockedWrong = await call({ email: 'admin@example.com', password: 'wrong' });
  const lockedRight = await call({ email: 'admin@example.com', password: PASSWORD });

  for (const res of [lockedWrong, lockedRight]) {
    assert.equal(res.statusCode, unknown.statusCode);
    assert.deepEqual(res.body, unknown.body);
  }
});

test('AUTH-01: inactive account responds like an unknown email', async () => {
  const unknown = await call({ email: 'nobody@example.com', password: 'x' });
  makeUser({ status: 'disabled' });
  const res = await call({ email: 'admin@example.com', password: PASSWORD });
  assert.equal(res.statusCode, unknown.statusCode);
  assert.deepEqual(res.body, unknown.body);
});

test('AUTH-05: a TOTP code cannot be replayed in the next time step', async () => {
  makeUser();
  const t0 = 1_000_000_020_000; // mid-step
  const code = speakeasy.totp({ secret, encoding: 'base32', time: Math.floor(t0 / 1000) });

  atTime(t0);
  const first = await call({ email: 'admin@example.com', password: PASSWORD, twoFactorCode: code });
  assert.equal(first.statusCode, 200);

  atTime(t0 + 30_000); // next step: code still inside verify window (delta -1)
  const replay = await call({ email: 'admin@example.com', password: PASSWORD, twoFactorCode: code });
  assert.equal(replay.statusCode, 401);
  assert.match(replay.body.message, /already used/);
});

test('AUTH-05: a future-step code used early cannot be reused once its step arrives', async () => {
  makeUser();
  const t0 = 1_000_000_020_000;
  const nextCode = speakeasy.totp({ secret, encoding: 'base32', time: Math.floor(t0 / 1000) + 30 });

  atTime(t0);
  assert.equal((await call({ email: 'admin@example.com', password: PASSWORD, twoFactorCode: nextCode })).statusCode, 200);

  atTime(t0 + 30_000);
  assert.equal((await call({ email: 'admin@example.com', password: PASSWORD, twoFactorCode: nextCode })).statusCode, 401);
});

test('AUTH-05: concurrent requests with the same code only succeed once', async () => {
  makeUser();
  const t0 = 1_000_000_020_000;
  atTime(t0);
  const code = speakeasy.totp({ secret, encoding: 'base32', time: Math.floor(t0 / 1000) });
  const results = await Promise.all(
    [1, 2, 3].map(() => call({ email: 'admin@example.com', password: PASSWORD, twoFactorCode: code }))
  );
  assert.equal(results.filter((r) => r.statusCode === 200).length, 1);
});

test('AUTH-05: a fresh code in a later step is still accepted', async () => {
  makeUser();
  const t0 = 1_000_000_020_000;
  atTime(t0);
  const c1 = speakeasy.totp({ secret, encoding: 'base32', time: Math.floor(t0 / 1000) });
  assert.equal((await call({ email: 'admin@example.com', password: PASSWORD, twoFactorCode: c1 })).statusCode, 200);

  atTime(t0 + 30_000);
  const c2 = speakeasy.totp({ secret, encoding: 'base32', time: Math.floor(t0 / 1000) + 30 });
  assert.equal((await call({ email: 'admin@example.com', password: PASSWORD, twoFactorCode: c2 })).statusCode, 200);
});
