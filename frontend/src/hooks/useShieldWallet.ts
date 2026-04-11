'use client'
import { useState, useCallback } from 'react'

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
      on?: (event: string, handler: (data: any) => void) => void
      off?: (event: string, handler: (data: any) => void) => void
      emit?: (event: string, data: any) => void
      eventEmitter?: {
        on: (event: string, handler: (data: any) => void) => void
        off: (event: string, handler: (data: any) => void) => void
        emit: (event: string, data: any) => void
      }
      icon?: string
      publicKey?: string
      account?: { publicKey?: string; address?: string }
      requestTransaction?: (tx: unknown) => Promise<{ transactionId: string }>
    }
  }
}

export function useShieldWallet(): ShieldWallet {
  const [state, setState] = useState<WalletState>('IDLE')
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const connect = useCallback(async () => {
    if (typeof window === 'undefined') return

    // Brief delay to ensure extension is fully injected
    await new Promise(r => setTimeout(r, 500))

    if (!window.shield) {
      setState('NOT_INSTALLED')
      return
    }

    setState('CONNECTING')
    setErrorMessage(null)

    // ── Set up event listeners BEFORE calling connect() ─────────────────────
    // Shield Wallet is purely event-based — publicKey is never exposed as a property.
    // Keys present: ['icon', 'eventEmitter', 'on', 'off', 'emit']
    const possibleEvents = [
      'accountChange',
      'accountChanged',
      'accountsChanged',
      'connect',
      'connected',
      'ready',
      'address',
      'wallet_accountsChanged',
      'change',
    ]

    const addressPromise = new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('No account event received within 20s'))
      }, 20000)

      const handler = (data: any) => {
        const address =
          data?.publicKey ||
          data?.address ||
          data?.account?.publicKey ||
          data?.account?.address ||
          (typeof data === 'string' && data.startsWith('aleo1') ? data : null) ||
          data?.[0]?.publicKey ||
          data?.[0]?.address ||
          (Array.isArray(data) && typeof data[0] === 'string' ? data[0] : null)

        if (address && address.startsWith('aleo1')) {
          clearTimeout(timeout)
          // Clean up all listeners
          possibleEvents.forEach(evt => {
            try { window.shield?.off?.(evt, handler) } catch {}
            try { (window.shield as any)?.eventEmitter?.off(evt, handler) } catch {}
          })
          resolve(address)
        }
      }

      // Listen via window.shield.on
      possibleEvents.forEach(evt => {
        try { window.shield?.on?.(evt, handler) } catch {}
      })

      // Also listen on the eventEmitter directly
      try {
        const emitter = (window.shield as any).eventEmitter
        if (emitter) {
          possibleEvents.forEach(evt => {
            try { emitter.on(evt, handler) } catch {}
          })
        }
      } catch {}

      // Also listen on window itself for wallet broadcast events
      const windowHandler = (e: any) => {
        const data = e?.detail || e?.data
        if (!data) return
        const address =
          data?.publicKey ||
          data?.address ||
          (typeof data === 'string' && data.startsWith('aleo1') ? data : null)
        if (address && address.startsWith('aleo1')) {
          clearTimeout(timeout)
          window.removeEventListener('shield_connect', windowHandler)
          window.removeEventListener('shield_account', windowHandler)
          window.removeEventListener('message', windowHandler)
          resolve(address)
        }
      }
      window.addEventListener('shield_connect', windowHandler)
      window.addEventListener('shield_account', windowHandler)
      window.addEventListener('message', windowHandler)

      // TEMPORARY: log ALL events Shield emits — remove after event name confirmed
      const allHandler = (eventName: string) => (data: any) => {
        console.log(`SHIELD EVENT [${eventName}]:`, data)
      }
      possibleEvents.forEach(evt => {
        window.shield?.on?.(evt, allHandler(evt))
        try {
          (window.shield as any)?.eventEmitter?.on(evt, allHandler(evt))
        } catch {}
      })
    })

    // ── Call connect() — always throws "Invalid connect payload", that's OK ──
    setState('POLLING')
    try {
      await window.shield.connect()
    } catch {
      // Expected — Shield fires events after throwing
    }

    // ── Wait for an address event ────────────────────────────────────────────
    try {
      const address = await addressPromise
      setPublicKey(address)
      setState('CONNECTED')
    } catch {
      // No event received — show ERROR with manual address fallback
      setState('ERROR')
      setErrorMessage(
        'Shield Wallet did not emit an account event. Paste your Aleo address below, or use Demo Mode.'
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
    setPublicKey(null)
    setState('IDLE')
    setErrorMessage(null)
  }, [])

  const enterDemoMode = useCallback(() => {
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
    connectWithAddress,
    disconnect,
    enterDemoMode,
    exitDemoMode,
    isDemo: state === 'DEMO_MODE',
    errorMessage,
  }
}
