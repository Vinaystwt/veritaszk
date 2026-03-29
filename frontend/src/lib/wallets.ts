export type WalletType = "puzzle" | "leo";

export interface ConnectedWallet {
  address: string;
  walletType: WalletType;
}

// ─── PUZZLE WALLET ───────────────────────────────────────────

export async function connectPuzzle(): Promise<ConnectedWallet> {
  const client = (window as any).puzzle?.puzzleWalletClient;
  if (!client) throw new Error("Puzzle Wallet not detected");
  await client.connect.mutate();
  const accountResult = await client.getSelectedAccount.query();
  const address =
    accountResult?.account?.address ??
    accountResult?.address ??
    accountResult?.publicKey ??
    accountResult?.key;
  if (!address) throw new Error("Puzzle Wallet connected but no address returned");
  return { address: String(address), walletType: "puzzle" };
}

export async function disconnectPuzzle(): Promise<void> {
  const client = (window as any).puzzle?.puzzleWalletClient;
  if (client?.disconnect?.mutate) await client.disconnect.mutate();
}

export function isPuzzleAvailable(): boolean {
  return !!(window as any).puzzle?.puzzleWalletClient;
}

// ─── LEO WALLET ──────────────────────────────────────────────
// Leo uses the demox adapter — connection is triggered via their WalletMultiButton
// This function reads the already-connected publicKey from the adapter

export async function connectLeoViaAdapter(): Promise<ConnectedWallet> {
  // Wait for Leo adapter to inject publicKey after user approves
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = setInterval(() => {
      const leo = (window as any).leoWallet;
      const key = leo?.publicKey;
      if (key) {
        clearInterval(check);
        resolve({ address: String(key), walletType: "leo" });
      }
      attempts++;
      if (attempts > 30) {
        clearInterval(check);
        reject(new Error("Leo Wallet connection timed out"));
      }
    }, 500);
  });
}

export function isLeoAvailable(): boolean {
  return !!(window as any).leoWallet || !!(window as any).leo;
}

export function isLeoConnected(): boolean {
  const leo = (window as any).leoWallet;
  return !!(leo?.publicKey);
}

export function getLeoPublicKey(): string | null {
  return (window as any).leoWallet?.publicKey ?? null;
}

// ─── DETECTION ───────────────────────────────────────────────

export async function detectWallets(): Promise<{ puzzle: boolean; leo: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    puzzle: isPuzzleAvailable(),
    leo: isLeoAvailable(),
  };
}
