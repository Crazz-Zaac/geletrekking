const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

function load(file) {
  const compiled = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const mod = { exports: {} }
  new Function('module', 'exports', compiled)(mod, mod.exports)
  return mod.exports
}

const { pickTrekReviews, cleanReviewText } = load('lib/trek-reviews.ts')
const { getBookableDepartures } = load('lib/trek-availability.ts')
const long = 'A wonderful experience with a very kind and careful guide, highly recommended to anyone.'
const review = (id, text, rating = 5) => ({ id, name: id, rating, text, date: null, url: null, avatar: null })

test('translated reviews show the translation only', () => {
  assert.equal(cleanReviewText('(Translated by Google) Great trek\n\n(Original)\nTolle Tour'), 'Great trek')
  assert.equal(cleanReviewText('Plain review'), 'Plain review')
})

test('reviews naming the route lead and are flagged', () => {
  const picked = pickTrekReviews([review('a', long + long), review('b', `${long} Kala Pattar at dawn.`), review('c', long)], 'Sagarmatha (Everest) Base Camp Trek')
  assert.equal(picked[0].id, 'b')
  assert.equal(picked[0].mentionsTrek, true)
  assert.equal(picked[1].mentionsTrek, false)
})

test('a general review is never flagged as being about the route', () => {
  assert.ok(pickTrekReviews([review('a', `${long} Everest was amazing.`)], 'New Langtang Trek').every((r) => !r.mentionsTrek))
})

test('routes with similar names stay separate', () => {
  assert.equal(pickTrekReviews([review('a', `${long} Annapurna Circuit.`)], 'Annapurna Base Camp Trek')[0].mentionsTrek, false)
  assert.equal(pickTrekReviews([review('a', `${long} Annapurna Circuit.`)], 'Upper Mustang & Annapurna Circuit')[0].mentionsTrek, true)
})

test('low-rated and very short reviews are left out, and there are at most three', () => {
  assert.deepEqual(pickTrekReviews([review('a', long, 3), review('b', 'Great')], 'Pikey Peak Trek'), [])
  assert.equal(pickTrekReviews(['a', 'b', 'c', 'd'].map((id) => review(id, long)), 'Pikey Peak Trek').length, 3)
})

test('only departures that can still be booked count', () => {
  const ranges = [
    { startDate: '2026-11-20', endDate: '2026-11-30', status: 'available' },
    { startDate: '2026-12-09', endDate: '2026-12-20', status: 'limited' },
    { startDate: '2027-01-05', endDate: '2027-01-15', status: 'booked' },
    { startDate: '2027-03-01', endDate: '2027-03-15' },
  ]
  assert.deepEqual(getBookableDepartures(ranges, '2026-11-09').map((r) => r.startDate), ['2026-12-09', '2027-03-01'])
})
