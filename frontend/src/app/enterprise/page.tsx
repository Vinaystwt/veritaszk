"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Building2,
  TrendingUp,
  Landmark,
  Users,
  Code2,
  Globe,
  Server,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Mail,
  Copy,
} from "lucide-react";
import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import CodeBlock from "@/components/ui/CodeBlock";

const useCases = [
  {
    icon: TrendingUp,
    tag: "Crypto Funds",
    title: "Private Treasury Verification",
    description: "Prove fund solvency to LPs without exposing portfolio positions, leverage ratios, or counterparty exposures. Zero-knowledge proofs let institutional investors verify AUM while keeping strategy alpha intact.",
    bullets: ["Prove total assets > liabilities", "Hide individual positions", "LP dashboard with live proofs"],
    color: "#10b981",
  },
  {
    icon: Shield,
    tag: "Exchanges",
    title: "Replace Merkle Proof-of-Reserves",
    description: "Move beyond broken Merkle-tree PoR. Aleo zk-proofs verify total exchange liabilities against real on-chain holdings — cryptographically, continuously, without exposing user balances.",
    bullets: ["Continuous vs. point-in-time proof", "No user balance exposure", "Regulator-verifiable"],
    color: "#3b82f6",
  },
  {
    icon: Landmark,
    tag: "DAOs",
    title: "Compliant Treasury Management",
    description: "DAOs can prove treasury health to governance without giving attackers a real-time map of holdings. Multi-sig teams maintain operational privacy while demonstrating fiscal responsibility.",
    bullets: ["Private multi-sig treasury", "Governance-gated proofs", "Slashing-proof compliance"],
    color: "#a855f7",
  },
  {
    icon: Users,
    tag: "Regulated Entities",
    title: "Selective Disclosure",
    description: "Financial institutions prove solvency to specific regulators or auditors via viewing keys — without publishing sensitive data on-chain. Meet compliance requirements without sacrificing competitive advantage.",
    bullets: ["Auditor-specific viewing keys", "Jurisdiction-scoped proofs", "Audit-ready ZK reports"],
    color: "#f59e0b",
  },
];

