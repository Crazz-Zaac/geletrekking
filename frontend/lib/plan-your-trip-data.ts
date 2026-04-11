export interface PlanYourTripGuide {
  id: string
  slug: string
  title: string
  description: string
  category: 'Logistics' | 'Health & Safety' | 'Preparation' | 'Guidelines'
  section?: string
  icon: string
  content: string
  order: number
}

export interface PlanYourTripColumn {
  title: 'Logistics' | 'Health & Safety' | 'Preparation'
  items: PlanYourTripGuide[]
}

export const planYourTripGuides: PlanYourTripGuide[] = [
  {
    id: '69ccf499658024d8ddb7a1b1',
    slug: 'key-preparations',
    title: 'Key Preparations',
    description: 'Essential steps to prepare for your Nepal trekking adventure in 2026',
    category: 'Preparation',
    section: 'Planning',
    icon: 'CheckCircle',
    order: 1,
    content: `# Key Preparations for Your 2026 Trek

Before embarking on your Nepal trekking adventure, ensure you've completed these essential preparations. Regulations have changed for 2026, so careful planning is crucial.

## Physical Fitness
- **Start Training 3-6 Months Before:** Begin a structured training program well in advance. Focus on building cardiovascular endurance, leg strength, and core stability. Activities like running, cycling, swimming, and stair climbing are excellent.
- **Simulate Trekking Conditions:** Practice hiking with a weighted backpack (10-14 kg) on varied terrain, including hills and stairs. This prepares your body for the daily grind of trekking with a daypack.
- **Be Realistic:** Do not overestimate your fitness level. Trekking in Nepal is strenuous, often involving 5-8 hours of walking per day at high altitudes.

## Travel Documents
- **Passport Validity:** Your passport must be valid for at least **6 months** beyond your intended date of arrival in Nepal.
- **Visa:** Most nationalities can obtain a Tourist Visa on Arrival at Kathmandu's Tribhuvan International Airport. See the 'Visa Information' guide for details.
- **Copies:** Make physical and digital photocopies of all important documents (passport, visa, insurance policy, flight tickets) and store them separately from the originals.
- **Embassy Registration:** It is wise to register your trip with your home country's embassy or consulate, especially for longer or more remote treks.

## Vaccinations & Health Checks
- **Consult a Travel Clinic 6-8 Weeks Before Departure:** This is the ideal timeframe to complete any necessary vaccination schedules.
- **Key Vaccinations:** While none are legally required for entry (except Yellow Fever), Hepatitis A and Typhoid are **strongly recommended** for all travelers. Hepatitis B and Rabies are highly recommended for trekkers.
- **Malaria:** Risk is low in most trekking areas but present in the lowland Terai region. Consult your doctor about prophylaxis if your itinerary includes these areas.
- **Travel Insurance:** Secure a comprehensive policy that explicitly covers **high-altitude trekking (up to 5,500m or 6,000m)** and **emergency helicopter evacuation** with direct billing. This is non-negotiable for safe trekking.

## Gear & Equipment
- **Invest in Quality Footwear:** Your most important piece of gear is a pair of sturdy, waterproof trekking boots that are well broken-in.
- **Pack the Layering System:** Prepare for a wide range of temperatures by packing moisture-wicking base layers, insulating mid-layers (fleece/down), and a waterproof/windproof outer shell.
- **Rent vs. Buy:** You can rent high-quality sleeping bags and down jackets in Kathmandu's Thamel district if you prefer not to buy them.
- **Porter Weight Limit:** If you hire a porter, their load is typically limited to 15kg in your main duffel bag. Your total kit weight (both bags) should be 10-14kg.

## Permits & Permissions
- **Understand 2026 Permit Changes:** A licensed guide is now **mandatory on all major trekking routes** in Nepal's national parks and conservation areas. The days of solo trekking are effectively over.
- **Book with a Licensed Agency:** Your trekking agency will arrange all necessary permits for you, including the TIMS card and relevant national park or conservation area permits.

## Mental Preparation
- **Research Your Trek:** Understand the daily distances, altitude gains, and potential challenges of your chosen route.
- **Embrace Flexibility:** Be prepared for changes to your itinerary due to weather, flight delays (especially to/from Lukla), or health issues.
- **Cultivate Patience:** Life in the mountains moves at a different pace. Embrace the slower rhythm and be patient with yourself and others.`,
  },
  {
    id: '69ccf499658024d8ddb7a1b2',
    slug: 'health-and-medicine',
    title: 'Health & Medicine',
    description: 'Medical preparation and common remedies for trekking in Nepal',
    category: 'Health & Safety',
    section: 'Medical Preparation',
    icon: 'Heart',
    order: 2,
    content: `# Health & Medicine for Trekking in Nepal

## Pre-Trek Medical Preparation

### Vaccinations (Start 6-8 Weeks Before Travel)
- **Essential for All:** Hepatitis A, Typhoid. The risk of typhoid in Nepal is among the highest in the world, and antibiotic-resistant strains are common.
- **Highly Recommended for Trekkers:** Hepatitis B, Rabies (Pre-exposure). Rabies is a concern due to the presence of stray dogs, and post-exposure treatment is difficult to access in remote areas.
- **Situational:** Japanese Encephalitis (for extended stays in rural areas, especially during/after monsoon).
- **Yellow Fever:** Required only if you are arriving from a country with risk of yellow fever transmission.
- **Routine:** Ensure your routine vaccinations (Tdap, MMR, Polio, Flu, COVID-19) are up to date.

### First-Aid Kit Essentials
- **Medications:** Personal prescriptions, Acetazolamide (Diamox) for altitude sickness, broad-spectrum antibiotic (prescribed by your doctor for traveler's diarrhea), antidiarrheal (Loperamide), pain relievers (Ibuprofen, Paracetamol), anti-nausea medication, and antihistamines.
- **Supplies:** Blister treatment (moleskin, Compeed), antiseptic wipes, bandages of various sizes, medical tape, oral rehydration salts, and a thermometer.
- **Sun Protection:** High SPF sunscreen and lip balm.
- **Hydration:** Water purification tablets or a mechanical purifier/filter. Do not drink tap water in Nepal; stick to boiled or bottled water.

## Common Trek-Related Issues & Treatment

### Acute Mountain Sickness (AMS)
- **What it is:** A constellation of symptoms (headache being universal) caused by your body's inability to acclimatize to lower oxygen levels at altitude.
- **Symptoms:** Headache, plus at least one of: loss of appetite/nausea, fatigue/weakness, dizziness, or difficulty sleeping.
- **Golden Rule: Ascend Slowly.** The recommended maximum ascent rate is **no more than 500m per day in sleeping altitude once above 3,000m**. Include a rest/acclimatization day for every 1,000m gained.
- **Prevention:** Ascend gradually, stay hydrated, eat a high-carb diet, and avoid alcohol and sedatives. Consider taking Diamox as a preventive measure, as advised by your doctor.
- **Treatment:** **If symptoms worsen, do not ascend further. If you do not improve, descend immediately.** Rest, hydrate, and treat headache with pain relievers.

### High Altitude Cerebral Edema (HACE) & High Altitude Pulmonary Edema (HAPE)
- **HACE:** A life-threatening progression of AMS. Symptoms include severe headache, confusion, loss of coordination (ataxia), and hallucinations.
- **HAPE:** Fluid accumulation in the lungs. Symptoms include extreme breathlessness at rest, chest tightness, a persistent cough, and crackling sounds in the chest.
- **Treatment for HACE/HAPE:** These are **medical emergencies**. **The only definitive treatment is immediate descent (at least 1,000m)** and, if available, supplemental oxygen. Do not delay.

### Digestive Issues (Traveler's Diarrhea)
- **Prevention:** Be vigilant about food and water safety. Drink only boiled, filtered, or bottled water. Eat only food that is freshly cooked and served hot. Wash hands frequently.
- **Treatment:** Focus on hydration with oral rehydration salts. Use Loperamide for symptom relief if necessary. If diarrhea is severe or accompanied by fever/blood, take your prescribed antibiotic.

### Additional Resource:
For more information, consult the [CDC's Nepal travel health information](https://www.cdc.gov/yellow-book/hcp/asia/nepal.html) and their guide on [High-Altitude Travel and Altitude Illness](https://www.cdc.gov/yellow-book/hcp/environmental-hazards-risks/high-altitude-travel-and-altitude-illness.html).`,
  },
  {
    id: '69ccf499658024d8ddb7a1b3',
    slug: 'communication-services',
    title: 'Communication Services',
    description: 'Internet, phone, and network coverage on Nepal\'s trekking trails',
    category: 'Logistics',
    section: 'Communication',
    icon: 'Smartphone',
    order: 3,
    content: `# Communication Services in Nepal

## Mobile Networks in 2026
- **Primary Providers:** Ncell (private) and NTC/Nepal Telecom (government-owned). Both offer 3G/4G services in major towns and along popular trekking routes. SmartCell has limited coverage.
- **Coverage Reality:** Connectivity is reliable in lower elevations like Lukla and Namche Bazaar but becomes increasingly patchy and weak as you gain altitude. Do not expect a stable signal above 4,000m-4,500m. NTC is generally considered more reliable in remote, high-altitude areas.

## Getting a Local SIM Card
- **Where to Buy:** SIM cards can be easily purchased at the airport in Kathmandu, in shops throughout the city (especially Thamel), or even in Lukla.
- **Requirements:** You **must** present your passport for registration. The process is straightforward and takes about 10-15 minutes.
- **Cost:** SIM cards are inexpensive, typically costing NPR 100-200. You can then top up with data packs, which are also very affordable.
- **Pro-Tip:** For the best coverage along the trail, consider getting a dual-SIM phone and using both an Ncell and an NTC SIM.

## Internet & WiFi on the Trail
- **Teahouse WiFi:** Most lodges and teahouses along popular routes offer WiFi. The connection is often slow and can be unreliable, especially during peak hours when many users are online.
- **Cost:** Teahouses typically charge for WiFi access, and the price increases with altitude. You can expect to pay anywhere from NPR 200 to NPR 600+ per day. Some teahouses offer it for free if you eat meals there.
- **Everest Link:** A dedicated fiber-optic network is available in parts of the Khumbu region (Everest area). You can purchase a top-up card for faster, more reliable internet, but it is more expensive.
- **Power Management:** Charging electronic devices also incurs a cost at higher altitudes. Bring a high-capacity portable charger (power bank) to minimize expenses and ensure you have power even if you don't want to pay for a charge.

## Digital Detox & Preparation
- **Embrace Disconnection:** Be prepared to be offline for large portions of your trek. This is a great opportunity for a digital detox and to fully immerse yourself in the experience.
- **Prepare Offline:** Before starting your trek, download offline maps (e.g., Maps.me, Gaia GPS), translation apps, and any reading material or entertainment you might want for the evenings.

## Emergency Communication
- **Satellite Communication:** For treks in very remote regions (e.g., Upper Dolpo, Kanchenjunga), your guide or agency will carry a satellite phone for emergencies.
- **Emergency Contacts:** Keep the emergency numbers for your trekking agency, your insurance provider's 24/7 emergency line, and your embassy saved in your phone and written down.`,
  },
  {
    id: '69ccf499658024d8ddb7a1b4',
    slug: 'hypoxia-and-altitude-sickness',
    title: 'Hypoxia & Altitude Sickness',
    description: 'Understanding and managing high-altitude health risks',
    category: 'Health & Safety',
    section: 'Health Risks',
    icon: 'AlertCircle',
    order: 4,
    content: `# Hypoxia & Altitude Sickness: A Complete Guide for 2026

## Understanding the Challenge of Hypoxia
At high altitudes, the primary challenge is hypoxia—a state of low oxygen in the body's tissues due to decreased air pressure. The inspired partial pressure of oxygen at Everest Base Camp (5,400m) is only about 50% of that at sea level. The key to safe high-altitude travel is **acclimatization**, the process by which your body adjusts to this lower oxygen environment.

## Altitude Classifications
- **High Altitude:** 2,500m - 3,500m (e.g., Namche Bazaar). Risk of AMS begins.
- **Very High Altitude:** 3,500m - 5,500m (e.g., Everest Base Camp, Thorong La Pass). Significant risk of AMS, HACE, and HAPE.
- **Extreme Altitude:** Above 5,500m (e.g., Kala Patthar). Long-term human acclimatization is not possible.

## Acute Mountain Sickness (AMS)

### Symptoms
AMS is the most common form of altitude illness. Diagnosis requires a headache, plus at least one of the following symptoms after a recent ascent above 2,500m:
- Loss of appetite, nausea, or vomiting
- Fatigue or weakness
- Dizziness or light-headedness
- Difficulty sleeping
- *Think of AMS like a bad hangover from the mountains.*

### Prevention
The cornerstone of AMS prevention is a gradual ascent profile. Key guidelines from the Wilderness Medical Society include:
- **Acclimatize at an intermediate altitude:** Spend 2-3 nights at around 2,450m to 2,750m before ascending higher.
- **Limit ascent rate:** Once above 3,000m, do not increase your sleeping altitude by more than **500m per night**.
- **Take rest days:** Include an extra acclimatization night for every 1,000m of sleeping altitude gain.
- **Climb High, Sleep Low:** This classic technique is highly effective. For example, you can hike to a higher altitude during the day and then descend to sleep at a lower elevation.
- **Hydrate and Eat Well:** Drink 3-4 liters of water daily and consume a high-carbohydrate diet.
- **Avoid Respiratory Depressants:** Do not drink alcohol or take sleeping pills/sedatives.

## High Altitude Cerebral Edema (HACE)
HACE is a severe and life-threatening progression of AMS where the brain swells with fluid.
### Symptoms
- Severe headache unresponsive to painkillers
- Confusion and disorientation
- Loss of coordination (ataxia) - *perform a "heel-to-toe" walking test*
- Hallucinations and irrational behavior
- Loss of consciousness

## High Altitude Pulmonary Edema (HAPE)
HAPE is a potentially fatal condition where fluid accumulates in the lungs, preventing oxygen exchange.
### Symptoms
- Extreme shortness of breath, even at rest
- Chest tightness or congestion
- Cough, which may produce frothy or pink-tinged sputum
- Crackling or gurgling sounds in the lungs (rales)
- Rapid heart rate and blue-tinged lips/fingernails

## Emergency Treatment for HACE and HAPE
**Both HACE and HAPE are medical emergencies.**
1.  **Immediate Descent:** The first and most critical action is to descend immediately, by at least 1,000m. Do not delay, even if it is night.
2.  **Supplemental Oxygen:** Administer high-flow oxygen if available.
3.  **Portable Hyperbaric Chamber (Gamow Bag):** This can be a temporary life-saving measure to simulate a lower altitude while waiting for evacuation or if immediate descent is impossible.
4.  **Medication:** Drugs like Dexamethasone (for HACE) and Nifedipine (for HAPE) can be life-saving but are not a substitute for descent.

**Golden Rule:** *If you feel unwell at altitude, assume it is altitude sickness until proven otherwise.* Do not ascend further if symptoms are present or worsening. Never leave a person with severe altitude sickness alone.`,
  },
  {
    id: '69ccf499658024d8ddb7a1b5',
    slug: 'tims-card',
    title: 'TIMS Card',
    description: 'Trekking Information Management System (TIMS) card requirements for 2026',
    category: 'Logistics',
    section: 'Entry Requirements',
    icon: 'FileCheck',
    order: 5,
    content: `# TIMS Card: What You Need to Know for 2026

## What is TIMS?
TIMS (Trekking Information Management System) is a permit designed to track trekkers in Nepal for their safety and to help regulate tourism. It is managed jointly by the Nepal Tourism Board (NTB) and the Trekking Agencies' Association of Nepal (TAAN).

## Important 2026 Update: TIMS is Phasing Out in Key Areas
**This is the most critical update for 2026.** The TIMS card is **no longer enforced in the Everest (Khumbu) and Annapurna regions**. In these areas, it has been replaced by other local permits.
- **Where TIMS is NO LONGER required:** Everest Base Camp, Annapurna Circuit, Annapurna Base Camp, and other treks within the Khumbu Pasang Lhamu Rural Municipality and Annapurna Conservation Area.
- **Where TIMS is STILL required:** The TIMS card remains a mandatory requirement for treks in **Langtang, Manaslu, and far western regions** like Rara.

## Who Needs a TIMS Card?
All foreign and SAARC trekkers entering a designated trekking zone where TIMS is still enforced. Your trekking agency will handle this and confirm if one is required for your chosen trek.

## Types of TIMS Cards and Fees (2026)
- **Blue TIMS (Group/Guided):** This is the only type issued now. It is for trekkers with a licensed guide. The cost is **NPR 2,000** (approx. $15 USD) for foreign nationals and **NPR 1,000** for SAARC nationals.
- **Green TIMS (Individual):** The permit for solo trekkers has been **officially retired**. Since solo trekking is no longer permitted in most areas, this card is obsolete.

## How to Get a TIMS Card
You **cannot** apply for a TIMS card independently. It can only be issued through a registered trekking agency, like those used by Gele Trekking. Your agency will collect your passport details and photo and obtain the card on your behalf. This process is typically done in Kathmandu or Pokhara before your trek begins.

## Why is TIMS Being Phased Out?
The changes are part of a larger shift in Nepal's tourism management. In the Khumbu region, the TIMS card has been replaced by the **Khumbu Pasang Lhamu Rural Municipality Permit** (a local fee). This, combined with the **Mandatory Guide Rule**, has made the central TIMS database redundant in that area.

## Key Takeaway for 2026
Do not assume you need a TIMS card. Discuss your specific trek with your trekking agency. They will provide the most up-to-date information and arrange all necessary permits for you, whether it's a TIMS card, a National Park Permit, or a local area permit.`,
  },
  {
    id: '69ccf499658024d8ddb7a1b6',
    slug: 'insurance',
    title: 'Insurance',
    description: 'Essential travel and high-altitude trekking insurance coverage',
    category: 'Guidelines',
    section: 'Requirements',
    icon: 'Shield',
    order: 6,
    content: `# Travel & Trekking Insurance Guide for 2026

## Why You Need Specialized Trekking Insurance
Standard travel insurance is almost never adequate for a Nepal trek. It is often capped at altitudes of 3,000m or 4,000m, well below the elevation of key destinations like Everest Base Camp (5,364m) or the Thorong La Pass (5,416m). A medical emergency at altitude can cost **USD 3,000 to 7,000 or more** for a helicopter evacuation, an expense that is almost impossible to cover out-of-pocket.

## Mandatory Insurance Requirements for Trekking
While not a legal requirement for entering Nepal, **any reputable trekking agency will require proof of adequate insurance before you start your trek.** Your policy must explicitly cover:
1.  **High-Altitude Trekking:** Your policy must clearly state that it covers trekking activities up to the maximum altitude of your route, ideally **5,500m to 6,000m** (e.g., "non-technical mountaineering below 6,000m").
2.  **Emergency Helicopter Evacuation:** This is non-negotiable. In the event of a severe altitude illness or a major injury, a helicopter is the only way to get to a hospital in Kathmandu quickly. Your policy must cover the full cost of this evacuation.
3.  **Direct Billing for Evacuation:** This is a crucial detail. Your insurer must operate on a **direct billing arrangement**, meaning they coordinate with and pay the helicopter operator directly. You do **not** want a "pay-first-claim-later" policy for an emergency that could cost you USD 7,000 upfront.
4.  **Medical Treatment:** Coverage for hospital and medical expenses both on the trail and in Kathmandu.

## Other Important Coverage to Consider
- **Trip Cancellation/Interruption:** Nepal's mountain weather is unpredictable. Flights to and from Lukla are frequently delayed or canceled. This coverage can reimburse you for missed flights, extra accommodation, and other costs.
- **Search and Rescue:** Some policies have separate limits for search and rescue efforts.
- **Lost/Stolen Gear:** Coverage for your valuable trekking equipment.
- **Personal Liability:** In case you accidentally cause injury to someone else or damage property.

## When and How to Buy Insurance
- **Purchase Before You Travel:** You should purchase your insurance policy **before you arrive in Nepal**. Many insurers will not issue a new policy once your trip has started.
- **Disclose Your Trek Details:** Be completely honest about the activities you will be undertaking and the maximum altitude you will reach. Failure to disclose this could invalidate your policy.
- **Share Your Policy:** Provide a copy of your insurance policy number and the insurer's 24/7 emergency contact number to your trekking guide on the first day of the trek.

## Common Insurance Mistakes to Avoid
- **Relying on Credit Card Insurance:** Almost all credit card travel insurance has strict altitude exclusions and does not cover helicopter evacuation. Do not rely on it.
- **Misunderstanding "Trekking" Definitions:** Some insurers define "trekking" as hiking below a certain altitude (e.g., 3,000m). Always check the fine print.
- **Forgetting to Disclose Pre-Existing Conditions:** If you have any medical conditions, ensure they are declared and covered.

## Recommended Providers
Your trekking agency will often have a list of recommended international insurers that they know provide the necessary coverage and have a good track record of handling claims in Nepal. Examples include World Nomads (Explorer Plan), True Traveller (for UK/Europe residents), and Global Rescue.`,
  },
  {
    id: '69ccf499658024d8ddb7a1b7',
    slug: 'gear-and-equipment',
    title: 'Gear & Equipment',
    description: 'A complete and updated packing list for your Nepal trek in 2026',
    category: 'Preparation',
    section: 'Essential Gear',
    icon: 'Backpack',
    order: 7,
    content: `# Complete Trekking Gear & Equipment Checklist for 2026

Packing for Nepal is a balancing act between preparedness and weight. Your total kit weight, including your daypack and duffel bag, should be **between 10 and 14 kg**. If hiring a porter, their load is limited to a **maximum of 15 kg** in your main duffel.

## The Bag System
- **Main Duffel Bag (50-65L):** A sturdy duffel for your porter to carry. Most trekking agencies provide one. Ensure it's durable and can be locked.
- **Daypack (20-25L):** For you to carry daily essentials like water, snacks, camera, extra layers, and your documents.
- **Waterproof Covers:** Essential for both bags. Also use dry bags or Ziploc bags inside to organize and waterproof your gear.

## Clothing (The Layering System)
This is the most effective way to manage your body temperature in the mountains.
### Base Layer (Moisture-Wicking)
- 2-3 trekking shirts (merino wool or synthetic - **no cotton**)
- 2 thermal base layer tops (for cold mornings/sleeping)
- 1 pair thermal bottoms (essential above 3,500m)
- 4-5 pairs of trekking socks (merino wool preferred)
- 4-5 pairs of moisture-wicking underwear

### Mid Layer (Insulation)
- 1 fleece jacket (your workhorse layer)
- 1 down jacket or synthetic insulated jacket (for cold evenings and mornings)
- 2 pairs of trekking trousers (zip-offs are versatile)

### Outer Layer (Weather Protection)
- 1 waterproof/windproof hardshell jacket (Gore-Tex or equivalent)
- 1 pair of waterproof trekking pants (essential for rain or snow)

### Extremities
- Warm hat (fleece or wool) and a sun hat with a wide brim
- Warm gloves or mittens (a liner glove + waterproof shell is ideal)
- Neck gaiter or Buff (for warmth and sun protection)

## Footwear
- **Trekking Boots:** Sturdy, waterproof, ankle-supporting boots that are **well broken-in**. This is your most important piece of gear.
- **Camp Shoes:** Lightweight sandals or trainers to change into at the teahouse in the evenings.
- **Gaiters:** Recommended for keeping snow, mud, and small rocks out of your boots.

## Sleeping & Comfort
- **Sleeping Bag:** Rated for at least **-10°C (14°F)**. A good 4-season bag is recommended. Can be rented in Kathmandu.
- **Sleeping Bag Liner:** Adds warmth and keeps your sleeping bag clean.
- **Earplugs:** Essential for sleeping in teahouses with thin walls.

## Navigation & Lighting
- **Headlamp:** With fresh, extra batteries. Essential for early morning starts and navigating dark teahouses at night.
- **Trekking Map & Compass/GPS:** A physical map is a good backup. Download offline maps on your phone.

## Health, Hygiene & First-Aid
- **Personal First-Aid Kit:** Including medications (Diamox, antibiotics, painkillers), blister kit, antiseptic wipes, bandages.
- **Sun Protection:** High SPF sunscreen and SPF lip balm.
- **Hydration:** 2-3L water bottles or a hydration bladder. **Water purification tablets or a mechanical filter** are non-negotiable.
- **Toiletries:** Biodegradable soap, toothbrush/paste, quick-dry towel, toilet paper (often for sale on the trail), hand sanitizer.

## Photography & Electronics
- **Camera & Phone:** With extra memory cards.
- **High-Capacity Portable Charger (Power Bank):** Crucial, as charging devices at teahouses costs money. A 20,000+ mAh charger is recommended.
- **Adapter:** Nepal uses 230V and Type C, D, and M plugs.

## Miscellaneous Essentials
- **Trekking Poles:** Highly recommended. They take significant strain off your knees, especially on descents.
- **Sunglasses:** Category 3 or 4 with UV protection. The sun's reflection off snow is intense.
- **Waterproof Document Wallet:** For keeping your passport, permits, and cash dry.`,
  },
  {
    id: '69ccf499658024d8ddb7a1b8',
    slug: 'permits-and-regulations',
    title: 'Permits & Regulations',
    description: 'Updated 2026 guide to national park permits and trekking rules',
    category: 'Logistics',
    section: 'Entry Requirements',
    icon: 'FileCheck',
    order: 8,
    content: `# Nepal Trekking Permits & Regulations for 2026

Navigating Nepal's permit system is essential for a legal and hassle-free trek. The rules have been updated significantly for 2026, with a greater emphasis on digital tracking and mandatory guiding.

## The Mandatory Guide Rule
**This is the single most important regulation for 2026.** As of April 2023 and actively enforced now, every non-Nepali trekker in any National Park or Conservation Area must be accompanied by a **licensed trekking guide** through a government-registered agency. Independent (solo) trekking is effectively banned on all major routes.

## Types of Permits
Your trek will require one or more of the following permits, which your agency will arrange for you.

### 1. National Park & Conservation Area Permits
Required for entry into protected areas. These are single-entry permits.
| Trek Region | Permit Required | Cost (Foreign National) | Notes |
| :--- | :--- | :--- | :--- |
| **Everest Region** | Sagarmatha National Park Permit | **NPR 3,000** (~$22 USD) | Plus **Khumbu Pasang Lhamu Rural Municipality Permit** (NPR 2,000) |
| **Annapurna Region** | Annapurna Conservation Area Project (ACAP) Permit | **NPR 3,000** (~$22 USD) | Valid for the entire trek duration within the ACAP area |
| **Langtang Region** | Langtang National Park Permit | **NPR 3,000** (~$22 USD) | Plus **TIMS Card** (NPR 2,000) |
| **Manaslu Region** | Manaslu Conservation Area Project (MCAP) Permit | **NPR 3,000** (~$22 USD) | Plus **Restricted Area Permit** and **TIMS Card** |
| **Upper Mustang** | Annapurna Conservation Area Project (ACAP) Permit | **NPR 3,000** (~$22 USD) | Plus **Restricted Area Permit** |

### 2. TIMS Card (Where Still Required)
As detailed in the "TIMS Card" guide, this permit is being phased out in the Everest and Annapurna regions but remains mandatory in areas like Langtang, Manaslu, and Far-West Nepal.
- **Cost (Blue TIMS):** **NPR 2,000** (~$15 USD) for foreign nationals.

### 3. Restricted Area Permits (RAP)
For treks in controlled areas like Upper Mustang, Manaslu, and Dolpo. These permits are more expensive and require a minimum of two trekkers plus a licensed guide.
| Restricted Region | Approximate Cost (First 10 Days) | Notes |
| :--- | :--- | :--- |
| **Upper Mustang** | **USD 522+** | Price per person |
| **Manaslu Circuit** | **USD 174 - 196** | Total for RAP, MCAP, and ACAP during peak season |
| **Tsum Valley** | **USD 62 - 70** | Peak season cost |

### 4. Local/Municipal Permits
Some areas have introduced their own local fees. The most prominent example is the **Khumbu Pasang Lhamu Rural Municipality Permit** required for the Everest region, which costs **NPR 2,000**. This has effectively replaced the TIMS card in this area.

## Key Regulations for 2026
- **Digital Checkpoints:** Many checkpoints, especially in Annapurna and Manaslu, now use QR-code scanners to verify e-permits. Your permit is digitally linked to your passport.
- **Children Under 10:** Exempt from national park and conservation area permit fees.
- **Permit Validity:** Most standard permits are single-entry and valid for the entire duration of your trek within the park boundaries.

## Who Arranges Permits?
**Your registered trekking agency will handle all permit arrangements.** The cost of these permits is typically included in your trek package price. You do not need to navigate the process yourself.`,
  },
  {
    id: '69ccf499658024d8ddb7a1b9',
    slug: 'visa-information',
    title: 'Visa Information',
    description: '2026 tourist visa requirements and procedures for Nepal',
    category: 'Logistics',
    section: 'Entry Requirements',
    icon: 'FileBadge2',
    order: 9,
    content: `# Nepal Visa Information for 2026

## Tourist Visa Options
Most nationalities can obtain a Tourist Visa on Arrival. This is the only entry visa for tourism, trekking, and visiting friends and family.

### Visa Fees for 2026
Fees are standard and payable in USD cash or by card at the airport.
| Duration | Cost (USD) | Notes |
| :--- | :--- | :--- |
| **15 Days** | $30 | Multiple entry facility |
| **30 Days** | $50 | Recommended for most trekkers |
| **90 Days** | $125 | Ideal for longer expeditions or multiple treks |

### How to Obtain a Visa
You have two options. The fastest and easiest method is to pre-fill the online form.

**Option 1: On Arrival (Recommended for most)**
1.  **Before Travel:** Fill out the online 'Tourist Visa' form on the official [Department of Immigration website](https://nepaliport.immigration.gov.np/visa-processing?tab=tab-change). Submit it and print the receipt with the barcode. It is valid for 15 days from the date of submission.
2.  **At the Airport:** Proceed to the Visa Fee counter. Pay the fee for your chosen duration. You will receive a receipt.
3.  **At Immigration:** Hand your passport, the printed online form receipt, and the payment receipt to the immigration officer. They will issue your visa.

**Option 2: On Arrival (Kiosk)**
1.  **At the Airport:** Fill out the visa application form on one of the electronic kiosk machines in the arrivals hall.
2.  **At the Airport:** Pay the fee at the counter.
3.  **At Immigration:** Present your passport, kiosk receipt, and payment receipt.

### Visa Requirements
- **Passport Validity:** Your passport must be valid for **at least 6 months** from your date of arrival in Nepal.
- **Passport Photo:** Carry one or two passport-sized photos. They are rarely needed with the online system but are good to have as a backup.
- **Citizens from Certain Countries:** Nationals of Nigeria, Ghana, Zimbabwe, Swaziland, Cameroon, Somalia, Liberia, Ethiopia, Iraq, Palestine, Afghanistan, Syria, and Iran, as well as refugees with travel documents, **must** obtain a visa from a Nepalese embassy or consulate before traveling.

### Visa Extensions
If you decide to stay longer, you can extend your tourist visa at the Department of Immigration office in Kathmandu or Pokhara.
- **Minimum Extension:** 15 days, costing **USD 45**. Each additional day costs **USD 3**.
- **Maximum Stay:** Tourists can stay a maximum of **150 days** in a calendar year.

### Important Notes
- **Keep Your Receipt:** Keep your visa payment receipt safe. You may be asked for it upon departure.
- **Indian Citizens:** Indian nationals do not require a visa to enter Nepal.
- **Gratis Visa:** Children under 10 years of age and first-time SAARC visitors (for 30 days) are eligible for a free visa.
- **Online Form is Key:** Using the online form before you fly can save you a significant amount of time in the visa queue, especially during peak tourist seasons.`,
  },
  {
    id: '69ccf499658024d8ddb7a1ba',
    slug: 'weather-and-seasons',
    title: 'Weather & Seasons',
    description: 'Best trekking seasons and what to expect from Nepal\'s weather',
    category: 'Preparation',
    section: 'Planning',
    icon: 'CloudSun',
    order: 10,
    content: `# Nepal Trekking: Weather & Best Seasons for 2026

Nepal has two primary trekking seasons that offer the best conditions: spring and autumn. Understanding the nuances of each will help you choose the perfect time for your adventure.

## Best Trekking Seasons

### Spring (March to May)
- **Vibe:** A season of renewal. The landscapes are lush and vibrant.
- **Weather:** Generally warm and stable. Days are pleasant, and nights are cool but not extreme. Skies are often clear in the morning, with occasional afternoon clouds.
- **Pros:** The famous rhododendron forests are in full bloom, creating a spectacular display of color. It's a great time for photography and for seeing wildlife become more active.
- **Cons:** It can be busier than autumn on some popular trails. Visibility of distant peaks can be slightly hazy compared to the crystal-clear skies of autumn.
- **Best For:** All major treks, especially those where you want to see flowers and enjoy warmer temperatures. Ideal for Everest Base Camp and the Annapurna Circuit.

### Autumn (Late September to November)
- **Vibe:** The "gold standard" of trekking in Nepal.
- **Weather:** The most stable and reliable weather of the year. The monsoon rains have washed the dust from the air, leaving behind crisp, cool, and incredibly clear conditions.
- **Pros:** **Unmatched mountain visibility**. The air is dry, and the views of the Himalayan peaks are at their absolute sharpest. Trails are in excellent condition.
- **Cons:** This is the peak trekking season, so trails and teahouses will be at their busiest. Prices for flights and accommodation can be higher.
- **Best For:** Any trek. It is the absolute best time for panoramic photography. Perfect for Everest Base Camp, Gokyo Lakes, and Upper Mustang.

## Off-Season & Shoulder Seasons

### Winter (December to February)
- **Weather:** Cold, especially at higher altitudes. Snowfall is common, and high passes like Thorong La may be closed. Lower elevations (below 3,000m) are pleasant during the day.
- **Pros:** Extremely quiet trails with few other trekkers. Stunning, crystal-clear skies. A unique, peaceful experience.
- **Cons:** Bitter cold nights. Some teahouses at higher altitudes close for the season. Risk of trail closures due to snow.
- **Best For:** Lower-altitude treks like Ghorepani Poon Hill or the Tamang Heritage Trail. Experienced trekkers seeking solitude.

### Summer / Monsoon (June to Mid-September)
- **Weather:** Hot, humid, and rainy. Expect daily afternoon downpours. Lower trails become muddy and leech-infested.
- **Pros:** Lush, incredibly green landscapes. Very few tourists. It's the best time to visit the rain-shadow regions.
- **Cons:** Poor mountain visibility. Trails can be treacherous. High risk of landslides and flight delays/cancellations (especially to Lukla).
- **Best For:** Treks in the **rain-shadow areas** north of the main Himalayan range, such as **Upper Mustang, Dolpo, and Nar-Phu**. These areas receive very little rain.

## Temperature by Altitude (Approximate Daytime Lows)
| Altitude | Spring (Mar-May) | Summer (Jun-Aug) | Autumn (Sep-Nov) | Winter (Dec-Feb) |
| :--- | :--- | :--- | :--- | :--- |
| **1,500m** (e.g., Pokhara) | 20°C | 25°C | 20°C | 15°C |
| **2,500m** (e.g., Namche) | 12°C | 15°C | 12°C | 5°C |
| **3,500m** (e.g., Dingboche) | 5°C | 8°C | 5°C | -5°C |
| **5,000m** (e.g., EBC) | -5°C | 0°C | -3°C | -15°C |`,
  },
  {
    id: '69ccf499658024d8ddb7a1bb',
    slug: 'guide-rules-and-etiquette',
    title: 'Guide Rules & Etiquette',
    description: 'Expectations, etiquette, and tipping culture for trekking with guides and porters',
    category: 'Guidelines',
    section: 'Etiquette & Safety',
    icon: 'CircleHelp',
    order: 11,
    content: `# Guide Rules & Trekking Etiquette for 2026

Trekking in Nepal is not just a physical challenge; it's a cultural exchange. Respecting your guide and porter, and understanding local customs, will enrich your experience immeasurably.

## The Mandatory Guide Rule
As of 2026, a **licensed trekking guide is mandatory** on all major trekking routes in Nepal's national parks and conservation areas. This regulation, which bans solo trekking, is strictly enforced at permit checkpoints for your safety and to support local employment.

## Your Guide's Responsibilities
Your guide is your lifeline in the mountains. They are responsible for:
- **Safety:** Monitoring the group for altitude sickness, navigating the trail, and making critical decisions about pacing and rest days.
- **Logistics:** Managing teahouse bookings, meals, and handling any issues that arise.
- **Communication:** Acting as a translator and cultural liaison.
- **Emergency Response:** Providing first aid and coordinating any necessary evacuations.

## Your Responsibilities as a Trekker
- **Follow Instructions:** Listen to your guide's advice on pacing, acclimatization, and safety. They have the final say on matters of safety.
- **Communicate Openly:** Inform your guide immediately if you are feeling unwell, have a headache, or are struggling in any way. Do not suffer in silence.
- **Respect Their Expertise:** Trust their knowledge of the mountains and local culture. Ask questions and learn from them.
- **Stay with the Group:** Do not wander off alone, and inform your guide if you need to stop for a photo or a break.

## Treating Guides and Porters with Respect
- **They are Professionals:** Guides and porters are skilled workers, not servants. Treat them with the same dignity and respect you would give a colleague.
- **Porters Carry Heavy Loads:** Be mindful of what you pack. The maximum weight a porter carries is 15kg in your duffel. Keep your bag within this limit.
- **Fair Wages:** Reputable agencies like Gele Trekking pay fair wages. Tipping is the primary way for trekkers to directly reward and thank their support staff.

## Tipping Guides and Porters in 2026
Tipping is not a legal requirement, but it is a deeply embedded cultural practice and represents a significant portion of a guide or porter's annual income.
- **When to Tip:** On the last day of the trek, typically at the final teahouse.
- **How to Tip:** It's customary to gather the group's tips and present them to the guide and porter(s) individually, with a handshake and a word of thanks. This is often done in a small ceremony.
- **Currency:** You can tip in either **Nepali Rupees (NPR)** or **US Dollars (USD)**. Rupees are often preferred.

### Recommended Tipping Amounts (Per Trekking Day)
These are standard guidelines for 2026. Adjust based on the quality of service.
| Staff Member | Suggested Tip (Per Day) | Example: 14-Day EBC Trek |
| :--- | :--- | :--- |
| **Lead Guide** | $15 - 20 USD | $210 - $280 USD |
| **Assistant Guide** | $10 - 15 USD | $140 - $210 USD |
| **Porter** | $8 - 12 USD | $112 - $168 USD |
| **Cook/Camp Staff** | $10 - 15 USD | $140 - $210 USD |

*Amounts are from 2026 trekker surveys and TAAN guidelines.*

## Cultural Etiquette on the Trail
- **Religious Sites:** Always walk to the left (clockwise) of Mani walls, Stupas, and around prayer wheels. This is a sign of respect.
- **Photography:** Always ask for permission before taking someone's photo. Be respectful at monasteries and religious ceremonies.
- **Public Displays of Affection:** Keep them modest, especially in remote villages.
- **Dress Code:** Dress modestly, especially when visiting villages and religious sites. Avoid overly revealing clothing.
- **Head and Feet:** The head is considered the most sacred part of the body; do not touch someone's head. Feet are considered unclean; avoid pointing your feet at people or sacred objects.
- **Learn a Few Words:** Simple phrases like "Namaste" (a respectful greeting), "Dhanyabad" (Thank you), and "Bistari, Bistari" (Slowly, slowly) go a very long way.`,
  },
]

