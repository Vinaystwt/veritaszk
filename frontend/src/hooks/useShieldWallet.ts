'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

export type WalletState =
  | 'IDLE'
  | 'CONNECTING'
  | 'POLLING'
  | 'CONNECTED'
  | 'ERROR'
  | 'NOT_INSTALLED'
  | 'DEMO_MODE'

export interface ShieldWallet {
  state: WalletState
  publicKey: string | null
  connect: () => Promise<void>
  disconnect: () => void
  enterDemoMode: () => void
  exitDemoMode: () => void
  isDemo: boolean
  errorMessage: string | null
}

declare global {
  interface Window {
    shield?: {
      connect: () => Promise<void>
      publicKey?: string | null
      requestTransaction?: (tx: unknown) => Promise<{ transactionId: string }>
    }
  }
}

const BACKOFF_DELAYS = [200, 400, 800, 1600, 3200]

export function useShieldWallet(): ShieldWallet {
  const [state, setState] = useState<WalletState>('IDLE')
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const attemptRef = useRef(0)

  // On mount: 500ms grace period before first shield check
  // Extensions sometimes inject after the component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      // Grace period elapsed — extension should be injected by now
      // NOT_INSTALLED state is only set when user clicks connect
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current)
    }
  }, [])

  const pollPublicKey = useCallback(() => {
    const attempt = attemptRef.current

    if (attempt >= BACKOFF_DELAYS.length) {
      setState('ERROR')
      setErrorMessage('Connection timed out. Please try again.')
      return
    }

    const delay = BACKOFF_DELAYS[attempt]
    pollingRef.current = setTimeout(() => {
      if (typeof window === 'undefined') return

      // CRITICAL: never call window.shield.publicKey synchronously after connect()
      // Always poll via backoff — this avoids the "Invalid connect payload" race condition
      const pk = window.shield?.publicKey
      if (pk) {
        setPublicKey(pk)
        setState('CONNECTED')
        attemptRef.current = 0
      } else {
        attemptRef.current = attempt + 1
        pollPublicKey()
      }
    }, delay)
  }, [])

  const connect = useCallback(async () => {
    if (typeof window === 'undefined') return

    if (!window.shield) {
      setState('NOT_INSTALLED')
      return
    }

    setState('CONNECTING')
    setErrorMessage(null)
    attemptRef.current = 0

    try {
      await Promise.race([
        window.shield.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 10000)
        ),
      ])
    } catch (e) {
      // CRITICAL: Do NOT set ERROR state here.
      // Shield Wallet throws "Invalid connect payload" but IS actually connected.
      // This is a bug in the extension, not a real failure.
      // Always proceed to POLLING regardless of the throw.
    }
    // Always move to POLLING after connect() — whether it threw or not
    setState('POLLING')
    pollPublicKey()
  }, [pollPublicKey])

  const disconnect = useCallback(() => {
    if (pollingRef.current) clearTimeout(pollingRef.current)
    setPublicKey(null)
    setState('IDLE')
    setErrorMessage(null)
    attemptRef.current = 0
  }, [])

  const enterDemoMode = useCallback(() => {
    if (pollingRef.current) clearTimeout(pollingRef.current)
    setState('DEMO_MODE')
    setPublicKey('aleo1demo...xyz')
    setErrorMessage(null)
  }, [])

  const exitDemoMode = useCallback(() => {
    setState('IDLE')
    setPublicKey(null)
  }, [])

  return {
    state,
    publicKey,
    connect,
    disconnect,
    enterDemoMode,
    exitDemoMode,
    isDemo: state === 'DEMO_MODE',
    errorMessage,
  }
}
