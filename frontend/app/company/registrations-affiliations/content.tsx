'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowUpRight, BadgeCheck, Building2, Clock, FileText, Mail, Search, ShieldCheck, Users, ZoomIn } from 'lucide-react'
import type { PublicRegistrationDocument } from '@/lib/api'
import { CopyButton } from '@/components/copy-button'
import { CONTACT_EMAIL } from '@/lib/contact-links'

type Association = { name: string; logoUrl: string }

function formatDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return ''
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))
}

const isFuture = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= new Date().toISOString().slice(0, 10)

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()

/** Logo for a membership: its own, or the matching association logo from the About page. */
function findLogo(doc: PublicRegistrationDocument, associations: Association[]) {
  if (doc.logoUrl) return doc.logoUrl
  const haystack = normalise(`${doc.title} ${doc.issuer}`)
  const match = associations.find((a) => {
    const name = normalise(a.name)
    return name && (haystack.includes(name) || name.includes(normalise(doc.issuer || '___')))
  })
  return match?.logoUrl || ''
}

function ReferenceNumber({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 flex items-center gap-2">
        <span className="font-mono text-sm font-semibold text-foreground">{value}</span>
        <CopyButton value={value} iconOnly className="h-6 w-6 justify-center border-0 bg-transparent px-0" />
      </dd>
    </div>
  )
}

function VerifyLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      <BadgeCheck className="h-4 w-4" aria-hidden="true" />
      {children}
      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  )
}

function DocumentPreview({ doc, onOpen }: { doc: PublicRegistrationDocument; onOpen: () => void }) {
  if (doc.previewUrl) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="group relative block aspect-[4/3] w-full overflow-hidden border-b border-border bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        aria-label={`View ${doc.title} full size`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={doc.previewUrl} alt={`${doc.title} (watermarked copy)`} loading="lazy" className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.02]" />
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white opacity-90 transition-opacity group-hover:opacity-100">
          <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" /> View full size
        </span>
      </button>
    )
  }
  if (doc.pdfUrl) {
    return (
      <button type="button" onClick={onOpen} className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 border-b border-border bg-muted/50 text-muted-foreground transition-colors hover:text-primary">
        <FileText className="h-10 w-10" aria-hidden="true" />
        <span className="text-sm font-medium">View PDF certificate</span>
      </button>
    )
  }
  return (
    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 border-b border-dashed border-border bg-muted/30 text-muted-foreground">
      <Clock className="h-8 w-8" aria-hidden="true" />
      <span className="text-sm">Certificate copy coming soon</span>
    </div>
  )
}

