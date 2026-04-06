"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ArrowRight,
  Zap,
  Search,
  Vault,
  Clock,
  Hash,
  Layers,
  TrendingUp,
  Activity,
  Building2,
} from "lucide-react";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import CommitmentDisplay from "@/components/ui/CommitmentDisplay";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import StatsCounter from "@/components/ui/StatsCounter";

// ─── Constants ───────────────────────────────────────────────────────

const EXPLORER = "https://api.explorer.provable.com/v1/testnet";
const REGISTRY = "veritaszk_registry.aleo";
const CORE = "veritaszk_core.aleo";
const AUDIT = "veritaszk_audit.aleo";
const ALEO_BLOCK_TIME_S = 25;
const TESTNET_START = 1742774400; // 2025-03-24T00:00:00Z approx
const REFRESH_INTERVAL_MS = 30_000;
const EXPIRING_THRESHOLD_BLOCKS = 500;

type OrgStatus = "ACTIVE" | "EXPIRING" | "EXPIRED" | "NO_PROOF";
type SortKey = "recent" | "verified" | "expiry";
type FilterKey = "all" | "active" | "expiring" | "expired" | "no_proof";

interface OrgRecord {
  commitment: string;
  status: OrgStatus;
  isSolvent: boolean;
  lastProofBlock: number | null;
  expiryBlock: number | null;
  verificationCount: number;
  thresholdLevel: number;
  hasMultiWallet: boolean;
  timestamp: number | null;
}

interface GlobalStats {
  totalProofs: number;
  totalVerifications: number;
  totalOrganizations: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function getCurrentBlock(): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.floor((now - TESTNET_START) / ALEO_BLOCK_TIME_S);
}

function parseU32(val: any): number | null {
  if (val === null || val === undefined) return null;
  const n = Number(String(val).replace("u32", "").trim());
  return Number.isFinite(n) ? n : null;
}

function parseU8(val: any): number {
  if (val === null || val === undefined) return 0;
  const n = Number(String(val).replace("u8", "").trim());
  return Number.isFinite(n) ? n : 0;
}

function computeStatus(
  isSolvent: boolean,
  expiryBlock: number | null,
  currentBlock: number
): OrgStatus {
  if (!isSolvent) return "EXPIRED";
  if (expiryBlock === null || expiryBlock === 0) return "NO_PROOF";
  const remaining = expiryBlock - currentBlock;
  if (remaining <= 0) return "EXPIRED";
  if (remaining < EXPIRING_THRESHOLD_BLOCKS) return "EXPIRING";
  return "ACTIVE";
}

function formatBlocksRemaining(expiryBlock: number | null): string {
  if (expiryBlock === null || expiryBlock === 0) return "N/A";
  const current = getCurrentBlock();
  const remaining = expiryBlock - current;
  if (remaining <= 0) return "Expired";
  if (remaining < 3456) return `${remaining} blocks`;
  const days = Math.floor(remaining / 3456);
  return `~${days}d`;
}

