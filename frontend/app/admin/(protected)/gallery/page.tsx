'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
import { ImageIcon, Trash2, Edit2, CheckCircle2, AlertCircle, LinkIcon, Plus, Grid3x3, LayoutList } from 'lucide-react'

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
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [openDialog, setOpenDialog] = useState(false)

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

  const categories = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.category).filter(Boolean)))
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = !search || item.title?.toLowerCase().includes(search.toLowerCase()) || item.category?.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [items, search, categoryFilter])

  const stats = useMemo(
    () => ({
      total: items.length,
      featured: items.filter((i) => i.isFeatured).length,
      categories: categories.length,
    }),
    [items, categories]
  )

  const onEdit = (item: AdminGalleryItem) => {
    setEditingId(item._id)
    setForm({
      title: item.title || '',
      imageUrl: item.imageUrl || '',
      category: item.category || '',
      isFeatured: !!item.isFeatured,
    })
    setOpenDialog(true)
  }

  const onReset = () => {
    setEditingId(null)
    setForm(initialForm)
    setOpenDialog(false)
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

    try {
      await deleteAdminGalleryItem(token, item._id)
      setMessage('Gallery item deleted successfully.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed. (Only superadmin can delete.)')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gallery Manager</h1>
          <p className="text-muted-foreground mt-1">Manage your gallery hero image and photo collections</p>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
      {message && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-800">{message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-fit">
          <TabsTrigger value="items">Gallery Items</TabsTrigger>
          <TabsTrigger value="hero">Hero Image</TabsTrigger>
        </TabsList>

        {/* Gallery Items Tab */}
        <TabsContent value="items" className="space-y-6 mt-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Items</CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Featured Items</CardDescription>
                <CardTitle className="text-3xl">{stats.featured}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Categories</CardDescription>
                <CardTitle className="text-3xl">{stats.categories}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Add Item Form */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="text-lg">Add Item</CardTitle>
                  <CardDescription>Create a new gallery item</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => onReset()} className="w-full gap-2">
                        <Plus className="w-4 h-4" />
                        New Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit Gallery Item' : 'Create Gallery Item'}</DialogTitle>
                        <DialogDescription>
                          {editingId ? 'Update the gallery item details below.' : 'Add a new image to your gallery collection.'}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Title *</label>
                          <Input
                            placeholder="e.g., Everest Base Camp Trek"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Image URL *</label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="https://example.com/image.jpg or S3 URL"
                              value={form.imageUrl}
                              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                            />
                            {form.imageUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={form.imageUrl} target="_blank" rel="noopener noreferrer">
                                  <LinkIcon className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Category</label>
                          <Input
                            placeholder="e.g., Mountains, Culture, Adventure"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                          />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border border-border hover:bg-muted/50 transition">
                          <input
                            type="checkbox"
                            checked={form.isFeatured}
                            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm font-medium">Featured</span>
                        </label>

                        {form.imageUrl && (
                          <div className="rounded-lg overflow-hidden border border-border">
                            <img src={form.imageUrl} alt="Preview" className="w-full h-40 object-cover" />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 justify-end mt-6">
                        <Button variant="outline" onClick={onReset}>
                          Cancel
                        </Button>
                        <Button onClick={onSaveItem} disabled={saving}>
                          {saving ? 'Saving...' : editingId ? 'Update Item' : 'Create Item'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="pt-4 border-t space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search</label>
                      <Input
                        placeholder="Search by title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Filter Category</label>
                      <Select value={categoryFilter || 'all'} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 border-t pt-3">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="flex-1 gap-2"
                      >
                        <Grid3x3 className="w-4 h-4" />
                        Grid
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="flex-1 gap-2"
                      >
                        <LayoutList className="w-4 h-4" />
                        List
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Items Display */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Items {filteredItems.length > 0 && <span className="text-muted-foreground font-normal ml-2">({filteredItems.length})</span>}
                  </CardTitle>
                  <CardDescription>Manage your gallery collection</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-muted-foreground">Loading gallery items...</p>
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground">{items.length === 0 ? 'No gallery items yet.' : 'No items match your filters.'}</p>
                      </div>
                    </div>
                  ) : viewMode === 'grid' ? (
                    /* Grid View */
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {filteredItems.map((item) => (
                        <div key={item._id} className="group relative rounded-lg overflow-hidden border border-border hover:border-primary transition cursor-pointer">
                          <div className="relative h-40 bg-muted overflow-hidden">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                            {item.isFeatured && <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">⭐</div>}
                          </div>

                          <div className="p-3 bg-card absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition">
                            <p className="font-semibold text-sm text-white line-clamp-2 mb-2">{item.title || 'Untitled'}</p>
                            {item.category && <p className="text-xs text-gray-300 mb-3">{item.category}</p>}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onEdit(item)}
                                className="flex-1 h-8 gap-1"
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive" className="h-8 w-8 p-0">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Item</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{item.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="flex gap-2 justify-end">
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => onDelete(item)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </div>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* List View */
                    <div className="space-y-2">
                      {filteredItems.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition group"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {item.imageUrl ? (
                              <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden border border-border">
                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-16 h-16 flex-shrink-0 rounded bg-muted flex items-center justify-center border border-border">
                                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">{item.title || 'Untitled'}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.category || 'Uncategorized'} {item.isFeatured && '• ⭐ Featured'}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 flex-shrink-0 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(item)}
                              className="gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Item</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{item.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="flex gap-2 justify-end">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => onDelete(item)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Hero Image Tab */}
        <TabsContent value="hero" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gallery Hero Image</CardTitle>
              <CardDescription>The image displayed at the top of the public gallery page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">Image URL</label>
                <div className="flex gap-2">
                  <Input
                    value={heroImageUrl}
                    onChange={(e) => setHeroImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg or S3 URL"
                  />
                  {heroImageUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={heroImageUrl} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {heroImageUrl && (
                <div className="rounded-lg overflow-hidden border border-border">
                  <img src={heroImageUrl} alt="Hero preview" className="w-full h-96 object-cover" />
                </div>
              )}

              <Button onClick={onSaveHero} disabled={heroSaving} size="lg" className="w-full">
                {heroSaving ? 'Saving...' : 'Save Hero Image'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
