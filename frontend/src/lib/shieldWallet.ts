// Shield Wallet integration — bypasses broken @provablehq/aleo-wallet-adaptor-shield
// Uses direct window.shield API with exponential backoff for state propagation

declare global {
  interface Window {
    shield?: {
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
      publicKey?: string;
      on: (event: string, handler: (data: any) => void) => void;
      off: (event: string, handler: (data: any) => void) => void;
      requestTransaction: (params: {
        programId: string;
        functionName: string;
        inputs: string[];
        fee?: number;
        privateFee?: boolean;
      }) => Promise<{ transactionId: string }>;
      getRecords: (programId: string) => Promise<any[]>;
      signMessage: (message: string) => Promise<{ signature: string }>;
    };
  }
}

export type WalletState =
  | 'disconnected'
  | 'connecting'
  | 'ready'
  | 'error';

/**
 * Connect to Shield Wallet with exponential backoff polling.
 * Root cause from Wave 4: connect() resolves before internal state propagates,
 * so this._publicKey is undefined when executeTransaction is called immediately.
 * Solution: poll window.shield.publicKey after connect() with backoff.
 */
export async function connectShieldWallet(): Promise<string> {
  if (!window.shield) {
    throw new Error(
      'Shield Wallet not detected. Please install the Shield Wallet extension.'
    );
  }

  await window.shield.connect();

  // Exponential backoff polling for publicKey
  // connect() resolves before internal state propagates — this is the known bug
  const MAX_RETRIES = 12;
  for (let i = 0; i < MAX_RETRIES; i++) {
    if (window.shield.publicKey && window.shield.publicKey.length > 0) {
      return window.shield.publicKey;
    }
    const delay = 100 * Math.pow(2, Math.min(i, 5));
    await new Promise((r) => setTimeout(r, delay));
  }

  throw new Error(
    'Shield Wallet connected but address unavailable. Please refresh and try again.'
  );
}

/**
 * Execute a transaction via Shield Wallet direct API.
 * Never uses the broken adapter — always goes through window.shield directly.
 */
export async function executeTransaction(
  programId: string,
  functionName: string,
  inputs: string[],
  fee: number = 1_000_000
): Promise<string> {
  if (!window.shield) {
    throw new Error('Shield Wallet not available');
  }
  if (!window.shield.publicKey) {
    throw new Error('Shield Wallet not connected. Please connect first.');
  }

  const result = await window.shield.requestTransaction({
    programId,
    functionName,
    inputs,
    fee,
    privateFee: false,
  });

  return result.transactionId;
}

/** Get the current Shield Wallet public key, or null if not connected. */
export function getPublicKey(): string | null {
  return window.shield?.publicKey ?? null;
}

/** Check if Shield Wallet extension is installed in the browser. */
export function isShieldAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.shield;
}
