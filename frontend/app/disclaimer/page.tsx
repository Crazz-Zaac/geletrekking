import {
  Activity,
  CloudSnow,
  Footprints,
  HeartPulse,
  Helicopter,
  Mountain,
  PawPrint,
  Scale,
  Shield,
  Stethoscope,
  UserCheck,
} from 'lucide-react'
import { LegalDocument, type LegalHighlight, type LegalSection } from '@/components/legal-document'

const highlights: LegalHighlight[] = [
  { icon: Mountain, title: 'Altitude can be dangerous', text: 'AMS, HACE and HAPE can be fatal. Acclimatisation helps but guarantees nothing.' },
  { icon: Shield, title: 'Insurance is mandatory', text: 'It must include medical evacuation and trekking at high altitude.' },
  { icon: Helicopter, title: 'Rescue is costly', text: 'A helicopter evacuation often costs US$3,000–10,000.' },
  { icon: Stethoscope, title: 'See a doctor first', text: 'Disclose all medical conditions before you trek.' },
]

const sections: LegalSection[] = [
  {
    id: 'altitude-and-acclimatization',
    icon: Mountain,
    title: 'Altitude and Acclimatization',
    body: [
      'High-altitude trekking poses significant risks including acute mountain sickness (AMS), high altitude cerebral edema (HACE), and high altitude pulmonary edema (HAPE). These conditions can be fatal.',
      'Proper acclimatization is essential but not guaranteed to prevent altitude sickness. Individual responses to altitude vary significantly and cannot be predicted.',
    ],
  },
  {
    id: 'weather-and-environmental-hazards',
    icon: CloudSnow,
    title: 'Weather and Environmental Hazards',
    body: [
      'Himalayan weather is unpredictable and can change rapidly. Snow, rain, lightning, avalanches, and extreme cold are common hazards.',
      'Participants may experience hypothermia, frostbite, and other weather-related injuries. We cannot guarantee protection from all weather-related incidents.',
    ],
  },
  {
    id: 'physical-exertion',
    icon: Activity,
    title: 'Physical Exertion',
    body: [
      'Trekking involves strenuous physical activity. Participants may experience muscle soreness, joint pain, fatigue, and dehydration.',
      'People with cardiovascular conditions, respiratory issues, or joint problems face increased risks. Consult your doctor before participating.',
    ],
  },
  {
    id: 'medical-and-emergency-evacuation',
    icon: Helicopter,
    title: 'Medical and Emergency Evacuation',
    body: [
      'Emergency medical facilities are limited in remote trekking areas. Medical evacuation by helicopter may be necessary but is not always possible due to weather or terrain.',
      'Helicopter evacuation is extremely expensive (often **$3,000–$10,000**). Medical evacuation insurance is mandatory.',
    ],
  },
  {
    id: 'accident-and-injury-risks',
    icon: Footprints,
    title: 'Accident and Injury Risks',
    body: [
      'Trekking trails can be steep, narrow, and dangerous. Slipping, falling, and other accidents can occur.',
      'Participants assume all risks associated with physical injuries. Gele Trekking and its staff are not liable for accidents or injuries.',
    ],
  },
  {
    id: 'wildlife-encounters',
    icon: PawPrint,
    title: 'Wildlife Encounters',
    body: [
      'The Himalayan region is home to various wildlife including snow leopards, bears, and other animals. While encounters are rare, they can occur. Follow guide instructions regarding wildlife safety.',
    ],
  },
  {
    id: 'assumption-of-risk',
    icon: Scale,
    title: 'Assumption of Risk',
    body: [
      'By participating in our treks, you acknowledge that you fully understand these risks and voluntarily assume all risks associated with high-altitude trekking.',
      'You agree not to hold Gele Trekking, its guides, or its staff responsible for any injuries, accidents, or deaths.',
    ],
  },
  {
    id: 'mandatory-insurance',
    icon: Shield,
    title: 'Mandatory Insurance',
    body: [
      'Participants must have comprehensive travel and trekking insurance including medical evacuation coverage. Without proper insurance, you may be unable to afford emergency medical care.',
      'Insurance companies should be notified that you will be trekking at high altitude.',
    ],
  },
  {
    id: 'pre-trek-medical-consultation',
    icon: HeartPulse,
    title: 'Pre-Trek Medical Consultation',
    body: [
      'We strongly recommend consulting with a doctor experienced in high-altitude medicine before your trek. Disclose all medical conditions, medications, and concerns.',
      'Participants with serious medical conditions may be advised against trekking.',
    ],
  },
  {
    id: 'individual-responsibility',
    icon: UserCheck,
    title: 'Individual Responsibility',
    body: [
      'Each participant is responsible for their own health and safety. Follow all guide instructions, listen to your body, and communicate any concerns immediately.',
      'Turn back if you feel unwell. Your safety is more important than reaching the summit.',
    ],
  },
]

export default function DisclaimerPage() {
  return (
    <LegalDocument
      path="/disclaimer"
      eyebrow="Legal · Risk disclosure"
      title="Health & Safety Disclaimer"
      intro="Trekking in the Himalaya carries real risks. This page explains them, what we expect from every participant, and the insurance you need before joining a trip with Gele Trekking."
      effective="April 2026"
      highlightsTitle="Before you book, please know"
      highlights={highlights}
      notice={{
        title: 'Please read this carefully before booking',
        text: 'Trekking in the Himalayas carries inherent risks, including at high altitude where help can be hours or days away.',
      }}
      sections={sections}
      closing="By booking a trek with Gele Trekking, you acknowledge that you have read, understood, and fully agree to this disclaimer. You accept all risks associated with high-altitude trekking and absolve Gele Trekking from any liability."
    />
  )
}
