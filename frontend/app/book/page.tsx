import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
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
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              <Card className="lg:col-span-3 border-border p-5 md:p-8 shadow-sm">
                <div className="mb-6">
                  <p className="text-sm md:text-base text-muted-foreground">
                    Tell us about your trip so we can check your dates and prepare the next steps. It takes about 10 minutes, and your passport details will be needed.
                  </p>
                </div>
                <PreBookingForm treks={treks} requireTrek />
              </Card>

              <div className="lg:col-span-2 space-y-4">
                <Card className="border-border p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPinned className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Not sure which trek?</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Choose &quot;Custom trek route / not sure yet&quot; and we&apos;ll help you decide.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="border-border p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <CalendarDays className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Flexible dates are welcome</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        If your dates are approximate, pick your best estimate and tell us under Additional Information.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="border-border p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Groups and private trips</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Choose Group or Private in the form, and tell us your group size under Additional Information.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="border-border p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Reply within 24 hours</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        We send the response to the email address you provide in the form.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
