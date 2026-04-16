'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { AlertCircle, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error for monitoring/debugging purposes
    console.error('Application Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="p-4 bg-destructive/10 rounded-full">
            <AlertCircle className="w-12 h-12 text-destructive" />
          </div>
        </div>

        {/* Error Content */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            Oops! Something went wrong
          </h1>
          <p className="text-muted-foreground text-base">
            We encountered an unexpected error. Our team has been notified.
          </p>
        </div>

        {/* Error Details (Development) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="bg-muted p-4 rounded-lg text-left space-y-2 border border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Error Details (Dev Only)
            </p>
            <p className="text-sm font-mono text-destructive break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={reset}
            className="w-full"
            size="lg"
          >
            Try Again
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              asChild
            >
              <button onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              asChild
            >
              <Link href="/">
                <Home className="w-4 h-4" />
                Home
              </Link>
            </Button>
          </div>
        </div>

        {/* Help Section */}
        <div className="pt-4 border-t border-border space-y-3">
          <p className="text-xs text-muted-foreground">
            Need additional help?
          </p>
          <Link
            href="/contact"
            className="inline-block text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  )
}
