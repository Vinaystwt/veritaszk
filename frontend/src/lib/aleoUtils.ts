// aleoUtils.ts — VeritasZK utility functions

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "veritaszk.aleo";
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.explorer.provable.com/v1";
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || "testnet";

// Poll a transaction until confirmed or timeout
export async function pollTransaction(
  txId: string,
  intervalMs = 3000,
  timeoutMs = 120000
): Promise<{ confirmed: boolean; data?: unknown }> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${API_URL}/${NETWORK}/transaction/${txId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.status === "accepted" || data.type)) {
          return { confirmed: true, data };
        }
      }
    } catch {
      // continue polling
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return { confirmed: false };
}

// Generate a random field value for asset/liability IDs
export function generateFieldId(): string {
  const rand = BigInt(Math.floor(Math.random() * 1_000_000_000_000));
  return `${rand}field`;
}

// Hash org name to a field value (simple numeric hash)
export function hashOrgName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash * 31) + name.charCodeAt(i)) >>> 0;
  }
  return `${hash}field`;
}

// Sentinel asset record for padding to 5 slots
export function buildSentinelAssetRecord(owner: string): string {
  return `{owner: ${owner}.private, asset_type: 0u8.private, amount: 0u64.private, asset_id: 0field.private, _nonce: 0group.public, _version: 1u8.public}`;
}

// Sentinel liability record for padding to 5 slots
export function buildSentinelLiabilityRecord(owner: string): string {
  return `{owner: ${owner}.private, liability_type: 0u8.private, amount: 0u64.private, liability_id: 0field.private, _nonce: 0group.public, _version: 1u8.public}`;
}

// Truncate Aleo address for display
export function formatAddress(address: string): string {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

// Convert Unix timestamp to readable date
export function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Current Unix timestamp as u32 string
export function currentTimestamp(): string {
  return `${Math.floor(Date.now() / 1000)}u32`;
}

// Asset type label map
export const ASSET_LABELS: Record<number, string> = {
  1: "ALEO",
  2: "USDCx",
  3: "USAD",
};

export const ASSET_COLORS: Record<number, string> = {
  1: "#6366f1",
  2: "#22c55e",
  3: "#eab308",
};

// Check if wallet adapter supports requestTransaction
export function supportsTransactions(wallet: unknown): boolean {
  return typeof (wallet as Record<string, unknown>)?.requestTransaction === "function";
}
