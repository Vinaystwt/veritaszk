// Direct Puzzle wallet connection - bypass SDK import issues

export type WalletType = "puzzle" | "leo";

export interface ConnectedWallet {
  address: string;
  walletType: WalletType;
}

// ─── PUZZLE WALLET via @puzzlehq/sdk-core ───────────────────────────────────
// Uses window.aleo.puzzleWalletClient (NOT window.puzzle)

export async function connectPuzzle(): Promise<ConnectedWallet> {
  const client = (window as any).aleo?.puzzleWalletClient;
  if (!client) throw new Error("Puzzle Wallet not detected");

  const response = await client.connect.mutate({
    method: "connect",
    params: {
      dAppInfo: {
        name: "VeritasZK",
        description: "Zero-knowledge solvency proofs on Aleo",
        iconUrl: "https://veritaszk.vercel.app/logo.svg",
      },
      permissions: {
        programIds: {
          AleoTestnet: ["veritaszk.aleo"],
        },
      },
    },
  });

  const address = response?.connection?.address;
  if (!address) throw new Error("No address returned from Puzzle Wallet");
  return { address, walletType: "puzzle" };
}

export async function disconnectPuzzle(): Promise<void> {
  try {
    const client = (window as any).aleo?.puzzleWalletClient;
    if (client?.disconnect?.mutate) await client.disconnect.mutate();
  } catch {}
}

export function isPuzzleAvailable(): boolean {
  return typeof window !== "undefined" && !!(window as any).aleo?.puzzleWalletClient;
}

// ─── LEO WALLET via window.leoWallet ─────────────────────────────────────────
// Leo current version auto-connects — publicKey is available if wallet is unlocked

export async function connectLeo(): Promise<ConnectedWallet> {
  const leo = (window as any).leoWallet ?? (window as any).leo;
  if (!leo) throw new Error("Leo Wallet not detected");

  // Wait briefly for auto-connection
  await new Promise(resolve => setTimeout(resolve, 1000));

  const publicKey = leo.publicKey;
  if (publicKey && typeof publicKey === "string" && publicKey.startsWith("aleo1")) {
    return { address: publicKey, walletType: "leo" };
  }

  // Poll for up to 10 seconds
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Leo Wallet timed out — unlock your wallet and refresh, then try again"));
    }, 10000);

    const check = setInterval(() => {
      const key = (window as any).leoWallet?.publicKey ?? (window as any).leo?.publicKey;
      if (key && typeof key === "string" && key.startsWith("aleo1")) {
        clearInterval(check);
        clearTimeout(timeout);
        resolve({ address: key, walletType: "leo" });
      }
    }, 500);
  });
}

export function isLeoAvailable(): boolean {
  return typeof window !== "undefined" && (!!(window as any).leoWallet || !!(window as any).leo);
}

export async function detectWallets(): Promise<{ puzzle: boolean; leo: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    puzzle: isPuzzleAvailable(),
    leo: isLeoAvailable(),
  };
}
