import {
  AlertCircle,
  CalendarClock,
  Camera,
  CheckCircle,
  CreditCard,
  FileText,
  HeartPulse,
  MapPin,
  RotateCcw,
  Shield,
  User,
  Users,
} from 'lucide-react'
import { LegalDocument, type LegalHighlight, type LegalSection } from '@/components/legal-document'

const highlights: LegalHighlight[] = [
  { icon: CalendarClock, title: 'Book one month ahead', text: 'Bookings close one month before the trek starts.' },
  { icon: CreditCard, title: 'Pay on arrival', text: 'At present you pay after arriving in Nepal, before the trek begins.' },
  { icon: RotateCcw, title: 'Free date changes', text: 'Reschedule within one year at the same rate. Cancel up to 3 months before for a small fee.' },
  { icon: Shield, title: 'Insurance is required', text: 'Including high-altitude trekking and helicopter evacuation.' },
  { icon: Users, title: 'Ages 18–70 when joining alone', text: 'No age limit for families booking together.' },
  { icon: AlertCircle, title: 'Last-minute bookings', text: 'Cannot be cancelled and are not refundable.' },
]

const sections: LegalSection[] = [
  {
    id: 'booking-and-payment',
    icon: CreditCard,
    title: 'Booking, Payments, and Confirmation',
    body: [
      'A booking is confirmed only after we receive any required deposit, completed booking details, and written confirmation from Gele Trekking.',
      'The balance, payment method, currency, bank charges, and due date will be shared before confirmation. Prices may be adjusted for requested itinerary changes, exchange-rate movement, government fee changes, or supplier cost changes before final payment.',
    ],
    points: [
      '**Booking deadline:** bookings must be made at least **one month before** the trek.',
      '**Payment:** at present, payment is made after you arrive in Nepal, before the trek starts. Any deposit or advance payment we require will be stated in writing before your booking is confirmed.',
      '**Last-minute bookings** are not accepted for cancellation and are not refundable.',
      '**Age:** trekkers must be between **18 and 70 years old** to join independently. No age restrictions apply for family groups booking together.',
    ],
  },
  {
    id: 'cancellation-and-refunds',
    icon: RotateCcw,
    title: 'Cancellation, Refunds, and Unused Services',
    body: [
      'Our priority is to accommodate date changes (postponements) rather than cancellations, to keep your plans flexible.',
      'Cancellation charges otherwise depend on the date we receive written notice and any non-refundable commitments already made, including permits, domestic flights, hotels, guides, porters, vehicles, and accommodation. No refund is normally available for unused services after a trip has started, voluntary withdrawal, late arrival, early return, or services missed for reasons outside our control.',
    ],
    points: [
      '**Cancellation:** cancellations are accepted up to **3 months before** the scheduled trip. A minimal fee is deducted to cover currency exchange rates and transaction charges.',
      '**Date change:** trips can be rescheduled for up to **one year** from the original cancellation date, at the same rate.',
    ],
  },
  {
    id: 'itinerary-changes',
    icon: MapPin,
    title: 'Itinerary Changes and Mountain Conditions',
    body: [
      'Trekking in Nepal is affected by weather, trail conditions, landslides, snow, altitude, flight delays, road closures, local restrictions, and safety decisions. We may change routes, schedules, accommodation, transport, or services when reasonably necessary.',
      'Additional costs caused by delays, evacuation, rerouting, extra nights, or private arrangements are the client’s responsibility unless expressly included.',
    ],
  },
  {
    id: 'fitness-and-medical',
    icon: HeartPulse,
    title: 'Fitness, Medical Disclosure, and Altitude Risk',
    body: [
      'Clients must be physically prepared for the selected trek and must disclose medical conditions, medications, allergies, injuries, dietary restrictions, and prior altitude issues before departure.',
      'High-altitude trekking carries risks including acute mountain sickness, injury, illness, and emergency evacuation. Guides may require rest, descent, itinerary changes, or trip termination when safety requires it. See our Health & Safety Disclaimer for details.',
    ],
  },
  {
    id: 'insurance',
    icon: Shield,
    title: 'Insurance and Emergency Evacuation',
    body: [
      'Comprehensive travel insurance is mandatory and must cover trekking at the booked altitude, medical treatment, helicopter evacuation where applicable, trip cancellation, delays, baggage, and repatriation. Clients must carry policy details and emergency contacts.',
      'Gele Trekking can assist with rescue coordination, but insurers and clients remain responsible for approvals, guarantees, and payment.',
    ],
  },
  {
    id: 'documents-and-permits',
    icon: FileText,
    title: 'Passports, Visas, Permits, and Local Rules',
    body: [
      'Clients are responsible for valid passports, visas, entry requirements, and accurate personal information needed for permits and bookings. Trekking permits are subject to government rules and may be non-refundable once issued.',
      'Clients must follow Nepalese law, conservation-area rules, cultural norms, guide instructions, and restrictions set by local authorities or communities.',
    ],
  },
  {
    id: 'conduct-and-equipment',
    icon: User,
    title: 'Client Conduct, Equipment, and Porter Welfare',
    body: [
      'Clients must act respectfully toward guides, porters, local communities, other travelers, wildlife, and the environment. Required clothing, footwear, medication, and personal equipment must be suitable for the itinerary.',
      'We may refuse participation or remove a client from a trip for unsafe, abusive, illegal, intoxicated, or disruptive behavior, with no refund for affected services.',
    ],
  },
  {
    id: 'third-parties-and-liability',
    icon: AlertCircle,
    title: 'Third-Party Services and Liability Limits',
    body: [
      'Some services are provided by independent suppliers such as airlines, hotels, lodges, vehicle operators, restaurants, permit offices, and rescue providers.',
      'We choose suppliers carefully, but we are not liable for losses, injury, delay, extra expense, or disruption caused by supplier failure, weather, natural events, political conditions, illness, force majeure, or events beyond reasonable control.',
    ],
  },
  {
    id: 'privacy-and-media',
    icon: Camera,
    title: 'Privacy, Media, and Marketing Consent',
    body: [
      'We collect booking, identity, health, insurance, and emergency-contact information needed to operate trips safely and meet legal or supplier requirements.',
      'Photos and videos are used for marketing only with consent where required, and you may ask us in writing not to use identifiable images. Personal data is handled according to our Privacy Policy.',
    ],
  },
  {
    id: 'complaints-and-acceptance',
    icon: CheckCircle,
    title: 'Complaints, Governing Terms, and Acceptance',
    body: [
      'Please raise concerns with your guide or our office as soon as possible so we can try to resolve them during the trip. Formal complaints should be sent in writing after the trip.',
      'By booking, paying a deposit, or joining a trek, you confirm that you have read, understood, and accepted these terms and conditions in full.',
    ],
  },
]

export default function TermsPage() {
  return (
    <LegalDocument
      path="/terms-and-conditions"
      eyebrow="Legal · Terms & Conditions"
      title="Terms & Conditions"
      intro="The terms for booking and joining a trek with Gele Trekking: payments, cancellations, safety responsibilities, insurance and what happens when mountain conditions change."
      effective="November 2026"
      version="1.2"
      highlightsTitle="Key terms at a glance"
      highlights={highlights}
      sections={sections}
      closing="By booking with Gele Trekking, you confirm that you have read, understood, and accepted these terms and conditions in full. These terms set clear responsibilities for a safe and professionally operated trekking experience. If anything is unclear, please contact us before you book."
    />
  )
}
