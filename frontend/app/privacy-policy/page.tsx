import {
  Ban,
  CalendarDays,
  Cookie,
  Database,
  Globe,
  IdCard,
  Lock,
  Mail,
  Scale,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react'
import { LegalDocument, type LegalHighlight, type LegalSection } from '@/components/legal-document'
import { getCachedPublicSettings } from '@/lib/api'
import { CONTACT_EMAIL } from '@/lib/contact-links'

const highlights: LegalHighlight[] = [
  { icon: Lock, title: 'Stored in Germany', text: 'Form submissions stay on our own server in Germany.' },
  { icon: Ban, title: 'Never used for marketing', text: 'We do not sell your data or use it for advertising.' },
  { icon: IdCard, title: 'Passport only after confirmation', text: 'Passport and health details are requested only once your trek is confirmed.' },
  { icon: Trash2, title: 'Deleted after 12 months', text: 'Booking form answers are deleted 12 months after your trek and are not in our backups.' },
  { icon: Cookie, title: 'No tracking cookies', text: 'No advertising or analytics cookies; maps and videos load only with your OK.' },
  { icon: Globe, title: 'Your rights, wherever you live', text: 'EU, UK, Australian and US privacy rights are respected.' },
]

const getSections = (email: string): LegalSection[] => [
  {
    id: 'who-we-are',
    icon: ShieldCheck,
    title: 'Who We Are (Data Controller)',
    body: [`Gele Trekking is the data controller for personal data submitted through this website. If you have privacy questions, contact us at **${email}**.`],
  },
  {
    id: 'scope',
    icon: Scale,
    title: 'Scope of This Policy',
    body: ['This policy applies to personal data submitted through:'],
    points: [
      'our **Contact Form** and **Booking Inquiry Form**;',
      'the public **Pre-booking Form**;',
      'the private **Booking Form** we send you once your trek is confirmed.',
    ],
  },
  {
    id: 'what-we-collect',
    icon: UserRound,
    title: 'Personal Data We Collect',
    body: ['What we collect depends on the form you use. We do not ask for card numbers through any of these forms.'],
    points: [
      '**Contact and inquiry forms:** name, email address, phone number if you give one, and your message and trek preferences.',
      '**Pre-booking Form:** your name, contact details, date of birth, gender, nationality, and trek and flight details. We do not ask for passport details at this stage.',
      '**Private Booking Form (only after confirmation):** passport and travel details, health and fitness information including medical conditions and medications, travel insurance details, emergency contact, preferences and your typed signature.',
    ],
  },
  {
    id: 'how-we-use',
    icon: Database,
    title: 'Purpose and Legal Basis',
    body: [
      'We use inquiry data to reply to you, and booking data to arrange your trek, obtain permits, and keep you safe in the mountains. Under the EU and UK GDPR, our legal bases are:',
    ],
    points: [
      '**Article 6(1)(b):** steps at your request before a contract, and performing that contract.',
      '**Article 6(1)(f):** our legitimate interest in communicating with customers.',
      '**Article 9(2)(a), health information:** your explicit consent, given by ticking the health consent box on the Private Booking Form. You can withdraw it at any time by contacting us, although we may then be unable to operate your trek safely.',
    ],
  },
  {
    id: 'storage',
    icon: Lock,
    title: 'Where Your Data Is Stored',
    body: ['Form submissions are stored on our server in Germany. We do not use any of this data for marketing or share it for third-party marketing.'],
    points: [
      'Booking Form and Pre-booking Form answers stay on that server: they are not sent by email and are not included in our backups.',
      'Contact and inquiry messages are also delivered to our staff email inbox so we can reply.',
      'We send you a short confirmation email that does not repeat what you submitted.',
      'When you submit a booking form, a PDF copy is saved to your own device.',
    ],
  },
  {
    id: 'retention',
    icon: CalendarDays,
    title: 'How Long We Keep Your Data',
    body: [
      'We keep personal data only as long as we need it:',
      'You can ask us to delete your booking data earlier at any time, unless we still need it to operate your trek or meet a legal obligation.',
    ],
    points: [
      '**Booking form answers and their PDF:** deleted automatically 12 months after your trek ends, or 18 months after you submitted them if there is no trek end date. After that we keep only your name, contact details, trek and dates as a basic business record.',
      '**Inquiry messages:** kept only as long as reasonably necessary and reviewed regularly.',
    ],
  },
  {
    id: 'processors-transfers',
    icon: Globe,
    title: 'Backups, Service Providers and International Transfers',
    body: ['We use service providers for email, website hosting and spam protection.'],
    points: [
      '**Backups:** encrypted backups of our website content and inquiry messages are stored in Google Drive and kept for up to 12 months. Backups made before 9 November 2026 may still contain booking form data until they expire, no later than November 2027.',
      '**Our team in Nepal:** our team is based in Nepal and accesses your data from there in order to arrange your trek.',
      '**International transfers:** where data is processed outside the EEA/UK, we rely on appropriate safeguards under the EU or UK GDPR or, where applicable, on the necessity of the transfer to perform your booking. For travellers from Australia, the US or elsewhere, this cross-border handling is needed to provide the trek you book with us.',
    ],
  },
  {
    id: 'cookies',
    icon: Cookie,
    title: 'Cookies, Local Storage and External Content',
    body: ['We do not use advertising or analytics cookies.'],
    points: [
      '**Always on (strictly necessary):** protects forms against spam and bots (Cloudflare), keeps administrators signed in, remembers dismissed notices and blog posts you have liked, and stores your cookie choice.',
      '**Maps & videos (optional):** Google Maps on the Contact page and YouTube videos in blog posts stay off until you allow them. These providers may then receive your IP address and set their own cookies, and their own privacy policies apply.',
      '**Google reviews:** fetched and stored by our own server (via Featurable) and shown as part of our page, including reviewer photos, so your browser does not contact Google or Featurable to display them.',
      '**Your choice:** accept all, reject all or customise it in the cookie banner, and change it at any time through Cookie settings at the bottom of every page. It is stored in this browser for up to 6 months, after which we ask again. Withdrawing permission reloads the page to remove content that was already loaded.',
      '**Links to other services:** WhatsApp, Cal.com, Google and Trustpilot open only when you choose to visit them.',
      '**Packing list:** if you request our free packing list, we store your email address (and first name, if given) to provide it. We send trek tips and offers only if you tick the separate opt-in box, and you can ask us at any time to delete your details.',
    ],
  },
  {
    id: 'security',
    icon: ShieldCheck,
    title: 'Security Measures',
    body: [
      'We apply reasonable technical and organisational measures to protect your data, including transport security, access controls, and anti-abuse protections (such as captcha and rate-limiting) on forms.',
    ],
  },
  {
    id: 'gdpr-rights',
    icon: Scale,
    title: 'Your Privacy Rights (EU, UK, Australia and US)',
    body: [
      'Wherever you live, you can ask us what personal data we hold about you, ask us to correct or delete it, and withdraw consent you have given. We do not sell your personal information or share it for targeted advertising.',
      `To make any request, email **${email}** with the subject “Privacy Request”. We may need to verify your identity first and will reply within the time the applicable law requires.`,
    ],
    points: [
      '**European Union and EEA:** under the GDPR you have the right to access, rectify, erase, restrict, object to and request portability of your personal data, and to complain to your local data protection authority.',
      '**United Kingdom:** you have the same rights under the UK GDPR and the Data Protection Act 2018, and can complain to the Information Commissioner’s Office (ICO).',
      '**Australia:** where the Privacy Act 1988 applies, we handle your information in line with the Australian Privacy Principles. You can ask to access or correct it, and if you are not satisfied with our response you can complain to the Office of the Australian Information Commissioner (OAIC).',
      '**United States:** depending on your state (for example California, under the CCPA/CPRA), you may have the right to know what personal information we collect and how we use it, to access, correct or delete it, and to opt out of its sale or sharing. We will not treat you differently for exercising these rights.',
    ],
  },
  {
    id: 'contact-us',
    icon: Mail,
    title: 'Contact and Updates',
    body: [
      `To exercise your privacy rights or ask questions, email **${email}** with the subject “Privacy Request”.`,
      'We may update this policy from time to time. Updated versions are posted on this page with a revised effective date.',
    ],
  },
]

export default async function PrivacyPolicyPage() {
  const email = (await getCachedPublicSettings())?.email?.trim() || CONTACT_EMAIL

  return (
    <LegalDocument
      path="/privacy-policy"
      eyebrow="Legal · Privacy Policy"
      title="Privacy Policy"
      intro="How Gele Trekking handles personal data submitted through our website forms, in line with the EU and UK GDPR principles of lawfulness, transparency and data minimisation, and with Australian and US privacy rights."
      effective="November 2026"
      highlightsTitle="Your privacy at a glance"
      highlights={highlights}
      sections={getSections(email)}
      closing={`If anything in this policy is unclear, or you would like to exercise your rights, email ${email} with the subject “Privacy Request” and we will help.`}
    />
  )
}
