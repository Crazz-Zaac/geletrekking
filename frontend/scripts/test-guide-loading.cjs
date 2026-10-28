const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

const source = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../lib/api.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText

function loadApi(fetchImpl, browser = false) {
  const result = { exports: {} }
  const context = {
    module: result, exports: result.exports, console,
    process: { env: { INTERNAL_API_URL: 'http://api.test', INTERNAL_API_TOKEN: 'test-private-token-never-for-browser' } },
    fetch: fetchImpl,
    require: name => {
      if (name === '@/lib/data') return { treks: [] }
      throw new Error(`Unexpected import: ${name}`)
    },
  }
  if (browser) context.window = { location: { protocol: 'https:' } }
  context.globalThis = context
  vm.runInNewContext(source, context)
  return result.exports
}

const response = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body })

test('only a real 404 returns a missing guide; temporary failures propagate', async () => {
  const guide = { slug: 'key-preparations', title: 'Key Preparations' }
  assert.equal((await loadApi(async () => response(200, { guide })).getGuideBySlug(guide.slug)).title, guide.title)
  assert.equal(await loadApi(async () => response(404, { message: 'Guide not found' })).getGuideBySlug(guide.slug), null)
  for (const status of [401, 403, 429, 500, 503]) {
    await assert.rejects(loadApi(async () => response(status, { message: 'Unavailable' })).getGuideBySlug(guide.slug), error => error.status === status)
  }
  await assert.rejects(loadApi(async () => { throw new Error('Network failure') }).getGuideBySlug(guide.slug), /Network failure/)
  await assert.rejects(loadApi(async () => response(200, {})).getGuideBySlug(guide.slug), /Invalid guide response/)
})

test('private credential is server-only and slug characters are URL encoded', async () => {
  let seen
  const fetchImpl = async (url, options) => { seen = { url, options }; return response(200, { guide: { slug: 'key-preparations' } }) }
  await loadApi(fetchImpl).getGuideBySlug('key preparations/test')
  assert.ok(seen.url.endsWith('/key%20preparations%2Ftest'))
  assert.equal(seen.options.headers['x-internal-api-token'], 'test-private-token-never-for-browser')
  await loadApi(fetchImpl, true).getGuideBySlug('key-preparations')
  assert.equal(seen.options.headers['x-internal-api-token'], undefined)
  assert.equal(seen.url, '/api/guides/slug/key-preparations')
})

test('old itinerary IDs resolve to their slug and temporary API failures never become false 404s', async () => {
  const record = { _id: '6a54aaacd5a65be18a3281cd', slug: 'pikey-peak-trekking', name: 'Pikey Peak Trek' }
  for (const identifier of [record._id, record.slug]) {
    const trek = await loadApi(async url => {
      assert.ok(url.endsWith(`/api/treks/${identifier}`))
      return response(200, record)
    }).getTrekByIdentifier(identifier)
    assert.equal(trek.id, record._id)
    assert.equal(trek.slug, record.slug)
    assert.equal(trek.title, record.name)
  }
  assert.equal(await loadApi(async () => response(404, {})).getTrekByIdentifier('missing'), null)
  for (const status of [429, 500, 503]) {
    await assert.rejects(loadApi(async () => response(status, { message: 'Unavailable' })).getTrekByIdentifier(record._id), error => error.status === status)
  }
  await assert.rejects(loadApi(async () => { throw new Error('Network failure') }).getTrekByIdentifier(record.slug), /Network failure/)
  await assert.rejects(loadApi(async () => response(200, {})).getTrekByIdentifier(record.slug), /Invalid itinerary response/)
})

test('itinerary mapping keeps every backend availability status and note for the calendar', async () => {
  const availability = ['available', 'limited', 'booked'].map((status, index) => ({ start_date: `2027-03-0${index + 1}T00:00:00.000Z`, end_date: '2027-03-21T00:00:00.000Z', status, note: `Backend ${status}` }))
  const trek = await loadApi(async () => response(200, { _id: 'test-id', name: 'Backend Trek', slug: 'backend-trek', availability })).getTrekByIdentifier('backend-trek')
  assert.equal(trek.availabilityRanges.length, 3)
  for (const [index, range] of trek.availabilityRanges.entries()) {
    assert.equal(range.status, availability[index].status)
    assert.equal(range.note, availability[index].note)
    assert.equal(range.startDate, `2027-03-0${index + 1}`)
  }
})

test('the itinerary page redirects a legacy ID to the named URL and preserves backend errors', async () => {
  const filename = path.resolve(__dirname, '../app/trek/[id]/page.tsx')
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  const loadPage = lookup => {
    const result = { exports: {} }
    vm.runInNewContext(code, {
      module: result, exports: result.exports,
      require: name => {
        if (name === 'react') return { cache: fn => fn }
        if (name === 'next/navigation') return {
          permanentRedirect: destination => { throw Object.assign(new Error('Redirect'), { destination }) },
          notFound: () => { throw new Error('NOT_FOUND') },
        }
        if (name === '@/lib/api') return { getTrekByIdentifier: lookup }
        if (name === '@/lib/trek-path') return { getTrekPath: trek => `/trek/${trek.slug || trek.id}` }
        if (name.startsWith('@/') || name === './TrekDetailClient') return {}
        return require(name)
      },
    })
    return result.exports.default
  }
  const id = '6a54aaacd5a65be18a3281cd'
  const props = { params: Promise.resolve({ id }) }
  await assert.rejects(loadPage(async () => ({ id, slug: 'pikey-peak-trekking' }))(props), error => error.destination === '/trek/pikey-peak-trekking')
  await assert.rejects(loadPage(async () => null)(props), /NOT_FOUND/)
  await assert.rejects(loadPage(async () => { throw new Error('Backend unavailable') })(props), /Backend unavailable/)
})

test('blog listings contain only backend records, including empty and failed responses', async () => {
  const record = { _id: 'cms-post', slug: 'my-published-post', title: 'Published in admin', content: 'Backend content', createdAt: '2026-10-19' }
  const posts = await loadApi(async () => response(200, [record])).getBlogs()
  assert.equal(posts.length, 1)
  assert.equal(posts[0].id, record._id)
  assert.equal(posts[0].slug, record.slug)
  assert.equal((await loadApi(async () => response(200, [])).getBlogs()).length, 0)
  assert.equal((await loadApi(async () => response(503, {})).getBlogs()).length, 0)
})

test('blog details never substitute bundled guides for missing backend records', async () => {
  for (const slug of ['everest-base-camp-cost', 'best-time-everest-base-camp-trek', 'lukla-flight-delays', 'annapurna-base-camp-vs-poon-hill']) {
    assert.equal(await loadApi(async () => response(404, {})).getBlogBySlug(slug), null)
    assert.equal(await loadApi(async () => response(503, {})).getBlogBySlug(slug), null)
  }
  const record = { _id: 'cms-post', slug: 'everest-base-camp-cost', title: 'My CMS guide', content: 'Edited in admin', createdAt: '2026-10-19' }
  const post = await loadApi(async () => response(200, record)).getBlogBySlug(record.slug)
  assert.equal(post.title, record.title)
  assert.equal(post.content, record.content)
})
