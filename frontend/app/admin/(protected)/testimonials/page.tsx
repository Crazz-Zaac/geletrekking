'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  AdminTestimonial,
  createAdminTestimonial,
  deleteAdminTestimonial,
  getAdminTestimonials,
  updateAdminTestimonial,
} from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

type TestimonialForm = {
  name: string
  country: string
  rating: number
  message: string
  image: string
  isApproved: boolean
}

const initialForm: TestimonialForm = {
  name: '',
  country: '',
  rating: 5,
  message: '',
  image: '',
  isApproved: true,
}

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<AdminTestimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TestimonialForm>(initialForm)
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
      const data = await getAdminTestimonials(token)
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load testimonials')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const startEdit = (item: AdminTestimonial) => {
    setEditingId(item._id)
    setForm({
      name: item.name,
      country: item.country || '',
      rating: item.rating || 5,
      message: item.message,
      image: item.image || '',
      isApproved: !!item.isApproved,
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

    if (!form.name.trim() || !form.message.trim()) {
      setError('Name and message are required.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    const payload = {
      name: form.name.trim(),
      country: form.country.trim(),
      rating: Math.min(5, Math.max(1, Number(form.rating) || 5)),
      message: form.message.trim(),
      image: form.image.trim() || null,
      isApproved: form.isApproved,
    }

    try {
      if (editingId) {
        await updateAdminTestimonial(token, editingId, payload)
        setMessage('Testimonial updated successfully.')
      } else {
        await createAdminTestimonial(token, payload)
        setMessage('Testimonial created successfully.')
      }
      startCreate()
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save testimonial')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (item: AdminTestimonial) => {
    if (!token) return
    if (!window.confirm('Delete this testimonial?')) return

    try {
      await deleteAdminTestimonial(token, item._id)
      setMessage('Testimonial deleted successfully.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed. (Superadmin only)')
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Testimonial' : 'Create Testimonial'}</CardTitle>
          <CardDescription>Manage public testimonials and approval state.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            <Input placeholder="Country" value={form.country} onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))} />
          </div>
          <Input type="number" min={1} max={5} placeholder="Rating" value={form.rating} onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value) || 5 }))} />
          <Input placeholder="Image URL" value={form.image} onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))} />
          <textarea rows={6} value={form.message} onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))} placeholder="Message" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isApproved} onChange={(e) => setForm((prev) => ({ ...prev, isApproved: e.target.checked }))} /> Approved</label>

          <div className="flex gap-2">
            <Button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Testimonial' : 'Create Testimonial'}</Button>
            {editingId ? <Button variant="outline" onClick={startCreate}>Cancel</Button> : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Testimonials</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading testimonials...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No testimonials yet.</p>
          ) : (
            <div className="space-y-2 max-h-[680px] overflow-auto pr-1">
              {items.map((item) => (
                <div key={item._id} className="rounded-md border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm">{item.name} <span className="text-xs text-muted-foreground">({item.country || '—'})</span></p>
                      <p className="text-xs text-muted-foreground mt-1">{item.rating}★ • {item.isApproved ? 'Approved' : 'Hidden'}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.message}</p>
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
