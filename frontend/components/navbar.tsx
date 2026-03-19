'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { treks } from '@/lib/data'
import { WhatsAppIcon } from '@/components/whatsapp-icon'
import { FacebookIcon, InstagramIcon, YouTubeIcon, LinkedInIcon } from '@/components/social-icons'
import Image from 'next/image'
import { useSiteSettings } from '@/hooks/use-site-settings'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  {
    label: 'Destinations',
    href: '/destinations',
    children: treks.map((trek) => ({
      label: trek.title.replace(/\s+Trek$/i, ''),
      href: `/trek/${trek.slug}`,
    })),
  },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Blog', href: '/blog' },
  { label: "FAQ's", href: '/faq' },
  { label: 'Contact', href: '/contact' },
]

export function Navbar() {
  const { settings, social } = useSiteSettings()

  const socialLinks = [
    { Icon: FacebookIcon, href: social.facebook, label: 'Facebook' },
    { Icon: InstagramIcon, href: social.instagram, label: 'Instagram' },
    { Icon: WhatsAppIcon, href: social.whatsapp, label: 'WhatsApp' },
    { Icon: YouTubeIcon, href: social.youtube, label: 'YouTube' },
    { Icon: LinkedInIcon, href: social.linkedin, label: 'LinkedIn' },
  ].filter((item) => item.href)

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[oklch(0.15_0.02_240/0.97)] backdrop-blur-md shadow-lg'
          : 'bg-[oklch(0.15_0.02_240/0.55)] backdrop-blur-sm'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src={settings.logoUrl || '/geletrekking.png'}
            alt={settings.siteName || 'Gele Trekking'}
            width={36}
            height={36}
            className="w-9 h-9 rounded-lg object-cover border border-white/20 shadow"
            priority
          />
          <div className="hidden sm:block">
            <div className="font-bold text-white text-sm leading-tight tracking-widest uppercase group-hover:text-accent transition-colors">
              {settings.siteName || 'GELE TREKKING'}
            </div>
            <div className="text-white/50 text-[8px] uppercase tracking-[2px] leading-tight">
              Walk · Explore · Discover
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) =>
            link.children ? (
              <li
                key={link.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={link.href}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                >
                  {link.label}
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 transition-transform duration-200',
                      openDropdown === link.label && 'rotate-180'
                    )}
                  />
                </Link>
                {openDropdown === link.label && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                    <div className="bg-white rounded-xl shadow-2xl border border-border p-2 min-w-52">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary hover:text-primary rounded-lg transition-colors font-medium"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ) : (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            )
          )}
        </ul>

        {/* CTA + Mobile button */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-1.5">
            {socialLinks.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-8 h-8 rounded-full text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
          <Link
            href="/contact"
            className="hidden md:inline-flex items-center gap-1 bg-accent text-accent-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors"
          >
            Book Now
          </Link>
          <button
            className="lg:hidden p-2 rounded-md text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden bg-[oklch(0.15_0.02_240/0.98)] backdrop-blur-md border-t border-white/10">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <div key={link.label}>
                <Link
                  href={link.href}
                  className="block px-3 py-2.5 text-white font-medium hover:bg-white/10 rounded-md transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
                {link.children && (
                  <div className="pl-4 space-y-1 mt-1">
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-3 py-2 text-white/70 text-sm hover:text-white hover:bg-white/10 rounded-md transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-center gap-2 pb-4">
                {socialLinks.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-full text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
              <Link
                href="/contact"
                className="flex justify-center bg-accent text-accent-foreground font-semibold px-4 py-3 rounded-lg hover:bg-accent/90 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Book a Trek
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
