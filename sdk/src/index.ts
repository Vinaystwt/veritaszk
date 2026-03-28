import fetch from "node-fetch";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SolvencyResult {
  address: string;
  isSolvent: boolean;
  timestamp: number;
  proofNonce: string;
  assetCount: number;
  liabilityCount: number;
  verificationCount: number;
  lastChecked: Date;
}

export interface OrgInfo {
  address: string;
  nameHash: string;
  registeredAt: number;
  isActive: boolean;
}

export interface VeritasZKConfig {
  network?: "testnet" | "mainnet";
  rpcUrl?: string;
  programId?: string;
}

interface SolvencyProofRaw {
  is_solvent: boolean;
  timestamp: string | number;
  proof_nonce: string;
  asset_count: string | number;
  liability_count: string | number;
}

interface OrgInfoRaw {
  name_hash: string;
  registered_at: string | number;
  is_active: boolean;
}

function stripSuffix(val: unknown): string {
  return String(val ?? "").replace(/u(8|16|32|64|128)$/, "");
}

function isSolvencyProofRaw(v: unknown): v is SolvencyProofRaw {
  return typeof v === "object" && v !== null && "is_solvent" in v;
}

function isOrgInfoRaw(v: unknown): v is OrgInfoRaw {
  return typeof v === "object" && v !== null && "name_hash" in v;
}

// ─────────────────────────────────────────────────────────────────────────────
// VeritasZK — main SDK class
// ─────────────────────────────────────────────────────────────────────────────

export class VeritasZK {
  private rpcUrl: string;
  private programId: string;
  private network: string;

  constructor(config: VeritasZKConfig = {}) {
    this.network = config.network ?? "testnet";
    this.rpcUrl =
      config.rpcUrl ?? "https://api.explorer.provable.com/v1/testnet";
    this.programId = config.programId ?? "veritaszk.aleo";
  }

  /**
   * Verify whether an organization holds a valid solvency proof.
   * Returns proof status without revealing any financial data.
   *
   * @param address - The Aleo address of the organization to verify
   * @returns SolvencyResult containing proof status and metadata
   *
   * @example
   * const client = new VeritasZK({ network: "testnet" })
   * const result = await client.verifySolvency("aleo1abc...")
   * console.log(result.isSolvent) // true or false — no amounts revealed
   */
  async verifySolvency(address: string): Promise<SolvencyResult> {
    const [raw, count] = await Promise.all([
      this.queryMapping("solvency_proofs", address),
      this.getVerificationCount(address),
    ]);

    if (!isSolvencyProofRaw(raw)) {
      return {
        address,
        isSolvent: false,
        timestamp: 0,
        proofNonce: "",
        assetCount: 0,
        liabilityCount: 0,
        verificationCount: count,
        lastChecked: new Date(),
      };
    }

    return {
      address,
      isSolvent: raw.is_solvent === true,
      timestamp: Number(stripSuffix(raw.timestamp)),
      proofNonce: String(raw.proof_nonce ?? ""),
      assetCount: Number(stripSuffix(raw.asset_count)),
      liabilityCount: Number(stripSuffix(raw.liability_count)),
      verificationCount: count,
      lastChecked: new Date(),
    };
  }

  /**
   * Retrieve public metadata for a registered organization.
   * Name hash only — raw organization name is never stored on-chain.
   *
   * @param address - The Aleo address of the organization
   * @returns OrgInfo containing registration metadata, or null if not registered
   */
  async getOrgInfo(address: string): Promise<OrgInfo | null> {
    const raw = await this.queryMapping("org_metadata", address);
    if (!isOrgInfoRaw(raw)) return null;

    return {
      address,
      nameHash: String(raw.name_hash ?? ""),
      registeredAt: Number(stripSuffix(raw.registered_at)),
      isActive: raw.is_active === true,
    };
  }

  /**
   * Get the total number of times an organization's proof
   * has been publicly verified.
   *
   * @param address - The Aleo address of the organization
   * @returns verification count as a number
   */
  async getVerificationCount(address: string): Promise<number> {
    try {
      const raw = await this.queryMapping("verification_count", address);
      if (raw === null || raw === undefined) return 0;
      return Number(stripSuffix(raw));
    } catch {
      return 0;
    }
  }

  /**
   * Query any mapping from the veritaszk.aleo program.
   * Hits: GET {rpcUrl}/program/{programId}/mapping/{mappingName}/{key}
   *
   * @param mappingName - The mapping to query
   * @param key - The key to look up
   * @returns Parsed mapping value or null if not found
   */
  private async queryMapping(
    mappingName: string,
    key: string
  ): Promise<unknown> {
    const url = `${this.rpcUrl}/program/${this.programId}/mapping/${mappingName}/${key}`;

    let res;
    try {
      res = await fetch(url);
    } catch (err) {
      throw new Error(
        `VeritasZK network error: Unable to reach ${this.rpcUrl}. ` +
          `Check your network connection or rpcUrl config. (${String(err)})`
      );
    }

    if (res.status === 404) return null;

    if (!res.ok) {
      throw new Error(
        `VeritasZK RPC error: ${res.status} ${res.statusText} for ${url}`
      );
    }

    const text = await res.text();
    if (!text || text === "null") return null;

    try {
      return JSON.parse(text);
    } catch {
      return text.replace(/^"|"$/g, "");
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience export — verify in one line
// ─────────────────────────────────────────────────────────────────────────────

/**
 * One-line convenience function for solvency verification.
 *
 * @example
 * import { verifySolvency } from "veritaszk-sdk"
 * const { isSolvent } = await verifySolvency("aleo1abc...")
 */
export async function verifySolvency(
  address: string,
  config?: VeritasZKConfig
): Promise<SolvencyResult> {
  const client = new VeritasZK(config);
  return client.verifySolvency(address);
}