/**
 * Organize guides into columns based on category
 */
export const getGuideColumn = (
  category: PlanYourTripGuide['category']
): 'Logistics' | 'Health & Safety' | 'Preparation' => {
  if (category === 'Logistics') {
    return 'Logistics'
  }
  if (category === 'Health & Safety') {
    return 'Health & Safety'
  }
  if (category === 'Guidelines') {
    return 'Preparation'
  }
  return 'Preparation'
}

/**
 * Get all guides organized into columns
 */
export const getPlanYourTripColumns = (): PlanYourTripColumn[] => {
  const columns: PlanYourTripColumn[] = [
    { title: 'Logistics', items: [] },
    { title: 'Health & Safety', items: [] },
    { title: 'Preparation', items: [] },
  ]

  planYourTripGuides.forEach((guide) => {
    const column = getGuideColumn(guide.category)
    const columnIndex = columns.findIndex((c) => c.title === column)
    if (columnIndex !== -1) {
      columns[columnIndex].items.push(guide)
    }
  })

  // Sort items within each column by order
  columns.forEach((column) => {
    column.items.sort((a, b) => a.order - b.order)
  })

  return columns
}

/**
 * Additional information note about missing topics for a complete trekker's resource
 */
export const missingInformationNote = `While the provided guides cover a broad range of essential topics, several important areas for a complete trekker's resource are either missing or could be significantly expanded.

Key Missing Categories:
- **Money Matters:** A dedicated guide on currency (Nepali Rupee), ATM availability on trails (none after Namche/Pokhara), cash management, and a detailed cost breakdown of daily expenses (food, accommodation, charging, WiFi) would be highly valuable.
- **Food and Water Safety:** A comprehensive guide on what to eat and drink to stay healthy is crucial. This should include specific advice on avoiding raw vegetables, safe tea house meal choices, and detailed water purification methods.
- **Responsible and Sustainable Trekking:** A guide covering 'Leave No Trace' principles, proper waste disposal (including toilet waste), and how to be an environmentally conscious trekker is missing and increasingly important for preserving Nepal's trails.
- **Women-Specific Safety and Advice:** A dedicated resource for female trekkers addressing personal safety, hygiene management on the trail, and what to expect in Nepali teahouse culture would be a valuable addition.
- **Common Nepali Phrases:** A simple phrasebook with essential words and phrases for trekkers would enhance the cultural interaction section.
- **Detailed Information on Specific Routes:** The current guides are general. In-depth guides for popular treks like Everest Base Camp, Annapurna Circuit, and Manaslu Circuit, with day-by-day itineraries and route-specific hazards, would be a logical next step for this collection.`