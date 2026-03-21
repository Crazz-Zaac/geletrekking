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
import { ImageIcon, Trash2, Edit2, CheckCircle2, AlertCircle, LinkIcon } from 'lucide-react'

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}
      {message && (
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-emerald-800 dark:text-emerald-300">{message}</p>
        </div>
      )}

      {/* Gallery Hero Image Section */}
      <div className="bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Gallery Hero Image
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Controls the hero image shown on the public gallery page</p>
        </div>
        
        <div className="space-y-3 bg-white dark:bg-slate-950 rounded-lg p-4 border border-blue-100/50 dark:border-blue-900/50">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Hero Image URL</label>
            <div className="flex gap-2">
              <Input
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg or S3 URL"
                className="h-10"
              />
              {heroImageUrl && (
                <Button variant="outline" size="sm" asChild className="h-10">
                  <a href={heroImageUrl} target="_blank" rel="noopener noreferrer">
                    <LinkIcon className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {heroImageUrl && (
            <div className="rounded-lg overflow-hidden border border-border">
              <img src={heroImageUrl} alt="Hero preview" className="w-full h-48 object-cover" />
            </div>
          )}

          <Button onClick={onSaveHero} disabled={heroSaving} className="w-full">
            {heroSaving ? 'Saving...' : 'Save Hero Image'}
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="xl:col-span-1">
          <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-purple-800/50 rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                {editingId ? 'Edit Gallery Item' : 'Add Gallery Item'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {editingId ? 'Update the selected gallery item' : 'Create a new gallery item'}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-lg p-4 border border-purple-100/50 dark:border-purple-900/50 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Title</label>
                <Input
                  placeholder="e.g., Everest Base Camp Trek"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Image URL</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/image.jpg or S3 URL"
                    value={form.imageUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    className="h-9"
                  />
                  {form.imageUrl && (
                    <Button variant="outline" size="sm" asChild className="h-9">
                      <a href={form.imageUrl} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
                <Input
                  placeholder="e.g., Mountains, Culture, Adventure"
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="h-9"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border border-border hover:bg-muted/50 transition">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium text-foreground">Mark as Featured</span>
              </label>

              {form.imageUrl && (
                <div className="rounded-lg overflow-hidden border border-border">
                  <img src={form.imageUrl} alt="Preview" className="w-full h-32 object-cover" />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button onClick={onSaveItem} disabled={saving} className="flex-1">
                  {saving ? 'Saving...' : editingId ? 'Update Item' : 'Create Item'}
                </Button>
                {editingId && (
                  <Button variant="outline" onClick={onReset} className="flex-1">
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Items List Section */}
        <div className="xl:col-span-2">
          <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/50 rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Gallery Items ({items.length})
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Manage all gallery items</p>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-lg border border-amber-100/50 dark:border-amber-900/50">
              {loading ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">Loading gallery items...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">No gallery items yet. Create your first one!</p>
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto">
                  <div className="space-y-2 p-4">
                    {items.map((item) => (
                      <div key={item._id} className="rounded-lg border border-border hover:border-amber-300 dark:hover:border-amber-700 transition p-4 bg-gradient-to-r from-transparent to-amber-50/30 dark:to-amber-950/10">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3 flex-1 min-w-0">
                            {item.imageUrl ? (
                              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-border">
                                <img src={item.imageUrl} alt={item.title || 'Gallery'} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center border border-border">
                                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-sm text-foreground truncate">{item.title || 'Untitled'}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.category || 'Uncategorized'} • {item.isFeatured ? '⭐ Featured' : 'Standard'}
                              </p>
                              {item.imageUrl && (
                                <p className="text-xs text-muted-foreground mt-1 truncate">{item.imageUrl}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(item)}
                              className="h-8 w-8 p-0"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => onDelete(item)}
                              className="h-8 w-8 p-0"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
