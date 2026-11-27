import { LegalDocument } from '@/components/legal-document'
import { TERMS_CLOSING, TERMS_EFFECTIVE, TERMS_HIGHLIGHTS, TERMS_SECTIONS, TERMS_VERSION } from '@/lib/terms-content'

export default function TermsPage() {
  return (
    <LegalDocument
      path="/terms-and-conditions"
      eyebrow="Legal · Terms & Conditions"
      title="Terms & Conditions"
      intro="The terms for booking and joining a trek with Gele Trekking: payments, cancellations, safety responsibilities, insurance and what happens when mountain conditions change."
      effective={TERMS_EFFECTIVE}
      version={TERMS_VERSION}
      highlightsTitle="Key terms at a glance"
      highlights={TERMS_HIGHLIGHTS}
      sections={TERMS_SECTIONS}
      closing={TERMS_CLOSING}
    />
  )
}
