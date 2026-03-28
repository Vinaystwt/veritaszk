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
export declare class VeritasZK {
    private rpcUrl;
    private programId;
    private network;
    constructor(config?: VeritasZKConfig);
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
    verifySolvency(address: string): Promise<SolvencyResult>;
    /**
     * Retrieve public metadata for a registered organization.
     * Name hash only — raw organization name is never stored on-chain.
     *
     * @param address - The Aleo address of the organization
     * @returns OrgInfo containing registration metadata, or null if not registered
     */
    getOrgInfo(address: string): Promise<OrgInfo | null>;
    /**
     * Get the total number of times an organization's proof
     * has been publicly verified.
     *
     * @param address - The Aleo address of the organization
     * @returns verification count as a number
     */
    getVerificationCount(address: string): Promise<number>;
    /**
     * Query any mapping from the veritaszk.aleo program.
     * Hits: GET {rpcUrl}/program/{programId}/mapping/{mappingName}/{key}
     *
     * @param mappingName - The mapping to query
     * @param key - The key to look up
     * @returns Parsed mapping value or null if not found
     */
    private queryMapping;
}
/**
 * One-line convenience function for solvency verification.
 *
 * @example
 * import { verifySolvency } from "veritaszk-sdk"
 * const { isSolvent } = await verifySolvency("aleo1abc...")
 */
export declare function verifySolvency(address: string, config?: VeritasZKConfig): Promise<SolvencyResult>;
//# sourceMappingURL=index.d.ts.map