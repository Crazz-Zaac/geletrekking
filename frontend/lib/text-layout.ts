import { prepare, layout, prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

/**
 * Measure text height for a given width and line height
 * Useful for determining if text will fit in a constrained space
 */
export function measureTextHeight(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number
): { height: number; lineCount: number } {
  try {
    const prepared = prepare(text, font)
    return layout(prepared, maxWidth, lineHeight)
  } catch (error) {
    console.warn('Text layout measurement failed:', error)
    // Fallback: estimate based on character count
    return { height: lineHeight, lineCount: 1 }
  }
}

/**
 * Get individual lines of text for precise layout control
 */
export function getTextLines(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number
): Array<{ text: string; width: number }> {
  try {
    const prepared = prepareWithSegments(text, font)
    const { lines } = layoutWithLines(prepared, maxWidth, lineHeight)
    return lines
  } catch (error) {
    console.warn('Text line layout failed:', error)
    return [{ text, width: maxWidth }]
  }
}

/**
 * Check if text will fit in a specific number of lines
 */
export function willTextFitInLines(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
): boolean {
  const { lineCount } = measureTextHeight(text, font, maxWidth, lineHeight)
  return lineCount <= maxLines
}

/**
 * Truncate text to fit in a maximum number of lines
 * Returns the truncated text or the original if it already fits
 */
export function truncateToLines(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
): string {
  const { lineCount } = measureTextHeight(text, font, maxWidth, lineHeight)

  if (lineCount <= maxLines) {
    return text
  }

  // Binary search for the right truncation point
  let low = 0
  let high = text.length
  let result = text

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const truncated = text.slice(0, mid).trimEnd() + '…'

    const { lineCount: newLineCount } = measureTextHeight(
      truncated,
      font,
      maxWidth,
      lineHeight
    )

    if (newLineCount <= maxLines) {
      result = truncated
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  return result
}
