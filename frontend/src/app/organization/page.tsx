"use client";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", maxWidth: "600px" }}
      >
        <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: "100px", border: "1px solid rgba(0,255,136,0.3)", background: "rgba(0,255,136,0.05)", color: "#00ff88", fontSize: "13px", marginBottom: "24px" }}>
          Coming in Phase 3
        </div>
        <h1 style={{ fontSize: "48px", fontWeight: 700, marginBottom: "16px" }}>Organization Portal</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "18px", lineHeight: 1.7 }}>Declare your assets and liabilities. Generate your ZK solvency proof.</p>
      </motion.div>
    </div>
  );
}
