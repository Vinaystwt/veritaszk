"use client";
import { motion } from "framer-motion";
import { ShieldCheck, Lock } from "lucide-react";
import { ASSET_LABELS, ASSET_COLORS } from "@/lib/aleoUtils";
import type { DeclaredAsset } from "./AssetDeclarationForm";
import type { DeclaredLiability } from "./LiabilityDeclarationForm";

interface Props {
  assets: DeclaredAsset[];
  liabilities: DeclaredLiability[];
  proofStatus: "none" | "active" | "revoked";
  proofNonce?: string;
  proofTimestamp?: string;
  onRevoke?: () => void;
  revoking?: boolean;
}

export function SummaryPanel({ assets, liabilities, proofStatus, proofNonce, proofTimestamp, onRevoke, revoking }: Props) {
  const ready = assets.length >= 1 && liabilities.length >= 1;

  return (
    <div style={{ position: "sticky", top: "88px" }}>
      {/* Declared items panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ padding: "28px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", marginBottom: "20px" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <Lock size={18} color="#00ff88" />
          <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Private Records</h3>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>Assets declared</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#00ff88" }}>{assets.length}</span>
          </div>
          {assets.map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", marginBottom: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: ASSET_COLORS[a.asset_type] }} />
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>{ASSET_LABELS[a.asset_type]}</span>
              <span style={{ marginLeft: "auto", fontSize: "12px", color: "#00ff88" }}>Declared privately ✓</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>Liabilities declared</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#ff8888" }}>{liabilities.length}</span>
          </div>
          {liabilities.map((l) => (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", marginBottom: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: ASSET_COLORS[l.liability_type] }} />
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>{ASSET_LABELS[l.liability_type]}</span>
              <span style={{ marginLeft: "auto", fontSize: "12px", color: "#ff8888" }}>Declared privately ✓</span>
            </div>
          ))}
        </div>

        {ready && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginTop: "16px", padding: "12px", borderRadius: "8px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", textAlign: "center" }}
          >
            <span style={{ fontSize: "13px", color: "#00ff88" }}>✓ Ready to generate proof</span>
          </motion.div>
        )}
      </motion.div>

      {/* Proof status panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        style={{ padding: "28px", borderRadius: "16px", border: proofStatus === "active" ? "1px solid rgba(0,255,136,0.3)" : "1px solid rgba(255,255,255,0.08)", background: proofStatus === "active" ? "rgba(0,255,136,0.04)" : "rgba(255,255,255,0.03)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <ShieldCheck size={18} color={proofStatus === "active" ? "#00ff88" : "rgba(255,255,255,0.3)"} />
          <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Proof Status</h3>
        </div>

        {proofStatus === "none" && (
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>No active proof. Generate one below.</p>
        )}

        {proofStatus === "active" && (
          <>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#00ff88", marginBottom: "12px" }}>SOLVENT ✓</div>
            {proofTimestamp && <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>Generated: {proofTimestamp}</p>}
            {proofNonce && (
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace", wordBreak: "break-all", marginBottom: "16px" }}>
                Nonce: {proofNonce.slice(0, 20)}...
              </p>
            )}
            <button
              onClick={onRevoke}
              disabled={revoking}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.25)", color: "#ff4444", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "Space Grotesk, sans-serif" }}
            >
              {revoking ? "Revoking..." : "Revoke Proof"}
            </button>
          </>
        )}

        {proofStatus === "revoked" && (
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#ff4444" }}>REVOKED</div>
        )}
      </motion.div>
    </div>
  );
}
