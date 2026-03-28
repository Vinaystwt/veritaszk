"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/context/WalletContext";

export function WalletModal({ onClose }: { onClose: () => void }) {
  const { connectWithPuzzle, connectWithLeo, puzzleAvailable, leoAvailable, connecting } = useWallet();

  const handlePuzzle = async () => {
    await connectWithPuzzle();
    onClose();
  };

  const handleLeo = async () => {
    await connectWithLeo();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ background: "#0a0a0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "360px", margin: "0 16px" }}
      >
        <h2 style={{ color: "white", fontWeight: 600, fontSize: "18px", marginBottom: "8px" }}>Connect Wallet</h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "24px" }}>Choose your Aleo wallet to continue</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={handlePuzzle}
            disabled={connecting}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "16px", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", cursor: "pointer", transition: "all 0.2s", fontFamily: "Space Grotesk, sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,255,136,0.4)"; e.currentTarget.style.background = "rgba(0,255,136,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(168,85,247,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>🧩</div>
            <div style={{ textAlign: "left", flex: 1 }}>
              <div style={{ color: "white", fontWeight: 500, fontSize: "15px" }}>Puzzle Wallet</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginTop: "2px" }}>
                {puzzleAvailable ? "Ready to connect" : "Not detected — install extension"}
              </div>
            </div>
            {puzzleAvailable && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00ff88", flexShrink: 0 }} />}
          </button>

          <button
            onClick={handleLeo}
            disabled={connecting}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "16px", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", cursor: "pointer", transition: "all 0.2s", fontFamily: "Space Grotesk, sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,255,136,0.4)"; e.currentTarget.style.background = "rgba(0,255,136,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>🦁</div>
            <div style={{ textAlign: "left", flex: 1 }}>
              <div style={{ color: "white", fontWeight: 500, fontSize: "15px" }}>Leo Wallet</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginTop: "2px" }}>
                {leoAvailable ? "Ready to connect" : "Not detected — install extension"}
              </div>
            </div>
            {leoAvailable && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00ff88", flexShrink: 0 }} />}
          </button>
        </div>

        {connecting && (
          <p style={{ textAlign: "center", color: "#00ff88", fontSize: "14px", marginTop: "20px" }}>
            Connecting...
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
