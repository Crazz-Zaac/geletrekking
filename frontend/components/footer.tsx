import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'
import { WhatsAppIcon } from '@/components/whatsapp-icon'
import { FacebookIcon, InstagramIcon, YouTubeIcon, LinkedInIcon } from '@/components/social-icons'
import Image from 'next/image'

const socialLinks = [
  { Icon: FacebookIcon, href: 'https://facebook.com/geletrekking', label: 'Facebook' },
  { Icon: InstagramIcon, href: 'https://instagram.com/geletrekking', label: 'Instagram' },
  { Icon: WhatsAppIcon, href: 'https://wa.me/9779851234567', label: 'WhatsApp' },
  { Icon: YouTubeIcon, href: 'https://youtube.com/@geletrekking', label: 'YouTube' },
  { Icon: LinkedInIcon, href: 'https://linkedin.com/company/geletrekking', label: 'LinkedIn' },
]

const footerLinks = {
  destinations: [
    { label: 'Everest Base Camp', href: '/trek/everest-base-camp' },
    { label: 'Annapurna Circuit', href: '/trek/annapurna-circuit' },
    { label: 'Langtang Valley', href: '/trek/langtang-valley' },
    { label: 'Manaslu Circuit', href: '/trek/manaslu-circuit' },
    { label: 'Upper Mustang', href: '/trek/upper-mustang' },
  ],
  quickLinks: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Team', href: '/about#team' },
    { label: 'Blog', href: '/blog' },
    { label: "FAQ's", href: '/faq' },
    { label: 'Contact', href: '/contact' },
  ],
  company: [
    { label: 'Registrations & Affiliations', href: '/company/registrations-affiliations' },
  ],
  usefulLinks: [
    { label: 'Visa Office Nepal', href: 'https://nepaliport.immigration.gov.np/', external: true },
    { label: 'Terms and Conditions', href: '/terms' },
    { label: 'Disclaimer', href: '/disclaimer' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-[oklch(0.13_0.015_240)] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/geletrekking.png"
                alt="Gele Trekking"
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg object-cover border border-white/20 shadow"
              />
              <div>
                <div className="font-bold text-white text-sm leading-tight tracking-widest uppercase">GELE TREKKING</div>
                <div className="text-white/50 text-[8px] uppercase tracking-[2px] leading-tight">Walk · Explore · Discover</div>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              Your trusted local trekking partner in Nepal since 2008. Licensed, insured and passionate about sharing the Himalayas with the world.
            </p>
            <div className="space-y-2 text-sm text-white/60">
              <a href="mailto:info@geletrekking.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-accent" />
                info@geletrekking.com
              </a>
              <a href="tel:+9779851234567" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-accent" />
                +977 985 123 4567
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span>Thamel, Kathmandu 44600, Nepal</span>
              </div>
            </div>
            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">Destinations</h3>
            <ul className="space-y-2">
              {footerLinks.destinations.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">Useful Links</h3>
            <ul className="space-y-2">
              {footerLinks.usefulLinks.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            {/* Trust badges */}
            <div className="mt-6 p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Certified By</p>
              <p className="text-xs text-white/70 leading-relaxed">Nepal Tourism Board • TAAN Member • NMA Licensed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-center">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Gele Trekking Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
