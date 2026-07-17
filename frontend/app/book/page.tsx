import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { BookingForm } from "@/components/booking-form";
import { getTreks } from "@/lib/api";
import { CalendarDays, Mail, MapPinned, Users } from "lucide-react";

export default async function BookPage() {
  const treks = await getTreks();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <section className="py-10 md:py-14 bg-gradient-to-br from-primary/15 via-accent/10 to-background border-b border-border">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs md:text-sm font-semibold text-primary">
              Trek Booking Inquiry
            </p>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-foreground text-balance">Book Your Trek</h1>
            <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              Share your details, choose a trek, and our team will confirm availability, route options, and next steps.
            </p>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              <Card className="lg:col-span-3 border-border p-5 md:p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">Booking Inquiry Form</h2>
                  <p className="mt-2 text-sm md:text-base text-muted-foreground">
                    Email is required. Add your preferred date and group size so we can respond with a practical plan.
                  </p>
                </div>
                <BookingForm treks={treks} requireTrek />
              </Card>

              <div className="lg:col-span-2 space-y-4">
                <Card className="border-border p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPinned className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Choose from active treks</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        The trek dropdown uses the current public trek list, so new active packages appear automatically.
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
                        If your date is approximate, pick your best estimate and add details in the message field.
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
                        Group size helps us suggest guide, porter, and accommodation arrangements.
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
