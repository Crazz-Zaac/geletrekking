/**
 * Give Markdown images with no real description (`![](url)` or the editor's old
 * placeholder `![Image](url)`) a meaningful alt text, usually the page title.
 * Applied when rendering, so already-published content benefits too.
 */
export function withDefaultImageAlt(markdown: string, fallback: string): string {
  const alt = fallback.replace(/[[\]\\]/g, '').trim()
  if (!markdown || !alt) return markdown
  return markdown.replace(/!\[\s*(?:image)?\s*\]\(/gi, `![${alt}](`)
}
