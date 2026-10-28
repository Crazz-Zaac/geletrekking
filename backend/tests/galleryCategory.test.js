const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

async function rename(body, existing, failure = false) {
  const updates = [];
  const GalleryItem = {
    exists: async ({ category }) => existing.includes(category),
    updateMany: async (filter, update) => {
      if (failure) throw new Error('Database unavailable');
      updates.push({ filter, update });
      return { modifiedCount: 3 };
    },
  };
  const exports = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../controllers/galleryController.js'), 'utf8'), {
    exports, require: (name) => name.endsWith('/GalleryItem') ? GalleryItem : {},
  });
  const res = { code: 200, status(code) { this.code = code; return this; }, json(value) { this.body = value; } };
  await exports.renameGalleryCategory({ body }, res);
  return { res, updates };
}

test('renaming targets all items in the exact old category and trims the new name', async () => {
  const { res, updates } = await rename({ category: 'Mountains', newCategory: ' Himalaya ' }, ['Mountains']);
  assert.equal(res.code, 200);
  assert.equal(res.body.category, 'Himalaya');
  assert.equal(res.body.updatedCount, 3);
  assert.equal(updates.length, 1);
  assert.equal(updates[0].filter.category, 'Mountains');
  assert.equal(updates[0].update.$set.category, 'Himalaya');
});

test('invalid input, missing categories and duplicate names never write', async () => {
  for (const [body, existing, status] of [
    [{ category: 'Mountains', newCategory: ' ' }, ['Mountains'], 400],
    [{ category: { $ne: '' }, newCategory: 'New' }, ['Mountains'], 400],
    [{ category: 'Missing', newCategory: 'New' }, ['Mountains'], 404],
    [{ category: 'Mountains', newCategory: 'Culture' }, ['Mountains', 'Culture'], 409],
  ]) {
    const { res, updates } = await rename(body, existing);
    assert.equal(res.code, status);
    assert.equal(updates.length, 0);
  }
});

test('database failures return an error rather than successful rename', async () => {
  const { res } = await rename({ category: 'Mountains', newCategory: 'Himalaya' }, ['Mountains'], true);
  assert.equal(res.code, 500);
});
