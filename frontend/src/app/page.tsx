"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Shield, Lock, Cpu, CheckCircle, ArrowRight, Terminal, Bot, Package } from "lucide-react";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import StatsCounter from "@/components/ui/StatsCounter";
import CommitmentDisplay from "@/components/ui/CommitmentDisplay";
import GlassCard from "@/components/ui/GlassCard";

const EXPLORER = "https://api.explorer.provable.com/v1/testnet";
const CORE = "veritaszk_core.aleo";

async function q(program: string, mapping: string, key: string) {
  const res = await fetch(`${EXPLORER}/program/${program}/mapping/${mapping}/${key}`);
  if (!res.ok) return null;
  try { return await res.json(); } catch { return null; }
}

const cards = [
  {
    icon: <Shield size={28} />,
    title: "The Problem",
    body: "After FTX collapsed, crypto realized it had no way to verify solvency without full public disclosure. Existing Proof of Reserves solutions expose wallet addresses, balances, and treasury strategy.",
  },
  {
    icon: <Lock size={28} />,
    title: "The Solution",
    body: "VeritasZK generates a cryptographic proof that assets exceed liabilities — without revealing which assets, exact amounts, or any wallet addresses. The output is a single boolean: solvent or not.",
  },
  {
    icon: <Cpu size={28} />,
    title: "Why Aleo",
    body: "Only Aleo combines private records with public verifiability. Asset data lives in encrypted on-chain records. The proof result is public. The underlying data is mathematically hidden. Forever.",
  },
];

const steps = [
  { icon: <Lock size={24} />, title: "Declare Privately", body: "Assets and liabilities are declared into private on-chain records. No amounts leave your wallet." },
  { icon: <Cpu size={24} />, title: "Compute Off-Chain", body: "The ZK proof is computed locally. The solvency assertion is verified cryptographically before submission." },
  { icon: <Shield size={24} />, title: "Verify Publicly", body: "Anyone can verify the proof result. No wallet needed. No data revealed. Ever." },
];

