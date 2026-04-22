'use client'

import React, { useMemo } from 'react'

interface GuideContentProps {
  html: string
}

/**
 * GuideContent renders markdown HTML with semantic elements and proper styling.
 * Enhances the HTML to:
 * - Ensure unique IDs for all headings (preventing duplicates)
 * - Convert plain text lists to semantic <ul>/<li> elements
 * - Apply comprehensive inline styling to all elements
 */
export default function GuideContent({ html }: GuideContentProps) {
  const enhancedHtml = useMemo(() => {
    let enhanced = html
    const headingIds = new Set<string>()

    // Remove h1 headings (they're redundant with the hero section title)
    enhanced = enhanced.replace(/<h1>(.*?)<\/h1>/g, '')

    // Add IDs to headings for TOC linking - ensure uniqueness
    enhanced = enhanced.replace(/<h([2-4])>(.*?)<\/h\1>/g, (match, level, content) => {
      let cleanText = content
        .replace(/<[^>]*>/g, '') // Remove any inner HTML
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') // Remove leading/trailing dashes

      // Ensure uniqueness
      let id = cleanText
      let counter = 1
      while (headingIds.has(id)) {
        id = `${cleanText}-${counter}`
        counter++
      }
      headingIds.add(id)

      // Add inline styles based on heading level
      const styles = {
        2: 'style="font-size: 1.625rem; font-weight: 700; margin-top: 2.25rem; margin-bottom: 1rem; color: inherit; line-height: 1.3;"',
        3: 'style="font-size: 1.25rem; font-weight: 700; margin-top: 1.75rem; margin-bottom: 0.75rem; color: inherit; line-height: 1.4;"',
        4: 'style="font-size: 1.0625rem; font-weight: 700; margin-top: 1.25rem; margin-bottom: 0.5rem; color: inherit; line-height: 1.4;"',
      }

      return `<h${level} id="${id}" ${styles[level as keyof typeof styles]}>${content}</h${level}>`
    })

    enhanced = enhanced.replace(/<h([2-4])([^>]*)style="([^"]*)"([^>]*)>/, (match, level, beforeStyle, styleValue, afterStyle) => {
      const normalized = styleValue.replace(/margin-top:\s*[^;]+;?/i, '').trim()
      const nextStyle = `margin-top: 0.125rem; ${normalized}`.trim()
      return `<h${level}${beforeStyle}style="${nextStyle}"${afterStyle}>`
    })

    // Bold headings in content that appear in the text
    // Find all h2/h3 headings and bold their first mention
    const headingMatches = enhanced.match(/<h[2-4][^>]*>([^<]+)<\/h[2-4]>/g) || []
    const headingTexts = headingMatches.map((h: string) =>
      h.replace(/<[^>]*>/g, '')
    )

    headingTexts.forEach((text: string) => {
      const regex = new RegExp(
        `(?<!<h[2-4][^>]*>)(${escapeRegex(text)})(?!<\\/h[2-4]>)`,
        'g'
      )
      let replaced = false
      enhanced = enhanced.replace(regex, (match) => {
        if (!replaced && !match.includes('<b>') && !match.includes('<strong>')) {
          replaced = true
          return `<strong>${match}</strong>`
        }
        return match
      })
    })

    // Convert paragraph text followed by newlines to proper list items
    // Matches patterns like "• Item 1" or "- Item 1"
    enhanced = enhanced.replace(
      /<p>([•\-*]\s+[^<]+(?:<br\s*\/?>\s*[•\-*]\s+[^<]+)*)<\/p>/g,
      (match, content) => {
        const items = content
          .split(/<br\s*\/?>/i)
          .map((item: string) => item.replace(/^[•\-*]\s+/, '').trim())
          .filter((item: string) => item.length > 0)

        if (items.length === 0) return match

        return (
          '<ul style="list-style-type: disc; margin-left: 1.5rem; line-height: 1.8; margin-top: 0.75rem; margin-bottom: 1rem; padding-left: 0.5rem;">' +
          items.map((item: string) => `<li style="margin-bottom: 0.5rem; color: inherit; padding-left: 0.125rem;">${item}</li>`).join('') +
          '</ul>'
        )
      }
    )

    // Style existing ul/li elements (created by marked from markdown lists)
    enhanced = enhanced.replace(/<ul>/g, '<ul style="list-style-type: disc; margin-left: 1.5rem; line-height: 1.8; margin-top: 0.75rem; margin-bottom: 1rem; padding-left: 0.5rem;">')
    enhanced = enhanced.replace(/<ol>/g, '<ol style="list-style-type: decimal; margin-left: 1.5rem; line-height: 1.8; margin-top: 0.75rem; margin-bottom: 1rem; padding-left: 0.5rem;">')
    enhanced = enhanced.replace(/<li>/g, '<li style="margin-bottom: 0.5rem; color: inherit; padding-left: 0.125rem;">')

    // Style paragraphs
    enhanced = enhanced.replace(/<p>/g, '<p style="line-height: 1.85; margin-bottom: 1.05rem; color: inherit; font-size: 1rem;">')

    // Style common inline text elements
    enhanced = enhanced.replace(/<strong>/g, '<strong style="font-weight: 700; color: inherit;">')
    enhanced = enhanced.replace(/<em>/g, '<em style="font-style: italic; color: inherit;">')
    enhanced = enhanced.replace(/<a /g, '<a style="color: rgb(34, 197, 94); text-decoration: underline; text-underline-offset: 2px;" ')
    enhanced = enhanced.replace(/<code>/g, '<code style="background: rgba(148, 163, 184, 0.18); border-radius: 0.375rem; padding: 0.12rem 0.35rem; font-size: 0.875rem;">')
    enhanced = enhanced.replace(/<pre>/g, '<pre style="background: rgba(148, 163, 184, 0.16); border: 1px solid rgba(148, 163, 184, 0.35); border-radius: 0.65rem; padding: 0.95rem; overflow-x: auto; margin: 1rem 0;">')

    // Style blockquotes and separators
    enhanced = enhanced.replace(/<blockquote>/g, '<blockquote style="margin: 1.25rem 0; padding: 0.75rem 1rem; border-left: 4px solid rgb(34, 197, 94); background: rgba(34, 197, 94, 0.06); border-radius: 0.375rem;">')
    enhanced = enhanced.replace(/<hr\s*\/?>/g, '<hr style="margin: 1.5rem 0; border: 0; border-top: 1px solid rgba(148, 163, 184, 0.35);" />')

    // Style tables
    enhanced = enhanced.replace(/<table>/g, '<table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0; border: 1px solid rgba(148, 163, 184, 0.35); border-radius: 0.5rem; overflow: hidden; display: block; overflow-x: auto;">')
    enhanced = enhanced.replace(/<thead>/g, '<thead style="background-color: rgba(148, 163, 184, 0.12);">')
    enhanced = enhanced.replace(/<th>/g, '<th style="border: 1px solid rgba(148, 163, 184, 0.35); padding: 0.75rem; text-align: left; font-weight: 700; color: inherit; white-space: nowrap;">')
    enhanced = enhanced.replace(/<td>/g, '<td style="border: 1px solid rgba(148, 163, 184, 0.35); padding: 0.7rem; color: inherit; vertical-align: top;">')
    enhanced = enhanced.replace(/<tbody>/g, '<tbody>')

    return enhanced
  }, [html])

  return (
    <div
      className="max-w-none"
      style={{
        fontSize: '1rem',
        lineHeight: '1.75',
        color: 'inherit',
      }}
      dangerouslySetInnerHTML={{ __html: enhancedHtml }}
    />
  )
}

/**
 * Helper function to escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
