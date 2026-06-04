'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  createAdminInvite,
  listAdminInvites,
  updateAdminUserStatus,
  type AdminInvite,
} from '@/lib/api'
import { getAdminToken, getAdminUser } from '@/lib/admin-auth'
import { Mail, Copy, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminUsersPage() {
  const [invites, setInvites] = useState<AdminInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const t = getAdminToken()
    const u = getAdminUser()
    setToken(t || '')
    setUser(u)

    if (t && u?.role === 'superadmin') {
      loadInvites(t)
    } else {
      setLoading(false)
    }
  }, [])

  const loadInvites = async (t: string) => {
    setLoading(true)
    setError('')
    try {
      const data = await listAdminInvites(t)
      setInvites(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load invites')
    } finally {
      setLoading(false)
    }
  }

  const onInvite = async () => {
    if (!email.trim()) {
      setError('Please enter an email address.')
      return
    }

    if (!token) {
      setError('Authentication required.')
      return
    }

    setCreating(true)
    setError('')
    setMessage('')

    try {
      const result = await createAdminInvite(token, email.trim())
      setMessage('Invite created successfully!')
      setEmail('')
      
      // Reload invites
      await loadInvites(token)
    } catch (err: any) {
      setError(err.message || 'Failed to create invite')
    } finally {
      setCreating(false)
    }
  }

  const onCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  const isExpired = (expiresAt: string | undefined) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  if (!user || user.role !== 'superadmin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Only superadmins can manage users.</p>
        </div>
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              You don't have permission to access this page. Contact your superadmin for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">Invite and manage admin users</p>
      </div>

      {/* Error/Message */}
      {error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </CardContent>
        </Card>
      )}
      {message && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <p className="text-sm text-green-800 dark:text-green-200">{message}</p>
          </CardContent>
        </Card>
      )}

      {/* Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle>Invite New Editor</CardTitle>
          <CardDescription>Send an invite to a new team member. They'll receive a link to set up their account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="editor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !creating) onInvite()
              }}
              type="email"
              disabled={creating}
            />
            <Button onClick={onInvite} disabled={creating}>
              {creating ? 'Sending...' : 'Send Invite'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Invites expire in 48 hours. The editor can only manage content, not settings or other users.
          </p>
        </CardContent>
      </Card>

      {/* Invites List */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading invites...</p>
          </CardContent>
        </Card>
      ) : invites.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No invites yet. Create one above to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invites</CardTitle>
            <CardDescription>Active and expired invites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invites.map((invite) => {
                const expired = isExpired(invite.expiresAt)
                const accepted = !!invite.usedAt
                const status = accepted ? 'accepted' : expired ? 'expired' : 'pending'

                return (
                  <div
                    key={invite._id}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-lg border',
                      accepted && 'border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-950/10',
                      expired && !accepted && 'border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/10',
                      !expired && !accepted && 'border-border'
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Mail className="w-4 h-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{invite.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {accepted ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Accepted {formatDate(invite.usedAt)}
                            </span>
                          ) : expired ? (
                            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              Expired {formatDate(invite.expiresAt)}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <Clock className="w-3 h-3" />
                              Expires {formatDate(invite.expiresAt)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {!accepted && !expired && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 shrink-0"
                        onClick={() => {
                          const url = `${window.location.origin}/admin/invite?token=${invite._id}`
                          onCopy(url, invite._id || '')
                        }}
                      >
                        <Copy className="w-4 h-4" />
                        {copied === invite._id ? 'Copied!' : 'Copy Link'}
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            ℹ️ About Editors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>What editors can do:</strong> Create, edit, and delete treks, blogs, activities, gallery items, and other content.
          </p>
          <p>
            <strong>What editors cannot do:</strong> Access site settings, security settings, manage users, or view audit logs.
          </p>
          <p>
            <strong>2FA:</strong> Editors can optionally enable two-factor authentication for their account.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
