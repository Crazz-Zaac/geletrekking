'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronDown, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  planYourTripGuides,
  getPlanYourTripColumns,
  type PlanYourTripGuide,
} from '@/lib/plan-your-trip-data'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CheckCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  AlertCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0-12a9 9 0 110 18 9 9 0 010-18z" />
    </svg>
  ),
  Smartphone: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  FileCheck: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7.784-2.32a.75.75 0 001.06-1.06L9.06 2.22a.75.75 0 00-1.06 0L2.22 8.1a.75.75 0 001.06 1.06l5.69-5.72L15.5 12.47V4.5h2.25v10.97l5.61-5.63z" />
    </svg>
  ),
  Backpack: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  CloudSun: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1m-16 0H1m15.364 1.636l.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  FileBadge2: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CircleHelp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

function GuideIcon({ name }: { name: string }) {
  const IconComponent = iconMap[name] || iconMap.CheckCircle
  return <IconComponent />
}

interface AccordionItem {
  id: string
  guide: PlanYourTripGuide
  isOpen: boolean
}

interface Props {
  initialCategory?: 'Logistics' | 'Health & Safety' | 'Preparation'
}

export function PlanYourTripAccordion({ initialCategory = 'Logistics' }: Props) {
  const [activeCategory, setActiveCategory] = useState<
    'Logistics' | 'Health & Safety' | 'Preparation'
  >(initialCategory)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const columns = useMemo(() => getPlanYourTripColumns(), [])
  const activeColumn = columns.find((col) => col.title === activeCategory)

  const toggleItem = (id: string) => {
    const newSet = new Set(expandedItems)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedItems(newSet)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Category Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {columns.map((column) => (
          <button
            key={column.title}
            onClick={() => {
              setActiveCategory(column.title)
              setExpandedItems(new Set())
            }}
            className={cn(
              'px-4 py-2 rounded-lg font-semibold text-sm transition-all',
              activeCategory === column.title
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {column.title}
            <span className="ml-2 text-xs opacity-75">({column.items.length})</span>
          </button>
        ))}
      </div>

      {/* Accordion Items */}
      <div className="space-y-3">
        {activeColumn?.items.map((guide) => (
          <div
            key={guide.id}
            className="border border-border/50 rounded-lg overflow-hidden bg-card hover:border-border transition-colors"
          >
            <button
              onClick={() => toggleItem(guide.id)}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <GuideIcon name={guide.icon} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground line-clamp-2">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {guide.description}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-muted-foreground flex-shrink-0 ml-2 transition-transform duration-200',
                  expandedItems.has(guide.id) && 'rotate-180'
                )}
              />
            </button>

            {/* Expanded Content */}
            {expandedItems.has(guide.id) && (
              <div className="border-t border-border/50 px-4 py-4 bg-muted/20">
                <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
                  {/* Render markdown-like content */}
                  {guide.content.split('\n').map((line, idx) => {
                    if (line.startsWith('# ')) {
                      return (
                        <h1 key={idx} className="text-lg font-bold mt-3 mb-2">
                          {line.slice(2)}
                        </h1>
                      )
                    }
                    if (line.startsWith('## ')) {
                      return (
                        <h2 key={idx} className="text-base font-semibold mt-3 mb-1">
                          {line.slice(3)}
                        </h2>
                      )
                    }
                    if (line.startsWith('### ')) {
                      return (
                        <h3 key={idx} className="text-sm font-semibold mt-2 mb-1 text-foreground/90">
                          {line.slice(4)}
                        </h3>
                      )
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <li key={idx} className="text-sm text-foreground/85 ml-4">
                          {line.slice(2)}
                        </li>
                      )
                    }
                    if (line.trim() === '') {
                      return <div key={idx} className="h-2" />
                    }
                    if (line.startsWith('|')) {
                      return null // Skip table lines for now
                    }
                    return (
                      <p key={idx} className="text-sm text-foreground/85 leading-relaxed">
                        {line}
                      </p>
                    )
                  })}
                </div>

                {/* Read Full Guide Link */}
                <Link
                  href={`/guides/${guide.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Read Full Guide
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
