export const CONTACT_EMAIL = 'info@geletrekking.com'
export const FRONT_DESK_EMAIL = 'geletrekkingfrontdesk@gmail.com'
export const GMAIL_EMAIL = 'geletrekking@gmail.com'

/** Extra Contact-page addresses used until Site settings has its own list. */
export const DEFAULT_CONTACT_EMAILS = [
  { label: 'Front desk', email: FRONT_DESK_EMAIL, note: 'General enquiries and booking help' },
  { label: 'Gmail', email: GMAIL_EMAIL, note: 'Alternative address if you prefer Gmail' },
]
export const CONTACT_PHONE = '+977 9843988164'
export const GELE_CALL_URL = 'https://cal.com/gele-trekking-d5slwj/15min'
export const WHATSAPP_URL = 'https://wa.me/9779843988164'

export function getContactLinks(email?: string, whatsapp?: string, phone?: string) {
  const configuredEmail = email?.trim() || ''
  const contactEmail = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(configuredEmail)
    ? configuredEmail
    : CONTACT_EMAIL
  let whatsappUrl = ''
  try {
    const url = new URL(whatsapp || '')
    if (url.protocol === 'https:' && !url.username && !url.password) {
      if (url.hostname === 'wa.me') {
        const digits = url.pathname.replace(/\D/g, '')
        if (/^\d{7,15}$/.test(digits)) whatsappUrl = `https://wa.me/${digits}${url.search}`
      } else if (url.hostname === 'api.whatsapp.com' && url.pathname === '/send') {
        whatsappUrl = url.toString()
      }
    }
  } catch {
    // Use the configured phone when a WhatsApp link is missing or invalid.
  }
  const phoneDigits = (phone || '').replace(/\D/g, '')
  if (!whatsappUrl) whatsappUrl = /^\d{7,15}$/.test(phoneDigits) ? `https://wa.me/${phoneDigits}` : WHATSAPP_URL
  return { email: contactEmail, emailUrl: `mailto:${contactEmail}`, whatsappUrl, callUrl: GELE_CALL_URL }
}
