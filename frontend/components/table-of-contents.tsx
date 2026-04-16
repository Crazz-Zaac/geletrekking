'use client'

import { useEffect, useState } from 'react'
import { type Heading } from '@/lib/guide-utils'

interface TableOfContentsProps {
  headings: Heading[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map((h) => {
        const el = document.getElementById(h.id)
        return { ...h, element: el }
      })

      let currentId = ''
      for (const heading of headingElements) {
        if (!heading.element) continue
        if (heading.element.getBoundingClientRect().top < 100) {
          currentId = heading.id
        }
      }

      setActiveId(currentId)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [headings])

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="space-y-2">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground mb-4">
        In this guide
      </h3>
      <ul className="space-y-1 text-sm">
        {headings.map((heading) => (
          <li key={heading.id}>
            <button
              onClick={() => handleClick(heading.id)}
              className={`block text-left w-full px-3 py-1.5 rounded transition-colors ${
                activeId === heading.id
                  ? 'bg-green-100 dark:bg-green-950/40 text-green-900 dark:text-green-100 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
              style={{
                paddingLeft: `${12 + (heading.level - 2) * 12}px`,
              }}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
