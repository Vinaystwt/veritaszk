"use client";
import { useWallet } from "@/context/WalletContext";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { ConnectButton } from "@/components/ConnectButton";

function WalletGateInner({ children }: { children: React.ReactNode }) {
  const { connected } = useWallet();
  const searchParams = useSearchParams();
  const demoMode = searchParams.get("demo") === "true";

  if (connected || demoMode) return <>{children}</>;

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
          Connect your Aleo wallet to generate a ZK solvency proof on Testnet.
        </p>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <ConnectButton />
          <a href="/organization?demo=true" style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: "2px" }}>
            Try demo mode (no wallet needed) →
          </a>
        </div>
      </motion.div>
    </div>
  );
}

export function WalletGate({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
      <WalletGateInner>{children}</WalletGateInner>
    </Suspense>
  );
}
