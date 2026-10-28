const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

function loadSource(relativePath, imports = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  const result = { exports: {} }
  new Function('module', 'exports', 'require', code)(result, result.exports, name => imports[name] || require(name))
  return result.exports
}
const contact = loadSource('lib/contact-links.ts')

test('default contact links use the configured business details and exact Cal.com booking URL', () => {
  assert.deepEqual(contact.getContactLinks(), {
    email: 'geletrekking@gmail.com',
    emailUrl: 'mailto:geletrekking@gmail.com',
    whatsappUrl: 'https://wa.me/9779843988164',
    callUrl: 'https://cal.com/gele-trekking-d5slwj/15min',
  })
})

test('configured contacts override defaults and WhatsApp links normalize international numbers', () => {
  const links = contact.getContactLinks(' guide@example.com ', 'https://wa.me/+9779843988164?text=Hello', '+977 1234567890')
  assert.equal(links.emailUrl, 'mailto:guide@example.com')
  assert.equal(links.whatsappUrl, 'https://wa.me/9779843988164?text=Hello')
  assert.equal(contact.getContactLinks('', '', '+977 1234567890').whatsappUrl, 'https://wa.me/9771234567890')
})

test('invalid email and unsafe WhatsApp targets fall back to usable business contacts', () => {
  for (const whatsapp of ['javascript:alert(1)', 'https://example.com/not-whatsapp', 'https://user:pass@wa.me/9771234567890', 'https://wa.me/invalid']) {
    const links = contact.getContactLinks('hello\nBcc:bad@example.com', whatsapp)
    assert.equal(links.emailUrl, 'mailto:geletrekking@gmail.com')
    assert.equal(links.whatsappUrl, contact.WHATSAPP_URL)
  }
})

test('floating contact renders on public pages, links all three contact channels, and stays off admin pages', () => {
  let pathname = '/'
  const { FloatingContact } = loadSource('components/floating-contact.tsx', {
    '@/lib/contact-links': contact,
    '@/components/whatsapp-icon': loadSource('components/whatsapp-icon.tsx'),
    '@/hooks/use-site-settings': { useSiteSettings: () => ({ settings: { email: contact.CONTACT_EMAIL, phone: contact.CONTACT_PHONE }, social: { whatsapp: contact.WHATSAPP_URL } }) },
    'next/navigation': { usePathname: () => pathname },
  })
  const render = () => require('react-dom/server').renderToStaticMarkup(require('react').createElement(FloatingContact))
  for (const route of ['/', '/contact', '/about', '/trek/sagarmatha-everest-base-camp-trek']) {
    pathname = route
    const html = render()
    assert.ok(html.includes(`href="${contact.WHATSAPP_URL}"`))
    assert.ok(html.includes(`href="mailto:${contact.CONTACT_EMAIL}"`))
    assert.ok(html.includes(`href="${contact.GELE_CALL_URL}"`))
    assert.ok(html.includes('aria-expanded="false"'))
    assert.ok(html.includes('Open contact options: WhatsApp, email, or book a call'))
  }
  for (const route of ['/admin', '/admin/about']) {
    pathname = route
    assert.equal(render(), '')
  }
})
