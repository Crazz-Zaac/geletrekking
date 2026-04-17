import { useMemo } from 'react'
import { measureTextHeight, willTextFitInLines, truncateToLines } from '@/lib/text-layout'

export interface TextLayoutOptions {
  font: string
  maxWidth: number
  lineHeight: number
  maxLines?: number
}

/**
 * Hook to measure text layout in a constrained space
 * Useful for checking if truncation is needed or calculating container heights
 */
export function useTextLayout(text: string, options: TextLayoutOptions) {
  return useMemo(() => {
    const { font, maxWidth, lineHeight, maxLines } = options

    const measurement = measureTextHeight(text, font, maxWidth, lineHeight)
    const fits = maxLines ? measurement.lineCount <= maxLines : true
    const truncated = maxLines
      ? truncateToLines(text, font, maxWidth, lineHeight, maxLines)
      : text

    return {
      ...measurement,
      fits,
      truncated,
      needsTruncation: truncated !== text,
    }
  }, [text, options.font, options.maxWidth, options.lineHeight, options.maxLines])
}

/**
 * Hook to check if text fits in a specific number of lines
 */
export function useTextFitsInLines(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
): boolean {
  return useMemo(() => {
    return willTextFitInLines(text, font, maxWidth, lineHeight, maxLines)
  }, [text, font, maxWidth, lineHeight, maxLines])
}
