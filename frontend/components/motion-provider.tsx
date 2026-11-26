'use client'

import { LazyMotion } from 'framer-motion'
import type { ReactNode } from 'react'

// Animation features (~15 KB) load after the page is interactive instead of
// shipping the whole framer-motion bundle with the first paint. Public
// components use the lightweight `m.*` components, which need this provider.
const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default)

export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>
}
