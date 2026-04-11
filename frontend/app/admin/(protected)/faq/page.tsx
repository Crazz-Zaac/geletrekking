'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, BookOpen } from 'lucide-react'
import { generalFAQ, trekFAQs } from '@/lib/faq-data'

export default function AdminFaqPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">FAQ Management</h1>
          <p className="text-muted-foreground">FAQ content is now hardcoded and static</p>
        </div>

        <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            FAQs are now served from static data files instead of the database. To edit FAQs, update the data files directly:
            <ul className="mt-2 ml-4 list-disc space-y-1">
              <li><code className="bg-white/50 dark:bg-black/30 px-2 py-1 rounded text-sm">frontend/lib/faq-data.ts</code> - General FAQs and trek-specific FAQs</li>
              <li><code className="bg-white/50 dark:bg-black/30 px-2 py-1 rounded text-sm">backend/data/faq-data.js</code> - Backend FAQ data</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* General FAQs */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">General FAQs</h2>
            <span className="ml-auto text-sm font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              {generalFAQ.faqs.length} questions
            </span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{generalFAQ.heroTitle}</CardTitle>
              <CardDescription>{generalFAQ.heroSubtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {generalFAQ.faqs.map((faq, idx) => (
                  <div key={idx} className="border-l-2 border-primary/20 pl-4 py-2">
                    <p className="font-semibold text-foreground text-sm">{idx + 1}. {faq.question}</p>
                    <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trek FAQs */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Trek-Specific FAQs</h2>
            <span className="ml-auto text-sm font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              {trekFAQs.length} treks
            </span>
          </div>

          <div className="grid gap-4">
            {trekFAQs.map((trek) => (
              <Card key={trek.trekSlug}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{trek.trekTitle}</CardTitle>
                      <CardDescription className="mt-1 text-xs font-mono text-muted-foreground">{trek.trekSlug}</CardDescription>
                    </div>
                    <span className="text-sm font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      {trek.faqs.length} Q&A
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trek.faqs.map((faq, idx) => (
                      <div key={idx} className="border-l-2 border-accent/20 pl-4 py-2">
                        <p className="font-semibold text-foreground text-sm">{idx + 1}. {faq.question}</p>
                        <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Summary */}
        <Card className="mt-8 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <CardTitle className="text-green-800 dark:text-green-200">FAQ Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-green-700 dark:text-green-300 text-sm space-y-2">
            <p>✓ General FAQs: {generalFAQ.faqs.length} questions configured</p>
            <p>✓ Trek FAQs: {trekFAQs.length} destinations with FAQ content</p>
            <p>✓ Total Questions: {generalFAQ.faqs.length + trekFAQs.reduce((sum, t) => sum + t.faqs.length, 0)} questions</p>
            <p>✓ FAQs appear on public <code className="bg-white/30 px-1 rounded text-xs">/faq</code> page and in destination detail pages</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
