/** FAQ topics shown as tabs on /faq. Keep in sync with FAQ_CATEGORIES in backend/controllers/faqController.js. */
export const FAQ_TOPICS = [
  { id: 'before', label: 'Before you go' },
  { id: 'booking', label: 'Booking & payments' },
  { id: 'trail', label: 'On the trail' },
  { id: 'health', label: 'Health & safety' },
  { id: 'team', label: 'Guides & porters' },
] as const

export type FaqTopicId = (typeof FAQ_TOPICS)[number]['id']
export type FaqCategory = FaqTopicId | ''

const GUESS_RULES: Array<[RegExp, FaqTopicId]> = [
  [/book|deposit|pay|price|cost|cancel|refund|reschedul|private|family|age|deadline/i, 'booking'],
  [/altitude|health|sick|insurance|rescue|evacuat|safe|vaccin|medic/i, 'health'],
  [/guide|porter|tip|solo|female|who will/i, 'team'],
  [/water|toilet|teahouse|tea house|lodg|food|eat|charg|wifi|wi-fi|shower|flight|lukla/i, 'trail'],
  [/visa|pack|season|permit|phone|sim|fitness|experience|beginner|airport/i, 'before'],
]

/** The admin-chosen topic, or a best guess from the question when none is set. */
export function faqTopicOf(item: { question: string; category?: string }): FaqTopicId {
  if (item.category && FAQ_TOPICS.some((topic) => topic.id === item.category)) return item.category as FaqTopicId
  return GUESS_RULES.find(([pattern]) => pattern.test(item.question))?.[1] ?? 'before'
}

