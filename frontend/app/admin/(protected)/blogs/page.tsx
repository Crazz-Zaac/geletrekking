'use client'

import { useConfirm } from '@/components/admin/use-confirm'
import { useEffect, useMemo, useState, type InputHTMLAttributes } from 'react'
import { ArrowLeft, ExternalLink, FileText, Newspaper, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  AdminPageHeader,
  EmptyState,
  Field,
  ImageUrlField,
  SaveBar,
  StatusToasts,
  TextArea,
  useDirtyState,
  useUnsavedChangesWarning,
} from '@/components/admin/form-kit'
import { MarkdownEditor } from '@/components/admin/markdown-editor'
import { cn } from '@/lib/utils'
import {
  AdminBlog,
  createAdminBlog,
  deleteAdminBlog,
  getAdminBlogs,
  slugify,
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
  /** Web address after /blog/. Empty on a new post means "make it from the title". */
  slug: string
}

const initialForm: BlogForm = {
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  author: '',
  hashtags: '',
  isPublished: false,
  slug: '',
}

/** Text input with a fixed "/blog/" prefix. Props (id, aria-*) go to the input so <Field> can label it. */
function SlugInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex h-10 items-center overflow-hidden rounded-md border border-input bg-background text-sm focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/20">
      <span className="shrink-0 self-stretch border-r border-border bg-muted/50 px-2.5 leading-10 text-muted-foreground" aria-hidden="true">/blog/</span>
      <input {...props} maxLength={120} spellCheck={false} autoCapitalize="off" autoComplete="off" className="h-full min-w-0 flex-1 bg-transparent px-2.5 outline-none" />
    </div>
  )
}

