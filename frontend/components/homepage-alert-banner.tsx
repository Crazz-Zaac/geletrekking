'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { getAlertsByType, type AdminAlert } from '@/lib/api'
import { ALERT_ICON_LABELS, getAlertColorPreset } from '@/lib/alert-color-presets'

const iconMap = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  success: CheckCircle,
  alert: AlertCircle,
  announcement: Info,
  critical: AlertCircle,
  neutral: Info,
}

interface StoredDismissal {
  timestamp: number
  alertId: string
}

export function HomepageAlertBanner() {
  const [alerts, setAlerts] = useState<AdminAlert[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto'
      }
    }
  }, [])

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await getAlertsByType('global')
        setAlerts(data)

        const dismissedStr = localStorage.getItem('dismissedAlerts')
        const dismissedList: StoredDismissal[] = dismissedStr ? JSON.parse(dismissedStr) : []
        const now = Date.now()
        const validDismissed = new Set<string>()
        dismissedList.forEach(({ timestamp, alertId }) => {
          if (now - timestamp < 86400000) validDismissed.add(alertId)
        })
        setDismissed(validDismissed)
      } catch (err) {
        console.error('Failed to load alerts:', err)
      } finally {
        setIsLoading(false)
      }
    }
    void loadAlerts()
  }, [])

  const handleDismiss = (alertId: string) => {
    const newDismissed = new Set([...dismissed, alertId])
    setDismissed(newDismissed)
    const dismissedStr = localStorage.getItem('dismissedAlerts')
    const dismissedList: StoredDismissal[] = dismissedStr ? JSON.parse(dismissedStr) : []
    dismissedList.push({ alertId, timestamp: Date.now() })
    localStorage.setItem('dismissedAlerts', JSON.stringify(dismissedList))
  }

  if (isLoading) return null

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a._id || ''))
  const firstAlert = visibleAlerts.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0]
  if (!firstAlert) return null

  const Icon = iconMap[firstAlert.icon as keyof typeof iconMap] ?? Info
  const fallbackPreset = getAlertColorPreset(firstAlert.icon)
  const bgColor = fallbackPreset.backgroundColor
  const borderColor = fallbackPreset.borderColor
  const accentColor = fallbackPreset.accentColor
  const titleColor = fallbackPreset.titleColor
  const bodyColor = fallbackPreset.bodyColor
  const label = ALERT_ICON_LABELS[firstAlert.icon] || 'Info'

  // Treat message as body text; ctaUrl as the link target
  const bodyText = firstAlert.message ?? null
  const ctaUrl = firstAlert.ctaUrl || '/updates'
  const ctaLabel = firstAlert.ctaLabel || 'View full details on our Updates page →'

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '10px 16px',
        borderLeft: `4px solid ${borderColor}`,
        backgroundColor: bgColor,
        color: titleColor,
      }}
    >
      {/* Icon — top-aligned */}
      {Icon && (
        <Icon
          style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px', color: accentColor }}
        />
      )}

      {/* Content column — grows to fill */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>

        {/* Line 1: pill badge + bold title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '1px 8px',
              borderRadius: '99px',
              background: accentColor,
              color: bgColor,
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: titleColor }}>{firstAlert.title}</span>
        </div>

        {/* Line 2: body message (if present) */}
        {bodyText && (
          <div style={{ fontSize: '13px', lineHeight: '1.5', opacity: 0.9, color: bodyColor }}>
            {bodyText}
          </div>
        )}

        {/* Line 3: CTA link */}
        <a
          href={ctaUrl}
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: accentColor,
            textDecoration: 'underline',
            marginTop: '2px',
            display: 'inline-block',
          }}
        >
          {ctaLabel}
        </a>
      </div>

      {/* Dismiss button — top-aligned */}
      <button
        onClick={() => handleDismiss(firstAlert._id || '')}
        style={{
          color: accentColor,
          padding: '2px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          flexShrink: 0,
          opacity: 0.6,
          marginTop: '1px',
        }}
        aria-label="Dismiss alert"
      >
        ✕
      </button>
    </div>
  )
}
