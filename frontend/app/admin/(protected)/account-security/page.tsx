'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, Loader2, ShieldAlert, ShieldCheck, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { AdminPageHeader, FormSection, StatusToasts } from '@/components/admin/form-kit'
import { useConfirm } from '@/components/admin/use-confirm'
import {
  beginAdminTwoFactorSetup,
  disableAdminTwoFactor,
  getCurrentAdmin,
  verifyAdminTwoFactorSetup,
  type AdminTwoFactorSetupResponse,
  type AdminUser,
} from '@/lib/api'
import { getAdminToken, saveAdminSession } from '@/lib/admin-auth'

function CodeInput({ value, onChange, onComplete, disabled }: { value: string; onChange: (value: string) => void; onComplete?: () => void; disabled?: boolean }) {
  return (
    <InputOTP
      maxLength={6}
      value={value}
      onChange={(next) => onChange(next.replace(/\D/g, ''))}
      onComplete={onComplete}
      disabled={disabled}
      inputMode="numeric"
      autoComplete="one-time-code"
      aria-label="6-digit code from your authenticator app"
    >
      <InputOTPGroup>
        {Array.from({ length: 6 }).map((_, index) => (
          <InputOTPSlot key={index} index={index} className="h-12 w-11 text-lg" />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{number}</span>
      <div className="min-w-0 flex-1 space-y-3 pb-2">
        <p className="pt-0.5 text-sm font-medium text-foreground">{title}</p>
        {children}
      </div>
    </li>
  )
}

export default function AdminAccountSecurityPage() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [busy, setBusy] = useState(false)
  const [code, setCode] = useState('')
  const [setup, setSetup] = useState<AdminTwoFactorSetupResponse | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [askConfirm, confirmDialog] = useConfirm()
  const token = getAdminToken()

  const loadUser = async () => {
    const current = await getCurrentAdmin()
    if (current) {
      setUser(current)
      saveAdminSession(current)
    }
  }

  useEffect(() => {
    void loadUser()
  }, [])

  const enabled = !!user?.twoFactorEnabled

  const run = async (action: () => Promise<void>) => {
    if (!token) {
      setError('Your session has expired. Please log in again.')
      return
    }
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const startSetup = () =>
    run(async () => {
      setSetup(await beginAdminTwoFactorSetup(token as string))
      setCode('')
    })

  const verify = () =>
    run(async () => {
      if (code.length !== 6) throw new Error('Enter the 6-digit code from your authenticator app.')
      const response = await verifyAdminTwoFactorSetup(token as string, code)
      setMessage(response.message || 'Two-factor authentication is now on.')
      setSetup(null)
      setCode('')
      await loadUser()
      if (user?.requiresTwoFactorSetup) window.setTimeout(() => (window.location.href = '/admin'), 900)
    })

  const disable = async () => {
    if (code.length !== 6) {
      setError('Enter the current 6-digit code to turn off two-factor authentication.')
      return
    }
    const confirmed = await askConfirm({
      title: 'Turn off two-factor authentication?',
      description:
        user?.role === 'superadmin'
          ? 'Superadmins must use 2FA: you will be asked to set it up again before you can use the dashboard.'
          : 'Your account will be protected by your password only.',
      confirmLabel: 'Turn off',
    })
    if (!confirmed) return
    await run(async () => {
      const response = await disableAdminTwoFactor(token as string, code)
      setMessage(response.message || 'Two-factor authentication is off.')
      setCode('')
      await loadUser()
    })
  }

  const copySecret = async () => {
    if (!setup?.secret) return
    try {
      await navigator.clipboard.writeText(setup.secret)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable; the secret is still visible to copy by hand.
    }
  }

  return (
    <div className="space-y-8">
      {confirmDialog}
      <StatusToasts error={error} message={message} />
      <AdminPageHeader title="Account security" description={user?.email ? `Signed in as ${user.email}` : 'Protect your admin account.'} />

      {user?.requiresTwoFactorSetup && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p><strong>Two-factor authentication is required for superadmins.</strong> Set it up below to continue to the dashboard.</p>
        </div>
      )}

      <FormSection
        title="Two-factor authentication"
        description="Sign-ins also need a 6-digit code from an authenticator app (Google Authenticator, Microsoft Authenticator, Authy, 1Password…)."
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-full ${enabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>
              {enabled ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Status</p>
              <p className="text-xs text-muted-foreground">{user ? (enabled ? 'Your account is protected with 2FA.' : 'Only your password protects this account.') : 'Checking…'}</p>
            </div>
          </div>
          {user && (
            <Badge variant="outline" className={enabled ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}>
              {enabled ? 'On' : 'Off'}
            </Badge>
          )}
        </div>

        {!user ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : enabled ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Turn off two-factor authentication</p>
            <p className="text-sm text-muted-foreground">Enter the current code from your authenticator app to confirm.</p>
            <div className="flex flex-wrap items-center gap-3">
              <CodeInput value={code} onChange={setCode} disabled={busy} />
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => void disable()} disabled={busy || code.length !== 6}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Turn off 2FA
              </Button>
            </div>
          </div>
        ) : !setup ? (
          <Button onClick={() => void startSetup()} disabled={busy} className="gap-2">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
            Set up two-factor authentication
          </Button>
        ) : (
          <ol className="space-y-5">
            <Step number={1} title="Scan this QR code with your authenticator app">
              <div className="flex flex-wrap items-start gap-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={setup.qrUrl} alt="QR code for your authenticator app" width={176} height={176} className="h-44 w-44 rounded-lg border border-border bg-white p-2" />
                <div className="min-w-0 max-w-xs space-y-2 text-sm">
                  <p className="text-muted-foreground">Can&apos;t scan? Enter this key in the app instead:</p>
                  <div className="flex items-center gap-2">
                    <code className="min-w-0 break-all rounded-md bg-muted px-2.5 py-1.5 font-mono text-xs">{setup.secret}</code>
                    <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => void copySecret()} aria-label="Copy key">
                      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </Step>
            <Step number={2} title="Enter the 6-digit code the app shows">
              <div className="flex flex-wrap items-center gap-3">
                <CodeInput value={code} onChange={setCode} onComplete={() => void verify()} disabled={busy} />
                <Button onClick={() => void verify()} disabled={busy || code.length !== 6} className="min-w-28">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />} Turn on 2FA
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Codes change every 30 seconds. Keep your phone&apos;s time set automatically.</p>
            </Step>
            <Step number={3} title="Done">
              <p className="text-sm text-muted-foreground">From now on you&apos;ll enter a code from the app each time you sign in.</p>
              <Button variant="ghost" size="sm" onClick={() => { setSetup(null); setCode('') }} disabled={busy}>Cancel setup</Button>
            </Step>
          </ol>
        )}
      </FormSection>
    </div>
  )
}
