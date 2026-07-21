import { PrivateBookingForm } from '@/components/private-booking-form'
import { getTreks } from '@/lib/api'

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
  const treks = await getTreks()

  return (
    <main className="min-h-screen bg-muted/30 py-8 md:py-12">
      <div className="mx-auto w-full max-w-4xl px-4 md:px-6">
        <div className="rounded-lg border border-border bg-background p-5 md:p-8 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Private secure intake</p>
            <h1 className="mt-2 text-2xl md:text-3xl font-bold text-foreground">Gele Trekking Booking Form</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This form is available only from the link sent by the admin team. It is not listed in site navigation.
            </p>
          </div>
          <PrivateBookingForm token={token} treks={treks} requireTrek />
        </div>
      </div>
    </main>
  )
}
