'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, Mountain, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { adminLogin, getCurrentAdmin } from '@/lib/api'
import { clearAdminSession, saveAdminSession } from '@/lib/admin-auth'

function AdminLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const invitedMessage = searchParams.get('invited') === '1'
  const submitting = useRef(false)

  useEffect(() => {
    const checkExistingSession = async () => {
      // The session is an httpOnly cookie, so ask the server whether it is valid.
      const user = await getCurrentAdmin()
      if (user) {
        saveAdminSession(user)
        router.replace('/admin')
        return
      }
      clearAdminSession()
    }
    void checkExistingSession()
  }, [router])

  const submit = async (code?: string) => {
    if (submitting.current) return
    submitting.current = true
    setError('')
    setLoading(true)

    const result = await adminLogin({
      email,
      password,
      twoFactorCode: needsTwoFactor ? code ?? twoFactorCode : undefined,
    })

    submitting.current = false

    if (result.need2FA) {
      setNeedsTwoFactor(true)
      setLoading(false)
      if (needsTwoFactor) setError(result.message || 'Enter your 6-digit code to continue.')
      return
    }

    if (!result.success || !result.user) {
      setLoading(false)
      setError(result.message || 'Sign-in failed. Check your details and try again.')
      if (needsTwoFactor) setTwoFactorCode('')
      return
    }

    saveAdminSession(result.user)
    router.replace(result.user.requiresTwoFactorSetup ? '/admin/account-security' : '/admin')
  }

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    void submit()
  }

  const backToCredentials = () => {
    setNeedsTwoFactor(false)
    setTwoFactorCode('')
    setError('')
  }

  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-2">
      {/* Brand panel (desktop) */}
      <div className="relative hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero-himalaya.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/60 to-black/70" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Mountain className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold">Gele Trekking</span>
          </div>
          <div className="max-w-md">
            <p className="font-serif text-4xl font-bold leading-tight">Manage your treks, bookings and stories.</p>
            <p className="mt-3 text-white/80">Everything that powers geletrekking.com, in one place.</p>
          </div>
          <p className="flex items-center gap-2 text-sm text-white/70">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Protected by two-factor authentication
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Mountain className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold">Gele Trekking</span>
          </div>

          {needsTwoFactor ? (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Two-step verification</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app for <span className="font-medium text-foreground">{email}</span>.</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">Sign in to the admin dashboard.</p>
            </>
          )}

          {invitedMessage && !needsTwoFactor && (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Your password has been set. Sign in to continue.
            </div>
          )}

          {error && (
            <div role="alert" className="mt-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            {needsTwoFactor ? (
              <div className="space-y-4">
                <InputOTP
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(value) => setTwoFactorCode(value.replace(/\D/g, ''))}
                  onComplete={(value) => void submit(value)}
                  disabled={loading}
                  autoFocus
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-label="6-digit verification code"
                  containerClassName="justify-center"
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot key={index} index={index} className="h-12 w-12 text-lg" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <Button type="submit" className="h-11 w-full" disabled={loading || twoFactorCode.length !== 6}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />} Verify
                </Button>
                <Button type="button" variant="ghost" className="w-full gap-1.5" disabled={loading} onClick={backToCredentials}>
                  <ArrowLeft className="h-4 w-4" /> Use a different account
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="username"
                      autoFocus
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@geletrekking.com"
                      disabled={loading}
                      className="h-11 pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="h-11 pl-9 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="h-11 w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
              </>
            )}
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Trouble signing in? Ask a superadmin to re-send your invitation.
          </p>
        </div>
      </div>
    </main>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading" />
        </main>
      }
    >
      <AdminLoginContent />
    </Suspense>
  )
}