export default function AdminBlogsPage() {
  const [askConfirm, confirmDialog] = useConfirm()
  const [items, setItems] = useState<AdminBlog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<BlogForm>(initialForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [submitted, setSubmitted] = useState(false)
  const { dirty, markSaved, baseline } = useDirtyState(form)
  useUnsavedChangesWarning(showForm && dirty)

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
    const next = {
      title: item.title || '',
      excerpt: item.excerpt || '',
      content: item.content || '',
      coverImage: item.coverImage || '',
      author: item.author || '',
      hashtags: (item.hashtags || []).join(', '),
      isPublished: !!item.isPublished,
      slug: item.slug || '',
    }
    setForm(next)
    markSaved(next)
    setSubmitted(false)
    setShowForm(true)
    window.scrollTo({ top: 0 })
    setMessage('')
    setError('')
  }

  const onCreateNew = () => {
    setEditingId(null)
    setForm(initialForm)
    markSaved(initialForm)
    setSubmitted(false)
    setShowForm(true)
    setMessage('')
    setError('')
    window.scrollTo({ top: 0 })
  }

  const onReset = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(initialForm)
    markSaved(initialForm)
  }

  const onSave = async (publish: boolean = form.isPublished) => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }

    setSubmitted(true)
    if (!form.title.trim() || !form.content.trim()) {
      setError('Add a title and the post content before saving.')
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
        isPublished: publish,
        slug: slugify(form.slug),
        hashtags: parsedHashtags,
      }

      const wasPublished = !!items.find((item) => item._id === editingId)?.isPublished
      if (editingId) {
        await updateAdminBlog(token, editingId, payload)
        setMessage(publish ? (wasPublished ? 'Post updated and live.' : 'Post published.') : wasPublished ? 'Post unpublished and moved to drafts.' : 'Draft saved.')
      } else {
        await createAdminBlog(token, payload)
        setMessage(publish ? 'Post published.' : 'Draft created.')
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

    if (!(await askConfirm({ title: `Delete blog "${item.title}"?` }))) return

    try {
      await deleteAdminBlog(token, item._id)
      setMessage('Post deleted.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed. (Only superadmin can delete posts.)')
    }
  }

  const leaveEditor = async () => {
    if (dirty && !(await askConfirm({ title: 'Discard unsaved changes?', description: 'Your edits to this post will be lost.', confirmLabel: 'Discard' }))) return
    onReset()
  }

  const counts = useMemo(
    () => ({ all: items.length, published: items.filter((item) => item.isPublished).length, draft: items.filter((item) => !item.isPublished).length }),
    [items]
  )

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (filter === 'published' && !item.isPublished) return false
      if (filter === 'draft' && item.isPublished) return false
      if (!q) return true
      return [item.title, item.slug, ...(item.hashtags || [])].some((value) => (value || '').toLowerCase().includes(q))
    })
  }, [items, filter, query])

  const editingItem = editingId ? items.find((item) => item._id === editingId) : null
  const isLive = !!editingItem?.isPublished
  const tags = form.hashtags.split(/[\s,]+/).map((tag) => tag.trim()).filter(Boolean)
  const slugPreview = slugify(form.slug) || (editingItem?.slug ?? slugify(form.title)) || 'new-post'
  const slugChangedOnLivePost = !!editingItem && (editingItem.isPublished || !!editingItem.publishedAt) && !!slugify(form.slug) && slugify(form.slug) !== editingItem.slug
  const seoDescription = (form.excerpt || form.content).replace(/[#*_>`~\[\]()!-]/g, '').replace(/\s+/g, ' ').trim()

  if (showForm) {
    return (
      <div className="space-y-6">
        {confirmDialog}
        <StatusToasts error={error} message={message} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" className="-ml-2 gap-1.5 text-muted-foreground" onClick={() => void leaveEditor()}>
            <ArrowLeft className="h-4 w-4" /> All posts
          </Button>
          {editingItem?.isPublished && editingItem.slug && (
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <a href={`/blog/${editingItem.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /> View live post</a>
            </Button>
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          {/* Writing area */}
          <div className="min-w-0 space-y-6 rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
            <Field label="Title" required error={submitted && !form.title.trim() ? 'Add a title.' : undefined} count={{ value: form.title, max: 70, recommended: true }}>
              <Input
                className="h-12 text-lg font-semibold"
                placeholder="e.g. Everest Base Camp in October: what to expect"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </Field>
            <Field label="Summary" hint="Shown on the blog list and in search results." count={{ value: form.excerpt, max: 160, recommended: true }}>
              <TextArea rows={2} className="min-h-0" placeholder="One or two sentences that make people want to read the post." value={form.excerpt} onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))} />
            </Field>
            <Field label="Post" required error={submitted && !form.content.trim() ? 'Write the post content.' : undefined}>
              <MarkdownEditor
                extended
                defaultAlt={form.title}
                value={form.content}
                onChange={(content) => setForm((prev) => ({ ...prev, content }))}
                rows={22}
                placeholder="Start writing… Use the toolbar for headings, lists, links, images and videos."
              />
            </Field>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
            <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Status</p>
                  <p className="text-xs text-muted-foreground">
                    {isLive ? 'Live on the blog. Use Unpublish to hide it.' : 'Only visible in the admin until you publish.'}
                  </p>
                </div>
                <Badge variant="outline" className={isLive ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}>
                  {isLive ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <Field label="Author">
                <Input className="h-10" placeholder="e.g. Gele Bishokarma" value={form.author} onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))} />
              </Field>
              <Field label="Tags" hint="Separate with commas.">
                <Input className="h-10" placeholder="everest, autumn, packing" value={form.hashtags} onChange={(e) => setForm((prev) => ({ ...prev, hashtags: e.target.value }))} />
              </Field>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="font-normal">#{tag.replace(/^#/, '')}</Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <ImageUrlField label="Cover image" value={form.coverImage} onChange={(coverImage) => setForm((prev) => ({ ...prev, coverImage }))} size="hero" hint="Also used on the blog list." />
            </div>

            <div className="space-y-2 rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search preview</p>
              <div className="space-y-0.5">
                <p className="truncate text-xs text-emerald-700 dark:text-emerald-400">geletrekking.com › blog › {slugPreview}</p>
                <p className="line-clamp-1 text-base text-[#1a0dab] dark:text-[#8ab4f8]">{form.title || 'Post title'} | Gele Trekking</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{seoDescription || 'The summary appears here.'}</p>
              </div>
              <div className="border-t border-border pt-3">
                <Field
                  label="Web address"
                  hint={
                    slugChangedOnLivePost
                      ? `Links to /blog/${editingItem?.slug} will redirect to the new address.`
                      : editingItem && (editingItem.isPublished || editingItem.publishedAt)
                        ? 'Stays the same when you edit the title.'
                        : 'Leave blank to make it from the title. It stays fixed once published.'
                  }
                >
                  <SlugInput
                    placeholder={slugify(form.title) || 'everest-base-camp-in-october'}
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') }))}
                    onBlur={() => setForm((prev) => ({ ...prev, slug: slugify(prev.slug) }))}
                  />
                </Field>
              </div>
            </div>
          </aside>
        </div>

        <SaveBar
          dirty={dirty || !editingId}
          saving={saving}
          onSave={() => void onSave(true)}
          onDiscard={() => void leaveEditor()}
          discardLabel="Cancel"
          saveLabel={isLive ? 'Update post' : 'Publish post'}
          saveWhenClean={!isLive}
          secondaryAction={
            <Button type="button" variant="outline" disabled={saving || (!isLive && !dirty && !!editingId)} onClick={() => void onSave(false)}>
              {isLive ? 'Unpublish' : 'Save draft'}
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {confirmDialog}
      <StatusToasts error={error} message={message} />
      <AdminPageHeader
        title="Blog"
        description="Stories, guides and news. Regular posts help your site rank in search."
        actions={
          <Button onClick={onCreateNew} className="gap-2">
            <Plus className="h-4 w-4" /> New post
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-lg border border-border bg-card p-1" role="tablist" aria-label="Filter posts">
          {(['all', 'published', 'draft'] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={cn('rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors', filter === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
            >
              {key === 'draft' ? 'Drafts' : key} <span className="ml-1 tabular-nums opacity-70">{counts[key]}</span>
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input type="search" className="h-10 pl-9" placeholder="Search posts…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search posts" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl border border-border bg-card" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={<Newspaper className="h-5 w-5" />} title="No posts yet" description="Write your first trekking story or guide." action={<Button onClick={onCreateNew} className="gap-2"><Plus className="h-4 w-4" /> New post</Button>} />
      ) : visibleItems.length === 0 ? (
        <EmptyState icon={<Search className="h-5 w-5" />} title="No matching posts" description="Try another search or filter." />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {visibleItems.map((item) => (
            <li key={item._id} className="flex items-center gap-4 p-3 transition-colors hover:bg-muted/40 sm:p-4">
              <div className="hidden h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:block">
                {item.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.coverImage} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground"><FileText className="h-5 w-5" /></div>
                )}
              </div>
              <button type="button" onClick={() => onEdit(item)} className="min-w-0 flex-1 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium text-foreground">{item.title}</p>
                  <Badge variant="outline" className={item.isPublished ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}>
                    {item.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  /blog/{item.slug}
                  {item.createdAt ? ` · ${new Date(item.createdAt).toLocaleDateString()}` : ''}
                  {item.isPublished ? ` · ${(item.views || 0).toLocaleString()} views · ${(item.likes || 0).toLocaleString()} likes` : ''}
                  {item.hashtags?.length ? ` · ${item.hashtags.slice(0, 3).map((tag) => `#${tag.replace(/^#/, '')}`).join(' ')}` : ''}
                </p>
              </button>
              <div className="flex shrink-0 items-center gap-1">
                {item.isPublished && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href={`/blog/${item.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`View ${item.title}`}><ExternalLink className="h-4 w-4" /></a>
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)} aria-label={`Edit ${item.title}`}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => void onDelete(item)} aria-label={`Delete ${item.title}`}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
