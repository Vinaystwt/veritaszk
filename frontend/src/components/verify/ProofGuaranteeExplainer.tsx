"use client";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, ShieldCheck } from "lucide-react";
import type { VerificationStatus } from "@/lib/aleoRpc";

interface Props {
  status: VerificationStatus;
  timestamp?: number;
}

function CheckItem({ text, mono }: { text: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
      <span style={{ color: "#00ff88", fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>✓</span>
      <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, fontFamily: mono ? "monospace" : "Space Grotesk, sans-serif" }}>
        {text}
      </span>
    </div>
  );
}

function CrossItem({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
      <span style={{ color: "rgba(255,68,68,0.8)", fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>✗</span>
      <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{text}</span>
    </div>
  );
}

export function ProofGuaranteeExplainer({ status, timestamp }: Props) {
  const [open, setOpen] = useState(false);
  const shouldReduce = useReducedMotion();

  if (status !== "SOLVENT" && status !== "REVOKED") return null;

  const formattedDate = timestamp
    ? new Date(timestamp * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "the time of generation";

  const title = status === "SOLVENT" ? "What does this proof guarantee?" : "What does revocation mean?";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      style={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)", overflow: "hidden", marginTop: "16px" }}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ width: "100%", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Space Grotesk, sans-serif" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ShieldCheck size={16} color="rgba(0,255,136,0.6)" />
          <span style={{ fontSize: "15px", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{title}</span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: shouldReduce ? 0 : 0.3 }}
        >
          <ChevronDown size={16} color="rgba(255,255,255,0.4)" />
        </motion.div>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: shouldReduce ? 0 : 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 24px 24px" }}>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>

                {status === "SOLVENT" && (
                  <>
                    <CheckItem text={`As of ${formattedDate}, this organization's total assets exceeded their total liabilities.`} />
                    <CheckItem text="Proved using Aleo's zero-knowledge proof system — no financial data was revealed to generate this proof." />
                    <CheckItem
                      text="Computed privately and verified on Aleo Testnet. The underlying amounts are mathematically hidden — not encrypted, not redacted. Hidden by the proof itself."
                      mono={false}
                    />

                    <div style={{ margin: "20px 0 16px", height: "1px", background: "rgba(255,255,255,0.06)" }} />

                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "14px", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      This proof does not reveal:
                    </p>
                    <CrossItem text="Which assets are held" />
                    <CrossItem text="Exact amounts" />
                    <CrossItem text="Wallet addresses or identities" />
                    <CrossItem text="Anything that can be reverse-engineered" />
                  </>
                )}

                {status === "REVOKED" && (
                  <>
                    <CheckItem text="This organization previously held a valid solvency proof." />
                    <CheckItem text="They chose to revoke it — most commonly before generating an updated proof with current figures." />

                    <div style={{ margin: "20px 0 16px", height: "1px", background: "rgba(255,255,255,0.06)" }} />

                    <CrossItem text="Revocation does not indicate insolvency." />
                    <CrossItem text="It does not reveal any financial data." />

                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginTop: "16px" }}>
                      A new proof can be generated at any time from the{" "}
                      <a href="/organization" style={{ color: "#00ff88", textDecoration: "none" }}>Organization Portal</a>.
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
