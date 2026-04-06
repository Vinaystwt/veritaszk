"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Search,
  AlertCircle,
  Download,
  Clock,
  Hash,
  Timer,
  Wallet,
  Layers,
  History,
  CheckCircle2,
} from "lucide-react";
import { verifySolvency, getAuditTrail } from "veritaszk-sdk";
import type { SolvencyStatus, AuditEvent } from "veritaszk-sdk";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import CommitmentDisplay from "@/components/ui/CommitmentDisplay";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Approximate Aleo testnet block time in seconds (~25s per block)
const ALEO_BLOCK_TIME_S = 25;

function formatBlocksAgo(blockNumber: number): string {
  // Estimate current block from rough testnet epoch (adjust epoch base as needed)
  // Testnet launched ~2025-03-24, ~86400s/day / 25s/block = 3456 blocks/day
  const testnetStartEpoch = 1742774400; // 2025-03-24T00:00:00Z approx
  const now = Math.floor(Date.now() / 1000);
  const elapsedBlocks = Math.floor((now - testnetStartEpoch) / ALEO_BLOCK_TIME_S);
  const ago = elapsedBlocks - blockNumber;
  if (ago <= 0) return "just now";
  if (ago < 3456) return `${ago} blocks ago`;
  const days = Math.floor(ago / 3456);
  return `~${days} day${days > 1 ? "s" : ""} ago`;
}

