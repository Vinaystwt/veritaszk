import { useState, useCallback, useEffect } from 'react';
import {
  connectShieldWallet,
  executeTransaction,
  getPublicKey,
  isShieldAvailable,
  WalletState,
} from '../lib/shieldWallet';

export function useShieldWallet() {
  const [state, setState] = useState<WalletState>('disconnected');
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if already connected on mount
  useEffect(() => {
    const existing = getPublicKey();
    if (existing) {
      setAddress(existing);
      setState('ready');
    }
  }, []);

  const connect = useCallback(async () => {
    setState('connecting');
    setError(null);
    try {
      const addr = await connectShieldWallet();
      setAddress(addr);
      setState('ready');
    } catch (e: any) {
      setError(e.message);
      setState('error');
    }
  }, []);

  const disconnect = useCallback(() => {
    window.shield?.disconnect?.();
    setAddress(null);
    setState('disconnected');
    setError(null);
  }, []);

  const execute = useCallback(
    async (
      programId: string,
      functionName: string,
      inputs: string[],
      fee?: number
    ) => {
      if (state !== 'ready') {
        throw new Error('Wallet not connected');
      }
      return executeTransaction(programId, functionName, inputs, fee);
    },
    [state]
  );

  return {
    state,
    address,
    error,
    connect,
    disconnect,
    execute,
    isAvailable: isShieldAvailable(),
    isReady: state === 'ready',
  };
}
