'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  AdminBlog,
  createAdminBlog,
  deleteAdminBlog,
  getAdminBlogs,
  updateAdminBlog,
} from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

type BlogForm = {
  title: string
  excerpt: string
  content: string
  coverImage: string
  author: string
  hashtags: string
  isPublished: boolean
}

const initialForm: BlogForm = {
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  author: '',
  hashtags: '',
  isPublished: false,
}

export default function AdminBlogsPage() {
  const [items, setItems] = useState<AdminBlog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<BlogForm>(initialForm)
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
      const data = await getAdminBlogs(token)
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blogs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const onEdit = (item: AdminBlog) => {
    setEditingId(item._id)
    setForm({
      title: item.title || '',
      excerpt: item.excerpt || '',
      content: item.content || '',
      coverImage: item.coverImage || '',
      author: item.author || '',
      hashtags: (item.hashtags || []).join(', '),
      isPublished: !!item.isPublished,
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

    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const parsedHashtags = form.hashtags
        .split(/[\s,]+/)
        .map((tag) => tag.trim())
        .filter(Boolean)

      const payload = {
        ...form,
        hashtags: parsedHashtags,
      }

      if (editingId) {
        await updateAdminBlog(token, editingId, payload)
        setMessage('Blog updated successfully.')
      } else {
        await createAdminBlog(token, payload)
        setMessage('Blog created successfully.')
      }
      onReset()
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save blog')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (item: AdminBlog) => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }

    if (!window.confirm(`Delete blog \"${item.title}\"?`)) return

    try {
      await deleteAdminBlog(token, item._id)
      setMessage('Blog deleted successfully.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed. (Only superadmin can delete posts.)')
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Blog Post' : 'Create Blog Post'}</CardTitle>
          <CardDescription>Functionality aligned with `frontend_old` admin blog management.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
          <Input placeholder="Cover image URL" value={form.coverImage} onChange={(e) => setForm((prev) => ({ ...prev, coverImage: e.target.value }))} />
          <Input placeholder="Author" value={form.author} onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))} />
          <Input placeholder="Hashtags (comma or space separated, e.g. #dental, #healthcamp)" value={form.hashtags} onChange={(e) => setForm((prev) => ({ ...prev, hashtags: e.target.value }))} />
          <textarea
            value={form.excerpt}
            onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
            rows={3}
            placeholder="Excerpt"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <textarea
            value={form.content}
            onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
            rows={10}
            placeholder="Content"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))} />
            Published
          </label>
          <div className="flex gap-2">
            <Button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Post' : 'Create Post'}</Button>
            {editingId ? <Button variant="outline" onClick={onReset}>Cancel</Button> : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Posts</CardTitle>
          <CardDescription>Published and draft blog entries.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading posts...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No posts yet.</p>
          ) : (
            <div className="space-y-2 max-h-[680px] overflow-auto pr-1">
              {items.map((item) => (
                <div key={item._id} className="rounded-md border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">/{item.slug} • {item.isPublished ? 'Published' : 'Draft'}</p>
                      {item.hashtags && item.hashtags.length > 0 ? (
                        <p className="text-xs text-muted-foreground mt-1">{item.hashtags.join(' ')}</p>
                      ) : null}
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
  )
}
