import DOMPurify from 'isomorphic-dompurify'

// Only these embeds may survive sanitization (blog video embeds).
const ALLOWED_IFRAME_SRC = /^https:\/\/(www\.)?(youtube-nocookie\.com|youtube\.com)\/embed\//i

let hooksInstalled = false

function installHooks() {
  if (hooksInstalled) return
  hooksInstalled = true

  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName !== 'iframe') return
    const el = node as Element
    const src = el.getAttribute?.('src') || ''
    if (!ALLOWED_IFRAME_SRC.test(src)) {
      el.parentNode?.removeChild(el)
    }
  })

  // Links that open a new tab must not get access to window.opener.
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    const el = node as Element
    if (el.tagName === 'A' && el.getAttribute('target') === '_blank') {
      el.setAttribute('rel', 'noopener noreferrer')
    }
  })
}

/**
 * Sanitize admin-authored HTML (rendered markdown) before it is injected with
 * dangerouslySetInnerHTML. Removes scripts, event handlers, javascript: URLs
 * and any iframe that is not a YouTube embed.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''
  installHooks()
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'loading', 'target'],
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select', 'object', 'embed'],
  })
}
