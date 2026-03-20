export interface Trek {
  id: string
  slug: string
  title: string
  region: 'Everest' | 'Annapurna' | 'Langtang' | 'Mustang' | 'Manaslu' | 'Other'
  duration: number
  difficulty: 'Easy' | 'Moderate' | 'Strenuous' | 'Challenging'
  maxAltitude: number
  price: number
  groupSize: string
  bestSeason: string
  transportation: string
  tourType: string
  shortDescription: string
  fullDescription: string
  image: string
  highlights: string[]
  itinerary: ItineraryDay[]
  includes: string[]
  excludes: string[]
  faqs: FAQ[]
  gallery: string[]
  mapEmbed?: string
  hasOffer?: boolean
  offerType?: string
  offerDescription?: string
  offerDiscountPercent?: number
  originalPrice?: number
  discountedPrice?: number
  // used to fetch live weather from Open-Meteo on the trek detail page
  latitude?: number
  longitude?: number
  locationName?: string
}

export interface ItineraryDay {
  day: number
  title: string
  description: string
  altitude?: number
  distance?: string
  accommodation: string
}

export interface FAQ {
  question: string
  answer: string
}

export const treks: Trek[] = [
  {
    id: '1',
    slug: 'everest-base-camp',
    title: 'Everest Base Camp Trek',
    region: 'Everest',
    duration: 14,
    difficulty: 'Strenuous',
    maxAltitude: 5364,
    price: 1299,
    groupSize: '2–12',
    bestSeason: 'Mar–May, Oct–Nov',
    transportation: 'Fly Kathmandu–Lukla',
    tourType: 'Group / Private',
    shortDescription:
      'Trek to the foot of the world\'s highest peak through Sherpa villages, monasteries and spectacular Himalayan scenery.',
    fullDescription:
      'The Everest Base Camp Trek is one of the world\'s most iconic adventures, taking you deep into the heart of the Khumbu region. You\'ll walk in the footsteps of legendary mountaineers like Edmund Hillary and Tenzing Norgay, passing through charming Sherpa villages, ancient Buddhist monasteries, and across high suspension bridges draped in prayer flags. The trail climbs through rhododendron forests and yak pastures to the barren, icy landscape of Gorak Shep, before the final push to Everest Base Camp itself at 5,364m. En route, a side trip to Kala Patthar (5,545m) rewards you with unparalleled sunrise views of Everest.',
    image: '/images/everest-base-camp.jpg',
    highlights: [
      'Stand at Everest Base Camp (5,364m)',
      'Sunrise views from Kala Patthar',
      'Explore Namche Bazaar Sherpa market',
      'Visit Tengboche Monastery',
      'Cross iconic suspension bridges with prayer flags',
      'Trek through Sagarmatha National Park (UNESCO)',
    ],
    itinerary: [
      { day: 1, title: 'Arrive Kathmandu', description: 'Welcome briefing, gear check and overnight in Kathmandu hotel.', altitude: 1400, accommodation: 'Hotel in Kathmandu' },
      { day: 2, title: 'Fly Kathmandu to Lukla, trek to Phakding', description: 'Scenic 35-minute flight to Lukla (2,860m), begin trek descending to Phakding.', altitude: 2610, distance: '8 km', accommodation: 'Teahouse in Phakding' },
      { day: 3, title: 'Phakding to Namche Bazaar', description: 'Trek through Sagarmatha National Park entry gate, cross suspension bridges, steep climb to Namche.', altitude: 3440, distance: '11 km', accommodation: 'Teahouse in Namche' },
      { day: 4, title: 'Acclimatization Day — Namche Bazaar', description: 'Rest and acclimatize. Optional hike to Everest View Hotel for first Everest glimpse.', altitude: 3440, accommodation: 'Teahouse in Namche' },
      { day: 5, title: 'Namche to Tengboche', description: 'Trek past Kyangjuma to Tengboche Monastery, stunning Ama Dablam views.', altitude: 3860, distance: '10 km', accommodation: 'Teahouse in Tengboche' },
      { day: 6, title: 'Tengboche to Dingboche', description: 'Descend through rhododendron forests, cross Imja Khola, climb to Dingboche.', altitude: 4410, distance: '12 km', accommodation: 'Teahouse in Dingboche' },
      { day: 7, title: 'Acclimatization Day — Dingboche', description: 'Hike above Dingboche to acclimatize. Rest afternoon.', altitude: 4410, accommodation: 'Teahouse in Dingboche' },
      { day: 8, title: 'Dingboche to Lobuche', description: 'Trek up the Khumbu valley past Thukla to Lobuche.', altitude: 4940, distance: '8 km', accommodation: 'Teahouse in Lobuche' },
      { day: 9, title: 'Lobuche to Gorak Shep, Everest Base Camp', description: 'Morning hike to Gorak Shep, then onward to Everest Base Camp (5,364m). Return to Gorak Shep.', altitude: 5364, distance: '13 km', accommodation: 'Teahouse in Gorak Shep' },
      { day: 10, title: 'Kala Patthar, descend to Pheriche', description: 'Pre-dawn hike to Kala Patthar (5,545m) for sunrise over Everest. Descend to Pheriche.', altitude: 5545, distance: '15 km', accommodation: 'Teahouse in Pheriche' },
      { day: 11, title: 'Pheriche to Namche', description: 'Longer descent day through the Khumbu valley back to Namche.', altitude: 3440, distance: '20 km', accommodation: 'Teahouse in Namche' },
      { day: 12, title: 'Namche to Lukla', description: 'Final full trekking day, descend back through forest to Lukla.', altitude: 2860, distance: '19 km', accommodation: 'Teahouse in Lukla' },
      { day: 13, title: 'Fly Lukla to Kathmandu', description: 'Morning flight back to Kathmandu. Farewell dinner with the team.', altitude: 1400, accommodation: 'Hotel in Kathmandu' },
      { day: 14, title: 'Departure', description: 'Transfer to the airport for your onward journey. Trek complete!', altitude: 1400, accommodation: 'Hotel / departure' },
    ],
    includes: [
      'All airport and hotel transfers',
      'Domestic flights (Kathmandu–Lukla–Kathmandu)',
      'Sagarmatha National Park permit and TIMS card',
      'Experienced English-speaking guide',
      'Porter service (1 porter per 2 trekkers)',
      'Teahouse accommodation throughout the trek',
      'Breakfast and dinner during the trek',
      'First-aid kit and emergency oxygen',
      'Welcome/farewell dinner in Kathmandu',
    ],
    excludes: [
      'International flights',
      'Nepal visa fee (~$50)',
      'Lunch and snacks on trek',
      'Personal travel insurance (mandatory)',
      'Personal gear and equipment',
      'Tips for guides and porters',
      'Extra accommodation in Kathmandu',
    ],
    faqs: [
      { question: 'Do I need prior trekking experience?', answer: 'No technical climbing skills are required, but you should be physically fit and comfortable with long walking days (5–8 hours). Prior hiking experience is beneficial.' },
      { question: 'What is the best season for EBC Trek?', answer: 'Spring (March–May) and Autumn (October–November) offer the best weather windows with clear skies and stable conditions.' },
      { question: 'Is altitude sickness a concern?', answer: 'Yes. We include acclimatization days and our guides are trained in altitude sickness prevention. We carry emergency oxygen and can arrange helicopter evacuation if needed.' },
      { question: 'Can I do this trek solo?', answer: 'Yes, we offer both group and private departures. Private treks can depart on any agreed date.' },
    ],
    gallery: [
      '/images/everest-base-camp.jpg',
      '/images/hero-himalaya.jpg',
      '/images/region-everest.jpg',
    ],
    latitude: 27.8069,
    longitude: 86.7144,
    locationName: 'Namche Bazaar',
  },
  {
    id: '2',
    slug: 'annapurna-circuit',
    title: 'Annapurna Circuit Trek',
    region: 'Annapurna',
    duration: 16,
    difficulty: 'Moderate',
    maxAltitude: 5416,
    price: 1099,
    groupSize: '2–14',
    bestSeason: 'Mar–May, Oct–Nov',
    transportation: 'Drive Kathmandu–Besisahar',
    tourType: 'Group / Private',
    shortDescription:
      'One of the world\'s greatest treks, circling the entire Annapurna massif over Thorong La Pass with stunning landscape diversity.',
    fullDescription:
      'The Annapurna Circuit is widely regarded as one of the greatest treks in the world. This classic route circumnavigates the entire Annapurna massif, crossing the dramatic Thorong La Pass (5,416m) and passing through an extraordinary variety of landscapes — from subtropical lowlands and terraced rice paddies to alpine meadows and high-altitude desert. The trail passes through the sacred Muktinath temple and the charming town of Manang, offering deep cultural immersion in both Hindu and Buddhist traditions. The diversity of terrain, culture, and scenery makes this an unforgettable 16-day journey.',
    image: '/images/annapurna-circuit.jpg',
    highlights: [
      'Cross Thorong La Pass (5,416m)',
      'Visit Muktinath sacred temple',
      'Stunning Gangapurna lake views',
      'Diverse landscape from subtropical to alpine',
      'Traditional Gurung and Magar villages',
      'Pokhara lakeside finish',
    ],
    itinerary: [
      { day: 1, title: 'Arrive Kathmandu', description: 'Welcome briefing and orientation.', altitude: 1400, accommodation: 'Hotel Kathmandu' },
      { day: 2, title: 'Drive Kathmandu to Besisahar', description: 'Scenic 7-hour drive to the trek starting point.', altitude: 760, accommodation: 'Teahouse Besisahar' },
      { day: 3, title: 'Besisahar to Bahundanda', description: 'Begin trekking through terraced fields and small villages.', altitude: 1310, distance: '12 km', accommodation: 'Teahouse Bahundanda' },
      { day: 4, title: 'Bahundanda to Chame', description: 'Enter the Marsyangdi Valley, pass through Chamje and Tal.', altitude: 2670, distance: '20 km', accommodation: 'Teahouse Chame' },
      { day: 5, title: 'Chame to Pisang', description: 'Stunning views of Annapurna II; apple orchards; enter high-altitude pine forests.', altitude: 3300, distance: '16 km', accommodation: 'Teahouse Pisang' },
      { day: 6, title: 'Pisang to Manang', description: 'Walk through Barge and Ngawal with views of Gangapurna and Tilicho.', altitude: 3500, distance: '22 km', accommodation: 'Teahouse Manang' },
      { day: 7, title: 'Acclimatization — Manang', description: 'Rest day; hike to Ice Lake for acclimatization.', altitude: 3500, accommodation: 'Teahouse Manang' },
      { day: 8, title: 'Manang to Yak Kharka', description: 'Trek above treeline through open yak pastures.', altitude: 4018, distance: '10 km', accommodation: 'Teahouse Yak Kharka' },
      { day: 9, title: 'Yak Kharka to Thorong Phedi', description: 'Short but steep day, prepare for early morning pass crossing.', altitude: 4450, distance: '7 km', accommodation: 'Teahouse Thorong Phedi' },
      { day: 10, title: 'Cross Thorong La Pass (5,416m) to Muktinath', description: 'Pre-dawn start for the high pass crossing, descend to sacred Muktinath.', altitude: 5416, distance: '18 km', accommodation: 'Teahouse Muktinath' },
      { day: 11, title: 'Muktinath to Marpha', description: 'Walk down the Kali Gandaki gorge through Kagbeni.', altitude: 2670, distance: '22 km', accommodation: 'Teahouse Marpha' },
      { day: 12, title: 'Marpha to Kalopani', description: 'Trek along the world\'s deepest gorge beneath Dhaulagiri and Annapurna.', altitude: 2530, distance: '20 km', accommodation: 'Teahouse Kalopani' },
      { day: 13, title: 'Kalopani to Tatopani', description: 'Descend to Tatopani hot springs — perfect for tired legs!', altitude: 1190, distance: '18 km', accommodation: 'Teahouse Tatopani' },
      { day: 14, title: 'Tatopani to Ghorepani', description: 'Steep climb through rhododendron forests.', altitude: 2860, distance: '15 km', accommodation: 'Teahouse Ghorepani' },
      { day: 15, title: 'Poon Hill sunrise, trek to Nayapul, drive Pokhara', description: 'Pre-dawn hike to Poon Hill (3,210m) for Annapurna sunrise panorama. Drive to Pokhara.', altitude: 820, accommodation: 'Hotel Pokhara' },
      { day: 16, title: 'Fly Pokhara to Kathmandu, departure', description: 'Morning flight back to Kathmandu for international departure.', altitude: 1400, accommodation: 'Hotel / departure' },
    ],
    includes: [
      'All airport and hotel transfers',
      'Domestic flight (Pokhara–Kathmandu)',
      'ACAP permit and TIMS card',
      'Experienced English-speaking guide',
      'Porter service',
      'Teahouse accommodation',
      'Breakfast and dinner during the trek',
    ],
    excludes: [
      'International flights',
      'Nepal visa fee',
      'Lunch on trek',
      'Personal travel insurance (mandatory)',
      'Tips for guides and porters',
    ],
    faqs: [
      { question: 'How difficult is the Annapurna Circuit?', answer: 'Rated Moderate to Strenuous. The main challenge is Thorong La Pass at 5,416m. Good physical fitness and acclimatization are essential.' },
      { question: 'Is the full circuit still open?', answer: 'Yes. While road construction has shortened some sections, the high-altitude portions remain pristine trail.' },
      { question: 'Can I combine this with Poon Hill?', answer: 'Absolutely — we include the Poon Hill sunrise on day 15 as a highlight of the circuit.' },
    ],
    gallery: [
      '/images/annapurna-circuit.jpg',
      '/images/region-annapurna.jpg',
    ],
    latitude: 28.2096,
    longitude: 83.9856,
    locationName: 'Pokhara',
  },
  {
    id: '3',
    slug: 'langtang-valley',
    title: 'Langtang Valley Trek',
    region: 'Langtang',
    duration: 10,
    difficulty: 'Moderate',
    maxAltitude: 4984,
    price: 699,
    groupSize: '2–12',
    bestSeason: 'Mar–May, Oct–Nov',
    transportation: 'Drive Kathmandu–Syabrubesi',
    tourType: 'Group / Private',
    shortDescription:
      'Often called the "Valley of Glaciers," Langtang offers pristine wilderness just 3 hours from Kathmandu, with Tibetan culture and stunning peaks.',
    fullDescription:
      'The Langtang Valley Trek offers a rich wilderness experience remarkably close to Kathmandu. Called the "Valley of Glaciers," this Himalayan valley features stunning snow-capped peaks, ancient Tamang and Tibetan Buddhist culture, and a diverse ecosystem within the Langtang National Park. The trek visits the cheese factory at Kyanjin Gompa, a thriving yak-herding community, and offers the opportunity to summit Tserko Ri (4,984m) for breathtaking panoramic views. This is an ideal first Himalayan trek for those new to high-altitude adventure.',
    image: '/images/langtang-valley.jpg',
    highlights: [
      'Trek through Langtang National Park',
      'Visit Kyanjin Gompa monastery',
      'Summit Tserko Ri viewpoint (4,984m)',
      'Traditional Tamang village culture',
      'Yak cheese factory visit',
      'Gosaikunda lake option available',
    ],
    itinerary: [
      { day: 1, title: 'Arrive Kathmandu', description: 'Welcome dinner and briefing.', altitude: 1400, accommodation: 'Hotel Kathmandu' },
      { day: 2, title: 'Drive to Syabrubesi', description: '5-hour scenic drive to trek starting point.', altitude: 1550, accommodation: 'Teahouse Syabrubesi' },
      { day: 3, title: 'Syabrubesi to Lama Hotel', description: 'Enter Langtang National Park, forest trail along Langtang Khola river.', altitude: 2470, distance: '13 km', accommodation: 'Teahouse Lama Hotel' },
      { day: 4, title: 'Lama Hotel to Langtang Village', description: 'Open valley views, Langtang range panoramas.', altitude: 3430, distance: '12 km', accommodation: 'Teahouse Langtang Village' },
      { day: 5, title: 'Langtang to Kyanjin Gompa', description: 'Arrive at the iconic gompa, visit cheese factory.', altitude: 3870, distance: '7 km', accommodation: 'Teahouse Kyanjin Gompa' },
      { day: 6, title: 'Tserko Ri Hike (4,984m)', description: 'Optional but highly recommended summit hike for 360-degree Himalayan views.', altitude: 4984, accommodation: 'Teahouse Kyanjin Gompa' },
      { day: 7, title: 'Kyanjin to Lama Hotel', description: 'Retrace steps down the valley.', altitude: 2470, distance: '19 km', accommodation: 'Teahouse Lama Hotel' },
      { day: 8, title: 'Lama Hotel to Syabrubesi', description: 'Final trekking day, descend to Syabrubesi.', altitude: 1550, distance: '13 km', accommodation: 'Teahouse Syabrubesi' },
      { day: 9, title: 'Drive back to Kathmandu', description: 'Return drive to Kathmandu. Farewell dinner.', altitude: 1400, accommodation: 'Hotel Kathmandu' },
      { day: 10, title: 'Departure', description: 'Transfer to airport.', altitude: 1400, accommodation: 'Hotel / departure' },
    ],
    includes: [
      'All airport and hotel transfers',
      'Private vehicle Kathmandu–Syabrubesi–Kathmandu',
      'Langtang National Park permit and TIMS card',
      'English-speaking guide',
      'Porter service',
      'Teahouse accommodation',
      'Breakfast and dinner on trek',
    ],
    excludes: [
      'International flights',
      'Nepal visa',
      'Lunch on trek',
      'Travel insurance (mandatory)',
      'Tips',
    ],
    faqs: [
      { question: 'Is Langtang suitable for beginners?', answer: 'Yes, Langtang is one of the best options for first-time Himalayan trekkers. The trail is well-marked and teahouses are plentiful.' },
      { question: 'How close is it to Kathmandu?', answer: 'Just 5 hours by road — making it perfect if you have limited time or want a quick escape to the mountains.' },
    ],
    gallery: [
      '/images/langtang-valley.jpg',
      '/images/region-langtang.jpg',
    ],
    latitude: 28.2122,
    longitude: 85.5636,
    locationName: 'Kyanjin Gompa',
  },
  {
    id: '4',
    slug: 'manaslu-circuit',
    title: 'Manaslu Circuit Trek',
    region: 'Manaslu',
    duration: 18,
    difficulty: 'Challenging',
    maxAltitude: 5160,
    price: 1499,
    groupSize: '2–10',
    bestSeason: 'Sep–Nov, Mar–May',
    transportation: 'Drive Kathmandu–Sotikhola',
    tourType: 'Private / Small Group',
    shortDescription:
      'Remote and untouched, the Manaslu Circuit takes you around the world\'s 8th highest peak through restricted wilderness accessible only to serious trekkers.',
    fullDescription:
      'The Manaslu Circuit Trek circles the world\'s 8th highest mountain (8,163m) through some of Nepal\'s most pristine and remote terrain. As a restricted area permit trek, it offers a rare off-the-beaten-path experience with far fewer trekkers than Everest or Annapurna. The route passes through diverse ecosystems — from subtropical lowlands to high alpine zones — while offering deep cultural immersion with Tibetan Buddhist communities. The crossing of Larkya La Pass (5,160m) is one of the most dramatic high-pass experiences in Nepal.',
    image: '/images/manaslu-circuit.jpg',
    highlights: [
      'Cross Larkya La Pass (5,160m)',
      'Restricted area — pristine wilderness',
      'Tibetan Buddhist culture in remote villages',
      'Views of Manaslu (8,163m)',
      'Tsum Valley extension available',
      'Very few trekkers — true off-the-beaten-path',
    ],
    itinerary: [
      { day: 1, title: 'Arrive Kathmandu', description: 'Briefing and permit processing.', altitude: 1400, accommodation: 'Hotel Kathmandu' },
      { day: 2, title: 'Drive to Sotikhola', description: '7-hour drive to trek start.', altitude: 700, accommodation: 'Teahouse Sotikhola' },
      { day: 3, title: 'Sotikhola to Machha Khola', description: 'Trek through forest and villages along Budhi Gandaki.', altitude: 930, distance: '13 km', accommodation: 'Teahouse Machha Khola' },
      { day: 4, title: 'Machha Khola to Jagat', description: 'Dramatic gorge scenery and waterfalls.', altitude: 1410, distance: '22 km', accommodation: 'Teahouse Jagat' },
      { day: 5, title: 'Jagat to Deng', description: 'Enter restricted area, cultural transition to Tibetan-influenced villages.', altitude: 1860, distance: '19 km', accommodation: 'Teahouse Deng' },
      { day: 6, title: 'Deng to Namrung', description: 'Trek through Ghap with first Manaslu views.', altitude: 2630, distance: '18 km', accommodation: 'Teahouse Namrung' },
      { day: 7, title: 'Namrung to Samagaon', description: 'Pass through pine forests, spectacular Manaslu views.', altitude: 3530, distance: '20 km', accommodation: 'Teahouse Samagaon' },
      { day: 8, title: 'Acclimatization — Samagaon', description: 'Hike to Manaslu Base Camp viewpoint for acclimatization.', altitude: 3530, accommodation: 'Teahouse Samagaon' },
      { day: 9, title: 'Samagaon to Samdo', description: 'Short day, high altitude adjustment.', altitude: 3875, distance: '7 km', accommodation: 'Teahouse Samdo' },
      { day: 10, title: 'Samdo to Dharamsala', description: 'Prepare for pass crossing at high camp.', altitude: 4460, distance: '8 km', accommodation: 'Teahouse Dharamsala' },
      { day: 11, title: 'Cross Larkya La (5,160m), descend to Bimthang', description: 'Most challenging day — pre-dawn start for dramatic high pass crossing.', altitude: 5160, distance: '20 km', accommodation: 'Teahouse Bimthang' },
      { day: 12, title: 'Bimthang to Tilije', description: 'Descend through yak pastures and alpine meadows.', altitude: 2300, distance: '15 km', accommodation: 'Teahouse Tilije' },
      { day: 13, title: 'Tilije to Dharapani, drive Besisahar', description: 'Trek out to roadhead, drive to Besisahar.', altitude: 760, accommodation: 'Hotel Besisahar' },
      { day: 14, title: 'Drive Besisahar to Kathmandu', description: 'Return to Kathmandu. Farewell dinner.', altitude: 1400, accommodation: 'Hotel Kathmandu' },
    ],
    includes: [
      'Restricted Area Permit',
      'Manaslu Conservation Area permit',
      'All transfers and ground transportation',
      'Expert guide with Manaslu experience',
      'Porter service',
      'Teahouse accommodation',
      'Breakfast and dinner on trek',
    ],
    excludes: [
      'International flights',
      'Nepal visa',
      'Lunch on trek',
      'Mandatory travel insurance',
      'Tips',
    ],
    faqs: [
      { question: 'Is a special permit required?', answer: 'Yes — the Manaslu Circuit requires a Restricted Area Permit (approx. $100 USD) in addition to the Manaslu Conservation Area Permit. We handle all permit processing for you.' },
      { question: 'How remote is the Manaslu Circuit?', answer: 'Very remote. Tea houses are basic and phone signal is limited. This is part of its appeal — genuine off-the-beaten-path Himalayan adventure.' },
    ],
    gallery: [
      '/images/manaslu-circuit.jpg',
    ],
    latitude: 28.5833,
    longitude: 84.9167,
    locationName: 'Samagaon',
  },
  {
    id: '5',
    slug: 'upper-mustang',
    title: 'Upper Mustang Trek',
    region: 'Mustang',
    duration: 14,
    difficulty: 'Moderate',
    maxAltitude: 4200,
    price: 2199,
    groupSize: '2–10',
    bestSeason: 'May–Oct (open year-round)',
    transportation: 'Fly Kathmandu–Pokhara–Jomsom',
    tourType: 'Private / Small Group',
    shortDescription:
      'Journey into the ancient forbidden Kingdom of Lo, a hidden Tibetan plateau with medieval walled cities, cave monasteries, and otherworldly landscapes.',
    fullDescription:
      'Upper Mustang, the former Kingdom of Lo, is one of Nepal\'s most unique and mystical destinations. This high-altitude rain shadow desert, culturally and geographically more Tibetan than Nepali, was closed to outsiders until 1992. Its ancient walled capital Lo Manthang, cave monasteries dating back to the 15th century, and dramatic ochre and crimson cliffs make it feel like stepping back in time. As a restricted area, it sees far fewer visitors than other Nepal trekking regions. The landscape is truly otherworldly — reminiscent of the Tibetan plateau with its wind-carved canyons and mani walls.',
    image: '/images/upper-mustang.jpg',
    highlights: [
      'Explore Lo Manthang medieval walled city',
      'Cave monasteries and ancient frescoes',
      'Dramatic Tibetan plateau landscapes',
      'Rain shadow region — can trek in monsoon',
      'Restricted area — limited trekkers',
      'Chhoser cave monastery complex',
    ],
    itinerary: [
      { day: 1, title: 'Arrive Kathmandu', description: 'Briefing and permit processing.', altitude: 1400, accommodation: 'Hotel Kathmandu' },
      { day: 2, title: 'Fly to Pokhara, then Jomsom', description: 'Scenic flights into the heart of Mustang.', altitude: 2720, accommodation: 'Hotel Jomsom' },
      { day: 3, title: 'Jomsom to Kagbeni', description: 'Trek through Kali Gandaki valley to Mustang gateway.', altitude: 2810, distance: '8 km', accommodation: 'Teahouse Kagbeni' },
      { day: 4, title: 'Kagbeni to Chele', description: 'Enter Upper Mustang restricted area, dramatic landscape begins.', altitude: 3050, distance: '15 km', accommodation: 'Teahouse Chele' },
      { day: 5, title: 'Chele to Syangboche', description: 'Traverse wind-carved canyons and red cliffs.', altitude: 3800, distance: '18 km', accommodation: 'Teahouse Syangboche' },
      { day: 6, title: 'Syangboche to Ghami', description: 'Long mani wall and Ghami monastery visit.', altitude: 3520, distance: '16 km', accommodation: 'Teahouse Ghami' },
      { day: 7, title: 'Ghami to Tsarang', description: 'Ancient Tsarang fortress and monastery.', altitude: 3740, distance: '14 km', accommodation: 'Teahouse Tsarang' },
      { day: 8, title: 'Tsarang to Lo Manthang', description: 'Arrive at the walled capital of the Kingdom of Lo.', altitude: 3810, distance: '10 km', accommodation: 'Teahouse Lo Manthang' },
      { day: 9, title: 'Explore Lo Manthang', description: 'Full day exploring the ancient city, palaces and monasteries.', altitude: 3810, accommodation: 'Teahouse Lo Manthang' },
      { day: 10, title: 'Excursion to Chhoser Caves', description: 'Visit ancient sky burial caves and cliff monasteries.', altitude: 3810, accommodation: 'Teahouse Lo Manthang' },
      { day: 11, title: 'Lo Manthang to Ghami', description: 'Begin return journey.', altitude: 3520, distance: '20 km', accommodation: 'Teahouse Ghami' },
      { day: 12, title: 'Ghami to Kagbeni (alternate route)', description: 'Return via eastern alternative trail.', altitude: 2810, distance: '22 km', accommodation: 'Teahouse Kagbeni' },
      { day: 13, title: 'Kagbeni to Jomsom, fly to Pokhara', description: 'Morning trek then fly out.', altitude: 820, accommodation: 'Hotel Pokhara' },
      { day: 14, title: 'Fly Pokhara–Kathmandu, departure', description: 'Return to Kathmandu for international departure.', altitude: 1400, accommodation: 'Hotel / departure' },
    ],
    includes: [
      'Upper Mustang Restricted Area Permit (~$500)',
      'All flights (Kathmandu–Pokhara–Jomsom–Pokhara–Kathmandu)',
      'Experienced guide with Mustang expertise',
      'Porter service',
      'Teahouse accommodation',
      'Breakfast and dinner',
    ],
    excludes: [
      'International flights',
      'Nepal visa',
      'Lunch on trek',
      'Mandatory travel insurance',
      'Tips',
    ],
    faqs: [
      { question: 'Why is Upper Mustang so expensive?', answer: 'Upper Mustang requires a special restricted area permit of USD 500 for 10 days. This fee supports local conservation and limits the number of trekkers, preserving the region\'s unique culture.' },
      { question: 'Can I trek during monsoon?', answer: 'Yes! Mustang is in a rain shadow zone and remains dry during the monsoon (June–September), making it one of the few Himalayan treks possible year-round.' },
    ],
    gallery: [
      '/images/upper-mustang.jpg',
    ],
    latitude: 29.1833,
    longitude: 83.9667,
    locationName: 'Lo Manthang',
  },
]