function formatTimestamp(ts: number | null): string {
  if (!ts) return "N/A";
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function fetchMapping(program: string, mapping: string): Promise<Record<string, any>> {
  const res = await fetch(`${EXPLORER}/program/${program}/mapping/${mapping}`);
  if (!res.ok) return {};
  try {
    const text = await res.text();
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

// ─── Data Fetching ───────────────────────────────────────────────────

async function loadOrgs(): Promise<OrgRecord[]> {
  const [registry, proofs, expiries, counts, thresholds, multiWallets, timestamps] =
    await Promise.all([
      fetchMapping(REGISTRY, "org_registry"),
      fetchMapping(CORE, "solvency_proofs"),
      fetchMapping(CORE, "proof_expiry"),
      fetchMapping(CORE, "verification_counts"),
      fetchMapping(CORE, "threshold_proofs"),
      fetchMapping(CORE, "multi_wallet_commitments"),
      fetchMapping(CORE, "proof_timestamps"),
    ]);

  const commitments = new Set<string>(Object.keys(registry));
  Object.keys(proofs).forEach((k) => commitments.add(k));
  Object.keys(expiries).forEach((k) => commitments.add(k));
  Object.keys(counts).forEach((k) => commitments.add(k));

  const currentBlock = getCurrentBlock();

  return Array.from(commitments).map((commitment) => {
    const solventVal = proofs[commitment];
    const isSolvent = solventVal === true || solventVal === "true";

    const expiryBlock = parseU32(expiries[commitment]);
    const ts = parseU32(timestamps[commitment]);
    const verificationCount = parseU32(counts[commitment]) ?? 0;
    const thresholdLevel = parseU8(thresholds[commitment]);
    const hasMultiWallet = multiWallets[commitment] !== undefined && multiWallets[commitment] !== null;
    const lastProofBlock = ts;

    const status = isSolvent
      ? computeStatus(isSolvent, expiryBlock, currentBlock)
      : Object.prototype.hasOwnProperty.call(registry, commitment)
        ? computeStatus(isSolvent, expiryBlock, currentBlock)
        : "NO_PROOF";

    return {
      commitment,
      status,
      isSolvent,
      lastProofBlock,
      expiryBlock,
      verificationCount,
      thresholdLevel,
      hasMultiWallet,
      timestamp: ts,
    };
  });
}

async function loadGlobalStats(orgs: OrgRecord[]): Promise<GlobalStats> {
  const [verMap] = await Promise.all([
    fetchMapping(CORE, "verification_counts"),
  ]);

  let totalVerifications = 0;
  for (const v of Object.values(verMap)) {
    const n = parseU32(v);
    if (n !== null) totalVerifications += n;
  }

  const totalProofs = orgs.filter((o) => o.isSolvent).length;

  return {
    totalProofs,
    totalVerifications,
    totalOrganizations: orgs.length,
  };
}

// ─── Org Card Component ──────────────────────────────────────────────

function OrgCard({ org, index }: { org: OrgRecord; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <GlassCard className="overflow-hidden h-full flex flex-col">
        <div style={{ borderTop: `3px solid ${
          org.status === "ACTIVE"
            ? "var(--accent-primary)"
            : org.status === "EXPIRING"
              ? "var(--status-expiring)"
              : "var(--status-expired)"
        }` }}>
          <div className="p-5 flex flex-col flex-1">
            {/* Top row: Status + verification badge */}
            <div className="flex items-center justify-between mb-4">
              <StatusBadge status={org.status} size="sm" />
              {org.verificationCount > 0 && (
                <span
                  className="inline-flex items-center gap-1 rounded-full text-xs font-medium px-2.5 py-0.5"
                  style={{
                    background: "var(--accent-primary-dim)",
                    color: "var(--accent-primary)",
                  }}
                >
                  <Shield size={10} />
                  {org.verificationCount}
                </span>
              )}
            </div>

            {/* Commitment */}
            <div className="mb-4">
              <CommitmentDisplay commitment={org.commitment} showFull={false} />
            </div>

            {/* Stats row */}
            <div
              className="flex items-center gap-3 text-xs flex-wrap mb-4"
              style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}
            >
              <span className="inline-flex items-center gap-1">
                <Hash size={11} />
                Block {org.lastProofBlock != null ? org.lastProofBlock.toLocaleString() : "N/A"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={11} />
                {formatBlocksRemaining(org.expiryBlock)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Layers size={11} />
                L{org.thresholdLevel}
              </span>
            </div>

            {/* Multi-wallet badge */}
            {org.hasMultiWallet && (
              <div className="mb-3">
                <span
                  className="inline-flex items-center gap-1 rounded-full text-xs px-2.5 py-0.5"
                  style={{
                    background: "rgba(59,130,246,0.10)",
                    color: "#60a5fa",
                  }}
                >
                  Multi-wallet
                </span>
              </div>
            )}

            {/* Spacer + link */}
            <div className="mt-auto pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <Link
                href={`/org/${org.commitment}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: "var(--accent-primary)" }}
              >
                View Profile
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "expiring", label: "Expiring" },
  { key: "expired", label: "Expired" },
  { key: "no_proof", label: "No Proof" },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Most Recent" },
  { key: "verified", label: "Most Verified" },
  { key: "expiry", label: "Expiry Soonest" },
];

export default function PublicDashboardPage() {
  const [orgs, setOrgs] = useState<OrgRecord[]>([]);
  const [stats, setStats] = useState<GlobalStats>({ totalProofs: 0, totalVerifications: 0, totalOrganizations: 0 });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("recent");

  const fetchData = useCallback(async () => {
    const loaded = await loadOrgs();
    setOrgs(loaded);
    const s = await loadGlobalStats(loaded);
    setStats(s);
    setLastRefresh(new Date());
    if (loading) setLoading(false);
  }, [loading]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Count badges for filter
  const filterCounts = useMemo(() => {
    const counts: Record<FilterKey, number> = {
      all: orgs.length,
      active: 0,
      expiring: 0,
      expired: 0,
      no_proof: 0,
    };
    for (const o of orgs) {
      if (o.status === "ACTIVE") counts.active++;
      else if (o.status === "EXPIRING") counts.expiring++;
      else if (o.status === "EXPIRED") counts.expired++;
      else if (o.status === "NO_PROOF") counts.no_proof++;
    }
    return counts;
  }, [orgs]);

  // Filter + sort
  const displayed = useMemo(() => {
    let list = orgs;
    if (filter !== "all") {
      const statusMap: Record<FilterKey, OrgStatus | null> = {
        all: null,
        active: "ACTIVE",
        expiring: "EXPIRING",
        expired: "EXPIRED",
        no_proof: "NO_PROOF",
      };
      const target = statusMap[filter];
      if (target) list = list.filter((o) => o.status === target);
    }

    const currentBlock = getCurrentBlock();
    return [...list].sort((a, b) => {
      if (sort === "recent") {
        return (b.lastProofBlock ?? 0) - (a.lastProofBlock ?? 0);
      }
      if (sort === "verified") {
        return b.verificationCount - a.verificationCount;
      }
      // expiry soonest
      const aRem = a.expiryBlock != null ? a.expiryBlock - currentBlock : Infinity;
      const bRem = b.expiryBlock != null ? b.expiryBlock - currentBlock : Infinity;
      return aRem - bRem;
    });
  }, [orgs, filter, sort]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", position: "relative" }}>
      {/* Background dot grid */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto py-10">
        {/* ─── HEADER ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Public Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              All verified organizations on Aleo testnet
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full pulse-dot flex-shrink-0"
              style={{ backgroundColor: "var(--accent-primary)" }}
            />
            <span className="text-xs font-medium" style={{ color: "var(--accent-primary)" }}>
              Live — updates every 30s
            </span>
          </div>
        </div>

        {lastRefresh && (
          <p className="text-xs mb-6" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </p>
        )}

        {/* ─── LOADING STATE ───────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Fetching on-chain data from Aleo testnet...
            </p>
          </div>
        ) : (
          <>
            {/* ─── STATS BAR ─────────────────────────────────────── */}
            <GlassCard className="mb-8">
              <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
                {[
                  { value: stats.totalProofs, label: "Total Proofs", icon: <Shield size={16} /> },
                  { value: stats.totalVerifications, label: "Total Verifications", icon: <Activity size={16} /> },
                  { value: stats.totalOrganizations, label: "Total Organizations", icon: <Building2 size={16} /> },
                ].map((stat) => (
                  <div key={stat.label} className="px-4 sm:px-6 py-5 flex items-center gap-3">
                    <span style={{ color: "var(--accent-primary)" }}>{stat.icon}</span>
                    <StatsCounter value={stat.value} label={stat.label} isLive />
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* ─── FILTER BAR ────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              {/* Pill filters */}
              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all"
                    style={{
                      background: filter === key ? "var(--accent-primary)" : "rgba(255,255,255,0.04)",
                      color: filter === key ? "#080808" : "var(--text-secondary)",
                      border: `1px solid ${filter === key ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                    }}
                  >
                    {label}
                    <span
                      className="text-xs tabular-nums"
                      style={{
                        opacity: filter === key ? 0.7 : 0.5,
                      }}
                    >
                      {filterCounts[key]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sort controls */}
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Sort:
                </span>
                <div className="flex gap-1">
                  {SORT_OPTIONS.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setSort(key)}
                      className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                      style={{
                        background: sort === key ? "rgba(16,185,129,0.10)" : "transparent",
                        color: sort === key ? "var(--accent-primary)" : "var(--text-tertiary)",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── ORG GRID ──────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {displayed.length === 0 ? (
                /* Empty state */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard>
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                      <svg width="32" height="32" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="1.5"
                        className="text-gray-500 mx-auto mb-4">
                        <rect x="3" y="11" width="18" height="11"
                          rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <h3 className="text-lg font-semibold mb-2">
                        No organizations found
                      </h3>
                      <p className="text-sm max-w-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                        {filter !== "all"
                          ? `There are no organizations with "${FILTER_OPTIONS.find((f) => f.key === filter)?.label.toLowerCase()}" status. Try a different filter or be the first to prove solvency.`
                          : "No organizations have been registered yet. Be the first to prove solvency on Aleo."}
                      </p>
                      <Link
                        href="/organization"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
                        style={{
                          background: "var(--accent-primary)",
                          color: "#080808",
                        }}
                      >
                        <Shield size={14} />
                        Prove Solvency
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </GlassCard>
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.04 },
                    },
                  }}
                >
                  {displayed.map((org, i) => (
                    <OrgCard key={org.commitment} org={org} index={i} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── FOOTER INFO ───────────────────────────────────── */}
            {!loading && orgs.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <TrendingUp size={12} style={{ color: "var(--accent-primary)" }} />
                    {displayed.length} of {orgs.length} organizations
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Zap size={12} style={{ color: "var(--accent-primary)" }} />
                    Auto-refreshes every 30s
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href={`${EXPLORER}/program/${REGISTRY}/mapping/org_registry`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    Explorer
                  </a>
                  <Link href="/organization" className="transition-colors" style={{ color: "var(--accent-primary)" }}>
                    Prove Solvency →
                  </Link>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