export default function Home() {
  const shouldReduce = useReducedMotion();
  const [stats, setStats] = useState({ orgs: 0, proofs: 0, verifications: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      // Query org registry for count of registered organizations
      const regRes = await fetch(`${EXPLORER}/program/veritaszk_registry.aleo/mapping/org_registry`);
      let orgCount = 0;
      let proofCount = 0;
      if (regRes.ok) {
        try {
          const data = await regRes.json();
          if (data && typeof data === "object") {
            orgCount = Object.values(data).filter(v => v === true || v === "true").length;
          }
        } catch {}
      }

      // Query solvency proofs for active proofs
      const solvRes = await fetch(`${EXPLORER}/program/${CORE}/mapping/solvency_proofs`);
      if (solvRes.ok) {
        try {
          const data = await solvRes.json();
          if (data && typeof data === "object") {
            proofCount = Object.values(data).filter(v => v === true || v === "true").length;
          }
        } catch {}
      }

      // Total verification count
      const verRes = await fetch(`${EXPLORER}/program/${CORE}/mapping/verification_counts`);
      let totalVer = 0;
      if (verRes.ok) {
        try {
          const data = await verRes.json();
          if (data && typeof data === "object") {
            totalVer = Object.values(data).reduce((sum: number, v: any) => {
              return sum + (Number(String(v).replace("u32", "")) || 0);
            }, 0);
          }
        } catch {}
      }

      setStats({ orgs: orgCount, proofs: proofCount, verifications: totalVer });
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.6 },
    }),
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", position: "relative", overflow: "hidden" }}>

      {/* Dot grid background */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none", zIndex: 0 }} />

      {/* Drifting orbs */}
      {!shouldReduce && (
        <>
          <motion.div
            animate={{ x: [0, 60, -40, 0], y: [0, -40, 60, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "fixed", top: "10%", left: "20%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }}
          />
          <motion.div
            animate={{ x: [0, -50, 30, 0], y: [0, 50, -30, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
            style={{ position: "fixed", top: "30%", right: "15%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }}
          />
        </>
      )}

      {/* ─── HERO ────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, minHeight: "85vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 60px", textAlign: "center" }}>

        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} style={{ marginBottom: "20px" }}>
          <span style={{ display: "inline-block", padding: "6px 16px", borderRadius: "100px", border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.06)", color: "var(--accent-primary)", fontSize: "13px", fontWeight: 500, letterSpacing: "0.05em", fontFamily: "var(--font-mono)" }}>
            Zero-Knowledge · Aleo Testnet · Three-Program Protocol
          </span>
        </motion.div>

        <motion.h1 initial="hidden" animate="visible" custom={1} variants={fadeUp} style={{ fontSize: "clamp(48px, 8vw, 80px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.03em", maxWidth: "900px", marginBottom: "24px" }}>
          <span style={{ display: "block" }}>Prove Solvency.</span>
          <span style={{ display: "block", color: "var(--accent-primary)" }}>Reveal Nothing.</span>
        </motion.h1>

        <motion.p initial="hidden" animate="visible" custom={2} variants={fadeUp} style={{ fontSize: "clamp(16px, 2.5vw, 20px)", color: "var(--text-secondary)", maxWidth: "600px", lineHeight: 1.7, marginBottom: "48px" }}>
          Organizations prove assets exceed liabilities via cryptographic proof on Aleo. The result is public. The data is mathematically private. Forever.
        </motion.p>

        <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp} style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center", marginBottom: "32px" }}>
          <Link href="/organization" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 32px", borderRadius: "10px", background: "var(--accent-primary)", color: "#080808", fontWeight: 600, fontSize: "16px", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.1)")}
            onMouseLeave={e => (e.currentTarget.style.filter = "none")}
          >
            Prove Solvency <ArrowRight size={16} />
          </Link>
          <Link href="/verifier" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 32px", borderRadius: "10px", border: "1px solid var(--border-default)", color: "var(--text-primary)", fontWeight: 600, fontSize: "16px", textDecoration: "none", background: "transparent" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            Verify an Org
          </Link>
        </motion.div>

        {/* Trust strip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }} style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center", fontSize: "13px", color: "var(--text-tertiary)" }}>
          <span>Deployed on Aleo Testnet</span>
          <span>·</span>
          <span>Three Leo Programs</span>
          <span>·</span>
          <span>veritaszk-sdk on npm</span>
          <span>·</span>
          <span>Open Source</span>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)" }}>
          <div style={{ width: "1px", height: "60px", background: "linear-gradient(to bottom, rgba(16,185,129,0.4), transparent)" }} />
        </motion.div>
      </section>

      {/* ─── LIVE STATS BAR ──────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px", textAlign: "center" }}>
          <StatsCounter value={stats.proofs} label="Proofs Generated" isLive />
          <div style={{ borderLeft: "1px solid var(--border-subtle)", borderRight: "1px solid var(--border-subtle)" }}>
            <StatsCounter value={stats.verifications} label="Verifications" isLive />
          </div>
          <StatsCounter value={stats.orgs} label="Organizations" isLive />
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} style={{ textAlign: "left", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 700 }}>How VeritasZK Works</h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0", alignItems: "stretch" }}>
          {steps.map((step, i) => (
            <div key={step.title} style={{ display: "flex", alignItems: "stretch", gap: "0" }}>
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                style={{ flex: 1, padding: "32px" }}
              >
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--accent-primary-dim)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", color: "var(--accent-primary)" }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: "11px", color: "var(--accent-primary)", fontWeight: 600, letterSpacing: "0.1em", marginBottom: "8px" }}>STEP {i + 1}</div>
                <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "10px" }}>{step.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.7 }}>{step.body}</p>
              </motion.div>
              {i < steps.length - 1 && (
                <div style={{ display: "flex", alignItems: "center", padding: "0 8px", color: "rgba(16,185,129,0.3)" }}>
                  <ArrowRight size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── THREE ROLES ─────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "40px 24px 80px", maxWidth: "1200px", margin: "0 auto" }}>
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} style={{ fontSize: "28px", fontWeight: 700, marginBottom: "32px" }}>
          Built for Every Stakeholder
        </motion.h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          {[
            { title: "Prove Solvency", body: "Declare assets privately. Generate a ZK proof that your holdings exceed your liabilities. Share a link — no financial data attached.", cta: "Start Proving →", href: "/organization", color: "#10b981" },
            { title: "Verify Instantly", body: "Paste any organization's commitment. Get a cryptographic confirmation in seconds. No wallet, no permissions, no friction.", cta: "Verify Now →", href: "/verifier", color: "#3b82f6" },
            { title: "Inspect the Record", body: "The public dashboard shows all verified organizations with their proof status. Every entry is on-chain and independently auditable.", cta: "View Dashboard →", href: "/public", color: "#8b5cf6" },
          ].map((card, i) => (
            <motion.div key={card.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
              style={{ padding: "32px", borderRadius: "12px", borderTop: `3px solid ${card.color}`, background: "var(--bg-surface)", border: `1px solid var(--border-subtle)`, borderTopColor: card.color }}
            >
              <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "12px" }}>{card.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.7, marginBottom: "20px" }}>{card.body}</p>
              <Link href={card.href} style={{ color: card.color, fontWeight: 600, fontSize: "14px", textDecoration: "none" }}>{card.cta}</Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── DEVELOPER STRIP ─────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px" }}>Integrate in minutes</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: 1.7 }}>
              Three ways to integrate VeritasZK into your stack. SDK for TypeScript apps, MCP for AI agents, CLI for automation.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "TypeScript", code: "npm install veritaszk-sdk", icon: <Package size={16} /> },
              { label: "AI Agents", code: "npx veritaszk-mcp", icon: <Bot size={16} /> },
              { label: "Terminal", code: "npx veritaszk-cli verify <commitment>", icon: <Terminal size={16} /> },
            ].map((item) => (
              <GlassCard key={item.label} className="px-4 py-3 flex items-center gap-3">
                <span style={{ color: "var(--accent-primary)" }}>{item.icon}</span>
                <code style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-primary)" }}>{item.code}</code>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ARCHITECTURE TEASER ─────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} style={{ fontSize: "28px", fontWeight: 700, marginBottom: "40px" }}>
          Three-Program CPI Architecture
        </motion.h2>

        <GlassCard className="p-8 font-mono text-sm leading-loose" >
          <pre style={{ color: "var(--text-secondary)", whiteSpace: "pre", overflowX: "auto", fontSize: "13px" }}>
{`┌──────────────────────┐
│ veritaszk_registry   │  org identity · credentials
└──────────┬───────────┘
           │ validates registration
┌──────────▼───────────┐      ┌──────────────────────┐
│  veritaszk_core      │─────►│  veritaszk_audit      │
│  ZK proof engine     │      │  immutable audit trail│
└──────────────────────┘      └──────────────────────┘`}
          </pre>
        </GlassCard>

        <div style={{ marginTop: "24px", display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap", fontSize: "13px" }}>
          {[
            { name: "Registry", slug: "veritaszk_registry.aleo" },
            { name: "Core", slug: "veritaszk_core.aleo" },
            { name: "Audit", slug: "veritaszk_audit.aleo" },
          ].map((p) => (
            <a key={p.slug} href={`https://explorer.aleo.org/program/${p.slug}`} target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--accent-primary)", textDecoration: "none", fontFamily: "var(--font-mono)" }}
            >
              {p.name} →
            </a>
          ))}
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid var(--border-subtle)", padding: "40px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>VeritasZK</div>
            <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>Prove Solvency. Reveal Nothing.</div>
          </div>
          <div style={{ display: "flex", gap: "24px" }}>
            <Link href="/docs" style={{ fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none" }}>Docs</Link>
            <Link href="/vision" style={{ fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none" }}>Vision</Link>
            <Link href="/enterprise" style={{ fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none" }}>Enterprise</Link>
            <a href="https://github.com/Vinaystwt/veritaszk" target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none" }}>GitHub</a>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <a href="https://www.npmjs.com/package/veritaszk-sdk" target="_blank" rel="noopener noreferrer" style={{ padding: "4px 10px", borderRadius: "6px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", fontSize: "11px", color: "var(--text-secondary)", textDecoration: "none" }}>npm: veritaszk-sdk</a>
            <a href="https://www.npmjs.com/package/veritaszk-mcp" target="_blank" rel="noopener noreferrer" style={{ padding: "4px 10px", borderRadius: "6px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", fontSize: "11px", color: "var(--text-secondary)", textDecoration: "none" }}>npm: veritaszk-mcp</a>
            <a href="https://www.npmjs.com/package/veritaszk-cli" target="_blank" rel="noopener noreferrer" style={{ padding: "4px 10px", borderRadius: "6px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", fontSize: "11px", color: "var(--text-secondary)", textDecoration: "none" }}>npm: veritaszk-cli</a>
          </div>
        </div>
        <div style={{ maxWidth: "1200px", margin: "24px auto 0", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)", fontSize: "12px", color: "var(--text-tertiary)", textAlign: "center" }}>
          Built on Aleo · Privacy by Default · Open Source
        </div>
      </footer>
    </div>
  );
}
