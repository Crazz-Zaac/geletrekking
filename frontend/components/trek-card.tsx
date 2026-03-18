import Link from 'next/link'
import Image from 'next/image'
import { Clock, Mountain, Users, ArrowRight } from 'lucide-react'
import type { Trek } from '@/lib/data'
import { cn } from '@/lib/utils'

const difficultyColors: Record<Trek['difficulty'], string> = {
  Easy: 'bg-green-100 text-green-800',
  Moderate: 'bg-amber-100 text-amber-800',
  Strenuous: 'bg-orange-100 text-orange-800',
  Challenging: 'bg-red-100 text-red-800',
}

interface TrekCardProps {
  trek: Trek
  className?: string
}

export function TrekCard({ trek, className }: TrekCardProps) {
  return (
    <Link
      href={`/trek/${trek.id}`}
      className={cn(
        'group flex flex-col bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
        className
      )}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={trek.image}
          alt={trek.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span className="bg-primary/90 text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
            {trek.region}
          </span>
          <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', difficultyColors[trek.difficulty])}>
            {trek.difficulty}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-serif text-lg font-bold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">
          {trek.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2">
          {trek.shortDescription}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 border-t border-border pt-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" />
            <span>{trek.duration} days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mountain className="w-4 h-4 text-primary" />
            <span>{trek.maxAltitude.toLocaleString()}m</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary" />
            <span>{trek.groupSize}</span>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">From</p>
            <p className="text-xl font-bold text-primary">${trek.price.toLocaleString()}</p>
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
            View Trek
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
