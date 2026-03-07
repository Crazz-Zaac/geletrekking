import { Layout } from "@/components/Layout";

export default function Terms() {
  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 pt-28 pb-16 max-w-4xl">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Terms and Conditions
            </h1>
            <p className="mt-3 text-sm text-gray-500">
              Please read these terms carefully before booking any trek or tour with Gele Trekking.
            </p>
            <div className="mt-4 h-1 w-20 bg-blue-600 rounded" />
          </div>

          <div className="space-y-10 text-gray-700 text-[15px] leading-relaxed">

            {/* 1 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                1. Travel Documentation Compliance and Requirements
              </h2>
              <p>
                Please ensure that all necessary documents are carried with you in proper sequence
                and be prepared to present them upon request by the company. We cannot be held
                accountable if trip formalities are not completed promptly before the trip departure
                due to the absence of essential papers and documents.
              </p>
              <p className="mt-3">
                When traveling with Gele Trekking, it is imperative to possess a valid passport and
                have obtained the necessary visas. Ensure that your passport remains valid for at
                least 6 months beyond the duration of the trip. It is your responsibility to secure
                the correct visas for the countries you will visit during the Nepal trip. The company
                disclaims any responsibility for entry denials to a country or specific locations due
                to insufficient or incorrect visa documentation. Notably, the Nepal visa can be
                obtained upon arrival in Nepal.
              </p>
            </section>

            <hr className="border-gray-200" />

            {/* 2 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                2. Compliance Agreement
              </h2>
              <div className="space-y-4">
                <div>
                  <span className="font-semibold">a.</span>{" "}
                  Guests are required to adhere to the rules and regulations of the host country
                  throughout their stay. Engagement in any illegal activities is strongly
                  discouraged, and any intentional or unintentional violation of the law by the
                  guest does not warrant the company advocating on their behalf. Should any illegal
                  activities be observed on the part of the client, the company reserves the right
                  to involve the authorities and hand over the clients to them. If a client faces
                  legal consequences due to unlawful actions, the company is not obligated to
                  provide any financial compensation.
                </div>
                <div>
                  <span className="font-semibold">b.</span>{" "}
                  During the expeditions, the team leader assumes the role of authority, and their
                  decisions are considered final. Our team leaders/guides are selected based on
                  extensive training and experience in mountainous regions. In the interest of the
                  safety and well-being of our clients, we urge them to defer to the instructions
                  of our team leaders/guides, setting aside any instincts that may go against these
                  directives. In cases of conflicts among clients, whether verbal, physical, or
                  otherwise, the company's staff will intervene to resolve the issue and retain the
                  right to involve the police if necessary.
                </div>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* 3 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                3. Client Health Notification and Special Requirements
              </h2>
              <p>
                Clients are required to submit written notification of their current physical
                conditions at the time of booking, providing factual information about any medical
                or other mental and physical challenges that may affect their fitness for travel.
                Failure to inform the company at the time of booking may result in clients being
                refused travel. In general, failure to disclose such conditions is akin to granting
                the company the right to impose a 100% cancellation fee.
              </p>
              <p className="mt-3">
                Furthermore, clients should consider factors affecting their ability to travel, such
                as age, mobility, pregnancy, or any physical or mental conditions. In such cases, we
                recommend thoroughly evaluating the trip's comfort level before making a booking.
                The company is not obligated to provide any special facilities unless such
                arrangements have been agreed upon in writing. While the company strives to meet
                clients' special requests, including dietary preferences, these requests do not
                constitute part of the contract, and the company is not liable for any failure to
                fulfil them.
              </p>
            </section>

            <hr className="border-gray-200" />

            {/* 4 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                4. Terms for Booking
              </h2>
              <ul className="space-y-2 list-none pl-0">
                <li>
                  <span className="font-semibold">a. Booking Deadline:</span>{" "}
                  1 month before the trek.
                </li>
                <li>
                  <span className="font-semibold">b. Last Minute Bookings:</span>{" "}
                  Last minute booking is not acceptable for cancellation and is not refundable.
                </li>
                <li>
                  <span className="font-semibold">c. Age Restrictions:</span>{" "}
                  Trekkers must be between 18 and 70 years old to join independently; however, no
                  age restrictions apply for family groups booking together.
                </li>
              </ul>
            </section>

            <hr className="border-gray-200" />

            {/* 5 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                5. Terms for Cancellation
              </h2>
              <p className="mb-3">
                Our priority is to accommodate date changes (postponements) rather than cancellations
                to ensure flexibility for our clients.
              </p>
              <ul className="space-y-2 list-none pl-0">
                <li>
                  <span className="font-semibold">a. Cancellation:</span>{" "}
                  Cancellations are accepted up to 3 months before the scheduled trip. A minimal fee
                  will be deducted based on currency exchange rates and transaction charges.
                </li>
                <li>
                  <span className="font-semibold">b. Date Extension:</span>{" "}
                  Trips can be rescheduled for up to one year from the original cancellation date, at
                  the same rate.
                </li>
              </ul>
            </section>

            <hr className="border-gray-200" />

            {/* 6 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                6. Health and Safety
              </h2>
              <div className="space-y-4">
                <div>
                  <span className="font-semibold">a.</span>{" "}
                  It is mandatory to obtain travel insurance for any Himalayan trip. Your chosen
                  insurance policy should provide sufficient coverage for the entire duration of the
                  trip. The required travel insurance must include a rescue and evacuation policy,
                  covering accidents, injuries, illnesses, and death, along with related expenses,
                  including those associated with pre-existing medical conditions. This coverage
                  should also encompass emergency repatriation, including helicopter rescue and air
                  ambulance services where applicable, as well as personal liability protection.
                </div>
                <div>
                  <span className="font-semibold">b.</span> The company does, however, provide the following:
                  <ul className="mt-2 ml-6 space-y-1 list-disc text-gray-600">
                    <li>A First Aid box, Oxygen, and a certified First Aid Trainer are available to assist you.</li>
                    <li>Satellite phones for emergency communication.</li>
                    <li>Altitude Evacuation (Note: Generally covered by your insurance up to 5,500 meters).</li>
                  </ul>
                </div>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* 7 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                7. Flight Cancellation and Delay
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold mb-1">a. Financial Compensation</p>
                  <ul className="ml-6 space-y-1 list-disc text-gray-600">
                    <li>
                      Gele Trekking is not obligated to provide any financial compensation for flight
                      cancellations unless the cancellation is directly initiated by the company.
                    </li>
                    <li>
                      Clients are responsible for any costs incurred due to flight cancellations,
                      excluding those initiated by Gele Trekking.
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-1">b. Arrangements for Overnight Stay</p>
                  <ul className="ml-6 space-y-1 list-disc text-gray-600">
                    <li>
                      In the event of flight cancellations, it is the responsibility of Gele Trekking
                      to arrange accommodation for guests.
                    </li>
                    <li>
                      Gele Trekking will make efforts to secure suitable overnight stay options for
                      affected clients, ensuring their comfort and safety during the disruption caused
                      by flight cancellations.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* 8 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                8. Early Tour Completion
              </h2>
              <p>
                Occasionally, the tour may conclude before the designated time. For example, in a
                14-day tour, if it concludes in 12 days, the company will not refund the cost for
                the remaining 2 days.
              </p>
            </section>

            <hr className="border-gray-200" />

            {/* 9 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                9. Incomplete Tours
              </h2>
              <div className="space-y-4">
                <div>
                  <span className="font-semibold">a.</span>{" "}
                  In the event of an early return before the completion of the trip, the company will
                  provide coverage for two nights (the first and the last) of accommodation in
                  Kathmandu. Beyond these circumstances, participants are responsible for covering all
                  associated costs and are not entitled to any compensation. However, as always, we
                  remain at your service, and you are welcome to rejoin the group on the last night
                  upon your return.
                </div>
                <div>
                  <span className="font-semibold">b.</span>{" "}
                  Regarding any illness during the trip, the company will prioritize safety, but all
                  associated expenses must be covered by the individual or their insurance.
                </div>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* 10 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                10. Photographic Documentation for Publicity
              </h2>
              <ul className="space-y-2 list-none pl-0">
                <li>
                  <span className="font-semibold">a.</span>{" "}
                  Gele Trekking may request visitors to provide photos and images captured during
                  their trek for publicity and promotional activities.
                </li>
                <li>
                  <span className="font-semibold">b.</span>{" "}
                  Participation in this request is entirely voluntary, and visitors have the option
                  to decline or provide specific guidelines regarding the use of their photos.
                </li>
                <li>
                  <span className="font-semibold">c.</span>{" "}
                  By agreeing to these Terms and Conditions, visitors grant Gele Trekking the
                  non-exclusive right to use, reproduce, and distribute the submitted photos for
                  promotional and publicity purposes, including but not limited to marketing
                  materials, website content, and social media.
                </li>
                <li>
                  <span className="font-semibold">d.</span>{" "}
                  Gele Trekking assures that any personal information or details accompanying the
                  submitted photos will be handled following its Privacy Policy.
                </li>
                <li>
                  <span className="font-semibold">e.</span>{" "}
                  Visitors are encouraged to communicate any specific concerns or preferences
                  regarding the use of their photos to Gele Trekking before or during the trek.
                </li>
              </ul>
            </section>

            <hr className="border-gray-200" />

            {/* 11 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                11. Overnight Stay and Food
              </h2>
              <div className="space-y-4">
                <div>
                  <span className="font-semibold">a.</span>{" "}
                  In the event of flight cancellations (Domestic/International) causing an overnight
                  stay, the client is responsible for the associated costs unless the cancellation is
                  directly attributable to Gele Trekking's actions or negligence.
                </div>
                <div>
                  <span className="font-semibold">b.</span>{" "}
                  Gele Trekking will provide necessary assistance and guidance in case of flight
                  cancellations, but financial responsibility for additional stay and meal costs lies
                  with the client unless it is due to factors within the agency's control.
                </div>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* 12 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                12. Flight Cancellations or Delays (International / Domestic)
              </h2>
              <p>
                Unless initiated by the company, flight cancellations do not obligate the company to
                offer financial compensation. However, it is the responsibility of the agency to
                arrange accommodation for guests in the event of flight cancellations.
              </p>
            </section>

            <hr className="border-gray-200" />

            {/* 13 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                13. Client Information Privacy during Booking
              </h2>
              <p>
                To obtain necessary information during the booking process, the company may ask
                several questions. It is important to note that any private or personal information
                provided by you during the booking process will not be used for any purposes other
                than the booking itself. Your privacy and the confidentiality of your information
                are of utmost importance to us.
              </p>
            </section>

            <hr className="border-gray-200" />

            {/* 14 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                14. Updates to Terms and Conditions
              </h2>
              <p>
                The company retains the right to update and amend these terms and conditions at any
                time. Clients are responsible for staying informed about any changes. The most recent
                version of the terms and conditions can always be accessed on the website{" "}
                <a
                  href="https://www.geletrekking.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  www.geletrekking.com
                </a>{" "}
                and will be the terms referred to in the event of any dispute.
              </p>
            </section>

          </div>
        </div>
      </div>
    </Layout>
  );
}
