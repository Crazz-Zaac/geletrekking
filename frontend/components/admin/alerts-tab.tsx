'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { getAdminToken } from '@/lib/admin-auth'
import { getAdminAlerts, createAlert, updateAlert, deleteAlert, type AdminAlert } from '@/lib/api'
import { ALERT_COLOR_PRESETS, ALERT_ICON_LABELS, alertIconOptions, getAlertColorPreset } from '@/lib/alert-color-presets'

const typeOptions = ['global', 'destinations'] as const

const getInitialFormData = (): Partial<AdminAlert> => {
  const preset = getAlertColorPreset('info')
  return {
    title: '',
    message: '',
    icon: 'info',
    type: 'global',
    isActive: true,
    backgroundColor: preset.backgroundColor,
    textColor: preset.titleColor,
    borderColor: preset.borderColor,
    accentColor: preset.accentColor,
    titleColor: preset.titleColor,
    bodyColor: preset.bodyColor,
    priority: 0,
  }
}

function applyPresetToForm(formData: Partial<AdminAlert>, icon: AdminAlert['icon']): Partial<AdminAlert> {
  const preset = getAlertColorPreset(icon)
  return {
    ...formData,
    icon,
    backgroundColor: preset.backgroundColor,
    textColor: preset.titleColor,
    borderColor: preset.borderColor,
    accentColor: preset.accentColor,
    titleColor: preset.titleColor,
    bodyColor: preset.bodyColor,
  }
}

export function AlertsTab() {
  const [alerts, setAlerts] = useState<AdminAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<AdminAlert>>(getInitialFormData())

  const loadAlerts = async () => {
    try {
      const token = getAdminToken()
      if (!token) return

      const data = await getAdminAlerts(token)
      setAlerts(data)
    } catch (err) {
      console.error('Failed to load alerts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadAlerts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.message) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const token = getAdminToken()
      if (!token) return

      const selectedIcon = (formData.icon || 'info') as AdminAlert['icon']
      const preparedPayload = applyPresetToForm(formData, selectedIcon)

      if (editingId) {
        await updateAlert(token, editingId, preparedPayload)
      } else {
        await createAlert(token, preparedPayload)
      }

      setShowForm(false)
      setEditingId(null)
      setFormData(getInitialFormData())

      await loadAlerts()
    } catch (err) {
      console.error('Failed to save alert:', err)
      alert('Failed to save alert')
    }
  }

  const handleEdit = (alert: AdminAlert) => {
    const selectedIcon = (alert.icon || 'info') as AdminAlert['icon']
    setFormData(applyPresetToForm(alert, selectedIcon))
    setEditingId(alert._id || null)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return

    try {
      const token = getAdminToken()
      if (!token) return

      await deleteAlert(token, id)
      await loadAlerts()
    } catch (err) {
      console.error('Failed to delete alert:', err)
      alert('Failed to delete alert')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(getInitialFormData())
  }

  const selectedIcon = (formData.icon || 'info') as AdminAlert['icon']
  const selectedPreset = getAlertColorPreset(selectedIcon)
  const sortedAlerts = [...alerts].sort((a, b) => (b.priority || 0) - (a.priority || 0))

  const renderAlertCards = () => {
    if (alerts.length === 0) {
      return (
        <Card className="border-border p-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No alerts created yet.</p>
        </Card>
      )
    }

    return (
      <div className="grid gap-3">
        {sortedAlerts.map((alert) => {
          const preset = getAlertColorPreset(alert.icon)
          return (
            <div
              key={alert._id}
              style={{
                backgroundColor: preset.backgroundColor,
                borderLeft: `4px solid ${preset.borderColor}`,
              }}
              className="border border-border rounded-lg p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4
                    className="font-bold text-sm"
                    style={{ color: preset.titleColor }}
                  >
                    {alert.title}
                  </h4>
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ backgroundColor: preset.accentColor, color: preset.backgroundColor }}
                  >
                    {alert.type === 'global' ? 'Global' : 'Destinations'}
                  </span>
                  {!alert.isActive && (
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-500 text-white">
                      Inactive
                    </span>
                  )}
                </div>
                <p
                  className="text-xs opacity-90 line-clamp-2"
                  style={{ color: preset.bodyColor }}
                >
                  {alert.message}
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(alert)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(alert._id || '')}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading alerts...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Alerts & Announcements</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage important notices and announcements</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Alert
          </Button>
        )}
      </div>

      {showForm ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <Card className="border-border p-6 xl:col-span-7">
            <h3 className="text-lg font-bold text-foreground mb-4">
              {editingId ? 'Edit Alert' : 'Create New Alert'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
                <Input
                  type="text"
                  placeholder="e.g., Monsoon Season Warning"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Message *</label>
                <textarea
                  placeholder="Enter your message here"
                  value={formData.message || ''}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Icon</label>
                  <select
                    value={formData.icon || 'info'}
                    onChange={(e) => {
                      const nextIcon = e.target.value as AdminAlert['icon']
                      setFormData((prev) => applyPresetToForm(prev, nextIcon))
                    }}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                  >
                    {alertIconOptions.map((icon) => (
                      <option key={icon} value={icon}>{ALERT_ICON_LABELS[icon]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                  <select
                    value={formData.type || 'global'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as AdminAlert['type'] })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                  >
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>{type === 'global' ? 'Global (All Pages)' : 'Destinations Only'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Auto-applied color theme</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 rounded-md border border-border p-3">
                  {Object.entries(selectedPreset).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded border border-border" style={{ backgroundColor: value }} />
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{key.replace('Color', '')}</p>
                        <p className="text-xs font-mono text-foreground">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Colors are set automatically from icon type.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Priority (0-10)</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.priority || 0}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive !== false}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-foreground">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingId ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>

          <Card className="border-border p-4 xl:col-span-5 xl:sticky xl:top-24">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-foreground">Existing Alerts</h3>
              <span className="text-xs rounded-full bg-muted px-2 py-1 text-muted-foreground">
                {alerts.length}
              </span>
            </div>
            <div className="max-h-[65vh] overflow-y-auto pr-1">
              {renderAlertCards()}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-foreground">Existing Alerts</h3>
            <span className="text-xs rounded-full bg-muted px-2 py-1 text-muted-foreground">
              {alerts.length}
            </span>
          </div>
          {renderAlertCards()}
        </Card>
      )}
    </div>
  )
}
