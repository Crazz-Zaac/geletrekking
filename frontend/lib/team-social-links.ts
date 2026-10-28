export const TEAM_SOCIAL_FIELDS = [
  { key: 'facebook', label: 'Facebook', placeholder: 'https://www.facebook.com/your-profile' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/your-profile' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://www.linkedin.com/in/your-profile' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://www.youtube.com/@your-channel' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/977XXXXXXXXXX' },
] as const

export type TeamSocialLinks = Partial<Record<(typeof TEAM_SOCIAL_FIELDS)[number]['key'], string>>

export function isValidSocialUrl(value: string): boolean {
  try {
    const url = new URL(value.trim())
    return ['https:', 'http:'].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password
  } catch {
    return false
  }
}
