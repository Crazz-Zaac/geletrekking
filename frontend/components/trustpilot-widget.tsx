'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement: (element: HTMLElement, force?: boolean) => void
    }
  }
}

const TRUSTPILOT_TEMPLATE_ID = '56278e9abfbbba0bdcd568bc'
const TRUSTPILOT_BUSINESS_UNIT_ID = '69f47dd9d9e95c39a7d38c9a'
const TRUSTPILOT_TOKEN = '7ce4a344-d5c3-4de4-9ff0-5443126348b2'

interface TrustpilotWidgetProps {
  className?: string
  height?: string
  variant?: 'boxed' | 'plain'
}

export function TrustpilotWidget({ className, height = '52px', variant = 'boxed' }: TrustpilotWidgetProps) {
  const widgetRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!widgetRef.current) return

    const loadWidget = () => {
      if (!widgetRef.current) return
      if (window.Trustpilot?.loadFromElement) {
        window.Trustpilot.loadFromElement(widgetRef.current, true)
      }
    }

    loadWidget()
  }, [])

  const containerClassName =
    variant === 'plain'
      ? `bg-transparent p-0 shadow-none ${className || ''}`
      : `rounded-2xl border border-border bg-card/90 p-5 shadow-sm ${className || ''}`

  return (
    <div className={containerClassName}>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Share your trekking experience</p>
          <h3 className="text-lg font-semibold text-foreground mt-2">Review us on Trustpilot</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your feedback helps fellow trekkers plan with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-xl border border-border bg-background px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00B67A]">Trustpilot</p>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#00B67A]/30 bg-[#00B67A]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#00B67A]">
                ★ 5-Star Reviews
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Share your experience on Trustpilot.</p>
            <div
              ref={widgetRef}
              className="trustpilot-widget"
              data-locale="en-US"
              data-template-id={TRUSTPILOT_TEMPLATE_ID}
              data-businessunit-id={TRUSTPILOT_BUSINESS_UNIT_ID}
              data-style-height={height}
              data-style-width="100%"
              data-token={TRUSTPILOT_TOKEN}
            >
              <a href="https://www.trustpilot.com/review/geletrekking.com" target="_blank" rel="noopener">
                Trustpilot
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
