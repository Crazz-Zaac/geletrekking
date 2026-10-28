import type { Trek } from '@/lib/data'

export function getTrekPath(trek: Pick<Trek, 'id' | 'slug'>): string {
  return `/trek/${encodeURIComponent(trek.slug?.trim() || trek.id)}`
}
