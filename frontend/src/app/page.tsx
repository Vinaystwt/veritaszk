"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Shield, Lock, Cpu, CheckCircle, ArrowRight } from "lucide-react";

const cards = [
  {
    icon: <Shield size={28} />,
    title: "The Problem",
    body: "After FTX collapsed, crypto realized it had no way to verify solvency without full public disclosure. Existing Proof of Reserves solutions expose wallet addresses, balances, and treasury strategy.",
  },
  {
    icon: <Shield size={28} />,
    title: "The Solution",
    body: "VeritasZK generates a cryptographic proof that assets exceed liabilities — without revealing which assets, exact amounts, or any wallet addresses. The output is a single boolean: solvent or not.",
  },
  {
    icon: <Lock size={28} />,
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

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.6 },
    }),
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", position: "relative", overflow: "hidden" }}>

      {/* Dot grid */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none", zIndex: 0 }} />

      {/* Drifting orbs */}
      {!shouldReduce && (
        <>
          <motion.div
            animate={{ x: [0, 60, -40, 0], y: [0, -40, 60, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "fixed", top: "10%", left: "20%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }}
          />
          <motion.div
            animate={{ x: [0, -50, 30, 0], y: [0, 50, -30, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
            style={{ position: "fixed", top: "30%", right: "15%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,215,0,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }}
          />
        </>
      )}

      {/* Hero */}
      <section style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", textAlign: "center" }}>

        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} style={{ marginBottom: "24px" }}>
          <span style={{ display: "inline-block", padding: "6px 16px", borderRadius: "100px", border: "1px solid rgba(0,255,136,0.3)", background: "rgba(0,255,136,0.05)", color: "#00ff88", fontSize: "13px", fontWeight: 500, letterSpacing: "0.05em" }}>
            Built on Aleo · Zero Knowledge · Wave 4
          </span>
        </motion.div>

        <motion.h1 initial="hidden" animate="visible" custom={1} variants={fadeUp} style={{ fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "900px", marginBottom: "24px" }}>
          Prove Solvency.{" "}
          <span style={{ color: "#00ff88" }}>Reveal Nothing.</span>
        </motion.h1>

        <motion.p initial="hidden" animate="visible" custom={2} variants={fadeUp} style={{ fontSize: "clamp(16px, 2.5vw, 20px)", color: "rgba(255,255,255,0.5)", maxWidth: "600px", lineHeight: 1.7, marginBottom: "48px" }}>
          The first zero-knowledge solvency proof on Aleo. Verify any organization&apos;s financial health — without seeing a single number.
        </motion.p>

        <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp} style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center", marginBottom: "32px" }}>
          <Link href="/organization" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 32px", borderRadius: "10px", background: "#00ff88", color: "#0a0a0f", fontWeight: 600, fontSize: "16px", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            I&apos;m an Organization
          </Link>
          <Link href="/verify" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 32px", borderRadius: "10px", border: "1px solid rgba(0,255,136,0.4)", color: "#00ff88", fontWeight: 600, fontSize: "16px", textDecoration: "none", background: "transparent" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,255,136,0.05)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            Verify an Org
          </Link>
        </motion.div>

        {/* Stats ticker */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 20px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
          <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00ff88" }} />
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            <span style={{ color: "#00ff88", fontWeight: 600 }}>3 organizations</span> verified on Aleo Testnet
          </span>
        </motion.div>

        {/* Scroll line */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)" }}>
          <div style={{ width: "1px", height: "60px", background: "linear-gradient(to bottom, rgba(0,255,136,0.4), transparent)", margin: "0 auto" }} />
        </motion.div>
      </section>

      {/* Explainer cards */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px 60px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {cards.map((card, i) => (
            <motion.div key={card.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
              style={{ padding: "32px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}
            >
              <div style={{ color: "#00ff88", marginBottom: "16px" }}>{card.icon}</div>
              <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "12px" }}>{card.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontSize: "15px" }}>{card.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How The Proof Works */}
      <section style={{ position: "relative", zIndex: 1, padding: "40px 24px 120px", maxWidth: "1200px", margin: "0 auto" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "12px" }}>How The Proof Works</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px" }}>Three steps. Zero data revealed.</p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0", alignItems: "center" }}>
          {steps.map((step, i) => (
            <div key={step.title} style={{ display: "flex", alignItems: "stretch", gap: "0" }}>
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                style={{ flex: 1, padding: "32px", borderRadius: "16px", border: "1px solid rgba(0,255,136,0.15)", background: "rgba(0,255,136,0.03)", backdropFilter: "blur(12px)", textAlign: "center" }}
              >
                <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#00ff88" }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: "12px", color: "#00ff88", fontWeight: 600, letterSpacing: "0.08em", marginBottom: "10px" }}>STEP {i + 1}</div>
                <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "10px" }}>{step.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px", lineHeight: 1.6 }}>{step.body}</p>
              </motion.div>
              {i < steps.length - 1 && (
                <div style={{ display: "flex", alignItems: "center", padding: "0 8px" }}>
                  <ArrowRight size={20} color="rgba(0,255,136,0.3)" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>VeritasZK — Prove Solvency. Reveal Nothing.</span>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>Built on Aleo · Wave 4 Buildathon</span>
          <div style={{ display: "flex", gap: "16px" }}>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>GitHub</a>
            <a href="https://testnet.explorer.provable.com/transaction/at1tkmfhd76ggsrx7p0srlhfc6hyjsqefskrtwd49y3elk4dga4sczse6r5c4" target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>View Contract</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
