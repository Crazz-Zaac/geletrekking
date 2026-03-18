'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AdminContactMessage,
  getAdminMessages,
  markAdminMessageRead,
  markAdminMessageUnread,
} from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

export default function AdminMessagesPage() {
  const [items, setItems] = useState<AdminContactMessage[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
      if (!selectedId && data.length > 0) {
        setSelectedId(data[0]._id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'unread') return items.filter((item) => !item.isRead)
    if (filter === 'read') return items.filter((item) => item.isRead)
    return items
  }, [filter, items])

  const selected = useMemo(() => items.find((item) => item._id === selectedId) || null, [items, selectedId])

  const toggleRead = async () => {
    if (!token || !selected) return

    try {
      const updated = selected.isRead
        ? await markAdminMessageUnread(token, selected._id)
        : await markAdminMessageRead(token, selected._id)

      setItems((prev) => prev.map((item) => (item._id === updated._id ? updated : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update message status')
    }
  }

  const unreadCount = items.filter((item) => !item.isRead).length

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Contact Messages</CardTitle>
          <CardDescription>{unreadCount} unread message(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex gap-2">
            <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>All</Button>
            <Button variant={filter === 'unread' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('unread')}>Unread</Button>
            <Button variant={filter === 'read' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('read')}>Read</Button>
            <Button variant="outline" size="sm" onClick={() => void refresh()}>Refresh</Button>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages found.</p>
          ) : (
            <div className="space-y-2 max-h-[620px] overflow-auto pr-1">
              {filtered.map((item) => (
                <button
                  key={item._id}
                  onClick={() => setSelectedId(item._id)}
                  className={`w-full text-left rounded-md border p-3 transition-colors ${selectedId === item._id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm truncate">{item.name}</p>
                    {!item.isRead ? <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> : null}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{item.email}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.message}</p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Message Detail</CardTitle>
          <CardDescription>{selected ? 'Read and manage selected message' : 'Select a message to view details'}</CardDescription>
        </CardHeader>
        <CardContent>
          {selected ? (
            <div className="space-y-4">
              <div>
                <p className="font-semibold">{selected.name}</p>
                <p className="text-sm text-muted-foreground">{selected.email}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <div className="rounded-md border border-border p-3 bg-muted/20 text-sm whitespace-pre-wrap">
                {selected.message}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={toggleRead}>
                  {selected.isRead ? 'Mark as Unread' : 'Mark as Read'}
                </Button>
                <a href={`mailto:${selected.email}`}>
                  <Button>Reply via Email</Button>
                </a>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No message selected.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
