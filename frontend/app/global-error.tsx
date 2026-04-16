'use client'

import Link from 'next/link'
import { Home, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="bg-background text-foreground">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md space-y-6 text-center">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="p-4 bg-destructive/10 rounded-full">
                <AlertTriangle className="w-12 h-12 text-destructive" />
              </div>
            </div>

            {/* Error Content */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-foreground">
                Critical Error
              </h1>
              <p className="text-muted-foreground text-base">
                A critical system error has occurred. Please try again or contact support if the problem persists.
              </p>
            </div>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === 'development' && error?.message && (
              <div className="bg-muted p-4 rounded-lg text-left space-y-2 border border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Error Details (Dev Only)
                </p>
                <p className="text-sm font-mono text-destructive break-words max-h-32 overflow-auto">
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
              <Button
                variant="outline"
                className="w-full gap-2"
                asChild
              >
                <Link href="/">
                  <Home className="w-4 h-4" />
                  Return to Home
                </Link>
              </Button>
            </div>

            {/* Contact Support */}
            <div className="pt-4 border-t border-border space-y-3">
              <p className="text-xs text-muted-foreground">
                If this issue persists, please
              </p>
              <Link
                href="/contact"
                className="inline-block text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Contact Our Support Team →
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
