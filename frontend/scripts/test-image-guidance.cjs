const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const compiled = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../lib/image-guidance.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const mod = { exports: {} }
new Function('module', 'exports', compiled)(mod, mod.exports)
const { checkImageSize, IMAGE_GUIDES } = mod.exports
const guide = IMAGE_GUIDES.hero

test('photos at or above the recommended width are good', () => {
  assert.equal(checkImageSize(1920, 1080, guide).good, true)
  assert.match(checkImageSize(4000, 2250, guide).message, /^4000 × 2250 px\. Sharp/)
})

test('slightly narrow photos pass with a note', () => {
  const result = checkImageSize(1600, 900, guide)
  assert.equal(result.good, true)
  assert.match(result.message, /1920 px wide would be sharper/)
})

test('small photos are flagged as blurry', () => {
  const result = checkImageSize(1599, 900, guide)
  assert.equal(result.good, false)
  assert.match(result.message, /blurry/)
})

test('tall or square photos are flagged even when large', () => {
  assert.match(checkImageSize(3000, 4000, guide).message, /landscape/)
  assert.match(checkImageSize(2000, 2000, guide).message, /landscape/)
  assert.equal(checkImageSize(2000, 2000, guide).good, false)
})
