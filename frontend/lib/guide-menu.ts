import type { ComponentType } from 'react'
import {
  FileBadge2,
  FileCheck,
  CloudSun,
  Smartphone,
  Mountain,
  HeartPulse,
  ShieldCheck,
  Dumbbell,
  Backpack,
  CircleHelp,
  BookOpen,
} from 'lucide-react'
import type { TravelGuide } from '@/lib/api'

export const getGuideMenuLabel = (guide: Pick<TravelGuide, 'slug' | 'title'>): string => {
  const bySlug: Record<string, string> = {
    'visa-information': 'Visa & Entry Info',
    'permits-and-regulations': 'Permits & TIMS Card',
    'tims-card': 'Permits & TIMS Card',
    'weather-and-seasons': 'Weather & Seasons',
    'communication-services': 'Arrival in Nepal (Communication/SIMs)',
    'hypoxia-and-altitude-sickness': 'Altitude & Hypoxia',
    'health-and-medicine': 'Medicines & Health',
    'insurance': 'Insurance & Accidents',
    'key-preparations': 'Training & Prep',
    'gear-and-equipment': 'Packing List (Gear)',
    'guide-rules-and-etiquette': 'FAQ (General queries)',
  }

  return bySlug[guide.slug] || guide.title
}

export const getGuideMenuIcon = (
  guide: Pick<TravelGuide, 'slug'>
): ComponentType<{ className?: string }> => {
  const bySlug: Record<string, ComponentType<{ className?: string }>> = {
    'visa-information': FileBadge2,
    'permits-and-regulations': FileCheck,
    'tims-card': FileCheck,
    'weather-and-seasons': CloudSun,
    'communication-services': Smartphone,
    'hypoxia-and-altitude-sickness': Mountain,
    'health-and-medicine': HeartPulse,
    insurance: ShieldCheck,
    'key-preparations': Dumbbell,
    'gear-and-equipment': Backpack,
    'guide-rules-and-etiquette': CircleHelp,
  }

  return bySlug[guide.slug] || BookOpen
}

export const getGuideMenuColumn = (
  guide: Pick<TravelGuide, 'category' | 'title'>
): 'Logistics' | 'Health & Safety' | 'Preparation' => {
  const lowerTitle = guide.title.toLowerCase()

  if (guide.category === 'Legal' || guide.category === 'Communication' || lowerTitle.includes('weather')) {
    return 'Logistics'
  }

  if (guide.category === 'Health' || guide.category === 'Safety' || lowerTitle.includes('insurance')) {
    return 'Health & Safety'
  }

  return 'Preparation'
}