export const blogPosts = [
  {
    id: '1',
    slug: 'everest-base-camp-complete-guide',
    title: 'The Complete Guide to Everest Base Camp Trek 2025',
    excerpt: 'Everything you need to know to plan and complete the iconic Everest Base Camp trek — permits, fitness, gear, costs, and insider tips.',
    image: '/images/blog-guide.jpg',
    category: 'Trekking Guides',
    hashtags: ['#everest', '#trekkingguide', '#nepal'],
    author: 'Gele Trek Team',
    date: '2025-01-15',
    readTime: '12 min',
    content:
      'Planning the Everest Base Camp trek starts with realistic expectations and proper preparation. Build cardio and leg strength for at least 8–10 weeks before departure, and include back-to-back hiking days to simulate trekking fatigue.\n\nFor permits, carry your passport details and extra photos, and confirm current permit rules before arrival. Altitude management is the most important safety factor: keep a slow pace, hydrate well, and respect acclimatization days.\n\nFor gear, focus on layering and reliability rather than quantity. A proven shell jacket, warm mid-layer, broken-in boots, and quality socks matter more than trendy extras. Pack light but do not compromise on warmth, headlamp, and personal medication.\n\nBudget for transportation delays, especially Lukla flights, and keep one or two contingency days in your schedule. The best experiences come when your plan is flexible and your mindset is patient.'
  },
  {
    id: '2',
    slug: 'best-gear-for-nepal-trekking',
    title: 'Essential Gear for Trekking in Nepal: What to Pack',
    excerpt: 'From base layers to trekking poles, our expert guide breaks down exactly what you need — and what to leave behind — for a Himalayan trek.',
    image: '/images/blog-tips.jpg',
    category: 'Travel Tips',
    hashtags: ['#trekkinggear', '#traveltips', '#nepal'],
    author: 'Maya Sherpa',
    date: '2025-02-01',
    readTime: '8 min',
    content:
      'Your clothing system should work as layers: base, insulation, and weather protection. Avoid cotton and choose quick-dry fabrics. One warm down or synthetic jacket and one waterproof shell usually cover most Himalayan conditions.\n\nOn your feet, comfort wins. Use broken-in boots with ankle support and carry liner plus wool socks to reduce blister risk. Trekking poles help protect knees during long descents and are strongly recommended.\n\nPack a simple but practical daypack setup: 1.5–2 liters of water capacity, sun protection, lip balm, snacks, and a small first-aid pouch. Keep electronics warm at altitude to preserve battery life.\n\nFinally, remove duplicates. Overpacking is the most common mistake we see. If an item has a single use and low value, leave it behind.'
  },
  {
    id: '3',
    slug: 'nepali-culture-sherpa-traditions',
    title: 'Sherpa Culture & Traditions: What Every Trekker Should Know',
    excerpt: 'A deep dive into the remarkable Sherpa people of the Khumbu region — their history, Buddhist traditions, and the modern trekking industry.',
    image: '/images/blog-culture.jpg',
    category: 'Nepal Culture',
    hashtags: ['#sherpaculture', '#nepal', '#himalaya'],
    author: 'Pemba Nuru',
    date: '2025-02-20',
    readTime: '10 min',
    content:
      'Sherpa communities have shaped high-altitude trekking in Nepal through deep mountain knowledge, resilience, and hospitality. As a visitor, understanding local customs helps create respectful and rewarding interactions.\n\nIn villages and monasteries, move slowly, greet people politely, and ask before photographing individuals or rituals. When passing mani walls or chortens, follow the local clockwise direction whenever possible.\n\nTeahouse life is communal. Meals are often simple, warm, and shared. Supporting locally run lodges and guides helps sustain livelihoods in remote regions where opportunities are seasonal and hard-earned.\n\nCultural respect is not just etiquette — it improves your trek. You gain trust, hear richer stories, and connect more deeply with the places you walk through.'
  },
]

