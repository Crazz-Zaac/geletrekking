'use client'

import { useEffect, useRef, useState } from 'react'

interface TurnstileRenderOptions {
  sitekey: string
  theme?: 'light' | 'dark' | 'auto'
  callback?: (token: string) => void
  'error-callback'?: () => void
  'expired-callback'?: () => void
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

interface TurnstileWidgetProps {
  siteKey: string
  onVerify: (token: string) => void
  onError?: (reason?: string) => void
  onExpire?: () => void
  theme?: 'light' | 'dark' | 'auto'
}

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script'
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

export function TurnstileWidget({
  siteKey,
  onVerify,
  onError,
  onExpire,
  theme = 'auto',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const onVerifyRef = useRef(onVerify)
  const onErrorRef = useRef(onError)
  const onExpireRef = useRef(onExpire)
  const [isReady, setIsReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    onVerifyRef.current = onVerify
    onErrorRef.current = onError
    onExpireRef.current = onExpire
  }, [onError, onExpire, onVerify])

  useEffect(() => {
    setLoadError(null)

    if (window.turnstile) {
      setIsReady(true)
      return
    }

    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null
    if (existingScript) {
      if (window.turnstile) {
        setIsReady(true)
      } else {
        const onLoad = () => setIsReady(true)
        const onScriptError = () => {
          setLoadError('Unable to load captcha script. Check network or ad blocker settings.')
          onErrorRef.current?.('script-load-failed')
        }
        existingScript.addEventListener('load', onLoad, { once: true })
        existingScript.addEventListener('error', onScriptError, { once: true })
        return () => {
          existingScript.removeEventListener('load', onLoad)
          existingScript.removeEventListener('error', onScriptError)
        }
      }
      return
    }

    const script = document.createElement('script')
    script.id = TURNSTILE_SCRIPT_ID
    script.src = TURNSTILE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => setIsReady(true)
    script.onerror = () => {
      setLoadError('Unable to load captcha script. Check network or ad blocker settings.')
      onErrorRef.current?.('script-load-failed')
    }
    document.head.appendChild(script)

    return () => {
      script.onload = null
      script.onerror = null
    }
  }, [])

  useEffect(() => {
    if (!isReady || !containerRef.current || !window.turnstile) return

    setLoadError(null)

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        callback: (token) => onVerifyRef.current(token),
        'error-callback': () => {
          setLoadError('Captcha verification failed. Confirm your site key domain settings in Cloudflare.')
          onErrorRef.current?.('verification-error')
        },
        'expired-callback': () => {
          onExpireRef.current?.()
        },
      })
    } catch {
      setLoadError('Captcha failed to initialize. Verify your Turnstile site key and allowed domains.')
      onErrorRef.current?.('render-failed')
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
      widgetIdRef.current = null
    }
  }, [isReady, siteKey, theme])

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="min-h-[65px]" />
      {loadError ? <p className="text-xs text-destructive">{loadError}</p> : null}
    </div>
  )
}
