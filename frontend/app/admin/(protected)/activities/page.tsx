'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  AdminActivity,
  createAdminActivity,
  deleteAdminActivity,
  getAdminActivities,
  updateAdminActivity,
} from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

type ActivityForm = {
  title: string
  description: string
  date: string
  image: string
  tags: string
  isPublished: boolean
}

const initialForm: ActivityForm = {
  title: '',
  description: '',
  date: '',
  image: '',
  tags: '',
  isPublished: true,
}

export default function AdminActivitiesPage() {
  const [items, setItems] = useState<AdminActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ActivityForm>(initialForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const token = getAdminToken()

  const refresh = async () => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await getAdminActivities(token)
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const startEdit = (item: AdminActivity) => {
    setEditingId(item._id)
    setForm({
      title: item.title,
      description: item.description,
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      image: item.image || '',
      tags: (item.tags || []).join(', '),
      isPublished: !!item.isPublished,
    })
  }

  const startCreate = () => {
    setEditingId(null)
    setForm(initialForm)
  }

  const onSave = async () => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }

    if (!form.title.trim() || !form.description.trim() || !form.date) {
      setError('Title, description and date are required.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date,
      image: form.image.trim() || null,
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      isPublished: form.isPublished,
    }

    try {
      if (editingId) {
        await updateAdminActivity(token, editingId, payload)
        setMessage('Activity updated successfully.')
      } else {
        await createAdminActivity(token, payload)
        setMessage('Activity created successfully.')
      }
      startCreate()
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save activity')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (item: AdminActivity) => {
    if (!token) return
    if (!window.confirm('Delete this activity?')) return

    try {
      await deleteAdminActivity(token, item._id)
      setMessage('Activity deleted successfully.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete activity')
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Activity' : 'Create Activity'}</CardTitle>
          <CardDescription>Manage company activities/events.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
          <textarea rows={4} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))} /> Published</label>
          </div>
          <Input placeholder="Image URL" value={form.image} onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))} />
          <Input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))} />
          <div className="flex gap-2">
            <Button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Activity' : 'Create Activity'}</Button>
            {editingId ? <Button variant="outline" onClick={startCreate}>Cancel</Button> : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading activities...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activities yet.</p>
          ) : (
            <div className="space-y-2 max-h-[680px] overflow-auto pr-1">
              {items.map((item) => (
                <div key={item._id} className="rounded-md border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(item.date).toLocaleDateString()} • {item.isPublished ? 'Published' : 'Hidden'}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(item)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(item)}>Delete</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
