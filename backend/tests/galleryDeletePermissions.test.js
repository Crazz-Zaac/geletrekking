const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const roles = require('../middleware/roleMiddleware');

function deleteRoute() {
  const routes = [];
  const router = Object.fromEntries(['get', 'post', 'put', 'delete'].map((method) => [method, (...args) => routes.push({ method, args })]));
  const auth = () => {};
  const audit = () => {};
  const controller = () => {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../routes/galleryRoutes.js'), 'utf8'), {
    module: { exports: {} },
    require: (name) => {
      if (name === 'express') return { Router: () => router };
      if (name.endsWith('/authMiddleware')) return auth;
      if (name.endsWith('/roleMiddleware')) return roles;
      if (name.endsWith('/auditMiddleware')) return { auditContent: () => audit };
      if (name.endsWith('/galleryController')) return { deleteGalleryItem: controller };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  const route = routes.find((route) => route.method === 'delete' && route.args[0] === '/:id');
  assert.equal(route.args[1], auth);
  assert.equal(route.args[3], audit);
  assert.equal(route.args[4], controller);
  return route.args[2];
}

test('gallery deletion allows editor, legacy admin and superadmin roles', () => {
  const permission = deleteRoute();
  for (const role of ['editor', 'admin', 'superadmin']) {
    let allowed = false;
    permission({ user: { role } }, { status() { throw new Error(`Denied ${role}`); } }, () => { allowed = true; });
    assert.equal(allowed, true);
  }
});

test('gallery deletion retains authentication, audit and rejection of unauthorized roles', () => {
  const permission = deleteRoute();
  for (const user of [undefined, {}, { role: 'viewer' }]) {
    let code;
    const res = { status(value) { code = value; return this; }, json() {} };
    permission({ user }, res, () => assert.fail('Unauthorized role was allowed'));
    assert.equal(code, 403);
  }
});
