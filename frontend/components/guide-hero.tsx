import { Clock, BookOpen, Award } from 'lucide-react'
import { getGuideMenuIcon } from '@/lib/guide-menu'
import { type TravelGuide } from '@/lib/api'

interface GuideHeroProps {
  guide: TravelGuide
  readingTime: number
}

export function GuideHero({ guide, readingTime }: GuideHeroProps) {
  const GuideIcon = getGuideMenuIcon(guide)

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 border border-green-200 dark:border-green-800 rounded-lg p-8 mb-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
          <GuideIcon className="w-7 h-7 text-green-700 dark:text-green-300" />
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-widest font-semibold text-green-700 dark:text-green-300 mb-2">
            {guide.category}
            {guide.section && ` • ${guide.section}`}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-green-900 dark:text-green-100 mb-2">
            {guide.title}
          </h1>
          <p className="text-green-800 dark:text-green-200 text-base leading-relaxed max-w-2xl">
            {guide.description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-4 border-t border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-sm">
          <Clock className="w-4 h-4" />
          <span>{readingTime} min read</span>
        </div>
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-sm">
          <BookOpen className="w-4 h-4" />
          <span>Comprehensive guide</span>
        </div>
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-sm">
          <Award className="w-4 h-4" />
          <span>Expert curated</span>
        </div>
      </div>
    </div>
  )
}
