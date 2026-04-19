'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { getAlertsByType, type AdminAlert } from '@/lib/api'

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

export function AnnouncementBanner() {
  const [alerts, setAlerts] = useState<AdminAlert[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await getAlertsByType('destinations')
        setAlerts(data)
      } catch (err) {
        console.error('Failed to load announcements:', err)
      } finally {
        setIsLoading(false)
      }
    }

    void loadAlerts()
  }, [])

  const visibleAlerts = alerts.filter((alert) => !dismissed.has(alert._id || ''))

  if (isLoading || visibleAlerts.length === 0) {
    return null
  }

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]))
  }

  return (
    <div className="flex flex-col gap-0">
      {visibleAlerts
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
        .map((alert) => {
          const Icon = iconMap[alert.icon] || Info
          const bgColor = alert.backgroundColor || '#F59E0B'
          const textColor = alert.textColor || '#FFFFFF'
          const borderColor = alert.borderColor || '#D97706'

          return (
            <div
              key={alert._id}
              style={{
                backgroundColor: bgColor,
                borderBottom: `2px solid ${borderColor}`,
              }}
              className="flex items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4"
            >
              <div className="flex items-start gap-3 flex-1">
                <Icon
                  className="h-5 w-5 flex-shrink-0 mt-0.5"
                  style={{ color: textColor }}
                />
                <div className="min-w-0 flex-1">
                  {alert.title && (
                    <h3
                      className="font-semibold text-sm md:text-base"
                      style={{ color: textColor }}
                    >
                      {alert.title}
                    </h3>
                  )}
                  <p
                    className="text-xs md:text-sm opacity-95"
                    style={{ color: textColor }}
                  >
                    {alert.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDismiss(alert._id || '')}
                className="flex-shrink-0 p-1 rounded hover:opacity-80 transition-opacity"
                style={{ color: textColor }}
                aria-label="Dismiss announcement"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )
        })}
    </div>
  )
}
