import {
  Activity,
  BarChart3,
  BookOpen,
  Building2,
  CalendarCheck,
  Flame,
  HelpCircle,
  Image as ImageIcon,
  Info,
  LayoutDashboard,
  Mail,
  AtSign,
  MailCheck,
  Megaphone,
  Mountain,
  Newspaper,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  type LucideIcon, CalendarClock } from 'lucide-react'

export type AdminRole = 'editor' | 'superadmin'

export type AdminNavItem = {
  label: string
  href: string
  icon: LucideIcon
  description: string
  /** Extra words the search palette matches on. */
  keywords?: string[]
  /** Restrict to these roles; visible to everyone when omitted. */
  roles?: AdminRole[]
  /** Show an unread counter from the notification summary. */
  badge?: 'messages' | 'bookings'
  /** Opens an outside site (e.g. the mailbox) in a new tab. */
  external?: boolean
}

export type AdminNavGroup = {
  label: string
  items: AdminNavItem[]
}

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, description: 'What needs attention today', keywords: ['home', 'overview'] },
      { label: 'Performance', href: '/admin/performance', icon: TrendingUp, description: 'Traffic and site analytics', keywords: ['analytics', 'visitors', 'stats', 'traffic'], roles: ['superadmin'] },
    ],
  },
  {
    label: 'Inbox',
    items: [
      { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck, description: 'Booking forms and private booking links', keywords: ['booking form', 'private link', 'pdf', 'reservation'], badge: 'bookings' },
      { label: 'Messages', href: '/admin/messages', icon: Mail, description: 'Contact form enquiries', keywords: ['contact', 'enquiry', 'inquiry', 'email'], badge: 'messages' },
      { label: 'Email inbox (Zoho)', href: 'https://mail.zoho.com', icon: AtSign, description: 'info@geletrekking.com on Zoho Mail (opens in a new tab)', keywords: ['zoho', 'mail', 'email', 'inbox', 'info@', 'webmail'], external: true },
      { label: 'Call bookings (Cal.com)', href: 'https://app.cal.com/bookings/upcoming', icon: CalendarClock, description: 'Free 15-min calls visitors booked (opens in a new tab)', keywords: ['cal', 'cal.com', 'call', 'meeting', 'appointment', 'calendar', '15 min'], external: true },
      { label: 'Subscribers', href: '/admin/subscribers', icon: MailCheck, description: 'Packing-list sign-ups and email opt-ins', keywords: ['leads', 'newsletter', 'emails', 'export', 'csv', 'packing list'] },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Treks', href: '/admin/treks', icon: Mountain, description: 'Trekking packages, itineraries, prices, availability', keywords: ['destinations', 'packages', 'itinerary', 'price', 'availability', 'departures'] },
      { label: 'Activities', href: '/admin/activities', icon: Activity, description: 'Tours and add-on experiences', keywords: ['tours', 'experiences'] },
      { label: 'Blog', href: '/admin/blogs', icon: Newspaper, description: 'Articles and drafts', keywords: ['posts', 'articles', 'drafts', 'publish'] },
      { label: 'Travel guides', href: '/admin/trip-plan', icon: BookOpen, description: 'Trip planning guides (permits, gear, seasons)', keywords: ['trip plan', 'guides', 'permits', 'visa', 'insurance', 'gear'] },
      { label: 'Gallery', href: '/admin/gallery', icon: ImageIcon, description: 'Photos and gallery categories', keywords: ['photos', 'images', 'pictures'] },
    ],
  },
  {
    label: 'Website pages',
    items: [
      { label: 'Homepage hero', href: '/admin/hero', icon: Flame, description: 'Homepage headline, image and video', keywords: ['hero', 'banner', 'homepage', 'headline'] },
      { label: 'About page', href: '/admin/about', icon: Info, description: 'Story, team and stats', keywords: ['team', 'story', 'mission'] },
      { label: 'FAQ', href: '/admin/faq', icon: HelpCircle, description: 'Frequently asked questions', keywords: ['questions', 'answers'] },
      { label: 'Site alerts', href: '/admin/alerts', icon: Megaphone, description: 'Announcement banners shown on the site', keywords: ['announcement', 'banner', 'notice', 'alert'] },
      { label: 'Company & registrations', href: '/admin/company', icon: Building2, description: 'Licences, registrations and affiliations', keywords: ['license', 'licence', 'registration', 'affiliation', 'documents', 'taan', 'ntb'], roles: ['superadmin'] },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Site settings', href: '/admin/settings', icon: Settings, description: 'Branding, contact details and social links', keywords: ['settings', 'logo', 'contact', 'social'], roles: ['superadmin'] },
      { label: 'Account security', href: '/admin/account-security', icon: ShieldCheck, description: 'Your two-factor authentication', keywords: ['2fa', 'two factor', 'authenticator', 'security', 'password'] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Users', href: '/admin/users', icon: Users, description: 'Admin accounts and invitations', keywords: ['invite', 'editor', 'accounts', 'team members'], roles: ['superadmin'] },
      { label: 'Audit logs', href: '/admin/audit-logs', icon: BarChart3, description: 'Sign-ins and content changes', keywords: ['logs', 'history', 'activity', 'login'], roles: ['superadmin'] },
    ],
  },
]

/** Individual settings, so search can jump straight to the right section. */
export type AdminSettingShortcut = {
  label: string
  href: string
  keywords: string[]
  roles?: AdminRole[]
}

export const ADMIN_SETTING_SHORTCUTS: AdminSettingShortcut[] = [
  { label: 'Site name & logo', href: '/admin/settings#branding', keywords: ['logo', 'brand', 'site name'], roles: ['superadmin'] },
  { label: 'Contact & booking page hero images', href: '/admin/settings#page-heroes', keywords: ['contact hero', 'booking hero', 'header image'], roles: ['superadmin'] },
  { label: 'Phone, email & address', href: '/admin/settings#contact', keywords: ['phone', 'email', 'address', 'office hours', 'map'], roles: ['superadmin'] },
  { label: 'Social media links', href: '/admin/settings#social', keywords: ['facebook', 'instagram', 'linkedin', 'youtube', 'whatsapp', 'twitter'], roles: ['superadmin'] },
  { label: 'Two-factor authentication', href: '/admin/account-security', keywords: ['2fa', 'authenticator', 'otp'] },
  { label: 'Invite an admin', href: '/admin/users', keywords: ['invite', 'new user', 'add admin'], roles: ['superadmin'] },
  { label: 'Create a private booking link', href: '/admin/bookings', keywords: ['private link', 'booking link', 'send form'] },
  { label: 'Announcement banner', href: '/admin/alerts', keywords: ['banner', 'announcement', 'notice'] },
]

export function canSee(roles: AdminRole[] | undefined, role: AdminRole | undefined) {
  return !roles || (!!role && roles.includes(role))
}

export function visibleNav(role: AdminRole | undefined): AdminNavGroup[] {
  return ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => canSee(item.roles, role)),
  })).filter((group) => group.items.length > 0)
}

/** Find the nav item (and its group) for the current path. */
export function findActiveItem(pathname: string): { group: AdminNavGroup; item: AdminNavItem } | null {
  let best: { group: AdminNavGroup; item: AdminNavItem } | null = null
  for (const group of ADMIN_NAV) {
    for (const item of group.items) {
      const matches = item.href === '/admin' ? pathname === '/admin' : pathname === item.href || pathname.startsWith(`${item.href}/`)
      if (matches && (!best || item.href.length > best.item.href.length)) best = { group, item }
    }
  }
  return best
}