export const testimonials = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    country: 'United Kingdom',
    trek: 'Everest Base Camp Trek',
    rating: 5,
    text: 'Absolutely incredible experience. Our guide Pemba was knowledgeable, patient, and genuinely cared about our safety. The whole trip was seamlessly organized and I felt in safe hands every step of the way. I\'ll be back for Annapurna!',
    date: 'October 2024',
    avatar: 'SM',
  },
  {
    id: '2',
    name: 'James Kowalski',
    country: 'United States',
    trek: 'Annapurna Circuit',
    rating: 5,
    text: 'This was my first Himalayan trek and I couldn\'t have asked for a better company to go with. Every detail was taken care of — permits, accommodation, even tea breaks at the best spots. The Thorong La crossing was the highlight of my year.',
    date: 'November 2024',
    avatar: 'JK',
  },
  {
    id: '3',
    name: 'Lena Müller',
    country: 'Germany',
    trek: 'Upper Mustang Trek',
    rating: 5,
    text: 'Upper Mustang was unlike anywhere I\'ve ever been. It feels like a lost world. Gele Trekking organized everything perfectly and our guide spoke excellent English and was a font of knowledge about Tibetan culture. Truly unforgettable.',
    date: 'September 2024',
    avatar: 'LM',
  },
  {
    id: '4',
    name: 'Daniel Park',
    country: 'Australia',
    trek: 'Manaslu Circuit',
    rating: 5,
    text: 'The Manaslu Circuit delivered everything it promised — remote, raw and absolutely spectacular. Our team handled every challenge with professionalism. I felt genuinely safe throughout. Already recommending to all my friends.',
    date: 'October 2024',
    avatar: 'DP',
  },
]

export const regions = [
  {
    id: 'everest',
    name: 'Everest Region',
    description: 'Home to the world\'s highest peaks, Sherpa culture and the iconic Khumbu valley.',
    image: '/images/region-everest.jpg',
    treksCount: 6,
  },
  {
    id: 'annapurna',
    name: 'Annapurna Region',
    description: 'Diverse landscapes from tropical lowlands to high alpine passes around the Annapurna massif.',
    image: '/images/region-annapurna.jpg',
    treksCount: 5,
  },
  {
    id: 'langtang',
    name: 'Langtang Region',
    description: 'The "Valley of Glaciers" — pristine wilderness just 3 hours from Kathmandu.',
    image: '/images/region-langtang.jpg',
    treksCount: 4,
  },
  {
    id: 'mustang',
    name: 'Mustang Region',
    description: 'The ancient forbidden Kingdom of Lo — Tibetan plateau culture and otherworldly landscapes.',
    image: '/images/upper-mustang.jpg',
    treksCount: 3,
  },
]