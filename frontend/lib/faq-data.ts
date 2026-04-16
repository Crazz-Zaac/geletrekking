export interface FAQ {
  question: string
  answer: string
  order: number
}

export interface GeneralFAQ {
  heroTitle: string
  heroSubtitle: string
  faqs: FAQ[]
}

export interface TrekFAQ {
  trekSlug: string
  trekTitle: string
  faqs: FAQ[]
}

export const generalFAQ: GeneralFAQ = {
  heroTitle: "Frequently Asked Questions",
  heroSubtitle: "Helpful answers about trekking seasons, permits, difficulty, insurance, and planning your Himalayan adventure.",
  faqs: [
    {
      question: "What is the best trekking season in Nepal?",
      answer: "Spring (March–May) and Autumn (October–November) are the best seasons for clear mountain views and stable weather across most regions.",
      order: 0,
    },
    {
      question: "Do I need prior trekking experience?",
      answer: "Not always. Many routes are beginner-friendly, but a basic fitness level helps. We recommend preparing with regular cardio and day hikes before your trip.",
      order: 1,
    },
    {
      question: "Is travel insurance mandatory?",
      answer: "Yes, travel insurance with high-altitude trekking and emergency helicopter evacuation coverage is mandatory for all our treks.",
      order: 2,
    },
    {
      question: "What permits are required for trekking?",
      answer: "Permit requirements depend on your route. Common permits include TIMS and regional conservation permits. Restricted areas may need special permits.",
      order: 3,
    },
    {
      question: "Can I book a private trek?",
      answer: "Yes. We offer both fixed-group departures and private trips with flexible dates, pace, and itinerary customizations.",
      order: 4,
    },
    {
      question: "How difficult are tea house treks?",
      answer: "Tea house treks vary from easy to challenging. Difficulty usually depends on altitude, duration, and daily walking hours. We help match you to the right route.",
      order: 5,
    },
  ],
}

export const trekFAQs: TrekFAQ[] = [
  {
    trekSlug: "everest-base-camp",
    trekTitle: "Everest Base Camp",
    faqs: [
      {
        question: "What is the altitude of Everest Base Camp?",
        answer: "Everest Base Camp is located at 5,364 meters (17,598 feet) above sea level.",
        order: 0,
      },
      {
        question: "How long does it take to trek to Everest Base Camp?",
        answer: "The typical trek takes 12-14 days including the flight to Lukla and acclimatization days.",
        order: 1,
      },
      {
        question: "Do I need climbing experience for EBC trek?",
        answer: "No, the trek to Everest Base Camp is not a mountaineering expedition. It is a trekking route that does not require climbing skills or equipment.",
        order: 2,
      },
      {
        question: "What is the weather like at Everest Base Camp?",
        answer: "Weather is extremely variable. Even in summer, temperatures can drop to -10°C at night. Winter sees temperatures as low as -40°C. Bring proper insulation.",
        order: 3,
      },
    ],
  },
  {
    trekSlug: "annapurna-circuit",
    trekTitle: "Annapurna Circuit",
    faqs: [
      {
        question: "What is the highest point on Annapurna Circuit?",
        answer: "Thorung La Pass is the highest point at 5,416 meters (17,769 feet).",
        order: 0,
      },
      {
        question: "How many days does the Annapurna Circuit take?",
        answer: "The standard trek takes 15-17 days, though longer options (18-21 days) allow for better acclimatization.",
        order: 1,
      },
      {
        question: "Is the Annapurna Circuit difficult?",
        answer: "It is considered challenging due to high altitude, long daily walks, and the difficulty of Thorung La Pass. Good fitness is essential.",
        order: 2,
      },
      {
        question: "What is special about the Annapurna Circuit?",
        answer: "The circuit offers incredible diversity—subtropical forests, rhododendron groves, glaciers, and Tibetan plateau landscapes. It crosses two major valleys and provides diverse cultural experiences.",
        order: 3,
      },
      {
        question: "Can I trek Annapurna Circuit in winter?",
        answer: "Winter trekking is possible but challenging. Snow blocks Thorung La Pass from December to February. Spring (March-May) and Autumn (September-November) are best.",
        order: 4,
      },
    ],
  },
  {
    trekSlug: "langtang-valley",
    trekTitle: "Langtang Valley",
    faqs: [
      {
        question: "How long is the Langtang Valley trek?",
        answer: "The trek typically takes 6-8 days from Kathmandu, making it one of the most accessible high-altitude treks near the city.",
        order: 0,
      },
      {
        question: "What is the highest altitude on Langtang trek?",
        answer: "Kyanjin Ri is the highest viewpoint at 4,773 meters (15,658 feet). The main trek route reaches around 3,500 meters.",
        order: 1,
      },
      {
        question: "Is Langtang Valley suitable for beginners?",
        answer: "Yes, Langtang Valley is one of the most beginner-friendly high-altitude treks. The gradual altitude gain makes it suitable for those new to trekking.",
        order: 2,
      },
      {
        question: "What wildlife can I see on Langtang trek?",
        answer: "You may encounter red pandas, snow leopards (rare), musk deer, and various bird species. The valley is a biodiversity hotspot.",
        order: 3,
      },
      {
        question: "When is the best time to trek Langtang?",
        answer: "Spring (March-May) and Autumn (September-November) offer the best weather and mountain visibility.",
        order: 4,
      },
    ],
  },
]

export function getTrekFAQBySlug(slug: string): TrekFAQ | undefined {
  return trekFAQs.find((trek) => trek.trekSlug === slug)
}
