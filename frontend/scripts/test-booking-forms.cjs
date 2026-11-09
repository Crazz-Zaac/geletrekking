const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const cache = {}
function load(file) {
  if (cache[file]) return cache[file].exports
  const compiled = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const mod = (cache[file] = { exports: {} })
  new Function('module', 'exports', 'require', compiled)(mod, mod.exports, (name) => load(name.replace('@/', '') + '.ts'))
  return mod.exports
}

const { getFieldProblem, getFieldNotice } = load('lib/booking-form-validation.ts')
const { buildSubmissionSections, whatsappDigits, linkState } = load('lib/booking-submission-view.ts')
const TODAY = '2026-11-09'
const check = (field, form) => getFieldProblem(field, form, TODAY)

test('required answers and required ticks', () => {
  assert.match(check({ id: 'a', type: 'text', required: true }, { a: '  ' }), /required/)
  assert.equal(check({ id: 'a', type: 'text' }, { a: '' }), null)
  assert.match(check({ id: 'x', type: 'checkbox', required: true }, { x: false }), /tick/)
  assert.match(check({ id: 'agreeTerms', type: 'checkbox' }, { agreeTerms: false }), /tick/)
  assert.equal(check({ id: 'photoMarketingConsent', type: 'checkbox' }, { photoMarketingConsent: false }), null)
})

test('email and phone formats', () => {
  const email = { id: 'email', type: 'email', required: true }
  assert.match(check(email, { email: 'anna@' }), /valid email/)
  assert.equal(check(email, { email: 'anna@example.com' }), null)
  const tel = { id: 't', type: 'tel' }
  assert.match(check(tel, { t: '123' }), /country code/)
  assert.match(check(tel, { t: 'call me maybe' }), /country code/)
  assert.equal(check(tel, { t: '+977 984-3988164' }), null)
})

test('dates that cannot be right are refused', () => {
  assert.match(check({ id: 'dateOfBirth', type: 'date' }, { dateOfBirth: TODAY }), /past/)
  assert.match(check({ id: 'passportExpiryDate', type: 'date' }, { passportExpiryDate: '2026-11-08' }), /expired/)
  assert.match(check({ id: 'trekEndDate', type: 'date' }, { trekStartDate: '2026-12-10', trekEndDate: '2026-12-09' }), /before it starts/)
  assert.equal(check({ id: 'trekEndDate', type: 'date' }, { trekStartDate: '2026-12-10', trekEndDate: '2026-12-10' }), null)
  assert.match(check({ id: 'departureDate', type: 'date' }, { arrivalDate: '2026-12-10', departureDate: '2026-12-01' }), /leave before/)
})

test('a short passport warns without blocking', () => {
  const field = { id: 'passportExpiryDate', type: 'date' }
  const form = { passportExpiryDate: '2027-03-01', trekStartDate: '2026-12-01' }
  assert.equal(check(field, form), null)
  assert.match(getFieldNotice(field, form, TODAY), /6 months/)
  assert.equal(getFieldNotice(field, { ...form, passportExpiryDate: '2027-08-01' }, TODAY), null)
})

test('admin sees the labels the guest saw, grouped by section', () => {
  const sections = buildSubmissionSections({ firstName: 'Anna', emergencyContactRelationship: 'mum@example.com', agreeTerms: true, photoMarketingConsent: false, medicalConditions: '' })
  assert.deepEqual(sections.find((s) => s.title === 'Emergency information').rows, [{ label: 'Emergency contact email', value: 'mum@example.com' }])
  const consent = sections.find((s) => s.title === 'Consent').rows
  assert.ok(consent.some((r) => r.label === 'Terms and Conditions accepted' && r.value === 'Yes'))
  assert.ok(consent.some((r) => r.label === 'Photo marketing consent' && r.value === 'No'))
  assert.ok(!sections.some((s) => s.rows.some((r) => r.label.includes('medical'))))
})

test('pre-bookings and custom link fields keep their labels', () => {
  const pre = buildSubmissionSections({ submissionSource: 'Pre-booking Form', fullName: 'Anna Rai', firstName: 'Anna', roomPreference: 'Private (extra charge)' })
  const all = pre.flatMap((s) => s.rows)
  assert.ok(all.some((r) => r.label === 'Full Name'))
  assert.ok(all.some((r) => r.label === 'Room'))
  assert.ok(!all.some((r) => r.label === 'First Name' || r.value === 'Pre-booking Form'))
  const custom = buildSubmissionSections({ Dog_name: 'Rex' }, [{ id: 's', title: 'Extras', fields: [{ id: 'Dog_name', label: 'Name of your dog', type: 'text' }] }])
  assert.deepEqual(custom, [{ title: 'Extras', rows: [{ label: 'Name of your dog', value: 'Rex' }] }])
  assert.deepEqual(buildSubmissionSections({ shoeSize: '42' }).find((s) => s.title === 'Other answers').rows, [{ label: 'Shoe Size', value: '42' }])
})

test('contact and link helpers', () => {
  assert.equal(whatsappDigits('+977 984-3988164'), '9779843988164')
  assert.equal(whatsappDigits('12'), null)
  const future = new Date(Date.now() + 86400000).toISOString()
  const past = new Date(Date.now() - 86400000).toISOString()
  assert.equal(linkState({ isActive: true, expiresAt: future }), 'active')
  assert.equal(linkState({ isActive: true, expiresAt: past }), 'expired')
  assert.equal(linkState({ isActive: false, expiresAt: future }), 'off')
  assert.equal(linkState({ isActive: false, submittedAt: past, expiresAt: past }), 'submitted')
})
