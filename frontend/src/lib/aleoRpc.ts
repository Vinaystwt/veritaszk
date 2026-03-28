"use client";

export const RPC_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.explorer.provable.com/v1";
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || "testnet";
export const CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "veritaszk.aleo";

export interface OrgInfo {
  address: string;
  name: string;
  nameHash: string;
  registeredAt: number;
  isActive: boolean;
}

export interface SolvencyProof {
  isSolvent: boolean;
  timestamp: number;
  assetCount: number;
  liabilityCount: number;
  proofNonce: string;
}

export interface OrgCard {
  address: string;
  name: string;
  status: "SOLVENT" | "REVOKED" | "UNVERIFIED";
  timestamp: number;
  verificationCount: number;
}

// Simulation data for demo mode
export const SimulationData = {
  orgs: [
    {
      address: "aleo1uxuph3sj4jcummhqs823hx5xkvq8rf7vy9jyp8sl5vgz0ux9nsyqw2e87p",
      name: "Demo Organization",
      status: "SOLVENT" as const,
      timestamp: Math.floor(Date.now() / 1000),
      verificationCount: 3,
    },
    {
      address: "aleo1abc123demo2qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqe87p",
      name: "Aleo DAO Treasury",
      status: "SOLVENT" as const,
      timestamp: Math.floor(Date.now() / 1000) - 86400,
      verificationCount: 12,
    },
    {
      address: "aleo1abc123demo3qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqe87p",
      name: "Wave4 Fund",
      status: "REVOKED" as const,
      timestamp: Math.floor(Date.now() / 1000) - 172800,
      verificationCount: 1,
    },
  ],
  stats: { orgs: 3, activeProofs: 2, totalVerifications: 16 },
};

async function queryMapping(program: string, mapping: string, key: string): Promise<unknown> {
  const url = `${RPC_URL}/${NETWORK}/program/${program}/mapping/${mapping}/${key}`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`RPC error: ${res.status}`);
  return res.json();
}

export async function getSolvencyProof(address: string): Promise<SolvencyProof | null> {
  try {
    const data = await queryMapping(CONTRACT, "solvency_proofs", address) as Record<string, unknown> | null;
    if (!data) return null;
    return {
      isSolvent: data.is_solvent as boolean,
      timestamp: Number(data.timestamp),
      assetCount: Number(data.asset_count),
      liabilityCount: Number(data.liability_count),
      proofNonce: String(data.proof_nonce),
    };
  } catch {
    return null;
  }
}

export async function getOrgMetadata(address: string): Promise<OrgInfo | null> {
  try {
    const data = await queryMapping(CONTRACT, "org_metadata", address) as Record<string, unknown> | null;
    if (!data) return null;
    return {
      address,
      name: String(data.name_hash || "").slice(0, 8),
      nameHash: String(data.name_hash),
      registeredAt: Number(data.registered_at),
      isActive: Boolean(data.is_active),
    };
  } catch {
    return null;
  }
}

export async function getVerificationCount(address: string): Promise<number> {
  try {
    const data = await queryMapping(CONTRACT, "verification_count", address);
    return Number(data) || 0;
  } catch {
    return 0;
  }
}

export type VerificationStatus = "SOLVENT" | "REVOKED" | "UNVERIFIED" | "NOT_FOUND";

export async function verifyAddress(address: string): Promise<{
  status: VerificationStatus;
  proof?: SolvencyProof;
  org?: OrgInfo;
  verificationCount: number;
}> {
  // Check localStorage for session proof (simulation mode)
  if (typeof window !== "undefined") {
    const sessionProof = localStorage.getItem("veritaszk_proof_active");
    const sessionAddress = localStorage.getItem("veritaszk_wallet_address");
    if (sessionProof === "true" && sessionAddress === address) {
      const nonce = localStorage.getItem("veritaszk_proof_nonce") || "simulatedfield";
      const ts = localStorage.getItem("veritaszk_proof_timestamp") || String(Math.floor(Date.now() / 1000));
      return {
        status: "SOLVENT",
        proof: { isSolvent: true, timestamp: Number(ts), assetCount: 2, liabilityCount: 1, proofNonce: nonce },
        verificationCount: 1,
      };
    }
  }

  // Try real RPC
  try {
    const [proof, org, count] = await Promise.all([
      getSolvencyProof(address),
      getOrgMetadata(address),
      getVerificationCount(address),
    ]);

    if (!proof) return { status: "UNVERIFIED", org: org || undefined, verificationCount: count };
    if (!proof.isSolvent) return { status: "REVOKED", proof, org: org || undefined, verificationCount: count };
    return { status: "SOLVENT", proof, org: org || undefined, verificationCount: count };
  } catch {
    return { status: "NOT_FOUND", verificationCount: 0 };
  }
}

export async function getNetworkStats(): Promise<{ orgs: number; activeProofs: number; totalVerifications: number }> {
  // Simulation fallback
  return SimulationData.stats;
}

export async function getAllOrgs(): Promise<OrgCard[]> {
  // Pull from localStorage for session org
  const sessionOrgs: OrgCard[] = [];
  if (typeof window !== "undefined") {
    const name = localStorage.getItem("veritaszk_org_name");
    const address = localStorage.getItem("veritaszk_wallet_address");
    const active = localStorage.getItem("veritaszk_proof_active");
    if (name && address) {
      sessionOrgs.push({
        address,
        name,
        status: active === "true" ? "SOLVENT" : "UNVERIFIED",
        timestamp: Math.floor(Date.now() / 1000),
        verificationCount: 1,
      });
    }
  }

  // Merge with simulation data, dedupe by address
  const all = [...sessionOrgs, ...SimulationData.orgs];
  const seen = new Set<string>();
  return all.filter((o) => {
    if (seen.has(o.address)) return false;
    seen.add(o.address);
    return true;
  });
}
