"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldCheck, ShieldX, AlertTriangle, Copy, ExternalLink, Search } from "lucide-react";
import { verifyAddress, VerificationStatus } from "@/lib/aleoRpc";
import { formatAddress, formatTimestamp } from "@/lib/aleoUtils";
import { ProofGuaranteeExplainer } from "@/components/verify/ProofGuaranteeExplainer";
import type { SolvencyProof, OrgInfo } from "@/lib/aleoRpc";

interface RecentLookup {
  address: string;
  status: VerificationStatus;
  timestamp: number;
}

interface VerifyResult {
  status: VerificationStatus;
  proof?: SolvencyProof;
  org?: OrgInfo;
  verificationCount: number;
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [recentLookups, setRecentLookups] = useState<RecentLookup[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("veritaszk_recent_lookups");
      if (saved) setRecentLookups(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const saveRecent = useCallback((address: string, status: VerificationStatus) => {
    setRecentLookups((prev) => {
      const updated = [
        { address, status, timestamp: Date.now() },
        ...prev.filter((r) => r.address !== address),
      ].slice(0, 5);
      localStorage.setItem("veritaszk_recent_lookups", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleVerify = useCallback(async (addr?: string) => {
    const target = (addr || input).trim();
    if (!target || !target.startsWith("aleo1")) {
      setError("Please enter a valid Aleo address starting with aleo1");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await verifyAddress(target);
      setResult(res);
      saveRecent(target, res.status);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [input, saveRecent]);

  useEffect(() => {
    const addr = searchParams.get("address");
    if (addr) {
      setInput(addr);
      handleVerify(addr);
    }
  }, [searchParams]);

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColor: Record<VerificationStatus, string> = {
    SOLVENT: "#00ff88",
    REVOKED: "#f97316",
    UNVERIFIED: "rgba(255,255,255,0.3)",
    NOT_FOUND: "#ff4444",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 24px 80px" }}>

      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "600px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Shield size={28} color="#00ff88" />
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: 700, marginBottom: "12px" }}>Verify Organization Solvency</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px", lineHeight: 1.6 }}>
            Enter any organization&apos;s Aleo address to verify their solvency proof. No wallet required.
          </p>
        </motion.div>

        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              placeholder="aleo1..."
              style={{ flex: 1, padding: "14px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: "15px", fontFamily: "Space Grotesk, monospace", outline: "none" }}
            />
            <button
              onClick={() => handleVerify()}
              disabled={loading}
              style={{ padding: "14px 24px", borderRadius: "12px", background: "#00ff88", color: "#0a0a0f", fontWeight: 600, fontSize: "15px", border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", fontFamily: "Space Grotesk, sans-serif", opacity: loading ? 0.7 : 1, whiteSpace: "nowrap" }}
            >
              <Search size={16} />
              {loading ? "Verifying..." : "Verify Now"}
            </button>
          </div>
          {error && <p style={{ color: "#ff4444", fontSize: "13px", marginTop: "8px" }}>{error}</p>}
        </motion.div>

        {/* Result */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={result.status}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div style={{ padding: "32px", borderRadius: "16px", border: `1px solid ${statusColor[result.status]}33`, background: `${statusColor[result.status]}08`, marginBottom: "0" }}>

                {result.status === "SOLVENT" && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                      <ShieldCheck size={32} color="#00ff88" />
                      <motion.div
                        animate={{ textShadow: ["0 0 10px rgba(0,255,136,0.4)", "0 0 30px rgba(0,255,136,0.7)", "0 0 10px rgba(0,255,136,0.4)"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ fontSize: "36px", fontWeight: 800, color: "#00ff88" }}
                      >
                        SOLVENT ✓
                      </motion.div>
                    </div>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "8px" }}>
                      {result.org?.name ? `Organization: ${result.org.name}` : `Address: ${formatAddress(input)}`}
                    </p>
                    {result.proof?.timestamp && (
                      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>
                        Proof generated: {formatTimestamp(result.proof.timestamp)}
                      </p>
                    )}
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>
                      Verified {result.verificationCount} time{result.verificationCount !== 1 ? "s" : ""}
                    </p>
                    {result.proof?.proofNonce && (
                      <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", marginBottom: "20px" }}>
                        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace", wordBreak: "break-all" }}>
                          Nonce: {result.proof.proofNonce.slice(0, 40)}...
                        </p>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button onClick={copyUrl} style={{ flex: 1, padding: "10px 16px", borderRadius: "8px", background: "#00ff88", color: "#0a0a0f", fontWeight: 600, fontSize: "13px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: "Space Grotesk, sans-serif" }}>
                        <Copy size={13} />
                        {copied ? "Copied!" : "Share Verification"}
                      </button>
                      <button onClick={() => window.open(`https://explorer.aleo.org/testnet/address/${input}`, "_blank")} style={{ flex: 1, padding: "10px 16px", borderRadius: "8px", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: "13px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: "Space Grotesk, sans-serif" }}>
                        <ExternalLink size={13} />
                        Aleo Explorer
                      </button>
                    </div>
                  </>
                )}

                {result.status === "UNVERIFIED" && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                      <Shield size={32} color="rgba(255,255,255,0.3)" />
                      <span style={{ fontSize: "24px", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>UNVERIFIED</span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "8px" }}>No active solvency proof found for this organization.</p>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>This organization has not generated a proof, or their proof has expired.</p>
                  </>
                )}

                {result.status === "REVOKED" && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                      <AlertTriangle size={32} color="#f97316" />
                      <span style={{ fontSize: "24px", fontWeight: 700, color: "#f97316" }}>REVOKED</span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "8px" }}>Solvency proof has been revoked.</p>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>This organization revoked their proof. A new proof has not been submitted.</p>
                    {result.proof?.timestamp && (
                      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginTop: "8px" }}>Revoked at: {formatTimestamp(result.proof.timestamp)}</p>
                    )}
                  </>
                )}

                {result.status === "NOT_FOUND" && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                      <ShieldX size={32} color="#ff4444" />
                      <span style={{ fontSize: "24px", fontWeight: 700, color: "#ff4444" }}>NOT FOUND</span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "16px" }}>Address not found or network error.</p>
                    <button onClick={() => handleVerify()} style={{ padding: "10px 20px", borderRadius: "8px", background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", color: "#ff4444", fontSize: "13px", cursor: "pointer", fontFamily: "Space Grotesk, sans-serif" }}>
                      Retry
                    </button>
                  </>
                )}
              </div>

              {/* Proof guarantee explainer — appears below result for SOLVENT and REVOKED */}
              <ProofGuaranteeExplainer
                status={result.status}
                timestamp={result.proof?.timestamp}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent lookups */}
        {recentLookups.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ marginTop: "32px" }}>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Recent Lookups</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recentLookups.map((r) => (
                <button
                  key={r.address}
                  onClick={() => { setInput(r.address); handleVerify(r.address); }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", cursor: "pointer", fontFamily: "Space Grotesk, sans-serif" }}
                >
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>{formatAddress(r.address)}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: statusColor[r.status] }}>{r.status}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "64px", paddingTop: "32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>VeritasZK — Prove Solvency. Reveal Nothing.</span>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>Built on Aleo · Wave 4</span>
          <div style={{ display: "flex", gap: "16px" }}>
            <a href="https://github.com/Vinaystwt/veritaszk" target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>GitHub</a>
            <a href="https://explorer.aleo.org" target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Explorer</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "rgba(255,255,255,0.3)" }}>Loading...</p></div>}>
      <VerifyContent />
    </Suspense>
  );
}
