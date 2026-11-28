/**
 * Pre-processing for blog markdown, shared by the public post page and the
 * admin editor preview so both render the same thing.
 *
 * Extensions on top of standard markdown:
 * - `![alt](url){width=600}` (optionally `height=400`): sized image
 * - `![alt](url "Caption")` on its own line: image with a visible caption
 * - `::youtube[Title](url)`: YouTube embed
 *
 * The output still goes through `marked` and then `sanitizeHtml`.
 */

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const SIZE = String.raw`\{\s*(?:width|w)=(\d{1,4})(?:px)?(?:\s+(?:height|h)=(\d{1,4})(?:px)?)?\s*\}`
const IMAGE = String.raw`!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)`

function imageTag(alt: string, src: string, opts: { title?: string; width?: string; height?: string } = {}) {
  const width = opts.width ? Number(opts.width) : undefined
  const height = opts.height ? Number(opts.height) : undefined
  const attrs = [
    `src="${escapeHtml(src)}"`,
    `alt="${escapeHtml(alt)}"`,
    opts.title ? `title="${escapeHtml(opts.title)}"` : '',
    width ? `width="${width}"` : '',
    height ? `height="${height}"` : '',
    width ? `style="max-width: min(100%, ${width}px);${height ? ` aspect-ratio: ${width} / ${height};` : ''}"` : '',
    'loading="lazy"',
  ]
    .filter(Boolean)
    .join(' ')
  return `<img ${attrs} />`
}

/** An image alone on its line with a title becomes a captioned figure. */
function renderCaptionedImages(content: string) {
  return content.replace(
    new RegExp(String.raw`^[ \t]*${IMAGE}(?:${SIZE})?[ \t]*$`, 'gm'),
    (match, alt: string, src: string, caption: string | undefined, width?: string, height?: string) => {
      if (!caption?.trim()) return match
      // Blank lines around the HTML block so marked parses the following markdown normally.
      return `\n<figure>${imageTag(alt, src, { width, height })}<figcaption>${escapeHtml(caption.trim())}</figcaption></figure>\n`
    }
  )
}

function renderSizedImages(content: string) {
  return content.replace(
    new RegExp(IMAGE + SIZE, 'g'),
    (_match, alt: string, src: string, title: string | undefined, width: string, height: string | undefined) =>
      imageTag(alt, src, { title, width, height })
  )
}

export function getYouTubeId(value: string) {
  const trimmed = value.trim()
  const directId = trimmed.match(/^[a-zA-Z0-9_-]{11}$/)?.[0]
  if (directId) return directId

  try {
    const url = new URL(trimmed)
    if (url.hostname.includes('youtu.be')) return url.pathname.split('/').filter(Boolean)[0] || null
    if (url.searchParams.get('v')) return url.searchParams.get('v')
    const parts = url.pathname.split('/').filter(Boolean)
    const embedIndex = parts.findIndex((part) => part === 'embed' || part === 'shorts')
    if (embedIndex >= 0) return parts[embedIndex + 1] || null
  } catch {
    return null
  }

  return null
}

function renderYouTubeEmbeds(content: string, allowExternalMedia: boolean) {
  return content.replace(/::youtube(?:\[([^\]]*)\])?\(([^)\s]+)\)/g, (match, title: string | undefined, url: string) => {
    const videoId = getYouTubeId(url)
    if (!videoId) return match
    const safeTitle = escapeHtml(title?.trim() || 'YouTube video')
    if (!allowExternalMedia) {
      return `<p>Video: <a href="https://www.youtube.com/watch?v=${escapeHtml(videoId)}" target="_blank" rel="noopener noreferrer">${safeTitle}</a>. Allow “Maps &amp; videos” in Cookie settings to watch it here.</p>`
    }
    return `<div class="blog-video-embed"><iframe src="https://www.youtube-nocookie.com/embed/${escapeHtml(videoId)}" title="${safeTitle}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`
  })
}

export function renderBlogMarkdown(content: string, allowExternalMedia: boolean) {
  const safeContent = allowExternalMedia
    ? content
    : content.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '<p>Embedded media is off. Allow “Maps &amp; videos” in Cookie settings to show it.</p>')
  return renderYouTubeEmbeds(renderSizedImages(renderCaptionedImages(safeContent)), allowExternalMedia)
}
