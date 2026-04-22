'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TableOfContents } from '@/components/table-of-contents'
import { type TravelGuide } from '@/lib/api'

interface GuideContentClientProps {
  content: string
  guide: TravelGuide
}

export function GuideContentClient({ content, guide }: GuideContentClientProps) {
  const [headings, setHeadings] = useState<Array<{ id: string; text: string; level: number }>>([])

  useEffect(() => {
    // Extract headings from HTML
    const div = document.createElement('div')
    div.innerHTML = content

    const headingElements = div.querySelectorAll('h2, h3, h4')
    const extractedHeadings: Array<{ id: string; text: string; level: number }> = []

    headingElements.forEach((el) => {
      const text = el.textContent || ''
      const level = parseInt(el.tagName[1])
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      extractedHeadings.push({ id, text, level })
    })

    setHeadings(extractedHeadings)

    // Add IDs to actual heading elements in the DOM for scroll linking
    setTimeout(() => {
      const headingElements = document.querySelectorAll('h2, h3, h4')
      headingElements.forEach((el, idx) => {
        if (!el.id && extractedHeadings[idx]) {
          el.id = extractedHeadings[idx].id
        }
      })
    }, 0)
  }, [content])

  return (
    <div className="lg:col-span-1">
      <div className="lg:sticky lg:top-24 space-y-6">
        {/* CTA Card */}
        <Card className="border-border/70 shadow-sm p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 dark:border-green-800">
          <h3 className="font-semibold text-lg text-green-900 dark:text-green-100 mb-2">
            Ready for your trek?
          </h3>
          <p className="text-sm text-green-800 dark:text-green-200 mb-4 leading-relaxed">
            Explore our curated trek packages and find your perfect Nepal adventure.
          </p>
          <Link href="/destinations" className="block">
            <Button className="w-full" size="sm">
              View Destinations
            </Button>
          </Link>
        </Card>

        {/* Table of Contents */}
        {headings.length > 0 && (
          <Card className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-none">
            <TableOfContents headings={headings} />
          </Card>
        )}
      </div>
    </div>
  )
}
