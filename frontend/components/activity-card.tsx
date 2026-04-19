import { useTextLayout } from '@/hooks/useTextLayout'
import { PublicActivity } from '@/lib/api'
import { getActivityMenuLabel } from '@/lib/activity-menu'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

interface ActivityCardProps {
  activity: PublicActivity
  categoryLabel: string
}

/**
 * Activity Card with precise text measurement
 * Ensures consistent 1-line description across all devices
 */
export function ActivityCard({ activity, categoryLabel }: ActivityCardProps) {
  const title = getActivityMenuLabel(activity)

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
    <Link href={`/activities/${activity.slug}`} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-2xl">
      <Card className="relative h-full rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-border bg-card">
        {/* Image Section */}
        <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
          {activity.mainImage && (
            <Image
              src={activity.mainImage}
              alt={`${title} activity cover image`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
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
            {title}
          </p>

          {/* Description - Measured with Pretext for accuracy */}
          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
            {descriptionLayout.truncated}
          </p>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-1">
              {activity.duration || 'Custom duration'}
            </span>
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-1">
              {activity.difficultyLevel || 'Flexible difficulty'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary">
              {activity.currency || '$'}{activity.price}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
              View details <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
