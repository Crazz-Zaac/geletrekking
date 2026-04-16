import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

interface RegionCardProps {
  name: string;
  image: string;
  description: string;
  trekCount: number;
}

export function RegionCard({ name, image, description, trekCount }: RegionCardProps) {
  return (
    <Link href={`/destinations?region=${name}`}>
      <Card className="border-border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group h-full flex flex-col">
        <div className="relative h-64 overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-2xl font-bold text-foreground mb-2">{name}</h3>
          <p className="text-muted-foreground mb-4 flex-1">{description}</p>
          <p className="text-sm text-primary font-semibold">{trekCount} treks available</p>
        </div>
      </Card>
    </Link>
  );
}
