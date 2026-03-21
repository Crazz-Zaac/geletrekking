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
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<BlogForm>(initialForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [excerptRef, setExcerptRef] = useState<HTMLTextAreaElement | null>(null)
  const [contentRef, setContentRef] = useState<HTMLTextAreaElement | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')

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
    setShowForm(true)
    setMessage('')
    setError('')
  }

  const onCreateNew = () => {
    setEditingId(null)
    setForm(initialForm)
    setShowForm(true)
    setMessage('')
    setError('')
  }

  const onReset = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(initialForm)
    setImageUrl('')
    setImageAlt('')
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

    if (!window.confirm(`Delete blog "${item.title}"?`)) return

    try {
      await deleteAdminBlog(token, item._id)
      setMessage('Blog deleted successfully.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed. (Only superadmin can delete posts.)')
    }
  }

  // Generic text insertion utility
  const insertText = (ref: HTMLTextAreaElement | null, fieldName: 'excerpt' | 'content', before: string, after: string = '', placeholder: string = '') => {
    if (!ref) return
    const textarea = ref
    const currentValue = fieldName === 'excerpt' ? form.excerpt : form.content
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = currentValue.substring(start, end) || placeholder
    const newContent = currentValue.substring(0, start) + before + selectedText + after + currentValue.substring(end)

    setForm((prev) => ({ ...prev, [fieldName]: newContent }))

    setTimeout(() => {
      const cursorPos = start + before.length + selectedText.length
      textarea.focus()
      textarea.setSelectionRange(cursorPos, cursorPos)
    }, 0)
  }

  const insertHeading = (ref: HTMLTextAreaElement | null, fieldName: 'excerpt' | 'content', level: number) => {
    const prefix = '#'.repeat(level) + ' '
    insertText(ref, fieldName, prefix, '', 'Heading')
  }

  const insertImage = () => {
    if (!imageUrl.trim()) {
      alert('Please enter an image URL')
      return
    }
    const markdown = `![${imageAlt || 'Image'}](${imageUrl})`
    insertText(contentRef, 'content', markdown, '', '')
    setImageUrl('')
    setImageAlt('')
  }

  // Excerpt toolbar component
  const ExcerptToolbar = () => (
    <div className="border border-input rounded-t-md bg-muted/30 p-2 flex flex-wrap gap-1">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => insertText(excerptRef, 'excerpt', '**', '**', 'bold text')}
        title="Bold"
        className="h-8 w-8 p-0"
      >
        <strong>B</strong>
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => insertText(excerptRef, 'excerpt', '_', '_', 'italic text')}
        title="Italic"
        className="h-8 w-8 p-0"
      >
        <em>I</em>
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => insertText(excerptRef, 'excerpt', '~~', '~~', 'strikethrough')}
        title="Strikethrough"
        className="h-8 w-8 p-0"
      >
        <s>S</s>
      </Button>
      
      <div className="w-px bg-border mx-1" />
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => insertHeading(excerptRef, 'excerpt', 1)}
        title="Heading 1"
        className="h-8 px-2 text-xs"
      >
        H1
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => insertHeading(excerptRef, 'excerpt', 2)}
        title="Heading 2"
        className="h-8 px-2 text-xs"
      >
        H2
      </Button>

      <div className="w-px bg-border mx-1" />

      <Button
        size="sm"
        variant="ghost"
        onClick={() => insertText(excerptRef, 'excerpt', '[', '](url)', 'link text')}
        title="Link"
        className="h-8 px-2 text-xs"
      >
        🔗 Link
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground mt-1">Create, edit, and manage your blog posts</p>
        </div>
        {!showForm && (
          <Button onClick={onCreateNew} size="lg" className="gap-2">
            ✨ Create New Blog Post
          </Button>
        )}
      </div>

      {/* Error/Message Display */}
      {error ? (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          {message}
        </div>
      ) : null}

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="border-border">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
            <CardTitle className="text-2xl">{editingId ? '✏️ Edit Blog Post' : '✨ Create New Blog Post'}</CardTitle>
            <CardDescription>
              {editingId 
                ? 'Update your blog post content, metadata, and publication status.'
                : 'Create a new blog post with rich content, images, and hashtags.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</h3>
                <Input 
                  placeholder="Blog Post Title" 
                  value={form.title} 
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="text-lg font-semibold"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input 
                    placeholder="Author Name" 
                    value={form.author} 
                    onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
                  />
                  <Input 
                    placeholder="Hashtags (comma or space separated)" 
                    value={form.hashtags} 
                    onChange={(e) => setForm((prev) => ({ ...prev, hashtags: e.target.value }))}
                  />
                </div>
              </div>

              {/* Media Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Media</h3>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-2">Cover Image URL</label>
                  <Input 
                    placeholder="https://example.com/image.jpg" 
                    value={form.coverImage} 
                    onChange={(e) => setForm((prev) => ({ ...prev, coverImage: e.target.value }))}
                  />
                  {form.coverImage && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-border h-40">
                      <img src={form.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Content</h3>
                
                {/* Excerpt */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-2">Excerpt (Summary)</label>
                  <ExcerptToolbar />
                  <textarea
                    ref={setExcerptRef}
                    value={form.excerpt}
                    onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                    rows={3}
                    placeholder="Write a brief summary of your post (shown in listings)..."
                    className="w-full rounded-b-md border border-t-0 border-input bg-background px-3 py-2 text-sm resize-vertical"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{form.excerpt.length} characters</p>
                </div>

                {/* Full Content */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground block">Full Content *</label>
                    <span className="text-xs text-muted-foreground">{form.content.length} characters</span>
                  </div>

                  {/* Text Formatting Toolbar */}
                  <div className="border border-input rounded-t-md bg-muted/30 p-2 flex flex-wrap gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => insertText(contentRef, 'content', '**', '**', 'bold text')}
                      title="Bold"
                      className="h-8 w-8 p-0"
                    >
                      <strong>B</strong>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => insertText(contentRef, 'content', '_', '_', 'italic text')}
                      title="Italic"
                      className="h-8 w-8 p-0"
                    >
                      <em>I</em>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => insertText(contentRef, 'content', '~~', '~~', 'strikethrough')}
                      title="Strikethrough"
                      className="h-8 w-8 p-0"
                    >
                      <s>S</s>
                    </Button>
                    
                    <div className="w-px bg-border mx-1" />
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => insertHeading(contentRef, 'content', 1)}
                      title="Heading 1"
                      className="h-8 px-2 text-xs"
                    >
                      H1
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => insertHeading(contentRef, 'content', 2)}
                      title="Heading 2"
                      className="h-8 px-2 text-xs"
                    >
                      H2
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => insertHeading(contentRef, 'content', 3)}
                      title="Heading 3"
                      className="h-8 px-2 text-xs"
                    >
                      H3
                    </Button>

                    <div className="w-px bg-border mx-1" />

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => insertText(contentRef, 'content', '- ', '', 'List item')}
                      title="Bullet List"
                      className="h-8 px-2 text-xs"
                    >
                      • List
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => insertText(contentRef, 'content', '1. ', '', 'List item')}
                      title="Numbered List"
                      className="h-8 px-2 text-xs"
                    >
                      1. List
                    </Button>

                    <div className="w-px bg-border mx-1" />

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => insertText(contentRef, 'content', '[', '](url)', 'link text')}
                      title="Link"
                      className="h-8 px-2 text-xs"
                    >
                      🔗 Link
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => insertText(contentRef, 'content', '> ', '', 'Quote')}
                      title="Quote"
                      className="h-8 px-2 text-xs"
                    >
                      ❝ Quote
                    </Button>

                    <div className="w-px bg-border mx-1" />

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => insertText(contentRef, 'content', '```\n', '\n```', 'code')}
                      title="Code Block"
                      className="h-8 px-2 text-xs"
                    >
                      {'<>'} Code
                    </Button>

                    <div className="w-px bg-border mx-1" />

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        // Trigger a simple dialog for image insertion
                        const url = prompt('Enter image URL:')
                        if (url) {
                          const alt = prompt('Enter alt text (optional):') || 'Image'
                          setImageUrl(url)
                          setImageAlt(alt)
                          // Directly insert the image markdown
                          insertText(contentRef, 'content', `![${alt}](${url})`, '', '')
                        }
                      }}
                      title="Insert Image"
                      className="h-8 px-2 text-xs"
                    >
                      🖼️ Image
                    </Button>
                  </div>

                  <textarea
                    ref={setContentRef}
                    value={form.content}
                    onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                    rows={24}
                    placeholder="Write your full blog post content here... Use the toolbar above for formatting or write plain text/markdown. Images: ![alt text](image-url)"
                    className="w-full rounded-b-md border border-t-0 border-input bg-background px-3 py-2 text-sm font-mono resize-vertical min-h-96"
                  />
                </div>
              </div>

              {/* Publishing Section */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-border">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Publishing</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.isPublished} 
                    onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
                    className="rounded border-input"
                  />
                  <span className="text-sm font-medium">
                    {form.isPublished ? '🟢 Published' : '🔴 Draft'} - Make this post visible to readers
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button 
                  onClick={onSave} 
                  disabled={saving}
                  size="lg"
                  className="flex-1"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Post' : 'Create Post'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onReset}
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List Section */}
      <Card className="border-border">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
          <CardTitle>Your Blog Posts</CardTitle>
          <CardDescription>Manage and organize your published and draft posts</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Loading posts...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
              <p className="text-sm text-muted-foreground mb-4">No posts yet. Create one to get started!</p>
              <Button onClick={onCreateNew} variant="outline">Create Your First Blog Post</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item._id} className="rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm truncate">{item.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                          item.isPublished 
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}>
                          {item.isPublished ? '📢 Published' : '📝 Draft'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Slug: <code className="bg-muted px-1 rounded">{item.slug}</code></p>
                      {item.hashtags && item.hashtags.length > 0 ? (
                        <p className="text-xs text-muted-foreground mt-2 flex flex-wrap gap-1">
                          {item.hashtags.map((tag, idx) => (
                            <span key={idx} className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onEdit(item)}
                        className="whitespace-nowrap"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => onDelete(item)}
                        className="whitespace-nowrap"
                      >
                        Delete
                      </Button>
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
