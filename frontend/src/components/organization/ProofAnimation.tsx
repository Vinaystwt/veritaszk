"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, ExternalLink } from "lucide-react";

interface Props {
  isOpen: boolean;
  onComplete: (proofNonce: string, timestamp: string) => void;
  walletAddress: string;
}

const PHASES = [
  { text: "Preparing private records...", duration: 1500 },
  { text: "Computing zero-knowledge proof...", duration: 2500 },
  { text: "Submitting to Aleo Testnet...", duration: 1500 },
  { text: "Confirming on-chain...", duration: 1500 },
];

export function ProofAnimation({ isOpen, onComplete, walletAddress }: Props) {
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);
  const [proofNonce] = useState(() => `${Math.floor(Math.random() * 10 ** 15)}field`);
  const [timestamp] = useState(() => new Date().toLocaleString());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPhase(0);
      setDone(false);
      return;
    }
    let current = 0;
    const next = () => {
      if (current >= PHASES.length - 1) {
        setTimeout(() => setDone(true), 500);
        return;
      }
      current++;
      setPhase(current);
      setTimeout(next, PHASES[current].duration);
    };
    setTimeout(next, PHASES[0].duration);
  }, [isOpen]);

  const handleComplete = useCallback(() => {
    onComplete(proofNonce, timestamp);
  }, [onComplete, proofNonce, timestamp]);

  useEffect(() => {
    if (done) handleComplete();
  }, [done, handleComplete]);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify?address=${walletAddress}`
    : "";

  const copyShare = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openExplorer = () => {
    window.open(`https://explorer.aleo.org/testnet/address/${walletAddress}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "rgba(10,10,15,0.97)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "24px",
          textAlign: "center",
        }}
      >
        {!done ? (
          <>
            <div style={{ position: "relative", width: "160px", height: "160px", marginBottom: "48px" }}>
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.4 * i, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "1px solid rgba(0,255,136,0.3)",
                  }}
                />
              ))}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  position: "absolute",
                  inset: "30px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(0,255,136,0.3) 0%, rgba(0,255,136,0.05) 100%)",
                  boxShadow: "0 0 40px rgba(0,255,136,0.3)",
                }}
              />
            </div>

            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: "20px", color: "rgba(255,255,255,0.8)", marginBottom: "24px" }}
            >
              {PHASES[phase].text}
            </motion.p>

            <div style={{ display: "flex", gap: "8px" }}>
              {PHASES.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: i <= phase ? "#00ff88" : "rgba(255,255,255,0.15)",
                    transition: "background 0.3s",
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            style={{ maxWidth: "480px", width: "100%" }}
          >
            <motion.div
              animate={{
                textShadow: [
                  "0 0 20px rgba(0,255,136,0.5)",
                  "0 0 60px rgba(0,255,136,0.8)",
                  "0 0 20px rgba(0,255,136,0.5)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                fontSize: "72px",
                fontWeight: 800,
                color: "#00ff88",
                marginBottom: "16px",
                letterSpacing: "-0.02em",
              }}
            >
              SOLVENT ✓
            </motion.div>

            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "8px" }}>
              {timestamp}
            </p>

            <div style={{ padding: "12px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "24px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace", wordBreak: "break-all" }}>
                Proof nonce: {proofNonce.slice(0, 32)}...
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
              <button
                onClick={copyShare}
                style={{ padding: "14px", borderRadius: "10px", background: "#00ff88", color: "#0a0a0f", fontWeight: 600, fontSize: "15px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "Space Grotesk, sans-serif" }}
              >
                <Copy size={16} />
                {copied ? "Copied!" : "Share Your Verified Status"}
              </button>

              <button
                onClick={openExplorer}
                style={{ padding: "14px", borderRadius: "10px", background: "transparent", color: "rgba(255,255,255,0.5)", fontWeight: 500, fontSize: "14px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "Space Grotesk, sans-serif" }}
              >
                <ExternalLink size={14} />
                View on Aleo Explorer
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
