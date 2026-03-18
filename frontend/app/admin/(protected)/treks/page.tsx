'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AdminTrek,
  createAdminTrek,
  deleteAdminTrek,
  getAdminTreks,
  updateAdminTrek,
} from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

type TrekForm = {
  name: string
  description: string
  image_url: string
  duration_days: number
  difficulty: 'Easy' | 'Moderate' | 'Hard'
  price_usd: number
  is_optional: boolean
  is_active: boolean
  is_featured: boolean
}

const initialForm: TrekForm = {
  name: '',
  description: '',
  image_url: '',
  duration_days: 10,
  difficulty: 'Moderate',
  price_usd: 0,
  is_optional: false,
  is_active: true,
  is_featured: false,
}

export default function AdminTreksPage() {
  const [items, setItems] = useState<AdminTrek[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TrekForm>(initialForm)

  const token = getAdminToken()

  const stats = useMemo(() => {
    const total = items.length
    const destinations = items.filter((item) => !item.is_optional).length
    const optional = items.filter((item) => !!item.is_optional).length
    const active = items.filter((item) => !!item.is_active).length
    return { total, destinations, optional, active }
  }, [items])

  const refresh = async () => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await getAdminTreks(token)
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load treks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const onEdit = (item: AdminTrek) => {
    setEditingId(item._id)
    setForm({
      name: item.name || '',
      description: item.description || '',
      image_url: item.image_url || '',
      duration_days: item.duration_days || 10,
      difficulty: item.difficulty || 'Moderate',
      price_usd: item.price_usd || 0,
      is_optional: !!item.is_optional,
      is_active: item.is_active ?? true,
      is_featured: !!item.is_featured,
    })
    setMessage('')
    setError('')
  }

  const onReset = () => {
    setEditingId(null)
    setForm(initialForm)
  }

  const onSave = async () => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }

    if (!form.name.trim() || !form.description.trim()) {
      setError('Name and trek description are required.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      if (editingId) {
        await updateAdminTrek(token, editingId, form)
        setMessage('Trek updated successfully.')
      } else {
        await createAdminTrek(token, form)
        setMessage('Trek created successfully.')
      }

      onReset()
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save trek')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (item: AdminTrek) => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }

    const confirmed = window.confirm(`Delete trek \"${item.name}\"?`)
    if (!confirmed) return

    try {
      await deleteAdminTrek(token, item._id)
      setMessage('Trek deleted successfully.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete trek')
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border"><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card className="border-border"><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Destinations</p><p className="text-2xl font-bold">{stats.destinations}</p></CardContent></Card>
        <Card className="border-border"><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Optional</p><p className="text-2xl font-bold">{stats.optional}</p></CardContent></Card>
        <Card className="border-border"><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Active</p><p className="text-2xl font-bold">{stats.active}</p></CardContent></Card>
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Trek' : 'Create Trek'}</CardTitle>
            <CardDescription>Same core functionality as `frontend_old` for entering trek data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Trek name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="About this trek"
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input type="number" value={form.duration_days} onChange={(e) => setForm((prev) => ({ ...prev, duration_days: Number(e.target.value) || 0 }))} placeholder="Duration" />
              <Input type="number" value={form.price_usd} onChange={(e) => setForm((prev) => ({ ...prev, price_usd: Number(e.target.value) || 0 }))} placeholder="Price USD" />
              <select
                value={form.difficulty}
                onChange={(e) => setForm((prev) => ({ ...prev, difficulty: e.target.value as TrekForm['difficulty'] }))}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_optional} onChange={(e) => setForm((prev) => ({ ...prev, is_optional: e.target.checked }))} /> Optional</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))} /> Active</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((prev) => ({ ...prev, is_featured: e.target.checked }))} /> Featured</label>
            </div>
            <div className="flex gap-2">
              <Button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Trek' : 'Create Trek'}</Button>
              {editingId ? <Button variant="outline" onClick={onReset}>Cancel</Button> : null}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>All Treks</CardTitle>
            <CardDescription>Manage, edit, and delete trek records.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading treks...</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No treks yet.</p>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-auto pr-1">
                {items.map((item) => (
                  <div key={item._id} className="rounded-md border border-border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.duration_days || 0} days • ${item.price_usd || 0} • {item.difficulty || 'Moderate'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(item)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => onDelete(item)}>Delete</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
