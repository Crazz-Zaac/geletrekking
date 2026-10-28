'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileText, ShieldCheck, X, ZoomIn } from 'lucide-react'
import type { RegistrationDocument } from '@/lib/api'

export default function RegistrationsAffiliationsContent({ documents }: { documents: RegistrationDocument[] }) {
  const [selectedDoc, setSelectedDoc] = useState<RegistrationDocument | null>(null)
  const [fullScreenOpen, setFullScreenOpen] = useState(false)

  const handleOpenFullScreen = (doc: RegistrationDocument) => {
    setSelectedDoc(doc)
    setFullScreenOpen(true)
  }

  const handleCloseFullScreen = () => {
    setFullScreenOpen(false)
    setSelectedDoc(null)
  }

  const isImage = selectedDoc?.documentType === 'image'
  const isPdf = selectedDoc?.documentType === 'pdf'

  return (
    <>
      <main className="min-h-screen bg-background pt-16">
        <section className="py-12 md:py-16 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-3">
              <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
                Company
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Registrations & Affiliations</h1>
              <p className="text-muted-foreground">
                Official certificates and documents validating our company registrations and industry affiliations.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 md:px-6">
            {documents.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center space-y-3">
                  <p className="text-muted-foreground">No documents available yet.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {documents.map((document) => (
                  <Card key={document.code} className="border-border p-5 hover:shadow-lg transition-shadow">
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

                    <div className="space-y-3">
                      {/* Status badges */}
                      <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                            document.status === 'uploaded'
                              ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                              : document.status === 'pending'
                                ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
                                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {document.status === 'uploaded' ? 'Verified' : document.status === 'pending' ? 'Pending' : 'Placeholder'}
                        </span>
                      </div>

                      {/* View button - only show if document is uploaded */}
                      {document.status === 'uploaded' && document.documentUrl && (
                        <a
                          href={document.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => { event.preventDefault(); handleOpenFullScreen(document) }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition text-sm font-medium"
                        >
                          <ZoomIn className="w-4 h-4" />
                          View Document
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Full Screen Viewer Dialog */}
      <Dialog open={fullScreenOpen} onOpenChange={handleCloseFullScreen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
            <DialogTitle>{selectedDoc?.title}</DialogTitle>
            <button
              onClick={handleCloseFullScreen}
              className="absolute right-4 top-4 p-1 hover:bg-muted rounded-md transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogHeader>

          <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center">
            {isImage && selectedDoc?.documentUrl ? (
              <img
                src={selectedDoc.documentUrl}
                alt={selectedDoc.title}
                className="max-w-full max-h-full object-contain"
              />
            ) : isPdf && selectedDoc?.documentUrl ? (
              <iframe
                src={selectedDoc.documentUrl}
                title={selectedDoc.title}
                className="w-full h-full"
                style={{ minHeight: '500px' }}
              />
            ) : (
              <p className="text-muted-foreground">Document not available</p>
            )}
          </div>

          {selectedDoc?.documentUrl && (
            <div className="px-6 py-4 border-t border-border bg-muted/50 shrink-0">
              <a
                href={selectedDoc.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition font-medium text-sm"
              >
                {isPdf ? 'Download PDF' : 'Download Image'}
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
