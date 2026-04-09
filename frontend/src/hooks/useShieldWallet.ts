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

  // On mount: check if Shield is installed (2s grace period)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && !window.shield && state === 'IDLE') {
        // Don't auto-set NOT_INSTALLED — only set it when user clicks connect
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [state])

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
      await window.shield.connect()
      // connect() resolved — now poll with backoff, do NOT read publicKey here
      setState('POLLING')
      pollPublicKey()
    } catch (err) {
      setState('ERROR')
      setErrorMessage(err instanceof Error ? err.message : 'Connection failed')
    }
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
