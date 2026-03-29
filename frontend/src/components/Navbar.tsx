"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { ConnectButton } from "@/components/ConnectButton";

export function Navbar() {
  const { connected } = useWallet();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "2px", textDecoration: "none" }}>
          <img src="/logo.svg" alt="VeritasZK" width={28} height={28} style={{ marginRight: "8px" }} />
          <span style={{ fontSize: "20px", fontWeight: 700, color: "#00ff88" }}>Veritas</span>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "white" }}>ZK</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {[
            { href: "/organization", label: "Organization" },
            { href: "/verify", label: "Verify" },
            { href: "/dashboard", label: "Dashboard" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: isActive(href) ? 600 : 400,
                color: isActive(href) ? "#00ff88" : "rgba(255,255,255,0.5)",
                background: isActive(href) ? "rgba(0,255,136,0.06)" : "transparent",
                border: isActive(href) ? "1px solid rgba(0,255,136,0.2)" : "1px solid transparent",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              {label}
              {label === "Organization" && connected && (
                <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#00ff88", marginLeft: "6px", verticalAlign: "middle" }} />
              )}
            </Link>
          ))}
        </div>

        <ConnectButton />
      </div>
    </nav>
  );
}
