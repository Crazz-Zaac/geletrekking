'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  AdminGalleryItem,
  createAdminGalleryItem,
  deleteAdminGalleryItem,
  getAdminGalleryHero,
  getAdminGalleryItems,
  updateAdminGalleryHero,
  updateAdminGalleryItem,
} from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

type GalleryForm = {
  title: string
  imageUrl: string
  category: string
  isFeatured: boolean
}

const initialForm: GalleryForm = {
  title: '',
  imageUrl: '',
  category: '',
  isFeatured: false,
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<AdminGalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [heroSaving, setHeroSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [form, setForm] = useState<GalleryForm>(initialForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const token = getAdminToken()

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const [galleryItems, hero] = await Promise.all([getAdminGalleryItems(), getAdminGalleryHero()])
      setItems(galleryItems)
      setHeroImageUrl(hero.heroImageUrl || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const onEdit = (item: AdminGalleryItem) => {
    setEditingId(item._id)
    setForm({
      title: item.title || '',
      imageUrl: item.imageUrl || '',
      category: item.category || '',
      isFeatured: !!item.isFeatured,
    })
  }

  const onReset = () => {
    setEditingId(null)
    setForm(initialForm)
  }

  const onSaveHero = async () => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }

    setHeroSaving(true)
    setError('')
    setMessage('')
    try {
      await updateAdminGalleryHero(token, heroImageUrl)
      setMessage('Hero image updated successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update hero image')
    } finally {
      setHeroSaving(false)
    }
  }

  const onSaveItem = async () => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }

    if (!form.imageUrl.trim()) {
      setError('Image URL is required.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      if (editingId) {
        await updateAdminGalleryItem(token, editingId, form)
        setMessage('Gallery item updated successfully.')
      } else {
        await createAdminGalleryItem(token, form)
        setMessage('Gallery item created successfully.')
      }
      onReset()
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save gallery item')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (item: AdminGalleryItem) => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }

    if (!window.confirm('Delete this gallery item?')) return

    try {
      await deleteAdminGalleryItem(token, item._id)
      setMessage('Gallery item deleted successfully.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed. (Only superadmin can delete.)')
    }
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Gallery Hero Image</CardTitle>
          <CardDescription>Controls the hero image shown on the public gallery page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={heroImageUrl} onChange={(e) => setHeroImageUrl(e.target.value)} placeholder="Hero image URL" />
          {heroImageUrl ? <img src={heroImageUrl} alt="Hero preview" className="h-40 w-full object-cover rounded-md border border-border" /> : null}
          <Button onClick={onSaveHero} disabled={heroSaving}>{heroSaving ? 'Saving...' : 'Save Hero Image'}</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader><CardTitle>{editingId ? 'Edit Gallery Item' : 'Add Gallery Item'}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
            <Input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))} />
            <Input placeholder="Category" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))} /> Featured</label>
            {form.imageUrl ? <img src={form.imageUrl} alt="Preview" className="h-40 w-full object-cover rounded-md border border-border" /> : null}
            <div className="flex gap-2">
              <Button onClick={onSaveItem} disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Item' : 'Create Item'}</Button>
              {editingId ? <Button variant="outline" onClick={onReset}>Cancel</Button> : null}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader><CardTitle>Gallery Items</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading gallery...</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No gallery items found.</p>
            ) : (
              <div className="space-y-2 max-h-[620px] overflow-auto pr-1">
                {items.map((item) => (
                  <div key={item._id} className="rounded-md border border-border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.title || 'Gallery'} className="h-14 w-14 object-cover rounded" /> : null}
                        <div>
                          <p className="font-semibold text-sm">{item.title || 'Untitled'}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.category || 'Uncategorized'} • {item.isFeatured ? 'Featured' : 'Normal'}</p>
                        </div>
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
      </div>
    </div>
  )
}
