import Link from 'next/link'
import { Search, Home, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: '404 - Page Not Found | Gele Trekking',
  description: 'The page you are looking for could not be found. Explore our treks and guides instead.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* 404 Icon/Number */}
        <div className="space-y-2">
          <div className="text-6xl font-bold text-muted-foreground/30">
            404
          </div>
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Search className="w-12 h-12 text-primary" />
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            Page Not Found
          </h1>
          <p className="text-muted-foreground text-base">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track!
          </p>
        </div>

        {/* Suggestions */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2 border border-border">
          <p className="text-sm font-semibold text-foreground">
            Here's what you can do:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 text-left">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Check the URL for any typos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Return to the home page and navigate from there</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Explore our trek destinations and guides</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <Button
            className="w-full gap-2"
            asChild
          >
            <Link href="/">
              <Home className="w-4 h-4" />
              Go to Home Page
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2"
            asChild
          >
            <Link href="/destinations">
              <MapPin className="w-4 h-4" />
              Explore Treks
            </Link>
          </Button>
        </div>

        {/* Help Section */}
        <div className="pt-4 border-t border-border space-y-3">
          <p className="text-xs text-muted-foreground">
            Still having trouble finding what you need?
          </p>
          <Link
            href="/contact"
            className="inline-block text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Get in Touch with Us →
          </Link>
        </div>

        {/* Popular Links */}
        <div className="pt-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Quick Navigation
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/about"
              className="text-xs text-primary hover:text-primary/80 transition-colors underline"
            >
              About Us
            </Link>
            <Link
              href="/blog"
              className="text-xs text-primary hover:text-primary/80 transition-colors underline"
            >
              Blog
            </Link>
            <Link
              href="/faq"
              className="text-xs text-primary hover:text-primary/80 transition-colors underline"
            >
              FAQ
            </Link>
            <Link
              href="/guides"
              className="text-xs text-primary hover:text-primary/80 transition-colors underline"
            >
              Guides
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
