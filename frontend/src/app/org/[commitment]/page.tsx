"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Hash,
  Timer,
  Layers,
  Wallet,
  History,
  Clock,
  AlertTriangle,
  AlertCircle,
  Copy,
  Share2,
  Search,
  Link as LinkIcon,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import CommitmentDisplay from "@/components/ui/CommitmentDisplay";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import CodeBlock from "@/components/ui/CodeBlock";

// Approximate Aleo testnet block time in seconds (~25s per block)
const ALEO_BLOCK_TIME_S = 25;
const TESTNET_START_EPOCH = 1742774400; // 2025-03-24T00:00:00Z approx
const BLOCKS_PER_DAY = 3456;

function formatBlocksAgo(blockNumber: number): string {
  const now = Math.floor(Date.now() / 1000);
  const elapsedBlocks = Math.floor((now - TESTNET_START_EPOCH) / ALEO_BLOCK_TIME_S);
  const ago = elapsedBlocks - blockNumber;
  if (ago <= 0) return "just now";
  if (ago < BLOCKS_PER_DAY) return `${ago} blocks ago`;
  const days = Math.floor(ago / BLOCKS_PER_DAY);
  return `~${days} day${days > 1 ? "s" : ""} ago`;
}

function formatTimestamp(ts: number | null): string {
  if (!ts) return "N/A";
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBlock(n: number | null): string {
  return n != null ? n.toLocaleString() : "N/A";
}

function formatExpiryCountdown(expiryBlock: number | null): string {
  if (!expiryBlock) return "N/A";
  const now = Math.floor(Date.now() / 1000);
  const currentBlock = Math.floor((now - TESTNET_START_EPOCH) / ALEO_BLOCK_TIME_S);
  const remaining = expiryBlock - currentBlock;
  if (remaining <= 0) return "Expired";
  if (remaining < BLOCKS_PER_DAY) return `${remaining} blocks remaining`;
  const days = Math.floor(remaining / BLOCKS_PER_DAY);
  const hours = Math.floor(((remaining % BLOCKS_PER_DAY) * ALEO_BLOCK_TIME_S) / 3600);
  return `~${days}d ${hours}h remaining`;
}

function deriveStatus(isSolvent: boolean, expiryBlock: number | null): "ACTIVE" | "EXPIRING" | "EXPIRED" | "NO_PROOF" {
  if (!isSolvent) return "EXPIRED";
  if (expiryBlock != null) {
    const now = Math.floor(Date.now() / 1000);
    const currentBlock = Math.floor((now - TESTNET_START_EPOCH) / ALEO_BLOCK_TIME_S);
    const remaining = expiryBlock - currentBlock;
    if (remaining <= 0) return "EXPIRED";
    if (remaining < 500) return "EXPIRING";
  }
  return "ACTIVE";
}

interface SolvencyData {
  org_commitment: string;
  is_solvent: boolean;
  timestamp: number | null;
  expiry_block: number | null;
  verification_count: number;
  threshold_level: number;
  audit_event_count: number;
  last_proof_block: number | null;
  network: string;
}

interface TimelineEvent {
  type: "generated" | "verified" | "expiry";
  label: string;
  detail: string;
  color: string;
}

function buildTimeline(data: SolvencyData): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  if (data.timestamp) {
    events.push({
      type: "generated",
      label: "Proof Generated",
      detail: formatTimestamp(data.timestamp),
      color: "var(--accent-primary)",
    });
  }
  if (data.last_proof_block != null) {
    events.push({
      type: "verified",
      label: `Last Verified (Block ${data.last_proof_block.toLocaleString()})`,
      detail: formatBlocksAgo(data.last_proof_block),
      color: "#3b82f6",
    });
  }
  if (data.expiry_block != null) {
    const now = Math.floor(Date.now() / 1000);
    const currentBlock = Math.floor((now - TESTNET_START_EPOCH) / ALEO_BLOCK_TIME_S);
    const remaining = data.expiry_block - currentBlock;
    const color = remaining <= 0 ? "var(--status-expired)" : remaining < 500 ? "var(--status-expiring)" : "var(--status-expired)";
    events.push({
      type: "expiry",
      label: `Expires at Block ${data.expiry_block.toLocaleString()}`,
      detail: formatExpiryCountdown(data.expiry_block),
      color,
    });
  }
  return events;
}

