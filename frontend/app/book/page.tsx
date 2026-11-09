import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PreBookingForm } from "@/components/pre-booking-form";
import { getAdminSettings, getTreks } from "@/lib/api";
import { CalendarDays, Mail, MapPinned, Users } from "lucide-react";

export default async function BookPage() {
  const [treks, settings] = await Promise.all([getTreks(), getAdminSettings()]);
  const heroImageUrl = (settings.bookingHeroImageUrl || "").trim();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <section className="relative overflow-hidden border-b border-border py-10 md:py-14">
          {heroImageUrl ? (
            <div className="absolute inset-0">
              <Image
                src={heroImageUrl}
                alt="Booking page hero background"
                fill
                sizes="100vw"
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-accent/10 to-background" />
          )}
          <div className="container relative z-10 mx-auto px-4 md:px-6 text-center">
            <h1 className={heroImageUrl ? "text-4xl md:text-5xl font-bold text-white text-balance" : "text-4xl md:text-5xl font-bold text-foreground text-balance"}>Pre-booking Form</h1>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-14">
              <div className="sm:rounded-2xl sm:border sm:border-border sm:bg-card sm:p-8 sm:shadow-sm">
                <p className="mb-6 text-sm text-muted-foreground md:text-base">
                  Tell us about your trip so we can check your dates and prepare the next steps. It takes about 10 minutes. Passport details are optional here, as we only need them once your booking is confirmed.
                </p>
                <PreBookingForm treks={treks} requireTrek />
              </div>

              <aside aria-label="Good to know" className="space-y-6">
                {[
                  { icon: MapPinned, title: "Not sure which trek?", text: "Choose \"Custom trek route / not sure yet\" and we'll help you decide." },
                  { icon: CalendarDays, title: "Flexible dates are welcome", text: "If your dates are approximate, pick your best estimate and tell us under Additional Information." },
                  { icon: Users, title: "Groups and private trips", text: "Choose Group or Private in the form, and tell us your group size under Additional Information." },
                  { icon: Mail, title: "Reply within 24 hours", text: "We send the response to the email address you provide in the form." },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
                    </div>
                  </div>
                ))}
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
