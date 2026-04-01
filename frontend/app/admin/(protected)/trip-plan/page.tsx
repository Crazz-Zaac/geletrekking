'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { TravelGuide, createGuide, deleteGuide, getGuides, updateGuide } from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'
import { AlertCircle, Plus, Edit2, Trash2, BookOpen, CheckCircle2 } from 'lucide-react'
import { marked } from 'marked'

type GuideForm = {
  title: string
  slug: string
  category: 'Logistics' | 'Health' | 'Preparation' | 'Legal' | 'Communication' | 'Safety'
  description: string
  icon: string
  content: string
  order: number
  region: 'Everest' | 'Annapurna' | 'Langtang' | 'Mustang' | 'General'
  isActive: boolean
}

const CATEGORIES: GuideForm['category'][] = ['Logistics', 'Health', 'Preparation', 'Legal', 'Communication', 'Safety']
const REGIONS: GuideForm['region'][] = ['Everest', 'Annapurna', 'Langtang', 'Mustang', 'General']
const ICONS = ['BookOpen', 'Heart', 'AlertCircle', 'Shield', 'Phone', 'Eye']

const initialForm: GuideForm = {
  title: '',
  slug: '',
  category: 'Logistics',
  description: '',
  icon: 'BookOpen',
  content: '',
  order: 0,
  region: 'General',
  isActive: true,
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function AdminTripPlanPage() {
  const [guides, setGuides] = useState<TravelGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<GuideForm>(initialForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [showPreview, setShowPreview] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [openDialog, setOpenDialog] = useState(false)

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
      const data = await getGuides()
      setGuides(data.guides || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load guides')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const categories = useMemo(() => {
    return Array.from(new Set(guides.map((guide) => guide.category).filter(Boolean)))
  }, [guides])

  const regions = useMemo(() => {
    return Array.from(new Set(guides.map((guide) => guide.region).filter(Boolean)))
  }, [guides])

  const filteredGuides = useMemo(() => {
    return guides.filter((guide) => {
      const matchesSearch = !search || guide.title.toLowerCase().includes(search.toLowerCase()) || guide.slug.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || guide.category === categoryFilter
      const matchesRegion = regionFilter === 'all' || guide.region === regionFilter
      return matchesSearch && matchesCategory && matchesRegion
    })
  }, [guides, search, categoryFilter, regionFilter])

  const stats = useMemo(
    () => ({
      total: guides.length,
      active: guides.filter((g) => g.isActive).length,
      categories: categories.length,
      regions: regions.length,
    }),
    [guides, categories, regions]
  )

  const startEdit = (guide: TravelGuide) => {
    setEditingId(guide._id || guide.id || '')
    setForm({
      title: guide.title,
      slug: guide.slug,
      category: (guide.category as GuideForm['category']) || 'Logistics',
      description: guide.description,
      icon: guide.icon || 'BookOpen',
      content: guide.content,
      order: guide.order,
      region: (guide.region as GuideForm['region']) || 'General',
      isActive: guide.isActive,
    })
    setOpenDialog(true)
  }

  const onReset = () => {
    setEditingId(null)
    setForm(initialForm)
    setShowPreview(false)
    setOpenDialog(false)
  }

  const onSave = async () => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }

    if (!form.title.trim() || !form.content.trim() || !form.description.trim()) {
      setError('Title, description, and content are required.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        category: form.category,
        description: form.description.trim(),
        icon: form.icon,
        content: form.content.trim(),
        order: form.order,
        region: form.region,
        isActive: form.isActive,
      }

      if (editingId) {
        await updateGuide(token, editingId, payload)
        setMessage('Guide updated successfully')
      } else {
        await createGuide(token, payload)
        setMessage('Guide created successfully')
      }

      onReset()
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save guide')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id: string) => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      await deleteGuide(token, id)
      setMessage('Guide deleted successfully')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete guide')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trip Planning Guides</h1>
        <p className="text-muted-foreground mt-1">Manage comprehensive guides for trekking preparation across logistics, health, and safety</p>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Guides</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Guides</CardDescription>
            <CardTitle className="text-3xl">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Categories</CardDescription>
            <CardTitle className="text-3xl">{stats.categories}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Regions</CardDescription>
            <CardTitle className="text-3xl">{stats.regions}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Add & Filter */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Add Guide</CardTitle>
              <CardDescription>Create a new guide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button onClick={onReset} className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    New Guide
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingId ? 'Edit Guide' : 'Create Guide'}</DialogTitle>
                    <DialogDescription>
                      {editingId ? 'Update the guide details below.' : 'Add a comprehensive trekking guide for your users.'}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input
                        placeholder="e.g., Packing Checklist for Everest Trek"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Slug *</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Auto-generated from title"
                          value={form.slug}
                          onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setForm({ ...form, slug: slugify(form.title) })}
                        >
                          Auto
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">URL-friendly identifier</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as GuideForm['category'] })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Region *</Label>
                        <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v as GuideForm['region'] })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {REGIONS.map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Short Description *</Label>
                      <Textarea
                        placeholder="Brief description for listings"
                        rows={2}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ICONS.map((icon) => (
                            <SelectItem key={icon} value={icon}>
                              {icon}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Content (Markdown) *</Label>
                      <Textarea
                        placeholder="Write your guide content in markdown format. Supports **bold**, *italic*, # headings, - lists, etc."
                        rows={8}
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowPreview(!showPreview)
                          if (!showPreview) {
                            setPreviewHtml(marked(form.content) as string)
                          }
                        }}
                        className="w-full"
                      >
                        {showPreview ? 'Hide Preview' : 'Preview Markdown'}
                      </Button>

                      {showPreview && (
                        <Card className="border-border bg-muted/50">
                          <CardContent className="pt-4">
                            <div className="markdown-content text-sm" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Display Order</Label>
                        <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })} />
                      </div>

                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={form.isActive}
                            onCheckedChange={(checked) => setForm({ ...form, isActive: !!checked })}
                          />
                          <span className="text-sm font-medium">Active</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end mt-6">
                    <Button variant="outline" onClick={onReset}>
                      Cancel
                    </Button>
                    <Button onClick={onSave} disabled={saving}>
                      {saving ? 'Saving...' : editingId ? 'Update Guide' : 'Create Guide'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="pt-4 border-t space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Search</Label>
                  <Input
                    placeholder="Search by title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Filter Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Filter Region</Label>
                  <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Guides List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                Guides {filteredGuides.length > 0 && <span className="text-muted-foreground font-normal ml-2">({filteredGuides.length})</span>}
              </CardTitle>
              <CardDescription>Manage your trip planning guides</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Loading guides...</p>
                </div>
              ) : filteredGuides.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">{guides.length === 0 ? 'No guides yet.' : 'No guides match your filters.'}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredGuides.map((guide) => (
                    <div key={guide._id || guide.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">{guide.title}</p>
                          {guide.isActive && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Active</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {guide.category} • {guide.region} • {guide.viewCount || 0} views • Order: {guide.order}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{guide.description}</p>
                      </div>

                      <div className="flex gap-2 flex-shrink-0 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(guide)}
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
                              <AlertDialogTitle>Delete Guide</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{guide.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex gap-2 justify-end">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => onDelete(guide._id || guide.id || '')}
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
    </div>
  )
}
