"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeritasZK = void 0;
exports.verifySolvency = verifySolvency;
const node_fetch_1 = __importDefault(require("node-fetch"));
function stripSuffix(val) {
    return String(val ?? "").replace(/u(8|16|32|64|128)$/, "");
}
function isSolvencyProofRaw(v) {
    return typeof v === "object" && v !== null && "is_solvent" in v;
}
function isOrgInfoRaw(v) {
    return typeof v === "object" && v !== null && "name_hash" in v;
}
// ─────────────────────────────────────────────────────────────────────────────
// VeritasZK — main SDK class
// ─────────────────────────────────────────────────────────────────────────────
class VeritasZK {
    constructor(config = {}) {
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
    async verifySolvency(address) {
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
    async getOrgInfo(address) {
        const raw = await this.queryMapping("org_metadata", address);
        if (!isOrgInfoRaw(raw))
            return null;
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
    async getVerificationCount(address) {
        try {
            const raw = await this.queryMapping("verification_count", address);
            if (raw === null || raw === undefined)
                return 0;
            return Number(stripSuffix(raw));
        }
        catch {
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
    async queryMapping(mappingName, key) {
        const url = `${this.rpcUrl}/program/${this.programId}/mapping/${mappingName}/${key}`;
        let res;
        try {
            res = await (0, node_fetch_1.default)(url);
        }
        catch (err) {
            throw new Error(`VeritasZK network error: Unable to reach ${this.rpcUrl}. ` +
                `Check your network connection or rpcUrl config. (${String(err)})`);
        }
        if (res.status === 404)
            return null;
        if (!res.ok) {
            throw new Error(`VeritasZK RPC error: ${res.status} ${res.statusText} for ${url}`);
        }
        const text = await res.text();
        if (!text || text === "null")
            return null;
        try {
            return JSON.parse(text);
        }
        catch {
            return text.replace(/^"|"$/g, "");
        }
    }
}
exports.VeritasZK = VeritasZK;
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
async function verifySolvency(address, config) {
    const client = new VeritasZK(config);
    return client.verifySolvency(address);
}
//# sourceMappingURL=index.js.map