function SkeletonPage() {
  return (
    <div style={{ minHeight: "100vh", padding: "100px 24px 80px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Breadcrumb skeleton */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <div style={{ width: "80px", height: "14px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", animation: "pulse 2s ease-in-out infinite" }} />
        <div style={{ width: "10px", height: "14px" }} />
        <div style={{ width: "140px", height: "14px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", animation: "pulse 2s ease-in-out infinite" }} />
      </div>
      {/* Heading skeleton */}
      <div style={{ width: "220px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", marginBottom: "24px", animation: "pulse 2s ease-in-out infinite" }} />
      {/* Hero card skeleton */}
      <div style={{ padding: "28px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <div style={{ width: "120px", height: "36px", borderRadius: "999px", background: "rgba(255,255,255,0.06)", animation: "pulse 2s ease-in-out infinite" }} />
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ padding: "14px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
                <div style={{ width: "60px", height: "11px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", marginBottom: "8px", animation: "pulse 2s ease-in-out infinite" }} />
                <div style={{ width: "40px", height: "22px", borderRadius: "4px", background: "rgba(255,255,255,0.08)", animation: "pulse 2s ease-in-out infinite" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Two column skeletons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
        {[1, 2].map((i) => (
          <div key={i} style={{ padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
            <div style={{ width: "120px", height: "18px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", marginBottom: "16px", animation: "pulse 2s ease-in-out infinite" }} />
            {[1, 2, 3].map((j) => (
              <div key={j} style={{ width: "100%", height: "16px", borderRadius: "4px", background: "rgba(255,255,255,0.04)", marginBottom: "10px", animation: "pulse 2s ease-in-out infinite" }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorState() {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <AlertCircle size={28} color="var(--status-expired)" />
      </div>
      <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>No Proof Found</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "24px", maxWidth: "400px" }}>
        We could not find any solvency proof for this commitment. It may be invalid or not yet submitted.
      </p>
      <button
        onClick={() => router.push("/verifier")}
        style={{
          padding: "12px 24px",
          borderRadius: "10px",
          background: "var(--accent-primary)",
          color: "#080808",
          fontWeight: 600,
          fontSize: "14px",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Search size={16} />
        Verify a different organization
      </button>
    </motion.div>
  );
}

export default function OrgProfilePage() {
  const params = useParams() as { commitment: string };
  const router = useRouter();
  const commitment = params.commitment;

  const [data, setData] = useState<SolvencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!commitment) return;
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/verify/${commitment}`);
        if (!res.ok) {
          if (!cancelled) setError(true);
          return;
        }
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [commitment]);

  if (loading) return <SkeletonPage />;
  if (error || !data) return <ErrorState />;

  const status = deriveStatus(data.is_solvent, data.expiry_block);
  const timeline = buildTimeline(data);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://veritaszk.vercel.app";
  const pageUrl = `${baseUrl}/org/${commitment}`;
  const embedScript = `<script data-commitment="${commitment}" src="https://veritaszk.vercel.app/badge.js" async defer></script>`;

  return (
    <div style={{ minHeight: "100vh", padding: "100px 24px 80px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* ---- BREADCRUMB ---- */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", fontSize: "13px" }}
      >
        <button
          onClick={() => router.push("/dashboard")}
          style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", padding: 0, fontSize: "13px", fontFamily: "var(--font-sans)" }}
        >
          Dashboard
        </button>
        <ChevronRight size={14} color="var(--text-tertiary)" />
        <span style={{ color: "var(--text-secondary)" }}>Organization Profile</span>
      </motion.nav>

      {/* ---- HEADING ---- */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{ marginBottom: "24px" }}
      >
        <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 700, marginBottom: "8px" }}>
          Organization Profile
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <CommitmentDisplay commitment={commitment} showFull />
          <a
            href={`https://testnet.explorer.provable.com/transaction/${commitment}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              color: "var(--accent-primary)",
              textDecoration: "none",
            }}
          >
            <ExternalLink size={12} />
            Aleo Explorer
          </a>
        </div>
      </motion.div>

      {/* ---- HERO STATUS CARD ---- */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard>
          <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              {/* Left: StatusBadge + label */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: "160px" }}>
                <StatusBadge status={status} size="lg" />
                <span style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Shield size={14} color="var(--accent-primary)" />
                  Proof status on Aleo Testnet
                </span>
              </div>

              {/* Right: 2x2 stats grid */}
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
                {/* Verified N times */}
                <div style={{ padding: "14px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <CheckCircle2 size={14} color="var(--text-tertiary)" />
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>Verified</span>
                  </div>
                  <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--accent-primary)", fontFamily: "var(--font-mono)" }}>
                    {data.verification_count}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--text-tertiary)", marginLeft: "4px" }}>times</span>
                </div>

                {/* Proven at block */}
                <div style={{ padding: "14px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <Hash size={14} color="var(--text-tertiary)" />
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>Proven At</span>
                  </div>
                  <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                    {formatBlock(data.last_proof_block)}
                  </span>
                </div>

                {/* Expires at block */}
                <div style={{ padding: "14px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <Timer size={14} color="var(--text-tertiary)" />
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>Expires At</span>
                  </div>
                  <span style={{
                    fontSize: "16px", fontWeight: 600,
                    color: !data.is_solvent ? "var(--status-expired)" : "var(--text-primary)",
                    fontFamily: "var(--font-mono)",
                  }}>
                    {formatBlock(data.expiry_block)}
                  </span>
                </div>

                {/* Threshold Level */}
                <div style={{ padding: "14px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <Layers size={14} color="var(--text-tertiary)" />
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>Threshold</span>
                  </div>
                  <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                    Level {data.threshold_level}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ---- TWO COLUMN LAYOUT ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px", marginTop: "24px" }}>
        {/* ---- LEFT COLUMN ---- */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* PROOF TIMELINE CARD */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <GlassCard>
              <div style={{ padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <History size={16} color="var(--text-secondary)" />
                    <h3 style={{ fontSize: "15px", fontWeight: 600 }}>Proof Timeline</h3>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                    {data.audit_event_count} total proof event{data.audit_event_count !== 1 ? "s" : ""}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {timeline.map((event, i) => (
                    <div key={i} style={{ display: "flex", gap: "16px", position: "relative" }}>
                      {/* Timeline line */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "20px", flexShrink: 0 }}>
                        {/* Dot */}
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: event.color,
                            flexShrink: 0,
                            zIndex: 1,
                          }}
                        />
                        {/* Vertical line */}
                        {i < timeline.length - 1 && (
                          <div style={{ width: "2px", flex: 1, background: "rgba(255,255,255,0.06)", marginTop: "4px" }} />
                        )}
                      </div>
                      {/* Content */}
                      <div style={{ paddingBottom: "20px", paddingTop: "2px" }}>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>
                          {event.label}
                        </p>
                        <p style={{ fontSize: "13px", color: event.color, fontFamily: "var(--font-mono)" }}>
                          {event.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {timeline.length === 0 && (
                  <div style={{ textAlign: "center", padding: "32px", color: "var(--text-tertiary)", fontSize: "14px" }}>
                    No proof events recorded.
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* PROOF DETAIL CARD */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard>
              <div style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Shield size={16} color="var(--accent-primary)" />
                  Proof Details
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Multi-wallet */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Wallet size={16} color="var(--text-tertiary)" />
                      <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Multi-Wallet</span>
                    </div>
                    <span style={{
                      fontSize: "13px", fontWeight: 600, padding: "2px 10px", borderRadius: "999px",
                    }}>
                      {/* We don&apos;t have hasMultiWallet from API, default to No */}
                      <span style={{ color: "var(--text-tertiary)", background: "var(--bg-overlay)" }}>No</span>
                    </span>
                  </div>

                  {/* Registered */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <CheckCircle2 size={16} color="var(--text-tertiary)" />
                      <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Registered</span>
                    </div>
                    <span style={{
                      fontSize: "13px", fontWeight: 600, padding: "2px 10px", borderRadius: "999px",
                      color: data.is_solvent ? "var(--accent-primary)" : "var(--status-expired)",
                      background: data.is_solvent ? "var(--accent-primary-dim)" : "var(--status-expired-bg)",
                    }}>
                      {data.is_solvent ? "Yes" : "No"}
                    </span>
                  </div>

                  {/* Threshold description */}
                  <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Threshold Level</span>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Level {data.threshold_level} — {data.threshold_level >= 3 ? "High assurance" : data.threshold_level >= 2 ? "Standard assurance" : "Basic proof"}
                    </span>
                  </div>

                  {/* Proof expiry countdown */}
                  <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <Timer size={14} color="var(--text-tertiary)" />
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Proof Expiry Countdown</span>
                    </div>
                    <span style={{
                      fontSize: "15px", fontWeight: 600, fontFamily: "var(--font-mono)",
                      color: !data.is_solvent ? "var(--status-expired)" : "var(--accent-primary)",
                    }}>
                      {formatExpiryCountdown(data.expiry_block)}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* ---- RIGHT COLUMN ---- */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* EMBED BADGE CARD */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard>
              <div style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <LinkIcon size={16} color="var(--accent-primary)" />
                  Embed Badge
                </h3>

                {/* Live badge preview */}
                <div style={{ padding: "20px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border-default)", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <StatusBadge status={status} size="lg" />
                </div>

                <CodeBlock code={embedScript} language="html" />
              </div>
            </GlassCard>
          </motion.div>

          {/* SHARE CARD */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <GlassCard>
              <div style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Share2 size={16} color="var(--accent-primary)" />
                  Share &amp; Verify
                </h3>

                {/* Full URL */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 14px", borderRadius: "8px",
                  background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)",
                  marginBottom: "16px",
                }}>
                  <span style={{ flex: 1, fontSize: "13px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {pageUrl}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(pageUrl)}
                    style={{
                      padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 500,
                      background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-default)",
                      color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    <Copy size={12} />
                    Copy Link
                  </button>
                </div>

                {/* Verify This Org button */}
                <button
                  onClick={() => router.push(`/verifier?commitment=${commitment}`)}
                  style={{
                    width: "100%",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    background: "var(--accent-primary)",
                    color: "#080808",
                    fontWeight: 600,
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <Search size={16} />
                  Verify This Organization
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
