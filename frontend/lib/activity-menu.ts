import type { ComponentType } from 'react'
import {
  Mountain,
  Waves,
  Binoculars,
  Zap,
  Tent,
  HeartPulse,
  Handshake,
  Compass,
  CalendarDays,
  BookOpen,
} from 'lucide-react'
import type { PublicActivity } from '@/lib/api'

type ActivityMenuColumn = 'Adventures' | 'Wellness & Safety' | 'Culture & Community'

export const getActivityMenuColumn = (activity: Pick<PublicActivity, 'title' | 'tags' | 'category'>): ActivityMenuColumn => {
  if (activity.category === 'Water Sports') return 'Adventures'
  if (activity.category === 'Adrenaline') return 'Adventures'
  if (activity.category === 'Wildlife') return 'Culture & Community'

  const title = activity.title.toLowerCase()
  const tags = (activity.tags || []).map((tag) => tag.toLowerCase())

  if (tags.some((tag) => ['trek', 'expedition', 'adventure', 'hike', 'camp'].includes(tag)) || title.includes('trek') || title.includes('expedition')) {
    return 'Adventures'
  }

  if (tags.some((tag) => ['health', 'wellness', 'safety', 'first aid', 'altitude'].includes(tag)) || title.includes('safety') || title.includes('health')) {
    return 'Wellness & Safety'
  }

  return 'Culture & Community'
}

export const getActivityMenuLabel = (activity: Pick<PublicActivity, 'title'>): string => activity.title

export const getActivityMenuIcon = (
  activity: Pick<PublicActivity, 'title' | 'tags' | 'category'>
): ComponentType<{ className?: string }> => {
  if (activity.category === 'Day Tour') return CalendarDays
  if (activity.category === 'Adrenaline') return Zap
  if (activity.category === 'Wildlife') return Binoculars
  if (activity.category === 'Water Sports') return Waves

  const title = activity.title.toLowerCase()
  const tags = (activity.tags || []).map((tag) => tag.toLowerCase())

  if (tags.some((tag) => ['trek', 'expedition', 'adventure', 'hike'].includes(tag)) || title.includes('trek')) return Mountain
  if (tags.some((tag) => ['camp', 'outdoor'].includes(tag)) || title.includes('camp')) return Tent
  if (tags.some((tag) => ['health', 'wellness', 'first aid'].includes(tag)) || title.includes('health')) return HeartPulse
  if (tags.some((tag) => ['community', 'culture', 'charity', 'local'].includes(tag)) || title.includes('community')) return Handshake
  if (tags.some((tag) => ['orientation', 'briefing', 'training'].includes(tag)) || title.includes('training')) return Compass
  if (tags.some((tag) => ['event', 'festival', 'workshop'].includes(tag)) || title.includes('workshop')) return CalendarDays

  return BookOpen
}
