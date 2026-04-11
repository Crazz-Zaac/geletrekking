'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import {
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { treks as defaultTreks } from '@/lib/data'
import { WhatsAppIcon } from '@/components/whatsapp-icon'
import { FacebookIcon, InstagramIcon, YouTubeIcon, LinkedInIcon } from '@/components/social-icons'
import Image from 'next/image'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { getTreks, getActivities, type PublicActivity } from '@/lib/api'
import { getPlanYourTripColumns, type PlanYourTripGuide } from '@/lib/plan-your-trip-data'
import { getActivityMenuColumn, getActivityMenuIcon, getActivityMenuLabel } from '@/lib/activity-menu'

interface Guide extends PlanYourTripGuide {}

interface GuideColumn {
  title: string
  items: Guide[]
}

interface ActivityColumn {
  title: string
  items: PublicActivity[]
}

export function Navbar() {
  const { settings, social } = useSiteSettings()
  const activitiesEnabled = settings.navigation?.activitiesEnabled ?? true

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
  const [destinationChildren, setDestinationChildren] = useState<Array<{ label: string; href: string }>>([])
  const [guideColumns, setGuideColumns] = useState<GuideColumn[]>([])
  const [activityColumns, setActivityColumns] = useState<ActivityColumn[]>([])
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<Set<string>>(new Set())
  const dropdownCloseTimer = useRef<NodeJS.Timeout | null>(null)

  const openMenu = (menu: string) => {
    if (dropdownCloseTimer.current) {
      clearTimeout(dropdownCloseTimer.current)
      dropdownCloseTimer.current = null
    }
    setOpenDropdown(menu)
  }

  const closeMenuWithDelay = () => {
    if (dropdownCloseTimer.current) {
      clearTimeout(dropdownCloseTimer.current)
    }
    dropdownCloseTimer.current = setTimeout(() => {
      setOpenDropdown(null)
    }, 120)
  }

  const toggleMobileMenu = (menuName: string) => {
    setExpandedMobileMenu((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(menuName)) {
        newSet.delete(menuName)
      } else {
        newSet.add(menuName)
      }
      return newSet
    })
  }

  const isMobileMenuExpanded = (menuName: string) => expandedMobileMenu.has(menuName)

  // Map guides to mega-menu columns
  const mapGuidesToColumns = (): GuideColumn[] => {
    return getPlanYourTripColumns() as GuideColumn[]
  }

  const mapActivitiesToColumns = (activities: PublicActivity[]): ActivityColumn[] => {
    const columns: ActivityColumn[] = [
      { title: 'Adventures', items: [] },
      { title: 'Wellness & Safety', items: [] },
      { title: 'Culture & Community', items: [] },
    ]

    activities.forEach((activity) => {
      const column = getActivityMenuColumn(activity)
      if (column === 'Adventures') {
        columns[0].items.push(activity)
      } else if (column === 'Wellness & Safety') {
        columns[1].items.push(activity)
      } else {
        columns[2].items.push(activity)
      }
    })

    return columns.map((column) => ({
      ...column,
      items: column.items
        .sort((a, b) => {
          const orderDiff = (a.displayOrder || 0) - (b.displayOrder || 0)
          if (orderDiff !== 0) return orderDiff
          const bTime = b.date ? new Date(b.date).getTime() : 0
          const aTime = a.date ? new Date(a.date).getTime() : 0
          return bTime - aTime
        })
        .slice(0, 5),
    }))
  }

  // Load treks from database
  useEffect(() => {
    const loadTreks = async () => {
      try {
        const dbTreks = await getTreks()
        if (dbTreks && dbTreks.length > 0) {
          setDestinationChildren(
            dbTreks.map((trek: any) => ({
              label: trek.name || trek.title,
              href: `/trek/${trek.id || trek.slug}`,
            }))
          )
        } else {
          // Fallback to default treks if database is empty
          setDestinationChildren(
            defaultTreks.map((trek) => ({
              label: trek.title.replace(/\s+Trek$/i, ''),
              href: `/trek/${trek.slug}`,
            }))
          )
        }
      } catch {
        // Fallback to default treks on error
        setDestinationChildren(
          defaultTreks.map((trek) => ({
            label: trek.title.replace(/\s+Trek$/i, ''),
            href: `/trek/${trek.slug}`,
          }))
        )
      }
    }

    void loadTreks()
  }, [])

  // Load guides from local data
  useEffect(() => {
    setGuideColumns(mapGuidesToColumns())
  }, [])

  // Load activities from database
  useEffect(() => {
    const loadActivities = async () => {
      try {
        const data = await getActivities()
        setActivityColumns(mapActivitiesToColumns(data || []))
      } catch (err) {
        console.error('Error loading activities:', err)
        setActivityColumns([])
      }
    }

    void loadActivities()
  }, [])

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
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
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
        <ul className="hidden xl:flex items-center gap-0.5 2xl:gap-1">
          {/* Home */}
          <li>
            <Link
              href="/"
              className="px-2.5 2xl:px-3 py-2 text-[13px] 2xl:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              Home
            </Link>
          </li>

          {/* About Us */}
          <li>
            <Link
              href="/about"
              className="px-2.5 2xl:px-3 py-2 text-[13px] 2xl:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors whitespace-nowrap"
            >
              About Us
            </Link>
          </li>

          {/* Destinations */}
          <li
            className="relative"
            onMouseEnter={() => openMenu('Destinations')}
            onMouseLeave={closeMenuWithDelay}
          >
            <button className="flex items-center gap-1 px-2.5 2xl:px-3 py-2 text-[13px] 2xl:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors">
              Destinations
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 transition-transform duration-200',
                  openDropdown === 'Destinations' && 'rotate-180'
                )}
              />
            </button>

            {openDropdown === 'Destinations' && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 pt-2"
                onMouseEnter={() => openMenu('Destinations')}
                onMouseLeave={closeMenuWithDelay}
              >
                <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden min-w-64">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Popular Destinations</p>
                  </div>
                  <div className="p-2 max-h-80 overflow-y-auto">
                  {destinationChildren.length > 0 ? (
                    destinationChildren.map((child: any) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-3 py-2.5 text-sm text-gray-900 hover:bg-gray-100 hover:text-primary rounded-lg transition-colors font-medium"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {child.label}
                      </Link>
                    ))
                  ) : (
                    <div className="px-3 py-2.5 text-sm text-gray-500">No treks available</div>
                  )}
                  </div>
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                    <Link
                      href="/destinations"
                      className="inline-block text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                      onClick={() => setOpenDropdown(null)}
                    >
                      View All Destinations →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </li>

          {/* Activities - Mega Menu */}
          {activitiesEnabled && (
            <li
              className="relative"
              onMouseEnter={() => openMenu('Activities')}
              onMouseLeave={closeMenuWithDelay}
            >
              <button className="flex items-center gap-1 px-2.5 2xl:px-3 py-2 text-[13px] 2xl:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                Activities
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 transition-transform duration-200',
                    openDropdown === 'Activities' && 'rotate-180'
                  )}
                />
              </button>

              {openDropdown === 'Activities' && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-2"
                  onMouseEnter={() => openMenu('Activities')}
                  onMouseLeave={closeMenuWithDelay}
                >
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-screen max-w-4xl">
                    <div className="grid grid-cols-3 gap-8 p-8">
                      {activityColumns.map((column) => (
                        <div key={column.title}>
                          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">
                            {column.title}
                          </h3>
                          <div className="space-y-3">
                            {column.items.length > 0 ? (
                              column.items.map((activity) => (
                                <Link
                                  key={activity._id}
                                  href="/activities"
                                  className="group/item block"
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-1 rounded-lg bg-primary/10 p-2 group-hover/item:bg-primary/20 transition-colors">
                                      {(() => {
                                        const ItemIcon = getActivityMenuIcon(activity)
                                        return <ItemIcon className="w-4 h-4 text-primary" />
                                      })()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-gray-900 group-hover/item:text-primary transition-colors line-clamp-2">
                                        {getActivityMenuLabel(activity)}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                        {activity.shortDescription || activity.description || ''}
                                      </p>
                                    </div>
                                  </div>
                                </Link>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500">No activities available</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 bg-gray-50 px-8 py-4">
                      <Link
                        href="/activities"
                        className="inline-block text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                        onClick={() => setOpenDropdown(null)}
                      >
                        View All Activities →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </li>
          )}

          {/* Plan Your Trip - Mega Menu */}
          <li
            className="relative"
            onMouseEnter={() => openMenu('Plan Your Trip')}
            onMouseLeave={closeMenuWithDelay}
          >
            <button className="flex items-center gap-1 px-2.5 2xl:px-3 py-2 text-[13px] 2xl:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors whitespace-nowrap">
              Plan Your Trip
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 transition-transform duration-200',
                  openDropdown === 'Plan Your Trip' && 'rotate-180'
                )}
              />
            </button>

            {openDropdown === 'Plan Your Trip' && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 pt-2"
                onMouseEnter={() => openMenu('Plan Your Trip')}
                onMouseLeave={closeMenuWithDelay}
              >
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-screen max-w-4xl">
                  <div className="grid grid-cols-3 gap-8 p-8">
                    {guideColumns.map((column) => (
                      <div key={column.title}>
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">
                          {column.title}
                        </h3>
                        <div className="space-y-3">
                          {column.items.length > 0 ? (
                            column.items.map((guide) => (
                              <Link
                                key={guide.id}
                                href={`/guides/${guide.slug}`}
                                className="group/item block"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="mt-1 rounded-lg bg-primary/10 p-2 group-hover/item:bg-primary/20 transition-colors">
                                    {(() => {
                                      // Simple icon mapping for guide icons
                                      const iconMap: Record<string, string> = {
                                        CheckCircle: '✓',
                                        Heart: '♥',
                                        AlertCircle: '!',
                                        Smartphone: '📱',
                                        FileCheck: '✓',
                                        Shield: '🛡',
                                        Backpack: '🎒',
                                        CloudSun: '☀',
                                        FileBadge2: '📄',
                                        CircleHelp: '?',
                                      }
                                      return <span className="text-primary text-lg">{iconMap[guide.icon] || '📌'}</span>
                                    })()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 group-hover/item:text-primary transition-colors line-clamp-2">
                                      {guide.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                      {guide.description}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No guides available</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 bg-gray-50 px-8 py-4">
                    <Link
                      href="/guides"
                      className="inline-block text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                      onClick={() => setOpenDropdown(null)}
                    >
                      View All Guides →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </li>

          {/* Gallery */}
          <li>
            <Link
              href="/gallery"
              className="px-2.5 2xl:px-3 py-2 text-[13px] 2xl:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              Gallery
            </Link>
          </li>

          {/* Blogs */}
          <li>
            <Link
              href="/blog"
              className="px-2.5 2xl:px-3 py-2 text-[13px] 2xl:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              Blogs
            </Link>
          </li>

          {/* FAQs */}
          <li>
            <Link
              href="/faq"
              className="px-2.5 2xl:px-3 py-2 text-[13px] 2xl:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              FAQs
            </Link>
          </li>

          {/* Contact */}
          <li>
            <Link
              href="/contact"
              className="px-2.5 2xl:px-3 py-2 text-[13px] 2xl:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              Contact
            </Link>
          </li>
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
            className="hidden md:inline-flex items-center gap-1 bg-accent text-accent-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors whitespace-nowrap"
          >
            Book Now
          </Link>
          <button
            className="xl:hidden p-2 rounded-md text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="xl:hidden bg-[oklch(0.15_0.02_240/0.98)] backdrop-blur-md border-t border-white/10">
          <div className="px-4 py-4 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2.5 text-white font-medium hover:bg-white/10 rounded-md transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2.5 text-white font-medium hover:bg-white/10 rounded-md transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              About Us
            </Link>

            {/* Mobile Destinations */}
            <div>
              <button
                className="block w-full text-left px-3 py-2.5 text-white font-medium hover:bg-white/10 rounded-md transition-colors flex items-center justify-between"
                onClick={() => toggleMobileMenu('destinations')}
              >
                Destinations
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    isMobileMenuExpanded('destinations') && 'rotate-180'
                  )}
                />
              </button>
              {isMobileMenuExpanded('destinations') && destinationChildren.length > 0 && (
                <div className="pl-4 space-y-1 mt-1 max-h-48 overflow-y-auto">
                  {destinationChildren.map((child: any) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      className="block px-3 py-2 text-white/70 text-sm hover:text-white hover:bg-white/10 rounded-md transition-colors"
                      onClick={() => {
                        setMobileOpen(false)
                        setExpandedMobileMenu(new Set())
                      }}
                    >
                      {child.label}
                    </Link>
                  ))}
                  <Link
                    href="/destinations"
                    className="block px-3 py-2 text-accent text-sm font-semibold hover:bg-white/10 rounded-md transition-colors"
                    onClick={() => {
                      setMobileOpen(false)
                      setExpandedMobileMenu(new Set())
                    }}
                  >
                    View All Destinations →
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Activities */}
            {activitiesEnabled && (
              <div>
                <button
                  className="block w-full text-left px-3 py-2.5 text-white font-medium hover:bg-white/10 rounded-md transition-colors flex items-center justify-between"
                  onClick={() => toggleMobileMenu('activities')}
                >
                  Activities
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform duration-200',
                      isMobileMenuExpanded('activities') && 'rotate-180'
                    )}
                  />
                </button>
                {isMobileMenuExpanded('activities') && activityColumns.some((column) => column.items.length > 0) && (
                  <div className="pl-4 space-y-1 mt-1 max-h-48 overflow-y-auto">
                    {activityColumns.flatMap((column) =>
                      column.items.map((activity) => (
                        <Link
                          key={activity._id}
                          href="/activities"
                          className="block px-3 py-2 text-white/70 text-sm hover:text-white hover:bg-white/10 rounded-md transition-colors"
                          onClick={() => {
                            setMobileOpen(false)
                            setExpandedMobileMenu(new Set())
                          }}
                        >
                          {getActivityMenuLabel(activity)}
                        </Link>
                      ))
                    )}
                    <Link
                      href="/activities"
                      className="block px-3 py-2 text-accent text-sm font-semibold hover:bg-white/10 rounded-md transition-colors"
                      onClick={() => {
                        setMobileOpen(false)
                        setExpandedMobileMenu(new Set())
                      }}
                    >
                      View All Activities →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Plan Your Trip */}
            <div>
              <button
                className="block w-full text-left px-3 py-2.5 text-white font-medium hover:bg-white/10 rounded-md transition-colors flex items-center justify-between"
                onClick={() => toggleMobileMenu('guides')}
              >
                Plan Your Trip
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    isMobileMenuExpanded('guides') && 'rotate-180'
                  )}
                />
              </button>
              {isMobileMenuExpanded('guides') && guideColumns.length > 0 && (
                <div className="pl-4 space-y-1 mt-1 max-h-48 overflow-y-auto">
                  {guideColumns.flatMap((column) =>
                    column.items.map((guide) => (
                      <Link
                        key={guide.id}
                        href={`/guides/${guide.slug}`}
                        className="block px-3 py-2 text-white/70 text-sm hover:text-white hover:bg-white/10 rounded-md transition-colors"
                        onClick={() => {
                          setMobileOpen(false)
                          setExpandedMobileMenu(new Set())
                        }}
                      >
                        {guide.title}
                      </Link>
                    ))
                  )}
                  <Link
                    href="/guides"
                    className="block px-3 py-2 text-accent text-sm font-semibold hover:bg-white/10 rounded-md transition-colors"
                    onClick={() => {
                      setMobileOpen(false)
                      setExpandedMobileMenu(new Set())
                    }}
                  >
                    View All Guides →
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/gallery"
              className="block px-3 py-2.5 text-white font-medium hover:bg-white/10 rounded-md transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Gallery
            </Link>
            <Link
              href="/blog"
              className="block px-3 py-2.5 text-white font-medium hover:bg-white/10 rounded-md transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Blogs
            </Link>
            <Link
              href="/faq"
              className="block px-3 py-2.5 text-white font-medium hover:bg-white/10 rounded-md transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              FAQs
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2.5 text-white font-medium hover:bg-white/10 rounded-md transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Contact
            </Link>

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
