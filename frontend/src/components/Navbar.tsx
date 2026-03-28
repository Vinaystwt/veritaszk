"use client";

import Link from "next/link";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";

export function Navbar() {
  const { publicKey, connected } = useWallet();

  const truncate = (addr: string) =>
    addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)" }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold" style={{ color: "#00ff88" }}>Veritas</span>
          <span className="text-xl font-bold text-white">ZK</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/organization" className="text-sm text-gray-400 hover:text-white transition-colors">Organization</Link>
          <Link href="/verify" className="text-sm text-gray-400 hover:text-white transition-colors">Verify</Link>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">Dashboard</Link>
        </div>

        <div className="flex items-center gap-3">
          {connected && publicKey ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border" style={{ borderColor: "#00ff88", background: "rgba(0,255,136,0.05)" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: "#00ff88" }} />
              <span className="text-sm font-mono" style={{ color: "#00ff88" }}>{truncate(publicKey)}</span>
            </div>
          ) : (
            <WalletMultiButton style={{ background: "transparent", border: "1px solid #00ff88", color: "#00ff88", borderRadius: "8px", fontSize: "14px", padding: "8px 16px", fontFamily: "Space Grotesk, sans-serif" }} />
          )}
        </div>
      </div>
    </nav>
  );
}
