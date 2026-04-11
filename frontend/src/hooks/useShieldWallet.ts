'use client'
import { useState, useCallback } from 'react'

export type WalletState =
  | 'IDLE'
  | 'CONNECTING'
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
      connect: (
        network: string,
        decryptPermission: string,
        programs: string[]
      ) => Promise<{ address: string }>
      disconnect: () => Promise<void>
      on?: (event: string, handler: (data: any) => void) => void
      off?: (event: string, handler: (data: any) => void) => void
      emit?: (event: string, data: any) => void
      executeTransaction?: (params: any) => Promise<any>
      signMessage?: (message: string) => Promise<any>
      requestRecords?: (params: any) => Promise<any>
      requestTransaction?: (tx: unknown) => Promise<{ transactionId: string }>
      eventEmitter?: any
      icon?: string
    }
  }
}

const PROGRAMS = [
  'veritaszk_registry.aleo',
  'veritaszk_core.aleo',
  'veritaszk_audit.aleo',
  'veritaszk_threshold.aleo',
  'credits.aleo',
]

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

    try {
      // Root cause fix: connect() requires (network, decryptPermission, programs)
      // and returns {address: "aleo1..."} directly as the return value.
      // Calling with no args throws "Invalid connect payload" and returns nothing.
      const result = await (window.shield as any).connect(
        'testnet',
        'onChainHistory',
        PROGRAMS
      )

      // Primary: address comes back as return value
      const address =
        result?.address ||
        result?.publicKey ||
        (typeof result === 'string' ? result : null)

      if (address && address.startsWith('aleo1')) {
        setPublicKey(address)
        setState('CONNECTED')
        return
      }

      // Fallback: check prototype — _publicKey may be set after connect() returns
      await new Promise(r => setTimeout(r, 300))
      const proto = Object.getPrototypeOf(window.shield)
      const protoKey = proto?._publicKey
      if (protoKey && protoKey.startsWith('aleo1')) {
        setPublicKey(protoKey)
        setState('CONNECTED')
        return
      }

      // No address found
      setState('ERROR')
      setErrorMessage(
        'Shield Wallet connected but returned no address. Paste your Aleo address below, or use Demo Mode.'
      )
    } catch (e: any) {
      console.error('[Shield] connect error:', e?.message ?? e)

      // Even on throw, address may have been set on prototype before the error
      try {
        const proto = Object.getPrototypeOf(window.shield)
        const protoKey = proto?._publicKey
        if (protoKey && protoKey.startsWith('aleo1')) {
          setPublicKey(protoKey)
          setState('CONNECTED')
          return
        }
      } catch {}

      setState('ERROR')
      setErrorMessage(
        'Shield Wallet did not return a public key. Paste your Aleo address below, or use Demo Mode.'
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
    try { (window.shield as any)?.disconnect?.() } catch {}
  }, [])

  const enterDemoMode = useCallback(() => {
    setState('DEMO_MODE')
    setPublicKey('aleo1demo000000000000000000000000000000000000000000000000000000000')
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
