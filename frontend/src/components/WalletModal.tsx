"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/context/WalletContext";

const WALLETS = [
  { name: "Leo Wallet", key: "Leo Wallet", emoji: "🦁", color: "rgba(59,130,246,0.15)" },
  { name: "Puzzle Wallet", key: "Puzzle Wallet", emoji: "🧩", color: "rgba(168,85,247,0.15)" },
];

export function WalletModal({ onClose }: { onClose: () => void }) {
  const { select, connect, connecting } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleConnect = async (walletKey: string) => {
    try {
      select(walletKey);
      await connect();
      onClose();
    } catch (err) {
      console.error("Connection failed:", err);
    }
  };

  if (!mounted) return null;

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        style={{ background: "#0d0d12", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "360px", margin: "0 16px", boxShadow: "0 24px 80px rgba(0,0,0,0.6)", position: "relative" }}
      >
        <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "20px" }}>×</button>

        <h2 style={{ color: "white", fontWeight: 600, fontSize: "18px", marginBottom: "8px", fontFamily: "Space Grotesk, sans-serif" }}>Connect Wallet</h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "24px", fontFamily: "Space Grotesk, sans-serif" }}>Choose your Aleo wallet</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {WALLETS.map(wallet => (
            <button
              key={wallet.key}
              onClick={() => handleConnect(wallet.key)}
              disabled={connecting}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "16px", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", cursor: connecting ? "not-allowed" : "pointer", fontFamily: "Space Grotesk, sans-serif", transition: "all 0.15s", opacity: connecting ? 0.6 : 1 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,255,136,0.4)"; e.currentTarget.style.background = "rgba(0,255,136,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
            >
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: wallet.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{wallet.emoji}</div>
              <div style={{ textAlign: "left", flex: 1 }}>
                <div style={{ color: "white", fontWeight: 500, fontSize: "15px" }}>{wallet.name}</div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginTop: "3px" }}>Click to connect</div>
              </div>
            </button>
          ))}
        </div>

        {connecting && (
          <p style={{ textAlign: "center", color: "#00ff88", fontSize: "14px", marginTop: "16px", fontFamily: "Space Grotesk, sans-serif" }}>
            Connecting...
          </p>
        )}
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}
