'use client'

import { useEffect, useRef } from 'react'

const FEATURABLE_WIDGET_ID = 'featurable-d8cabeae-9e92-42e1-ab78-75f13b25aa45'
const FEATURABLE_SCRIPT_SRC = 'https://featurable.com/assets/bundle.js'

export function GoogleReviewsEmbed() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''

    const widget = document.createElement('div')
    widget.id = FEATURABLE_WIDGET_ID
    widget.setAttribute('data-featurable-async', '')
    container.appendChild(widget)

    document
      .querySelectorAll<HTMLScriptElement>(`script[src="${FEATURABLE_SCRIPT_SRC}"]`)
      .forEach((script) => script.remove())

    const script = document.createElement('script')
    script.src = FEATURABLE_SCRIPT_SRC
    script.async = true
    document.body.appendChild(script)

    return () => {
      script.remove()
    }
  }, [])

  return <div ref={containerRef} />
}
