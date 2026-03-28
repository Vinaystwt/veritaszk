"use client";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useWallet } from "@/context/WalletContext";
import { WalletModal } from "@/components/WalletModal";

export function ConnectButton() {
  const { wallet, disconnect } = useWallet();
  const [showModal, setShowModal] = useState(false);

  if (wallet) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00ff88" }} />
        <span style={{ color: "#00ff88", fontSize: "13px", fontFamily: "monospace" }}>
          {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
        </span>
        <button
          onClick={disconnect}
          style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", background: "none", border: "none", cursor: "pointer", fontFamily: "Space Grotesk, sans-serif", marginLeft: "4px" }}
        >
          disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(0,255,136,0.4)", color: "#00ff88", fontSize: "14px", background: "transparent", cursor: "pointer", fontFamily: "Space Grotesk, sans-serif", transition: "all 0.2s" }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,255,136,0.08)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        Connect Wallet
      </button>
      <AnimatePresence>
        {showModal && <WalletModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  );
}
