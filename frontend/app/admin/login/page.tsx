'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { adminLogin, getCurrentAdmin } from '@/lib/api'
import { clearAdminSession, getAdminToken, saveAdminSession } from '@/lib/admin-auth'

function AdminLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const invitedMessage = searchParams.get('invited') === '1'

  useEffect(() => {
    const checkExistingSession = async () => {
      const token = getAdminToken()
      if (!token) return

      const user = await getCurrentAdmin(token)
      if (user) {
        router.replace('/admin')
        return
      }

      clearAdminSession()
    }

    void checkExistingSession()
  }, [router])

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const result = await adminLogin({
      email,
      password,
      twoFactorCode: needsTwoFactor ? twoFactorCode : undefined,
    })

    if (result.need2FA) {
      setNeedsTwoFactor(true)
      setLoading(false)
      setError(result.message || 'Enter your 2FA code to continue.')
      return
    }

    if (!result.success || !result.token || !result.user) {
      setLoading(false)
      setError(result.message || 'Login failed')
      return
    }

    saveAdminSession(result.token, result.user)
    setLoading(false)
    router.replace(result.user.requiresTwoFactorSetup ? '/admin/account-security' : '/admin')
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border p-6 md:p-8">
        <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in to manage Gele Trekking content.
        </p>

        {invitedMessage ? (
          <div className="mt-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
            Your password has been set. Please sign in to continue.
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              disabled={needsTwoFactor || loading}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={needsTwoFactor || loading}
            />
          </div>

          {needsTwoFactor ? (
            <div className="space-y-1.5">
              <label htmlFor="twoFactorCode" className="text-sm font-medium text-foreground">Authenticator Code</label>
              <Input
                id="twoFactorCode"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
              />
              <p className="text-xs text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : needsTwoFactor ? 'Verify 2FA' : 'Sign In'}
          </Button>

          {needsTwoFactor ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={loading}
              onClick={() => {
                setNeedsTwoFactor(false)
                setTwoFactorCode('')
                setError('')
              }}
            >
              Use different credentials
            </Button>
          ) : null}
        </form>
      </Card>
    </main>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md border-border p-6 md:p-8">
            <p className="text-center text-muted-foreground">Loading...</p>
          </Card>
        </main>
      }
    >
      <AdminLoginContent />
    </Suspense>
  )
}
