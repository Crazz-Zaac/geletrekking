const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeGalleryAlts, MAX_ALT_LENGTH } = require('../utils/galleryAlts');

test('alts are trimmed and aligned with gallery_images', () => {
  const data = { gallery_images: ['a.jpg', 'b.jpg', 'c.jpg'], gallery_image_alts: ['  Poon Hill  ', 42] };
  normalizeGalleryAlts(data);
  assert.deepEqual(data.gallery_image_alts, ['Poon Hill', '', '']);
});

test('extra alts are dropped and long ones capped', () => {
  const data = { gallery_images: ['a.jpg'], gallery_image_alts: ['x'.repeat(500), 'orphan'] };
  normalizeGalleryAlts(data);
  assert.equal(data.gallery_image_alts.length, 1);
  assert.equal(data.gallery_image_alts[0].length, MAX_ALT_LENGTH);
});

test('alts without gallery_images in the update are ignored', () => {
  const data = { name: 'Trek', gallery_image_alts: ['stray'] };
  normalizeGalleryAlts(data);
  assert.equal('gallery_image_alts' in data, false);
});
