'use client'

import { useConfirm } from '@/components/admin/use-confirm'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit2, Trash2, AlertCircle, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Field, FieldGrid, SelectInput, TextArea, ToggleField } from '@/components/admin/form-kit'
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
    ctaUrl: '',
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
  const [askConfirm, confirmDialog] = useConfirm()
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

    if (!formData.title?.trim() || !formData.message?.trim()) {
      toast.error('Add a title and a message.')
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

      toast.success(editingId ? 'Alert saved.' : 'Alert created.')
      setShowForm(false)
      setEditingId(null)
      setFormData(getInitialFormData())

      await loadAlerts()
    } catch (err) {
      console.error('Failed to save alert:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to save alert')
    }
  }

  const handleEdit = (alert: AdminAlert) => {
    const selectedIcon = (alert.icon || 'info') as AdminAlert['icon']
    setFormData(applyPresetToForm(alert, selectedIcon))
    setEditingId(alert._id || null)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!(await askConfirm({ title: 'Delete this alert?', description: 'It will disappear from the website immediately.' }))) return

    try {
      const token = getAdminToken()
      if (!token) return

      await deleteAlert(token, id)
      toast.success('Alert deleted.')
      await loadAlerts()
    } catch (err) {
      console.error('Failed to delete alert:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to delete alert')
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
      {confirmDialog}
      {!showForm && (
        <div className="flex justify-end">
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New alert
          </Button>
        </div>
      )}

      {showForm ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <Card className="border-border p-6 xl:col-span-7">
            <h3 className="mb-5 text-base font-semibold text-foreground">
              {editingId ? 'Edit alert' : 'New alert'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Title" required count={{ value: formData.title, max: 60, recommended: true }}>
                <Input className="h-10" placeholder="e.g. Monsoon season: trail conditions" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </Field>
              <Field label="Message" required count={{ value: formData.message, max: 280, recommended: true }}>
                <TextArea rows={3} placeholder="What visitors need to know, in one or two sentences." value={formData.message || ''} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
              </Field>
              <FieldGrid>
                <Field label="Style" hint="Sets the icon and colours.">
                  <SelectInput
                    value={formData.icon || 'info'}
                    onChange={(e) => {
                      const nextIcon = e.target.value as AdminAlert['icon']
                      setFormData((prev) => applyPresetToForm(prev, nextIcon))
                    }}
                  >
                    {alertIconOptions.map((icon) => (
                      <option key={icon} value={icon}>{ALERT_ICON_LABELS[icon]}</option>
                    ))}
                  </SelectInput>
                </Field>
                <Field label="Where to show">
                  <SelectInput value={formData.type || 'global'} onChange={(e) => setFormData({ ...formData, type: e.target.value as AdminAlert['type'] })}>
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>{type === 'global' ? 'Every page' : 'Destination pages only'}</option>
                    ))}
                  </SelectInput>
                </Field>
              </FieldGrid>
              {formData.type === 'global' && (
                <Field label="“Full details” link" hint="Optional. Shown as “View full details here →”.">
                  <Input className="h-10" type="url" placeholder="https://… or /blog/…" value={formData.ctaUrl || ''} onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })} />
                </Field>
              )}
              <FieldGrid>
                <Field label="Priority" hint="0–10. Higher shows first.">
                  <Input className="h-10" type="number" min={0} max={10} value={formData.priority ?? 0} onChange={(e) => setFormData({ ...formData, priority: Math.min(10, Math.max(0, parseInt(e.target.value) || 0)) })} />
                </Field>
                <ToggleField className="self-end" label="Active" description="Visible on the website." checked={formData.isActive !== false} onCheckedChange={(isActive) => setFormData({ ...formData, isActive })} />
              </FieldGrid>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Preview</p>
                <div
                  className="rounded-lg border border-l-4 p-4"
                  style={{ backgroundColor: selectedPreset.backgroundColor, borderColor: selectedPreset.borderColor, borderLeftColor: selectedPreset.accentColor }}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: selectedPreset.accentColor }} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="font-semibold" style={{ color: selectedPreset.titleColor }}>{formData.title || 'Alert title'}</p>
                      <p className="mt-1 text-sm" style={{ color: selectedPreset.bodyColor }}>{formData.message || 'Your message appears here.'}</p>
                      {formData.type === 'global' && formData.ctaUrl && (
                        <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium" style={{ color: selectedPreset.accentColor }}>View full details here <ExternalLink className="h-3.5 w-3.5" /></p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button type="button" variant="ghost" onClick={handleCancel}>Cancel</Button>
                <Button type="submit" className="min-w-28">{editingId ? 'Save alert' : 'Create alert'}</Button>
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
