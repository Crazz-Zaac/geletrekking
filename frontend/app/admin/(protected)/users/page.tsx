'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AdminPageHeader, EmptyState, Field, FormSection, StatusToasts } from '@/components/admin/form-kit'
import { useConfirm } from '@/components/admin/use-confirm'
import {
  createAdminInvite,
  disableAdminUser,
  listAdminInvites,
  listAdminUsers,
  revokeAdminInvite,
  updateAdminUserStatus,
  type AdminManagedUser,
  type AdminInvite,
} from '@/lib/api'
import { getAdminToken, getAdminUser } from '@/lib/admin-auth'
import { AlertCircle, Ban, CheckCircle, Clock, Copy, Loader2, Mail, MoreHorizontal, PauseCircle, PlayCircle, Send, ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminUsersPage() {
  const [adminUsers, setAdminUsers] = useState<AdminManagedUser[]>([])
  const [invites, setInvites] = useState<AdminInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [askConfirm, confirmDialog] = useConfirm()

  useEffect(() => {
    const t = getAdminToken()
    const u = getAdminUser()
    setToken(t || '')
    setUser(u)

    if (t && u?.role === 'superadmin') {
      void Promise.all([loadInvites(t), loadAdminUsers(t)]).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const loadInvites = async (t: string) => {
    setError('')
    try {
      const data = await listAdminInvites(t)
      setInvites(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load invites')
    }
  }

  const loadAdminUsers = async (t: string) => {
    setError('')
    try {
      const data = await listAdminUsers(t)
      setAdminUsers(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load admin users')
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
      setMessage(`Invitation sent to ${email.trim()}.${result.inviteUrl ? ' The link was also copied to your clipboard.' : ''}`)
      setEmail('')

      if (result.inviteUrl) {
        await navigator.clipboard.writeText(result.inviteUrl)
        setCopied(result._id || result.inviteUrl)
      }
      
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

  const onRevokeInvite = async (inviteId: string) => {
    if (!token) {
      setError('Authentication required.')
      return
    }

    setActioningId(inviteId)
    setError('')
    setMessage('')

    try {
      const response = await revokeAdminInvite(token, inviteId)
      setMessage(response.message || 'Invite revoked successfully.')
      await loadInvites(token)
    } catch (err: any) {
      setError(err.message || 'Failed to revoke invite')
    } finally {
      setActioningId(null)
    }
  }

  const onDisableUser = async (userId: string) => {
    if (!token) {
      setError('Authentication required.')
      return
    }

    setActioningId(userId)
    setError('')
    setMessage('')

    try {
      const response = await disableAdminUser(token, userId)
      setMessage(response.message || 'User disabled successfully.')
      await loadAdminUsers(token)
    } catch (err: any) {
      setError(err.message || 'Failed to disable user')
    } finally {
      setActioningId(null)
    }
  }

  const onUpdateStatus = async (userId: string, status: 'active' | 'suspended' | 'disabled') => {
    if (!token) {
      setError('Authentication required.')
      return
    }

    setActioningId(userId)
    setError('')
    setMessage('')

    try {
      const response = await updateAdminUserStatus(token, userId, status)
      setMessage(response.message || 'User status updated.')
      await loadAdminUsers(token)
    } catch (err: any) {
      setError(err.message || 'Failed to update user status')
    } finally {
      setActioningId(null)
    }
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

  const initials = (value: string) => value.split(/[@.\s]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')

  const STATUS_BADGE: Record<string, string> = {
    active: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    suspended: 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    disabled: 'border-border bg-muted text-muted-foreground',
  }

  const emailInvalid = email.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())

  const confirmStatus = async (target: AdminManagedUser, status: 'active' | 'suspended' | 'disabled') => {
    if (status !== 'active') {
      const ok = await askConfirm({
        title: status === 'suspended' ? `Suspend ${target.email}?` : `Disable ${target.email}?`,
        description:
          status === 'suspended'
            ? 'They will be signed out and cannot sign in until you reactivate them.'
            : 'They lose access permanently unless reactivated.',
        confirmLabel: status === 'suspended' ? 'Suspend' : 'Disable',
      })
      if (!ok) return
    }
    if (status === 'disabled') await onDisableUser(target._id)
    else await onUpdateStatus(target._id, status)
  }

  const confirmRevoke = async (invite: AdminInvite) => {
    if (!invite._id) return
    if (!(await askConfirm({ title: `Revoke the invitation for ${invite.email}?`, description: 'The invitation link will stop working.', confirmLabel: 'Revoke' }))) return
    await onRevokeInvite(invite._id)
  }

  if (!user || user.role !== 'superadmin') {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Users" description="Admin accounts and invitations." />
        <EmptyState icon={<ShieldCheck className="h-5 w-5" />} title="Superadmins only" description="Ask a superadmin if you need to invite someone or change an account." />
      </div>
    )
  }

  const pendingInvites = invites.filter((invite) => !invite.usedAt)

  return (
    <div className="space-y-8">
      {confirmDialog}
      <StatusToasts error={error} message={message} />
      <AdminPageHeader title="Users" description="Who can access the admin dashboard." />

      <FormSection
        title="Invite an editor"
        description="Editors manage content (treks, blog, gallery, FAQ…). They can't change site settings, users or security. Invitations expire after 48 hours."
      >
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-start"
          onSubmit={(event) => {
            event.preventDefault()
            if (!creating && !emailInvalid) void onInvite()
          }}
        >
          <Field label="Email address" error={emailInvalid ? 'Enter a valid email address.' : undefined} className="flex-1">
            <Input className="h-10" type="email" autoComplete="off" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={creating} />
          </Field>
          <Button type="submit" disabled={creating || !email.trim() || emailInvalid} className="h-10 gap-2 sm:mt-7">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send invitation
          </Button>
        </form>
      </FormSection>

      <FormSection stacked title={`Team (${adminUsers.length})`} description="Suspend someone temporarily, or disable an account that should no longer have access.">
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />)}</div>
        ) : adminUsers.length === 0 ? (
          <EmptyState icon={<Users className="h-5 w-5" />} title="No admin users found" />
        ) : (
          <ul className="divide-y divide-border">
            {adminUsers.map((adminUser) => {
              const isSuperadmin = adminUser.role === 'superadmin'
              const status = adminUser.status || 'active'
              const busy = actioningId === adminUser._id
              return (
                <li key={adminUser._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{initials(adminUser.email)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{adminUser.email}</p>
                    <p className="text-xs text-muted-foreground">Added {formatDate(adminUser.createdAt)}</p>
                  </div>
                  <Badge variant="outline" className="hidden capitalize sm:inline-flex">{adminUser.role === 'admin' ? 'editor' : adminUser.role}</Badge>
                  <Badge variant="outline" className={cn('capitalize', STATUS_BADGE[status])}>{status}</Badge>
                  {isSuperadmin ? (
                    <span className="flex w-8 justify-center" title="Superadmin accounts are protected"><ShieldCheck className="h-4 w-4 text-muted-foreground" aria-label="Protected account" /></span>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={busy} aria-label={`Actions for ${adminUser.email}`}>
                          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {status !== 'active' && (
                          <DropdownMenuItem onSelect={() => void confirmStatus(adminUser, 'active')}><PlayCircle className="h-4 w-4" /> Reactivate</DropdownMenuItem>
                        )}
                        {status === 'active' && (
                          <DropdownMenuItem onSelect={() => void confirmStatus(adminUser, 'suspended')}><PauseCircle className="h-4 w-4" /> Suspend</DropdownMenuItem>
                        )}
                        {status !== 'disabled' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => void confirmStatus(adminUser, 'disabled')}><Ban className="h-4 w-4" /> Disable</DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </FormSection>

      <FormSection stacked title={`Invitations (${pendingInvites.length} open)`} description="Invitation emails include a link to set a password. You can also copy the link and send it yourself.">
        {loading ? (
          <div className="h-16 animate-pulse rounded-lg bg-muted" />
        ) : invites.length === 0 ? (
          <EmptyState icon={<UserPlus className="h-5 w-5" />} title="No invitations yet" description="Invite an editor above." />
        ) : (
          <ul className="divide-y divide-border">
            {invites.map((invite) => {
              const expired = isExpired(invite.expiresAt)
              const accepted = !!invite.usedAt
              return (
                <li key={invite._id || invite.email} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{invite.email}</p>
                    <p className={cn('flex items-center gap-1 text-xs', accepted ? 'text-emerald-700 dark:text-emerald-300' : expired ? 'text-muted-foreground' : 'text-amber-700 dark:text-amber-300')}>
                      {accepted ? <CheckCircle className="h-3 w-3" /> : expired ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {accepted ? `Accepted ${formatDate(invite.usedAt)}` : expired ? `Expired ${formatDate(invite.expiresAt)}` : `Expires ${formatDate(invite.expiresAt)}`}
                    </p>
                  </div>
                  {!accepted && !expired && (
                    <div className="flex gap-1.5">
                      {invite.inviteUrl && (
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onCopy(invite.inviteUrl || '', invite._id || invite.inviteUrl || '')}>
                          {copied === invite._id ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                          {copied === invite._id ? 'Copied' : 'Copy link'}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-destructive" disabled={!invite._id || actioningId === invite._id} onClick={() => void confirmRevoke(invite)}>
                        <Trash2 className="h-4 w-4" /> Revoke
                      </Button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </FormSection>
    </div>
  )
}
