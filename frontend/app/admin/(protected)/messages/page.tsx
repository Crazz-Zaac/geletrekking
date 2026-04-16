'use client'

import { useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  AdminContactMessage,
  getAdminMessages,
  markAdminMessageRead,
  markAdminMessageUnread,
  deleteAdminMessage, // add this to your API lib
} from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

export default function AdminMessagesPage() {
  const [items, setItems] = useState<AdminContactMessage[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<AdminContactMessage | null>(null)

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
      const data = await getAdminMessages(token)
      setItems(data)
      if (!selectedId && data.length > 0) setSelectedId(data[0]._id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void refresh() }, [])

  const filtered = useMemo(() => {
    if (filter === 'unread') return items.filter((i) => !i.isRead)
    if (filter === 'read') return items.filter((i) => i.isRead)
    return items
  }, [filter, items])

  const selected = useMemo(() => items.find((i) => i._id === selectedId) ?? null, [items, selectedId])

  const toggleRead = async () => {
    if (!token || !selected) return
    try {
      const updated = selected.isRead
        ? await markAdminMessageUnread(token, selected._id)
        : await markAdminMessageRead(token, selected._id)
      setItems((prev) => prev.map((i) => (i._id === updated._id ? updated : i)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update message')
    }
  }

  const handleDelete = async () => {
    if (!token || !deleteTarget) return
    try {
      await deleteAdminMessage(token, deleteTarget._id)
      const next = items.filter((i) => i._id !== deleteTarget._id)
      setItems(next)
      if (selectedId === deleteTarget._id) setSelectedId(next[0]?._id ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message')
    } finally {
      setDeleteTarget(null)
    }
  }

  const unreadCount = items.filter((i) => !i.isRead).length

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Contact Messages</CardTitle>
            <CardDescription>{unreadCount} unread message(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              {(['all', 'unread', 'read'] as const).map((f) => (
                <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => void refresh()}>Refresh</Button>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages found.</p>
            ) : (
              <div className="space-y-2 max-h-[620px] overflow-auto pr-1">
                {filtered.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setSelectedId(item._id)}
                    className={`group relative w-full text-left rounded-md border p-3 cursor-pointer transition-colors ${
                      selectedId === item._id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 pr-7">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      {!item.isRead && <span className="h-2.5 w-2.5 rounded-full bg-sky-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{item.email}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.message}</p>

                    {/* Trash button — visible on hover */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(item) }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Delete message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Message Detail</CardTitle>
            <CardDescription>
              {selected ? 'Read and manage selected message' : 'Select a message to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selected ? (
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">{selected.name}</p>
                  <p className="text-sm text-muted-foreground">{selected.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-md border border-border p-3 bg-muted/20 text-sm whitespace-pre-wrap">
                  {selected.message}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" onClick={toggleRead}>
                    {selected.isRead ? 'Mark as Unread' : 'Mark as Read'}
                  </Button>
                  <a href={`mailto:${selected.email}`}>
                    <Button>Reply via Email</Button>
                  </a>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 gap-1.5"
                    onClick={() => setDeleteTarget(selected)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No message selected.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the message from <strong>{deleteTarget?.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}