const integrations = [
  {
    icon: Code2,
    title: "TypeScript SDK",
    description: "Embed verification into your app.",
    code: "npm install veritaszk-sdk",
    language: "bash",
  },
  {
    icon: Globe,
    title: "REST API",
    description: "Query proofs from any backend.",
    code: "GET https://veritaszk.vercel.app/api/verify/[commitment]",
    language: "http",
  },
  {
    icon: Server,
    title: "MCP Server",
    description: "AI agents verify solvency natively.",
    code: "npx veritaszk-mcp",
    language: "bash",
  },
  {
    icon: Terminal,
    title: "CLI",
    description: "Verify from your terminal instantly.",
    code: "npx veritaszk-cli verify <commitment>",
    language: "bash",
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 24 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-80px" } as const,
  transition: { duration: 0.5 } as const,
};

export default function EnterprisePage() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopyUrl = async (url: string, idx: number) => {
    await navigator.clipboard.writeText(url);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      {/* Subtle background grid */}
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

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ==================== HERO ==================== */}
        <section style={{ padding: "120px 24px 80px", maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 16px",
                borderRadius: "100px",
                border: "1px solid rgba(16,185,129,0.3)",
                background: "rgba(16,185,129,0.06)",
                color: "var(--accent-primary)",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "24px",
              }}
            >
              <Shield size={14} />
              For Institutions
            </div>

            <h1 style={{ fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 700, lineHeight: 1.1, marginBottom: "20px" }}>
              Infrastructure for{" "}
              <span style={{ color: "var(--accent-primary)" }}>Institutional Solvency</span>
            </h1>

            <p style={{ fontSize: "clamp(16px, 2.5vw, 19px)", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: "680px", margin: "0 auto 32px" }}>
              Deploy zero-knowledge solvency proofs on Aleo. Three production contracts —{" "}
              <code style={{ color: "var(--accent-primary)", fontFamily: "var(--font-mono)" }}>veritaszk_core</code>,{" "}
              <code style={{ color: "var(--accent-primary)", fontFamily: "var(--font-mono)" }}>veritaszk_audit</code>,{" "}
              <code style={{ color: "var(--accent-primary)", fontFamily: "var(--font-mono)" }}>veritaszk_threshold</code>{" "}
              — running live on Aleo Testnet. Verify solvency without revealing a single number.
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="/dashboard"
                style={{
                  padding: "14px 28px",
                  borderRadius: "10px",
                  background: "var(--accent-primary)",
                  color: "#080808",
                  fontWeight: 600,
                  fontSize: "15px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                View Dashboard
                <ArrowRight size={16} />
              </a>
              <a
                href="/docs"
                style={{
                  padding: "14px 28px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                  fontWeight: 500,
                  fontSize: "15px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                Read the Docs
              </a>
            </div>
          </motion.div>
        </section>

        {/* ==================== USE CASES ==================== */}
        <section style={{ padding: "40px 24px 100px", maxWidth: "1100px", margin: "0 auto" }}>
          {useCases.map((uc, i) => (
            <motion.div
              key={uc.tag}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{
                display: "grid",
                gridTemplateColumns: i % 2 === 0 ? "1fr 1fr" : "1fr 1fr",
                gap: "48px",
                alignItems: "center",
                marginBottom: "80px",
              }}
            >
              {/* Icon side */}
              <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "16px",
                    background: `${uc.color}10`,
                    border: `1px solid ${uc.color}25`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <uc.icon size={32} color={uc.color} />
                </div>
                <div
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: uc.color,
                    background: `${uc.color}12`,
                    border: `1px solid ${uc.color}20`,
                    marginBottom: "12px",
                  }}
                >
                  {uc.tag}
                </div>
                <h3 style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700, marginBottom: "12px", lineHeight: 1.25 }}>
                  {uc.title}
                </h3>
                <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "20px" }}>
                  {uc.description}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {uc.bullets.map((b) => (
                    <div key={b} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <CheckCircle2 size={14} color="var(--accent-primary)" />
                      <span style={{ fontSize: "14px", color: "var(--text-primary)" }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code/visual side */}
              <div style={{ order: i % 2 === 0 ? 1 : 0 }}>
                <GlassCard>
                  <div style={{ padding: "24px" }}>
                    {i === 0 && (
                      <CodeBlock code={`import { verifySolvency } from "veritaszk-sdk";

const status = await verifySolvency(
  "aleo1..." // org commitment
);

console.log(status.isSolvent);
// true — solvent, proof verified`} language="typescript" />
                    )}
                    {i === 1 && (
                      <CodeBlock code={`$ curl https://veritaszk.vercel.app/api/verify/aleo1...

{
  "is_solvent": true,
  "verification_count": 47,
  "threshold_level": 3,
  "expiry_block": 2847561,
  "network": "testnet"
}`} language="json" />
                    )}
                    {i === 2 && (
                      <CodeBlock code={`// Multi-sig threshold proof
// 3-of-5 signers prove treasury
// health without revealing balances

await submitThresholdProof({
  signers: 3,
  threshold: 5,
  commitment: hash(treasury),
});`} language="typescript" />
                    )}
                    {i === 3 && (
                      <CodeBlock code={`// Generate auditor-specific viewing key
const key = generateViewingKey(auditorAddr);

// Share proof with regulator only
await shareWith(key, proofData);

// Public data remains hidden
assert(!isPublic(proofData)); // true`} language="typescript" />
                    )}
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          ))}
        </section>

        {/* ==================== INTEGRATION OPTIONS ==================== */}
        <section style={{ padding: "80px 24px", maxWidth: "1100px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: "center", marginBottom: "48px" }}
          >
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, marginBottom: "12px" }}>
              Integration Options
            </h2>
            <p style={{ fontSize: "16px", color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto" }}>
              Verify solvency your way — SDK, REST API, AI agents, or CLI.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
            {integrations.map((int, i) => (
              <motion.div
                key={int.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <GlassCard>
                  <div style={{ padding: "24px", height: "100%", display: "flex", flexDirection: "column" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        background: "rgba(16,185,129,0.08)",
                        border: "1px solid rgba(16,185,129,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <int.icon size={20} color="var(--accent-primary)" />
                    </div>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>{int.title}</h3>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>{int.description}</p>
                    <div style={{ marginTop: "auto" }}>
                      <CodeBlock code={int.code} language={int.language} />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ==================== CONTACT ==================== */}
        <section style={{ padding: "60px 24px 100px", maxWidth: "700px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard>
              <div style={{ padding: "40px", textAlign: "center" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
                  Ready to Integrate?
                </h2>
                <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginBottom: "32px", lineHeight: 1.6 }}>
                  Get in touch for custom integrations, enterprise support, or partnership inquiries.
                </p>

                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <a
                    href="mailto:contact@veritaszk.com"
                    style={{
                      padding: "12px 24px",
                      borderRadius: "10px",
                      background: "rgba(16,185,129,0.08)",
                      border: "1px solid rgba(16,185,129,0.2)",
                      color: "var(--accent-primary)",
                      fontWeight: 500,
                      fontSize: "14px",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Mail size={16} />
                    contact@veritaszk.com
                  </a>
                  <a
                    href="https://github.com/vinaystwt/veritaszk/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "12px 24px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                      fontWeight: 500,
                      fontSize: "14px",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span className="text-sm font-mono">GH</span>
                    GitHub Issues
                  </a>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
