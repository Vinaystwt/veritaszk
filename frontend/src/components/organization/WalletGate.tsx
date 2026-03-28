"use client";
import { useWallet } from "@/context/WalletContext";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { ConnectButton } from "@/components/ConnectButton";

export function WalletGate({ children }: { children: React.ReactNode }) {
  const { wallet } = useWallet();

  if (wallet) return <>{children}</>;

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", maxWidth: "480px" }}
      >
        <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px" }}>
          <Shield size={36} color="#00ff88" />
        </div>
        <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "12px" }}>Connect Your Wallet</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "32px", lineHeight: 1.7 }}>
          Connect your wallet to access the Organization Portal and generate your ZK solvency proof.
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ConnectButton />
        </div>
      </motion.div>
    </div>
  );
}
