'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function TrekError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Trek Page Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center px-4 pt-32">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="p-4 bg-destructive/10 rounded-full">
            <AlertCircle className="w-12 h-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            Trek Not Found
          </h1>
          <p className="text-muted-foreground text-base">
            The trek you're looking for could not be loaded. It may have been removed or the ID might be incorrect.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="bg-muted p-4 rounded-lg text-left space-y-2 border border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Error Details
            </p>
            <p className="text-sm font-mono text-destructive break-words">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={reset} className="w-full" size="lg">
            Try Again
          </Button>
          <Button variant="outline" className="w-full gap-2" asChild>
            <button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </Button>
        </div>

        <div className="pt-4 border-t border-border space-y-3">
          <Link
            href="/destinations"
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            View All Treks →
          </Link>
        </div>
      </div>
    </div>
  )
}
