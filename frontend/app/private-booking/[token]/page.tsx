import { PrivateBookingForm } from '@/components/private-booking-form'
import Image from 'next/image'
import { getAdminSettings, getTreks } from '@/lib/api'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const metadata = {
  title: 'Private Booking Form | Gele Trekking',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
  },
}

interface PrivateBookingPageProps {
  params: Promise<{ token: string }>
}

export default async function PrivateBookingPage({ params }: PrivateBookingPageProps) {
  const { token } = await params
  const [treks, settings] = await Promise.all([getTreks(), getAdminSettings().catch(() => null)])

  return (
    <main className="min-h-screen bg-background py-6 sm:bg-muted/30 md:py-12">
      <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
        <div className="sm:rounded-2xl sm:border sm:border-border sm:bg-background sm:p-8 sm:shadow-sm">
          <div className="mb-8 flex items-start gap-4">
            <Image src={settings?.logoUrl || '/geletrekking.png'} alt="Gele Trekking" width={56} height={56} className="h-14 w-14 shrink-0 rounded-lg border border-border object-cover" />
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">Your booking form</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                This takes about 10 minutes. Please have your passport and travel insurance details to hand. This link is just for you.
              </p>
            </div>
          </div>
          <PrivateBookingForm token={token} treks={treks} requireTrek />
        </div>
      </div>
    </main>
  )
}
