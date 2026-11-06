'use client'

import { AlertsTab } from '@/components/admin/alerts-tab'

export default function AdminAlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Site alerts</h1>
        <p className="text-sm text-muted-foreground">
          Announcement banners shown to visitors, e.g. weather warnings, permit changes or seasonal offers.
        </p>
      </div>
      <AlertsTab />
    </div>
  )
}