export default function RegistrationsAffiliationsContent({ documents, associations }: { documents: PublicRegistrationDocument[]; associations: Association[] }) {
  const [selected, setSelected] = useState<PublicRegistrationDocument | null>(null)

  const registrations = documents.filter((doc) => doc.kind !== 'membership')
  const memberships = documents.filter((doc) => doc.kind === 'membership')

  return (
    <main className="min-h-screen bg-background pt-16">
      <section className="border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-3 text-center">
            <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">Company</p>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">Registrations & Affiliations</h1>
            <p className="text-muted-foreground">
              Gele Trekking is a registered trekking company in Nepal. Below are our official registrations and memberships, with registration numbers you can check yourself.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto space-y-14 px-4 py-10 md:px-6 md:py-14">
        {/* How to verify */}
        <section aria-labelledby="verify-heading" className="rounded-2xl border border-primary/20 bg-primary/5 p-5 md:p-6">
          <h2 id="verify-heading" className="flex items-center gap-2 text-lg font-bold text-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" /> How to verify us
          </h2>
          <ol className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              { icon: FileText, title: 'Note a number', text: 'Each government registration and licence below lists its official number.' },
              { icon: Search, title: 'Check it independently', text: 'Ask the issuing authority or association to confirm us, or use a “Verify” link where one is shown.' },
              { icon: Mail, title: 'Still unsure? Ask us', text: `Write to ${CONTACT_EMAIL} and we will send anything else you need.` },
            ].map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{index + 1}</span>
                <div>
                  <p className="font-semibold text-foreground">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Registrations */}
        <section aria-labelledby="registrations-heading">
          <h2 id="registrations-heading" className="mb-1 flex items-center gap-2 text-2xl font-bold text-foreground">
            <Building2 className="h-6 w-6 text-primary" aria-hidden="true" /> Registrations & licences
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">Issued by the Government of Nepal.</p>
          {registrations.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">Registration details will be published here shortly.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {registrations.map((doc) => (
                <article key={doc.code} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <DocumentPreview doc={doc} onOpen={() => setSelected(doc)} />
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-bold text-foreground">{doc.title}</h3>
                    {doc.issuer && <p className="mt-0.5 text-sm text-muted-foreground">Issued by {doc.issuer}</p>}
                    {doc.description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{doc.description}</p>}
                    {(doc.referenceNumber || formatDate(doc.issuedOn) || isFuture(doc.validUntil)) && (
                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4">
                      {doc.referenceNumber && (
                        <div className="col-span-2">
                          <ReferenceNumber label="Registration no." value={doc.referenceNumber} />
                        </div>
                      )}
                      {formatDate(doc.issuedOn) && (
                        <div>
                          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Issued</dt>
                          <dd className="mt-0.5 text-sm text-foreground">{formatDate(doc.issuedOn)}</dd>
                        </div>
                      )}
                      {isFuture(doc.validUntil) && (
                        <div>
                          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Valid until</dt>
                          <dd className="mt-0.5 text-sm text-foreground">{formatDate(doc.validUntil)}</dd>
                        </div>
                      )}
                    </dl>
                    )}
                    {doc.verifyUrl && (
                      <div className="mt-auto pt-4">
                        <VerifyLink href={doc.verifyUrl}>Verify with issuer</VerifyLink>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Memberships */}
        <section aria-labelledby="memberships-heading">
          <h2 id="memberships-heading" className="mb-1 flex items-center gap-2 text-2xl font-bold text-foreground">
            <Users className="h-6 w-6 text-primary" aria-hidden="true" /> Memberships & affiliations
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">Industry bodies we belong to. Check our membership on their official websites.</p>
          {memberships.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {memberships.map((doc) => {
                const logo = findLogo(doc, associations)
                const since = /^\d{4}/.test(doc.issuedOn) ? doc.issuedOn.slice(0, 4) : ''
                return (
                  <article key={doc.code} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex h-16 min-w-16 max-w-[10rem] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white px-2 py-1.5">
                      {logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logo} alt="" className="h-full w-auto max-w-full object-contain" loading="lazy" />
                      ) : (
                        <Users className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-foreground">{doc.title}</h3>
                      {(doc.issuer || since) && (
                        <p className="text-sm text-muted-foreground">{[doc.issuer, since && `Member since ${since}`].filter(Boolean).join(' · ')}</p>
                      )}
                      {doc.referenceNumber && (
                        <dl className="mt-3">
                          <ReferenceNumber label="Member no." value={doc.referenceNumber} />
                        </dl>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {doc.verifyUrl && <VerifyLink href={doc.verifyUrl}>Verify membership</VerifyLink>}
                        {(doc.previewUrl || doc.pdfUrl) && (
                          <button
                            type="button"
                            onClick={() => setSelected(doc)}
                            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <ZoomIn className="h-4 w-4" aria-hidden="true" /> View certificate
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : associations.length > 0 ? (
            <ul className="flex flex-wrap gap-4">
              {associations.map((association) => (
                <li key={association.name} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                  {/* Same height for every logo; wide ones (TAAN, NMA) can use more width. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={association.logoUrl} alt="" className="h-12 w-auto max-w-[10rem] rounded bg-white object-contain" loading="lazy" />
                  <span className="text-sm font-medium text-foreground">{association.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">Membership details will be published here shortly.</p>
          )}
        </section>

        <p className="flex items-start gap-2 border-t border-border pt-6 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Certificate images are watermarked and shared for verification only. Personal details have been removed. If you need to verify anything else, email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-primary hover:underline">{CONTACT_EMAIL}</a>.
        </p>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="flex max-h-[92vh] w-[calc(100vw-2rem)] max-w-4xl flex-col sm:max-w-4xl gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4 text-left">
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              {[selected?.issuer && `Issued by ${selected.issuer}`, selected?.referenceNumber && `No. ${selected.referenceNumber}`].filter(Boolean).join(' · ') || 'Watermarked copy for verification'}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-auto bg-muted/40 p-4">
            {selected?.fullUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.fullUrl} alt={`${selected.title} (watermarked copy)`} className="mx-auto max-h-[75vh] w-auto max-w-full object-contain shadow-md" />
            ) : selected?.pdfUrl ? (
              <iframe src={selected.pdfUrl} title={selected.title} className="h-[75vh] w-full rounded border border-border bg-white" />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
