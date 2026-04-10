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
  connectWithAddress: (addr: string) => void
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
      account?: { publicKey?: string; address?: string }
      _publicKey?: string
      accounts?: string[]
      selectedAccount?: string
      on?: (event: string, handler: (data: unknown) => void) => void
      off?: (event: string, handler: (data: unknown) => void) => void
      requestTransaction?: (tx: unknown) => Promise<{ transactionId: string }>
    }
  }
}

/** Extract publicKey from any of the known Shield Wallet properties. */
function extractPublicKey(shield: NonNullable<Window['shield']>): string | null {
  return (
    shield.publicKey ||
    shield.account?.publicKey ||
    shield.account?.address ||
    shield._publicKey ||
    (shield.accounts?.[0] ?? null) ||
    shield.selectedAccount ||
    null
  )
}

export function useShieldWallet(): ShieldWallet {
  const [state, setState] = useState<WalletState>('IDLE')
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Stable ref for the accountChange handler so we can remove it
  const accountHandlerRef = useRef<((data: unknown) => void) | null>(null)
  const abortRef = useRef(false) // prevent state updates after disconnect/unmount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current = true
      if (accountHandlerRef.current && window.shield?.off) {
        window.shield.off('accountChange', accountHandlerRef.current)
      }
    }
  }, [])

  const connect = useCallback(async () => {
    if (typeof window === 'undefined') return

    if (!window.shield) {
      setState('NOT_INSTALLED')
      return
    }

    setState('CONNECTING')
    setErrorMessage(null)
    abortRef.current = false

    const shield = window.shield

    // ── Step 1: Register accountChange listener BEFORE connect() ────────────
    // Shield Wallet fires this when the account becomes available (even after throw)
    let eventResolved = false
    const accountReadyPromise = new Promise<string>((resolve) => {
      const handler = (account: unknown) => {
        const data = account as Record<string, unknown> | null
        const key =
          (data?.publicKey as string) ||
          (data?.address as string) ||
          (typeof account === 'string' ? account : null) ||
          extractPublicKey(shield)
        if (key && !eventResolved) {
          eventResolved = true
          shield.off?.('accountChange', handler)
          accountHandlerRef.current = null
          resolve(key)
        }
      }
      accountHandlerRef.current = handler
      shield.on?.('accountChange', handler)

      // Also check if publicKey is already available (extension may have cached)
      const immediate = extractPublicKey(shield)
      if (immediate) {
        eventResolved = true
        shield.off?.('accountChange', handler)
        accountHandlerRef.current = null
        resolve(immediate)
      }
    })

    // ── Step 2: Call connect() — intentionally ignore all throws ────────────
    try {
      await Promise.race([
        shield.connect(),
        new Promise<void>((_, reject) => setTimeout(() => reject(new Error('connect timeout')), 8000)),
      ])
    } catch {
      // Ignored: Shield Wallet throws "Invalid connect payload" but still connects.
    }

    // TEMPORARY DEBUG — remove after fix confirmed
    setTimeout(() => {
      console.log('=== SHIELD DEBUG ===')
      console.log('window.shield:', window.shield)
      console.log('publicKey:', (window.shield as any)?.publicKey)
      console.log('account:', (window.shield as any)?.account)
      console.log('_publicKey:', (window.shield as any)?._publicKey)
      console.log('accounts:', (window.shield as any)?.accounts)
      console.log('selectedAccount:', (window.shield as any)?.selectedAccount)
      console.log('keys:', Object.keys(window.shield || {}))
      console.log('===================')
    }, 500)

    // ── Step 3: Move to POLLING and race event vs backoff ──────────────────
    if (abortRef.current) return
    setState('POLLING')

    // Polling backoff: 300 → 600 → 1200 → 2400 → 4800ms
    const pollingPromise = new Promise<string | null>(async (resolve) => {
      const delays = [300, 600, 1200, 2400, 4800]
      for (const delay of delays) {
        await new Promise(r => setTimeout(r, delay))
        if (abortRef.current) { resolve(null); return }
        const key = extractPublicKey(shield)
        if (key) { resolve(key); return }
      }
      resolve(null)
    })

    // ── Step 4: Use whichever resolves first ────────────────────────────────
    try {
      const key = await Promise.race([
        accountReadyPromise,
        pollingPromise.then(k => {
          if (!k) throw new Error('polling exhausted')
          return k
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 16000)
        ),
      ])

      if (abortRef.current) return
      setPublicKey(key)
      setState('CONNECTED')
    } catch {
      if (abortRef.current) return
      setState('ERROR')
      setErrorMessage(
        'Shield Wallet did not return a public key. You can paste your Aleo address manually below, or use Demo Mode.'
      )
    }
  }, [])

  /** Last-resort fallback: accept manually pasted Aleo address. */
  const connectWithAddress = useCallback((addr: string) => {
    const trimmed = addr.trim()
    if (!trimmed || !trimmed.startsWith('aleo1')) {
      setErrorMessage('Invalid Aleo address — must start with aleo1')
      return
    }
    setPublicKey(trimmed)
    setState('CONNECTED')
    setErrorMessage(null)
  }, [])

  const disconnect = useCallback(() => {
    abortRef.current = true
    if (accountHandlerRef.current && window.shield?.off) {
      window.shield.off('accountChange', accountHandlerRef.current)
      accountHandlerRef.current = null
    }
    setPublicKey(null)
    setState('IDLE')
    setErrorMessage(null)
    // Reset abort flag so reconnection works
    setTimeout(() => { abortRef.current = false }, 50)
  }, [])

  const enterDemoMode = useCallback(() => {
    abortRef.current = true
    setState('DEMO_MODE')
    setPublicKey('aleo1demo...xyz')
    setErrorMessage(null)
  }, [])

  const exitDemoMode = useCallback(() => {
    abortRef.current = false
    setState('IDLE')
    setPublicKey(null)
  }, [])

  return {
    state,
    publicKey,
    connect,
    connectWithAddress,
    disconnect,
    enterDemoMode,
    exitDemoMode,
    isDemo: state === 'DEMO_MODE',
    errorMessage,
  }
}
