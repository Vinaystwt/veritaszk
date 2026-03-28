"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getAllOrgs, getNetworkStats, OrgCard } from "@/lib/aleoRpc";
import { formatAddress, formatTimestamp } from "@/lib/aleoUtils";

type FilterType = "ALL" | "SOLVENT" | "REVOKED" | "UNVERIFIED";
type SortType = "RECENT" | "VERIFIED" | "ALPHA";

const STATUS_COLOR: Record<string, string> = {
  SOLVENT: "#00ff88",
  REVOKED: "#f97316",
  UNVERIFIED: "rgba(255,255,255,0.3)",
};

const TOKEN_COLORS: Record<string, string> = {
  ALEO: "#6366f1",
  USDCx: "#22c55e",
  USAD: "#eab308",
};

export default function DashboardPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<OrgCard[]>([]);
  const [stats, setStats] = useState({ orgs: 0, activeProofs: 0, totalVerifications: 0 });
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [sort, setSort] = useState<SortType>("RECENT");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [orgData, statsData] = await Promise.all([getAllOrgs(), getNetworkStats()]);
      setOrgs(orgData);
      setStats(statsData);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = orgs
    .filter((o) => filter === "ALL" || o.status === filter)
    .sort((a, b) => {
      if (sort === "RECENT") return b.timestamp - a.timestamp;
      if (sort === "VERIFIED") return b.verificationCount - a.verificationCount;
      if (sort === "ALPHA") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", padding: "40px 24px 80px" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "40px" }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "100px", border: "1px solid rgba(0,255,136,0.3)", background: "rgba(0,255,136,0.05)", color: "#00ff88", fontSize: "12px", marginBottom: "16px" }}>
            Public Dashboard
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: 700, marginBottom: "8px" }}>Verified Organizations</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px" }}>All solvency proofs verified on Aleo Testnet. Public and permissionless.</p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}
        >
          {[
            { label: "Organizations Registered", value: stats.orgs },
            { label: "Active Proofs", value: stats.activeProofs },
            { label: "Total Verifications", value: stats.totalVerifications },
          ].map((s) => (
            <div
              key={s.label}
              style={{ padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)", textAlign: "center" }}
            >
              <div style={{ fontSize: "40px", fontWeight: 700, color: "#00ff88", marginBottom: "8px" }}>{s.value}</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Filter + sort bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            {(["ALL", "SOLVENT", "REVOKED", "UNVERIFIED"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{ padding: "7px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, border: filter === f ? "1px solid rgba(0,255,136,0.4)" : "1px solid rgba(255,255,255,0.08)", background: filter === f ? "rgba(0,255,136,0.08)" : "transparent", color: filter === f ? "#00ff88" : "rgba(255,255,255,0.4)", cursor: "pointer", fontFamily: "Space Grotesk, sans-serif" }}
              >
                {f}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)", fontSize: "13px", fontFamily: "Space Grotesk, sans-serif", outline: "none", cursor: "pointer" }}
            >
              <option value="RECENT">Most Recent</option>
              <option value="VERIFIED">Most Verified</option>
              <option value="ALPHA">Alphabetical</option>
            </select>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(0,255,136,0.2)", background: "rgba(0,255,136,0.04)" }}>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00ff88" }}
              />
              <span style={{ fontSize: "12px", color: "#00ff88" }}>Live on Aleo Testnet</span>
            </div>
          </div>
        </motion.div>

        {/* Org cards grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px", color: "rgba(255,255,255,0.3)" }}>Loading organizations...</div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "80px 24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
          >
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "18px", marginBottom: "16px" }}>No organizations found.</p>
            <button
              onClick={() => router.push("/organization")}
              style={{ padding: "12px 24px", borderRadius: "10px", background: "#00ff88", color: "#0a0a0f", fontWeight: 600, fontSize: "15px", border: "none", cursor: "pointer", fontFamily: "Space Grotesk, sans-serif" }}
            >
              Be the first →
            </button>
          </motion.div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
            {filtered.map((org, i) => (
              <motion.div
                key={org.address}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  padding: "28px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(12px)",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
                whileHover={{ borderColor: "rgba(0,255,136,0.25)" }}
              >
                {/* Org name + status */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div>
                    <p style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>{org.name}</p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{formatAddress(org.address)}</p>
                  </div>
                  <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, background: `${STATUS_COLOR[org.status]}15`, color: STATUS_COLOR[org.status], border: `1px solid ${STATUS_COLOR[org.status]}30`, whiteSpace: "nowrap" }}>
                    {org.status === "SOLVENT" ? "SOLVENT ✓" : org.status}
                  </span>
                </div>

                {/* Timestamp */}
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "12px" }}>
                  {org.timestamp ? `Last proof: ${formatTimestamp(org.timestamp)}` : "No proof submitted"}
                </p>

                {/* Verification count */}
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>
                  Verified {org.verificationCount} time{org.verificationCount !== 1 ? "s" : ""}
                </p>

                {/* Token badges */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
                  {["ALEO", "USDCx", "USAD"].map((token) => (
                    <span
                      key={token}
                      style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "11px", background: `${TOKEN_COLORS[token]}15`, color: TOKEN_COLORS[token], border: `1px solid ${TOKEN_COLORS[token]}30` }}
                    >
                      {token}
                    </span>
                  ))}
                </div>

                {/* Verify button */}
                <button
                  onClick={() => router.push(`/verify?address=${org.address}`)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", color: "#00ff88", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "Space Grotesk, sans-serif" }}
                >
                  Verify →
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
