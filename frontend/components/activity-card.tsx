import { useTextLayout } from '@/hooks/useTextLayout'
import { PublicActivity } from '@/lib/api'
import { getActivityMenuLabel } from '@/lib/activity-menu'
import Link from 'next/link'
import { Card } from '@/components/ui/card'

interface ActivityCardProps {
  activity: PublicActivity
  categoryLabel: string
}

/**
 * Activity Card with precise text measurement
 * Ensures consistent 1-line description across all devices
 */
export function ActivityCard({ activity, categoryLabel }: ActivityCardProps) {
  // Font specs matching your CSS: 14px Inter
  const descriptionLayout = useTextLayout(
    activity.description || activity.shortDescription || 'No description available',
    {
      font: '14px Inter',
      maxWidth: 280, // approximate card content width (p-4 * 2 = 32px padding)
      lineHeight: 20, // 1.43 line-height for text-xs
      maxLines: 1,
    }
  )

  return (
    <Link href={`/activities/${activity.slug}`}>
      <Card className="relative h-full rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-0">
        {/* Image Section */}
        <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
          {activity.mainImage && (
            <img
              src={activity.mainImage}
              alt={getActivityMenuLabel(activity)}
              className="w-full h-full object-cover"
            />
          )}

          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center bg-white text-gray-700 text-xs font-bold uppercase px-3 py-1 rounded-full shadow-sm">
              {categoryLabel}
            </span>
          </div>

          {/* Tags Overlay at Bottom */}
          {activity.tags && activity.tags.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex gap-2 flex-wrap">
              {activity.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs bg-white/20 text-white rounded-full px-2.5 py-1 font-medium backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          <p className="text-sm font-bold text-foreground mb-2 line-clamp-2">
            {getActivityMenuLabel(activity)}
          </p>

          {/* Description - Measured with Pretext for accuracy */}
          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
            {descriptionLayout.truncated}
          </p>

          {/* Duration and Location */}
          <div className="flex gap-4 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              📅 {activity.duration || 'Custom'}
            </span>
            <span className="flex items-center gap-1">
              📍 {activity.category || 'Trek'}
            </span>
          </div>

          {/* Arrow Button */}
          <div className="flex justify-end">
            <div className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                <path d="m9 6 6 6-6 6"></path>
              </svg>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
