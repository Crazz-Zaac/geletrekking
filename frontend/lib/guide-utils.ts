/**
 * Extract headings from HTML content for table of contents
 */
export interface Heading {
  id: string
  text: string
  level: number
}

export function extractHeadingsFromHtml(html: string): Heading[] {
  if (typeof document === 'undefined') return []

  const div = document.createElement('div')
  div.innerHTML = html

  const headings: Heading[] = []
  const headingElements = div.querySelectorAll('h1, h2, h3, h4, h5, h6')

  headingElements.forEach((el) => {
    const text = el.textContent || ''
    const level = parseInt(el.tagName[1])
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    headings.push({ id, text, level })
  })

  return headings
}

/**
 * Calculate estimated reading time in minutes
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

/**
 * Generate IDs for headings and update HTML
 */
export function addHeadingIds(html: string): string {
  if (typeof document === 'undefined') return html

  const div = document.createElement('div')
  div.innerHTML = html

  const headingElements = div.querySelectorAll('h1, h2, h3, h4, h5, h6')

  headingElements.forEach((el) => {
    const text = el.textContent || ''
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    if (!el.id) {
      el.id = id
    }
  })

  return div.innerHTML
}
