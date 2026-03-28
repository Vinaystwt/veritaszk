"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Eye, Lock } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

const cards = [
  {
    icon: <Eye size={28} />,
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

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", position: "relative", overflow: "hidden" }}>

      {/* Dot grid background */}
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Green glow orb */}
      <div style={{
        position: "fixed",
        top: "-20%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "800px",
        height: "800px",
        background: "radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Hero */}
      <section style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", textAlign: "center" }}>

        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          style={{ marginBottom: "24px" }}
        >
          <span style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: "100px",
            border: "1px solid rgba(0,255,136,0.3)",
            background: "rgba(0,255,136,0.05)",
            color: "#00ff88",
            fontSize: "13px",
            fontWeight: 500,
            letterSpacing: "0.05em",
          }}>
            Built on Aleo · Zero Knowledge · Wave 4
          </span>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          style={{
            fontSize: "clamp(48px, 8vw, 96px)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            maxWidth: "900px",
            marginBottom: "24px",
          }}
        >
          Prove Solvency.{" "}
          <span style={{ color: "#00ff88" }}>Reveal Nothing.</span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
          style={{
            fontSize: "clamp(16px, 2.5vw, 20px)",
            color: "rgba(255,255,255,0.5)",
            maxWidth: "600px",
            lineHeight: 1.7,
            marginBottom: "48px",
          }}
        >
          The first zero-knowledge solvency proof on Aleo. Verify any organization&apos;s financial health — without seeing a single number.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          custom={3}
          variants={fadeUp}
          style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}
        >
          <Link href="/organization" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 32px",
            borderRadius: "10px",
            background: "#00ff88",
            color: "#0a0a0f",
            fontWeight: 600,
            fontSize: "16px",
            textDecoration: "none",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            I&apos;m an Organization
          </Link>

          <Link href="/verify" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 32px",
            borderRadius: "10px",
            border: "1px solid rgba(0,255,136,0.4)",
            color: "#00ff88",
            fontWeight: 600,
            fontSize: "16px",
            textDecoration: "none",
            background: "transparent",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,255,136,0.05)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            Verify an Org
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)" }}
        >
          <div style={{ width: "1px", height: "60px", background: "linear-gradient(to bottom, rgba(0,255,136,0.4), transparent)", margin: "0 auto" }} />
        </motion.div>
      </section>

      {/* Cards */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px 120px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              style={{
                padding: "32px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div style={{ color: "#00ff88", marginBottom: "16px" }}>{card.icon}</div>
              <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "12px" }}>{card.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontSize: "15px" }}>{card.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
