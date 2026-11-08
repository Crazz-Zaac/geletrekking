const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const compiled = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../lib/trek-offer.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const mod = { exports: {} }
new Function('module', 'exports', compiled)(mod, mod.exports)
const { salePrice, percentOff, offerStatus, offerProblem, applyOfferToTier } = mod.exports

const offer = (patch = {}) => ({ offer_discount_percent: 0, discounted_price_usd: 0, offer_valid_from: '', offer_valid_to: '', ...patch })

test('percent and sale price convert both ways', () => {
  assert.equal(salePrice(2099, 15), 1784)
  assert.equal(percentOff(2099, 1784), 15)
  assert.equal(percentOff(2099, 2099), 0)
  assert.equal(percentOff(2099, 3000), 0)
  assert.equal(percentOff(0, 100), 0)
  assert.equal(percentOff(2099, 0), 0)
})

test('offer status matches the backend date rules, with both end days included', () => {
  assert.equal(offerStatus('', '', '2026-11-08').state, 'live')
  assert.equal(offerStatus('2026-11-08', '2026-11-08', '2026-11-08').state, 'live')
  assert.equal(offerStatus('2026-11-09', '', '2026-11-08').state, 'scheduled')
  assert.equal(offerStatus('', '2026-11-07', '2026-11-08').state, 'ended')
})

test('offers that would mislead visitors are caught', () => {
  assert.equal(offerProblem(offer(), 2099), null)
  assert.equal(offerProblem(offer({ offer_discount_percent: 15, discounted_price_usd: 1784 }), 2099), null)
  assert.match(offerProblem(offer({ discounted_price_usd: 2099 }), 2099), /lower than/)
  assert.match(offerProblem(offer({ offer_discount_percent: 20 }), 2099), /no lower price/)
  assert.match(offerProblem(offer({ offer_valid_from: '2026-12-02', offer_valid_to: '2026-12-01' }), 2099), /ends before/)
})

test('an offer takes the same percentage off every package', () => {
  const offer = { percent: 14, originalPrice: 2099, salePrice: 1800 }
  assert.deepEqual(applyOfferToTier(2099, offer), { price: 1800, wasPrice: 2099 })
  assert.deepEqual(applyOfferToTier(2199, offer), { price: 1891, wasPrice: 2199 })
  assert.deepEqual(applyOfferToTier(2199, { salePrice: 2199 }), { price: 2199 })
  assert.deepEqual(applyOfferToTier(2199, { percent: 14, salePrice: 2199 }), { price: 2199 })
  assert.deepEqual(applyOfferToTier(0, offer), { price: 0 })
})