function formatTimestamp(ts: number | null): string {
  if (!ts) return "N/A";
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBlock(n: number | null): string {
  return n != null ? n.toLocaleString() : "N/A";
}

function deriveStatus(solvency: SolvencyStatus): "ACTIVE" | "EXPIRING" | "EXPIRED" | "NO_PROOF" {
  if (!solvency.isSolvent) return "EXPIRED";
  if (solvency.isExpired) return "EXPIRED";
  if (solvency.expiryBlock != null) {
    const testnetStartEpoch = 1742774400;
    const now = Math.floor(Date.now() / 1000);
    const currentBlock = Math.floor((now - testnetStartEpoch) / ALEO_BLOCK_TIME_S);
    const remaining = solvency.expiryBlock - currentBlock;
    if (remaining < 500) return "EXPIRING";
  }
  return "ACTIVE";
}

export default function VerifierPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [solvency, setSolvency] = useState<SolvencyStatus | null>(null);
  const [audit, setAudit] = useState<AuditEvent | null>(null);
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleVerify = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const commitment = input.trim();

    if (!commitment) {
      setError("Please enter an organization commitment.");
      return;
    }
    if (!commitment.startsWith("aleo1")) {
      setError("Invalid format. Commitments start with aleo1...");
      return;
    }

    setLoading(true);
    setError("");
    setShowResult(false);
    setSolvency(null);
    setAudit(null);

    try {
      const [solvencyRes, auditRes] = await Promise.all([
        verifySolvency(commitment),
        getAuditTrail(commitment).catch(() => null),
      ]);

      setSolvency(solvencyRes);
      setAudit(auditRes);
      setShowResult(true);
    } catch {
      setError(
        "Unable to fetch proof data. Check the address and try again, or the network may be unavailable."
      );
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleDownloadReport = useCallback(() => {
    if (!solvency) return;
    const report = {
      organization: solvency.orgCommitment,
      verifiedAt: new Date().toISOString(),
      isSolvent: solvency.isSolvent,
      timestamp: solvency.timestamp,
      expiryBlock: solvency.expiryBlock,
      verificationCount: solvency.verificationCount,
      thresholdLevel: solvency.thresholdLevel,
      hasMultiWallet: solvency.hasMultiWallet,
      isExpired: solvency.isExpired,
      lastProofBlock: solvency.lastProofBlock,
      auditTrail: audit
        ? {
            eventCount: audit.eventCount,
            lastProofBlock: audit.lastProofBlock,
            isExpired: audit.isExpired,
          }
        : null,
      source: "VeritasZK Client-Side Report",
      network: "Aleo Testnet",
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `veritaszk-report-${solvency.orgCommitment.slice(0, 12)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [solvency, audit]);

  const status = solvency ? deriveStatus(solvency) : "NO_PROOF";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "80px 20px 80px",
      }}
    >
      {/* Subtle background grid */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "680px" }}>
        {/* ---- HEADER ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: "40px" }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Shield size={24} color="var(--accent-primary)" />
          </div>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 36px)",
              fontWeight: 700,
              marginBottom: "8px",
              lineHeight: 1.2,
            }}
          >
            Verify Solvency
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.6 }}>
            Enter an organization&apos;s commitment address to verify their zero-knowledge
            solvency proof. No wallet required.
          </p>
        </motion.div>

        {/* ---- SEARCH INPUT ---- */}
        <motion.form
          onSubmit={handleVerify}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          style={{ marginBottom: "32px" }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleVerify(e);
              }}
              placeholder="aleo1..."
              style={{
                flex: "1 1 280px",
                padding: "14px 16px",
                borderRadius: "10px",
                border: "1px solid var(--border-default)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-primary)",
                fontSize: "14px",
                fontFamily: "var(--font-mono)",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(16,185,129,0.4)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--border-default)")
              }
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px 28px",
                borderRadius: "10px",
                background: "var(--accent-primary)",
                color: "#080808",
                fontWeight: 600,
                fontSize: "14px",
                fontFamily: "var(--font-sans)",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap",
                opacity: loading ? 0.7 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {loading ? <LoadingSpinner size="sm" /> : <Search size={16} />}
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                style={{
                  marginTop: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "var(--status-expired-bg)",
                  border: "1px solid rgba(239,68,68,0.15)",
                }}
              >
                <AlertCircle size={16} color="var(--status-expired)" />
                <span
                  style={{
                    fontSize: "13px",
                    color: "var(--status-expired)",
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>

        {/* ---- RESULTS ---- */}
        <AnimatePresence mode="wait">
          {showResult && solvency && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {/* ---- STATUS CARD ---- */}
              <GlassCard
                className="overflow-hidden"
              >
                <div
                  style={{
                    padding: "24px",
                    borderTop: `3px solid ${
                      status === "ACTIVE"
                        ? "var(--accent-primary)"
                        : status === "EXPIRING"
                        ? "var(--status-expiring)"
                        : "var(--status-expired)"
                    }`,
                  }}
                >
                  {/* Status badge + commitment row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "12px",
                      marginBottom: "20px",
                    }}
                  >
                    <StatusBadge status={status} size="lg" />
                    <CommitmentDisplay
                      commitment={solvency.orgCommitment}
                    />
                  </div>

                  {/* 2x2 Stats Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    {/* Verified N times */}
                    <div
                      style={{
                        padding: "14px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "6px",
                        }}
                      >
                        <CheckCircle2
                          size={14}
                          color="var(--text-tertiary)"
                        />
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--text-tertiary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            fontWeight: 500,
                          }}
                        >
                          Verified
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "22px",
                          fontWeight: 700,
                          color: "var(--accent-primary)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {solvency.verificationCount}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--text-tertiary)",
                          marginLeft: "4px",
                        }}
                      >
                        times
                      </span>
                    </div>

                    {/* Proven at block */}
                    <div
                      style={{
                        padding: "14px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "6px",
                        }}
                      >
                        <Hash size={14} color="var(--text-tertiary)" />
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--text-tertiary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            fontWeight: 500,
                          }}
                        >
                          Proven At
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {formatBlock(solvency.lastProofBlock)}
                      </span>
                    </div>

                    {/* Expires at block */}
                    <div
                      style={{
                        padding: "14px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "6px",
                        }}
                      >
                        <Timer size={14} color="var(--text-tertiary)" />
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--text-tertiary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            fontWeight: 500,
                          }}
                        >
                          Expires
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color:
                            solvency.isExpired
                              ? "var(--status-expired)"
                              : "var(--text-primary)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {formatBlock(solvency.expiryBlock)}
                      </span>
                    </div>

                    {/* Threshold Level */}
                    <div
                      style={{
                        padding: "14px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "6px",
                        }}
                      >
                        <Layers size={14} color="var(--text-tertiary)" />
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--text-tertiary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            fontWeight: 500,
                          }}
                        >
                          Threshold
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        Level {solvency.thresholdLevel}
                      </span>
                    </div>
                  </div>

                  {/* Multi-wallet badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    <Wallet size={14} color="var(--text-tertiary)" />
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Multi-Wallet:
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: solvency.hasMultiWallet
                          ? "var(--accent-primary)"
                          : "var(--text-tertiary)",
                        background: solvency.hasMultiWallet
                          ? "var(--accent-primary-dim)"
                          : "var(--bg-overlay)",
                        padding: "2px 10px",
                        borderRadius: "999px",
                      }}
                    >
                      {solvency.hasMultiWallet ? "Yes" : "No"}
                    </span>
                  </div>

                  {/* Footer */}
                  <div
                    style={{
                      borderTop: "1px solid var(--border-subtle)",
                      paddingTop: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--text-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Shield size={12} color="var(--accent-primary)" />
                      Verified on Aleo Testnet
                    </span>
                    {solvency.timestamp && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--text-tertiary)",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Clock size={12} />
                        {formatTimestamp(solvency.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
              </GlassCard>

              {/* ---- AUDIT TRAIL CARD ---- */}
              <GlassCard>
                <div style={{ padding: "24px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    <History size={16} color="var(--text-secondary)" />
                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      Proof History
                    </h3>
                  </div>

                  {audit ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Total proof events
                        </span>
                        <span
                          style={{
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "var(--accent-primary)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {audit.eventCount}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Last proven
                        </span>
                        <span
                          style={{
                            fontSize: "13px",
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {audit.lastProofBlock != null
                            ? formatBlocksAgo(audit.lastProofBlock)
                            : "N/A"}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Status
                        </span>
                        <span
                          style={{
                            fontSize: "13px",
                            color: audit.isExpired
                              ? "var(--status-expired)"
                              : "var(--accent-primary)",
                            fontWeight: 500,
                          }}
                        >
                          {audit.isExpired ? "Expired" : "Active"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      Audit trail data unavailable.
                    </p>
                  )}
                </div>
              </GlassCard>

              {/* ---- COMPLIANCE REPORT CARD ---- */}
              <GlassCard>
                <div
                  style={{
                    padding: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginBottom: "4px",
                      }}
                    >
                      Download Compliance Report
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--text-tertiary)",
                        lineHeight: 1.5,
                      }}
                    >
                      Export all proof metadata as a JSON file for offline
                      review.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadReport}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-default)",
                      background: "rgba(255,255,255,0.03)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      fontWeight: 500,
                      fontFamily: "var(--font-sans)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "background 0.2s",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(255,255,255,0.06)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "rgba(255,255,255,0.03)")
                    }
                  >
                    <Download size={14} />
                    Download Report
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- EMPTY STATE (before any search) ---- */}
        <AnimatePresence>
          {!loading && !showResult && !error && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
              style={{ textAlign: "center", padding: "48px 0" }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-tertiary)",
                  lineHeight: 1.6,
                  maxWidth: "400px",
                  margin: "0 auto",
                }}
              >
                Enter a commitment address above to verify any
                organization&apos;s zero-knowledge solvency proof on-chain.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
