import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card } from '@/components/ui/card'
import { BadgeCheck, FileText, ShieldCheck } from 'lucide-react'

const documents = [
  {
    title: 'Company Registration Certificate',
    code: 'DOC-01',
    description: 'Official company registration issued by the relevant authority.',
  },
  {
    title: 'PAN / Tax Registration',
    code: 'DOC-02',
    description: 'Tax and PAN registration document for legal business operations.',
  },
  {
    title: 'Nepal Tourism Board Affiliation',
    code: 'DOC-03',
    description: 'Affiliation and authorization record with Nepal Tourism Board.',
  },
  {
    title: 'TAAN Membership Certificate',
    code: 'DOC-04',
    description: 'Trekking Agencies’ Association of Nepal membership proof.',
  },
  {
    title: 'NMA Affiliation Certificate',
    code: 'DOC-05',
    description: 'Nepal Mountaineering Association affiliation document.',
  },
  {
    title: 'Local Government Trade License',
    code: 'DOC-06',
    description: 'Valid municipal/local government trade operation license.',
  },
]

export default function RegistrationsAffiliationsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <section className="py-12 md:py-16 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-3">
              <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
                Company
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Registrations & Affiliations</h1>
              <p className="text-muted-foreground">
                This page contains placeholders for legal and affiliation documents. Final certified files can be uploaded/replaced anytime.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {documents.map((document) => (
                <Card key={document.code} className="border-border p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {document.code}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">{document.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{document.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Placeholder
                    </span>
                    <span className="inline-flex items-center gap-1 text-primary font-semibold">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Upload Pending
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}