/** Stable anchor for a question, e.g. "Do I need travel insurance?" → "do-i-need-travel-insurance". */
export function faqAnchor(question: string) {
  return question
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

/**
 * Draft answers the admin can add with one click ("Add suggested questions").
 * Booking terms follow Gele Trekking's current rules; payment reflects the current
 * practice of paying on arrival and should be updated if a deposit is introduced.
 */
export const SUGGESTED_FAQS: Array<{ question: string; answer: string; category: FaqTopicId }> = [
  {
    category: 'before',
    question: 'When is the best time to trek in Nepal?',
    answer:
      'The most popular seasons are **spring (March to May)** and **autumn (late September to November)**, with stable weather and clear mountain views.\nWinter (December to February) is quieter and good for lower treks, but high passes can be snowy and cold. The monsoon (June to August) brings rain to most regions; rain-shadow areas such as **Upper Mustang** are a good choice then.\nNot sure which month suits your trek? [Ask us](/contact) and we will advise.',
  },
  {
    category: 'before',
    question: 'Do I need trekking experience or a high level of fitness?',
    answer:
      'No technical climbing experience is needed for our treks. You should be comfortable walking **5 to 7 hours a day** on uneven trails, often uphill.\nRegular walking, hiking, stair climbing or cycling for a few weeks before you travel makes a big difference. Each trek page shows a difficulty level, and we are happy to suggest a route that matches your fitness.',
  },
  {
    category: 'before',
    question: 'What permits do I need, and do you arrange them?',
    answer:
      'Every trekking region needs its own permits, for example national park or conservation area permits, and **special restricted-area permits** for places like Upper Mustang and Manaslu.\nWe arrange all the permits for your itinerary. We only need a copy of your passport and passport-size photos. Please note that permits are issued by the government and may be non-refundable once issued.',
  },
  {
    category: 'booking',
    question: 'How do I book a trek with Gele Trekking?',
    answer:
      'Send us your preferred trek, dates and group size through the [booking form](/book), [WhatsApp](https://wa.me/9779843988164) or a [free 15-minute call](https://cal.com/gele-trekking-d5slwj/15min). We will confirm availability, the final itinerary and the price in writing.\nPlease book **at least one month before** your trek so we have time to arrange permits, flights and accommodation.',
  },
  {
    category: 'booking',
    question: 'When and how do I pay?',
    answer:
      'At the moment you pay for your trek **after you arrive in Nepal**, before the trek starts. No advance payment is required to reserve your place.\nWe will confirm the total price, currency and accepted payment methods in writing before you travel. See our [terms and conditions](/terms) for details.',
  },
  {
    category: 'booking',
    question: 'What is your cancellation and rescheduling policy?',
    answer:
      'We always try to **move your dates** rather than cancel your trip.\n- **Cancellation:** accepted up to **3 months before** the trip. A small fee is deducted to cover currency exchange and transaction charges.\n- **Rescheduling:** you can move your trip to new dates **within one year**, at the same price.\n- **Last-minute bookings** cannot be cancelled or refunded.\nFull details are in our [terms and conditions](/terms).',
  },
  {
    category: 'booking',
    question: 'Is there an age limit for joining a trek?',
    answer:
      'Trekkers joining on their own should be **between 18 and 70 years old**. There is **no age limit for families** booking together. We will tailor the pace and itinerary to everyone in the group.',
  },
  {
    category: 'booking',
    question: 'What is included in the trek price?',
    answer:
      'Every trek page lists exactly what is **included and not included**. It usually covers your guide, porter, permits, teahouse accommodation and the transport in the itinerary. International flights, travel insurance, visa fees and personal expenses are not included.\nIf anything is unclear, [ask us](/contact) before you book.',
  },
  {
    category: 'trail',
    question: 'Where do we stay on the trek?',
    answer:
      'Most of our treks use **teahouses**: family-run mountain lodges with simple twin rooms, blankets and a shared dining room with a stove. Higher up, rooms are more basic and bathrooms are usually shared.\nA warm sleeping bag is recommended. See our [packing list](/packing-list) for what to bring.',
  },
  {
    category: 'trail',
    question: 'What food is available on the trail?',
    answer:
      'Teahouses serve a good choice of meals, including the Nepali classic **dal bhat** (rice, lentil soup and vegetables, usually with free refills), noodles, pasta, potatoes, eggs, soups and porridge. Vegetarian meals are easy to find.\nLet us know about allergies or special diets when you book.',
  },
  {
    category: 'trail',
    question: 'Can I charge my phone and use Wi-Fi on the trek?',
    answer:
      'Most teahouses offer charging and Wi-Fi **for a small fee**, which usually rises with altitude. Connections can be slow or unavailable in remote areas.\nWe recommend bringing a **power bank** and a local SIM card for mobile data where there is coverage.',
  },
  {
    category: 'trail',
    question: 'What happens if my Lukla flight is delayed or cancelled?',
    answer:
      'Flights to and from Lukla (Everest region) depend on mountain weather and are **often delayed**. We rebook you on the next available flight and adjust the itinerary where possible.\nWe recommend keeping **one or two spare days** at the end of your trip before your international flight. Extra costs caused by delays, such as additional hotel nights, are not included in the trek price.',
  },
  {
    category: 'health',
    question: 'How do you deal with altitude sickness?',
    answer:
      'Our itineraries include **acclimatisation days** and gradual ascents. Your guide checks on you every day and watches for early signs such as headache, nausea or loss of appetite.\nIf symptoms get worse, the safest treatment is to **descend**. In serious cases we arrange evacuation, which is why your travel insurance must cover helicopter rescue. Read more on our [safety page](/safety).',
  },
  {
    category: 'team',
    question: 'Who will guide my trek?',
    answer:
      'Most of our treks are led by our founder, **Gele Bishokarma**, who has worked in the Himalaya since 1998 and has been a professional trek leader since 2004. You can [meet him on our About page](/about) or [book a free call](https://cal.com/gele-trekking-d5slwj/15min) before you decide.',
  },
  {
    category: 'team',
    question: 'Why do you have one porter for every guest?',
    answer:
      'Our **one guest, one porter** policy keeps every porter’s load lighter and safer. Carrying heavy loads, often on the head, is a serious health risk for porters in Nepal, and we want to change that.\nIt also means you only carry a light daypack. Please pack your main bag within the weight limit we give you when you book.',
  },
  {
    category: 'team',
    question: 'Is trekking with you suitable for solo and female travellers?',
    answer:
      'Yes. Many of our guests travel on their own. You will have your own guide and porter, and we can arrange a **private trek** on your dates. If you have any concerns, [talk to us](/contact) and we will answer them honestly.',
  },
]
