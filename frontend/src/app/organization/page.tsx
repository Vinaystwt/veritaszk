"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@/context/WalletContext";
import { WalletGate } from "@/components/organization/WalletGate";
import { OrgRegistration } from "@/components/organization/OrgRegistration";
import { AssetDeclarationForm } from "@/components/organization/AssetDeclarationForm";
import { LiabilityDeclarationForm } from "@/components/organization/LiabilityDeclarationForm";
import { SummaryPanel } from "@/components/organization/SummaryPanel";
import { ProofAnimation } from "@/components/organization/ProofAnimation";
import { ProgressStepper } from "@/components/organization/ProgressStepper";
import type { DeclaredAsset } from "@/components/organization/AssetDeclarationForm";
import type { DeclaredLiability } from "@/components/organization/LiabilityDeclarationForm";
import { buildSentinelAssetRecord, buildSentinelLiabilityRecord, currentTimestamp, CONTRACT_ADDRESS } from "@/lib/aleoUtils";
import { Loader2 } from "lucide-react";

export default function OrganizationPage() {
  const { address: publicKey, connected: walletConnected } = useWallet();
  const [demoMode, setDemoMode] = useState(false);
  useEffect(() => {
    const isDemo = new URLSearchParams(window.location.search).get("demo") === "true";
    setDemoMode(isDemo);
    if (isDemo) {
      // Reset state for fresh demo — clear localStorage so registration shows
      localStorage.removeItem("veritaszk_org_name");
      localStorage.removeItem("veritaszk_org_registered");
      localStorage.removeItem("veritaszk_proof_active");
      setRegistered(false);
      setOrgName("");
      setAssets([]);
      setLiabilities([]);
    }
  }, []);
  const connected = walletConnected || demoMode;

  const [registered, setRegistered] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [assets, setAssets] = useState<DeclaredAsset[]>([]);
  const [liabilities, setLiabilities] = useState<DeclaredLiability[]>([]);
  const [proofStatus, setProofStatus] = useState<"none" | "active" | "revoked">("none");
  const [proofNonce, setProofNonce] = useState<string | undefined>();
  const [proofTimestamp, setProofTimestamp] = useState<string | undefined>();
  const [showProofAnimation, setShowProofAnimation] = useState(false);
  const [generatingProof, setGeneratingProof] = useState(false);
  const [revoking, setRevoking] = useState(false);

  // Compute current step for stepper
  const currentStep = !registered ? 0 : assets.length === 0 ? 1 : liabilities.length === 0 ? 2 : 3;

  useEffect(() => {
    if (connected) {
      const savedName = localStorage.getItem("veritaszk_org_name");
      const savedReg = localStorage.getItem("veritaszk_org_registered");
      if (savedName && savedReg) { setOrgName(savedName); setRegistered(true); }
    }
  }, [connected]);

  const handleRegistered = (name: string) => {
    setOrgName(name);
    setRegistered(true);
    const addr = publicKey ?? "aleo1cdmu479q6duu327wgm3vnphqtq2n4q4vcvp66f5742gv5f8f9qxq0w9r00";
    localStorage.setItem("veritaszk_wallet_address", addr);
    localStorage.setItem("veritaszk_org_name", name);
    localStorage.setItem("veritaszk_org_registered", "true");
  };

  const handleGenerateProof = async () => {
    const effectiveKey = publicKey ?? "aleo1cdmu479q6duu327wgm3vnphqtq2n4q4vcvp66f5742gv5f8f9qxq0w9r00";
    if (!effectiveKey) return;
    setGeneratingProof(true);
    setShowProofAnimation(true);
    try {
      const assetSlots = [...assets.slice(0, 5)];
      while (assetSlots.length < 5) assetSlots.push({ id: "sentinel", asset_type: 0, amount: 0, asset_id: "0field", timestamp: "0u32" });
      const liabilitySlots = [...liabilities.slice(0, 5)];
      while (liabilitySlots.length < 5) liabilitySlots.push({ id: "sentinel", liability_type: 0, amount: 0, liability_id: "0field", timestamp: "0u32" });

      const assetInputs = assetSlots.map((a) =>
        a.id === "sentinel" ? buildSentinelAssetRecord(effectiveKey)
          : `{owner: ${effectiveKey}.private, asset_type: ${a.asset_type}u8.private, amount: ${a.amount}u64.private, asset_id: ${a.asset_id}.private, _nonce: 0group.public, _version: 1u8.public}`
      );
      const liabilityInputs = liabilitySlots.map((l) =>
        l.id === "sentinel" ? buildSentinelLiabilityRecord(effectiveKey)
          : `{owner: ${effectiveKey}.private, liability_type: ${(l as DeclaredLiability).liability_type}u8.private, amount: ${l.amount}u64.private, liability_id: ${(l as DeclaredLiability).liability_id}.private, _nonce: 0group.public, _version: 1u8.public}`
      );
      const ts = currentTimestamp();

      if (false) {
        // live contract call placeholder
      } else {
        console.log("[SIM] generate_solvency_proof called");
        await new Promise((r) => setTimeout(r, 3000));
      }
    } catch (e) {
      console.error("Proof generation error:", e);
    }
  };

  const handleProofComplete = useCallback((nonce: string, ts: string) => {
    setProofNonce(nonce);
    setProofTimestamp(ts);
    setProofStatus("active");
    setGeneratingProof(false);
    // Save to localStorage for simulation mode in /verify
    localStorage.setItem("veritaszk_proof_active", "true");
    localStorage.setItem("veritaszk_proof_nonce", nonce);
    localStorage.setItem("veritaszk_proof_timestamp", String(Math.floor(Date.now() / 1000)));
    localStorage.setItem("veritaszk_wallet_address", publicKey ?? "aleo1cdmu479q6duu327wgm3vnphqtq2n4q4vcvp66f5742gv5f8f9qxq0w9r00");
  }, [publicKey]);

  const handleRevoke = async () => {
    if (!publicKey || !confirm("Are you sure you want to revoke your solvency proof?")) return;
    setRevoking(true);
    try {
      const ts = currentTimestamp();
      if (false) {
        // live contract call placeholder
      } else {
        console.log("[SIM] revoke_proof called");
        await new Promise((r) => setTimeout(r, 1500));
      }
      setProofStatus("revoked");
      setProofNonce(undefined);
      localStorage.removeItem("veritaszk_proof_active");
    } catch (e) { console.error("Revoke error:", e); }
    finally { setRevoking(false); }
  };

  const canGenerate = assets.length >= 1 && liabilities.length >= 1 && !generatingProof && proofStatus !== "active";

  return (
    <WalletGate>
      <div style={{ minHeight: "100vh", background: "#0a0a0f", padding: "40px 24px 80px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "32px" }}>
            <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "100px", border: "1px solid rgba(0,255,136,0.3)", background: "rgba(0,255,136,0.05)", color: "#00ff88", fontSize: "12px", marginBottom: "16px" }}>
              Organization Portal
            </div>
            <h1 style={{ fontSize: "36px", fontWeight: 700, marginBottom: "8px" }}>
              {orgName ? `Welcome, ${orgName}` : "Organization Portal"}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px" }}>Declare your assets and liabilities privately. Generate a ZK solvency proof.</p>
          </motion.div>

          <ProgressStepper currentStep={currentStep} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "32px", alignItems: "start" }}>
            <div>
              {!registered ? (
                <OrgRegistration onRegistered={handleRegistered} />
              ) : (
                <>
                  <AssetDeclarationForm onAssetDeclared={(a) => setAssets((prev) => [...prev, a])} />
                  <LiabilityDeclarationForm onLiabilityDeclared={(l) => setLiabilities((prev) => [...prev, l])} />

                  <motion.button
                    onClick={handleGenerateProof}
                    disabled={!canGenerate}
                    animate={canGenerate ? { boxShadow: ["0 0 20px rgba(0,255,136,0.2)", "0 0 40px rgba(0,255,136,0.4)", "0 0 20px rgba(0,255,136,0.2)"] } : { boxShadow: "none" }}
                    transition={{ duration: 2, repeat: Infinity }}
                    whileHover={canGenerate ? { scale: 1.02 } : {}}
                    whileTap={canGenerate ? { scale: 0.99 } : {}}
                    style={{
                      width: "100%", padding: "18px", borderRadius: "12px",
                      background: canGenerate ? "linear-gradient(135deg, #00ff88, #00cc6a)" : "rgba(255,255,255,0.05)",
                      color: canGenerate ? "#0a0a0f" : "rgba(255,255,255,0.3)",
                      fontWeight: 700, fontSize: "18px", border: "none",
                      cursor: canGenerate ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                      fontFamily: "Space Grotesk, sans-serif",
                      transition: "background 0.4s, color 0.4s",
                    }}
                  >
                    {generatingProof && <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />}
                    {proofStatus === "active" ? "Proof Active ✓" : generatingProof ? "Generating..." : "Generate Solvency Proof"}
                  </motion.button>

                  {!canGenerate && proofStatus !== "active" && (
                    <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "13px", marginTop: "12px" }}>
                      Declare at least 1 asset and 1 liability to generate proof
                    </p>
                  )}
                </>
              )}
            </div>

            <SummaryPanel assets={assets} liabilities={liabilities} proofStatus={proofStatus} proofNonce={proofNonce} proofTimestamp={proofTimestamp} onRevoke={handleRevoke} revoking={revoking} />
          </div>
        </div>
      </div>

      <ProofAnimation
        isOpen={showProofAnimation}
        onComplete={(nonce, ts) => {
          handleProofComplete(nonce, ts);
          // Auto-close removed — user closes manually
        }}
        walletAddress={publicKey || (typeof window !== "undefined" ? localStorage.getItem("veritaszk_wallet_address") : "") || ""}
      />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 380px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </WalletGate>
  );
}
