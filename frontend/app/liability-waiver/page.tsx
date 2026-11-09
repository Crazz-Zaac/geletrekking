import { AlertTriangle, Ambulance, FileSignature, HeartPulse, Mountain, Scale, Shield, Stethoscope, Users } from 'lucide-react'
import { LegalDocument, type LegalHighlight, type LegalSection } from '@/components/legal-document'

const highlights: LegalHighlight[] = [
  { icon: Mountain, title: 'Trekking carries real risk', text: 'Including serious injury, illness and death, even with careful planning.' },
  { icon: Shield, title: 'Insurance is required', text: 'It must cover your altitude, medical treatment and helicopter evacuation.' },
  { icon: Stethoscope, title: 'Tell us your medical history', text: 'Your guide needs an honest picture to keep you safe.' },
  { icon: AlertTriangle, title: "Your guide's safety decisions stand", text: 'Including rest, descent or ending your trek.' },
]

const sections: LegalSection[] = [
  {
    id: 'purpose',
    icon: FileSignature,
    title: 'What This Waiver Is',
    body: [
      'This Liability Waiver is an agreement between you and Gele Trekking. It applies to every trek, climb, tour and related service we arrange for you, from your arrival in Nepal until your departure. It forms part of, and should be read with, our Terms & Conditions and Health & Safety Disclaimer.',
      '**Please read it carefully.** It affects your legal rights. If anything is unclear, contact us before you accept it.',
    ],
  },
  {
    id: 'risks',
    icon: Mountain,
    title: 'The Risks of Trekking in the Himalaya',
    body: ['Trekking and climbing in Nepal take place in remote, high and changeable environments. Some risks cannot be removed, however carefully a trip is planned and led. They include:'],
    points: [
      '**Altitude:** acute mountain sickness, high-altitude pulmonary or cerebral oedema, and other altitude illness, which can be fatal.',
      '**Terrain and weather:** falls, rockfall, landslides, avalanches, river crossings, exposed trails, snow, ice, extreme cold, sun and sudden storms.',
      '**Remoteness:** limited communication and medical care, and evacuation that may be delayed or impossible because of weather or terrain.',
      '**Transport:** travel by mountain roads, domestic flights and helicopters, including delays, cancellations and accidents.',
      '**Health and environment:** illness, infection, food or water contamination, animals such as yaks and dogs, and the worsening of existing conditions.',
      '**People and events:** the acts of other travellers or third parties, political disruption, natural disasters and other events beyond our control.',
    ],
  },
  {
    id: 'assumption-of-risk',
    icon: AlertTriangle,
    title: 'Your Acceptance of These Risks',
    body: [
      'You confirm that you are taking part voluntarily, that you understand the nature of the activity, and that you knowingly accept the risks described above, along with other risks that cannot reasonably be foreseen. These risks could result in injury, illness, permanent disability, death, or loss of or damage to property.',
    ],
  },
  {
    id: 'fitness-and-disclosure',
    icon: HeartPulse,
    title: 'Fitness and Medical Disclosure',
    body: [
      'You confirm that you are physically and mentally fit for the trek you have booked, and that you have taken medical advice where appropriate.',
      'You agree to tell us, truthfully and before departure, about any medical condition, medication, allergy, injury, pregnancy, dietary restriction or previous altitude problem, and to tell your guide promptly about any symptoms during the trek.',
    ],
  },
  {
    id: 'insurance',
    icon: Shield,
    title: 'Insurance',
    body: [
      'You must hold comprehensive travel insurance that covers trekking at the highest altitude of your itinerary, medical treatment, helicopter evacuation, trip cancellation, delays, baggage and repatriation, and you must keep it in force throughout your trip. You remain responsible for any cost your insurer does not pay.',
    ],
  },
  {
    id: 'guide-instructions',
    icon: Users,
    title: 'Following Your Guide',
    body: [
      'You agree to follow the reasonable instructions of your guide and our staff, as well as Nepalese law and local rules. Your guide may require you to rest, descend, change route or end your trek when safety requires it. If you choose to act against that advice or leave the group, you do so at your own risk.',
    ],
  },
  {
    id: 'emergency-care',
    icon: Ambulance,
    title: 'Emergency Treatment and Evacuation',
    body: [
      'If you are unable to decide for yourself in an emergency, you authorise Gele Trekking and its staff to arrange the first aid, medical treatment, hospital care, rescue or helicopter evacuation they reasonably believe you need, and to share relevant details with medical providers, your insurer and your emergency contact.',
      'Our staff are not doctors. Gele Trekking can assist with coordination, but you and your insurer are responsible for approving and paying for all treatment, rescue and repatriation.',
    ],
  },
  {
    id: 'release',
    icon: Scale,
    title: 'Release of Liability',
    body: [
      'To the fullest extent permitted by law, you release Gele Trekking and its owners, guides, porters, employees and agents from all claims, liability and costs arising from your participation in the trip, including claims for injury, illness, death, delay, extra expense, or loss of or damage to belongings. This also binds your heirs, estate and anyone who may claim on your behalf.',
      '**This release does not apply** to loss caused by gross negligence or wilful misconduct, or to any liability that cannot lawfully be limited or excluded.',
      'Airlines, hotels, lodges, vehicle operators and other independent suppliers are responsible for their own services, as set out in our Terms & Conditions.',
    ],
  },
  {
    id: 'minors',
    icon: Users,
    title: 'Children in Family Groups',
    body: ['A parent or legal guardian must accept this waiver for any traveller under 18, and accepts these terms on that child’s behalf.'],
  },
  {
    id: 'general',
    icon: FileSignature,
    title: 'General Terms and Your Acceptance',
    body: [
      'This waiver is governed by the laws of Nepal. If any part of it is found to be unenforceable, the rest remains in effect.',
      'By ticking the liability waiver box on our booking form and adding your typed signature, you confirm that you have read and understood this waiver and accept it, and that the signature has the same effect as a handwritten one.',
    ],
  },
]

export default function LiabilityWaiverPage() {
  return (
    <LegalDocument
      path="/liability-waiver"
      eyebrow="Legal · Liability Waiver"
      title="Liability Waiver"
      intro="What you accept when you trek with Gele Trekking: the risks of the Himalaya, your responsibilities, and the limits of our liability."
      effective="November 2026"
      version="1.0"
      highlightsTitle="Key points at a glance"
      highlights={highlights}
      sections={sections}
      closing="By accepting this waiver, you confirm that you have read and understood it and are taking part voluntarily. If anything is unclear, please contact us before you sign."
    />
  )
}
