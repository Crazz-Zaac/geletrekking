const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

function loadSource(relativePath) {
  const source = fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  const result = { exports: {} }
  new Function('module', 'exports', 'require', code)(result, result.exports, require)
  return result.exports
}
const consent = loadSource('lib/cookie-consent.ts')
const { buildMetadata } = loadSource('lib/seo.ts')

test('cookie preference expires and rejects corrupt, future, or unexpected settings', () => {
  const now = Date.now()
  const valid = { version: 1, externalMedia: false, savedAt: now }
  assert.deepEqual(consent.parseCookiePreference(JSON.stringify(valid), now), valid)
  assert.equal(consent.parseCookiePreference(JSON.stringify({ ...valid, externalMedia: true }), now).externalMedia, true)
  for (const input of [null, 'invalid', '{}', JSON.stringify({ ...valid, version: 2 }), JSON.stringify({ ...valid, externalMedia: 'yes' }), JSON.stringify({ ...valid, savedAt: now + 1 }), JSON.stringify({ ...valid, savedAt: now - consent.CONSENT_MAX_AGE_MS })]) {
    assert.equal(consent.parseCookiePreference(input, now), null)
  }
})

test('metadata has page-specific keywords and images on both social platforms', () => {
  const about = buildMetadata({ title: 'About Us', description: 'Our team', path: '/about', image: '/images/about-team.jpg' })
  const contact = buildMetadata({ title: 'Contact Gele Trekking', description: 'Contact us', path: '/contact' })
  assert.notDeepEqual(about.keywords, contact.keywords)
  assert.ok(about.openGraph.images[0].url.endsWith('/images/about-team.jpg'))
  assert.ok(about.twitter.images[0].endsWith('/images/about-team.jpg'))
  assert.equal(about.alternates.canonical, '/about')
})

test('responsive images are capped and trek cards link directly to slugs', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../next.config.mjs'), 'utf8')
  const result = { exports: {} }
  new Function('module', source.replace('export default nextConfig;', 'module.exports = nextConfig;'))(result)
  assert.equal(Math.max(...result.exports.images.deviceSizes), 1920)
  assert.ok(result.exports.images.deviceSizes.includes(360))
  const card = fs.readFileSync(path.resolve(__dirname, '../components/trek-card.tsx'), 'utf8')
  assert.ok(card.includes('href={getTrekPath(trek)}'))
  assert.ok(card.includes('sizes='))
  const { getTrekPath } = loadSource('lib/trek-path.ts')
  assert.equal(getTrekPath({ id: '6a54aaacd5a65be18a3281cd', slug: 'pikey-peak-trekking' }), '/trek/pikey-peak-trekking')
  for (const file of ['components/navbar.tsx', 'components/footer.tsx', 'app/sitemap.ts']) {
    assert.ok(fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8').includes('getTrekPath(trek)'), file)
  }
})
