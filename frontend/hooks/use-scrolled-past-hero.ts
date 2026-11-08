'use client'

import { useEffect, useState } from 'react'

/** True once the visitor has scrolled half a screen, so floating buttons can stay off the hero. */
export function useScrolledPastHero(enabled: boolean) {
  const [past, setPast] = useState(false)
  useEffect(() => {
    if (!enabled) {
      setPast(false)
      return
    }
    const update = () => setPast(window.scrollY > window.innerHeight * 0.5)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [enabled])
  return past
}
