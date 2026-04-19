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
      <h3 className="text-sm font-semibold text-slate-900 mb-3">
        Quick Navigation
      </h3>
      <ul className="space-y-1.5 text-sm">
        {headings.map((heading, index) => (
          <li key={heading.id}>
            <button
              onClick={() => handleClick(heading.id)}
              className={`group flex items-center gap-2 w-full text-left rounded-md px-2 py-1.5 transition-colors ${
                activeId === heading.id
                  ? 'bg-white text-blue-700'
                  : 'text-slate-600 hover:bg-white hover:text-blue-700'
              }`}
              style={{
                paddingLeft: `${8 + (heading.level - 2) * 10}px`,
              }}
            >
              <span className={`text-xs font-semibold min-w-6 ${activeId === heading.id ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'}`}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="line-clamp-1">{heading.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
