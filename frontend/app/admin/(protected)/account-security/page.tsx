'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  beginAdminTwoFactorSetup,
  disableAdminTwoFactor,
  verifyAdminTwoFactorSetup,
  type AdminTwoFactorSetupResponse,
} from '@/lib/api'
import { getAdminToken } from '@/lib/admin-auth'

export default function AdminAccountSecurityPage() {
  const [isTwoFactorLoading, setIsTwoFactorLoading] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [twoFactorSetup, setTwoFactorSetup] = useState<AdminTwoFactorSetupResponse | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const token = getAdminToken()

  const onBeginTwoFactorSetup = async () => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }

    setIsTwoFactorLoading(true)
    setError('')
    setMessage('')
    try {
      const setup = await beginAdminTwoFactorSetup(token)
      setTwoFactorSetup(setup)
      setMessage(setup.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start 2FA setup.')
    } finally {
      setIsTwoFactorLoading(false)
    }
  }

  const onVerifyTwoFactorSetup = async () => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }
    if (!twoFactorCode.trim()) {
      setError('Enter the 6-digit authenticator code.')
      return
    }

    setIsTwoFactorLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await verifyAdminTwoFactorSetup(token, twoFactorCode)
      setMessage(response.message)
      setTwoFactorCode('')
      setTwoFactorSetup(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to verify 2FA setup.')
    } finally {
      setIsTwoFactorLoading(false)
    }
  }

  const onDisableTwoFactor = async () => {
    if (!token) {
      setError('Missing admin token. Please login again.')
      return
    }
    if (!twoFactorCode.trim()) {
      setError('Enter the 6-digit authenticator code to disable 2FA.')
      return
    }

    setIsTwoFactorLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await disableAdminTwoFactor(token, twoFactorCode)
      setMessage(response.message)
      setTwoFactorCode('')
      setTwoFactorSetup(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to disable 2FA.')
    } finally {
      setIsTwoFactorLoading(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Account Security</CardTitle>
        <CardDescription>Manage authentication security for your admin account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

        <div className="rounded-md border border-border p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Two-Factor Authentication (Authenticator App)</h3>
          <p className="text-xs text-muted-foreground">
            Use Google Authenticator, Authy, or a compatible TOTP app for admin login verification.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={onBeginTwoFactorSetup} disabled={isTwoFactorLoading}>
              {isTwoFactorLoading ? 'Working...' : 'Start 2FA Setup'}
            </Button>
          </div>

          {twoFactorSetup ? (
            <div className="rounded-md border border-border bg-muted/20 p-3 space-y-2">
              <p className="text-xs text-muted-foreground">Scan this QR in your authenticator app:</p>
              <img src={twoFactorSetup.qrUrl} alt="2FA QR code" className="h-40 w-40 rounded border border-border" />
              <p className="text-xs text-muted-foreground break-all">Secret: {twoFactorSetup.secret}</p>
            </div>
          ) : null}

          <div className="flex flex-col md:flex-row gap-2">
            <Input
              placeholder="Enter 6-digit authenticator code"
              inputMode="numeric"
              maxLength={6}
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            <Button type="button" onClick={onVerifyTwoFactorSetup} disabled={isTwoFactorLoading}>Enable 2FA</Button>
            <Button type="button" variant="destructive" onClick={onDisableTwoFactor} disabled={isTwoFactorLoading}>Disable 2FA</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
