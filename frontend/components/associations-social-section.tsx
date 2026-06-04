'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { FacebookIcon, InstagramIcon, LinkedInIcon, YouTubeIcon } from '@/components/social-icons'
import { WhatsAppIcon } from '@/components/whatsapp-icon'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { getAdminAbout, type AdminAboutAssociation } from '@/lib/api'

const socialIconStyles: Record<string, { bg: string; text: string }> = {
  Facebook: { bg: 'bg-[#1877F2]', text: 'text-white' },
  Instagram: { bg: 'bg-[#E1306C]', text: 'text-white' },
  YouTube: { bg: 'bg-[#FF0000]', text: 'text-white' },
  LinkedIn: { bg: 'bg-[#F59E0B]', text: 'text-white' },
  WhatsApp: { bg: 'bg-white border border-border', text: 'text-slate-900' },
}

export function AssociationsSocialSection() {
  const { social } = useSiteSettings()
  const [associations, setAssociations] = useState<AdminAboutAssociation[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdminAbout()
        const list = (data.associations || []).filter((item) => item?.logoUrl || item?.name)
        setAssociations(list)
      } catch {
        setAssociations([])
      }
    }

    void load()
  }, [])

  const socialLinks = useMemo(
    () =>
      [
        { Icon: FacebookIcon, href: social.facebook, label: 'Facebook' },
        { Icon: InstagramIcon, href: social.instagram, label: 'Instagram' },
        { Icon: YouTubeIcon, href: social.youtube, label: 'YouTube' },
        { Icon: LinkedInIcon, href: social.linkedin, label: 'LinkedIn' },
        { Icon: WhatsAppIcon, href: social.whatsapp, label: 'WhatsApp' },
      ].filter((item) => item.href),
    [social]
  )

  if (associations.length === 0 && socialLinks.length === 0) return null

  return (
    <section className="py-10 md:py-12 bg-sky-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {associations.length > 0 ? (
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">In Association With</h3>
              <div className="flex flex-wrap gap-4">
                {associations.map((assoc, index) => (
                  <div
                    key={`${assoc.name || 'association'}-${index}`}
                    className="h-20 w-20 rounded-xl bg-white shadow-sm border border-border flex items-center justify-center"
                  >
                    {assoc.logoUrl ? (
                      <Image
                        src={assoc.logoUrl}
                        alt={assoc.name || 'Association'}
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-500 text-center px-2">{assoc.name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {socialLinks.length > 0 ? (
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-4">Follow Us On</h3>
              <div className="flex flex-wrap gap-4">
                {socialLinks.map(({ Icon, href, label }) => {
                  const styles = socialIconStyles[label] || { bg: 'bg-white', text: 'text-slate-900' }
                  return (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={`h-16 w-24 rounded-xl shadow-sm flex items-center justify-center transition-transform hover:-translate-y-0.5 ${styles.bg}`}
                    >
                      <Icon className={`h-6 w-6 ${styles.text}`} />
                    </a>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
