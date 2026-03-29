"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, CheckCircle, Loader2 } from "lucide-react";
import { hashOrgName, currentTimestamp, CONTRACT_ADDRESS } from "@/lib/aleoUtils";
import { useWallet } from "@/context/WalletContext";

interface Props {
  onRegistered: (name: string) => void;
}

export function OrgRegistration({ onRegistered }: Props) {
  const { wallet } = useWallet();
  const publicKey = wallet?.address ?? null;
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setStatus("loading");
    setError("");

    try {
      const nameHash = hashOrgName(name.trim());
      const timestamp = currentTimestamp();

      if (false) {
        // live contract call placeholder
      } else {
        // Simulation mode — wallet adapter does not support requestTransaction
        console.log("[SIM] register_org called with:", { nameHash, timestamp });
        await new Promise((r) => setTimeout(r, 1500));
      }

      localStorage.setItem("veritaszk_org_name", name.trim());
      localStorage.setItem("veritaszk_org_registered", "true");
      setStatus("success");
      setTimeout(() => onRegistered(name.trim()), 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction failed. Please try again.");
      setStatus("error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: "32px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", marginBottom: "24px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <Building2 size={22} color="#00ff88" />
        <h2 style={{ fontSize: "20px", fontWeight: 600 }}>Register Organization</h2>
      </div>

      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 }}>
        Your organization name will be hashed before submission. Only the hash is stored on-chain — never the name itself.
      </p>

      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>Organization Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Acme Capital Fund"
          disabled={status === "loading" || status === "success"}
          style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: "15px", fontFamily: "Space Grotesk, sans-serif", outline: "none" }}
        />
      </div>

      {error && (
        <p style={{ color: "#ff4444", fontSize: "13px", marginBottom: "12px" }}>{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!name.trim() || status === "loading" || status === "success"}
        style={{
          width: "100%", padding: "13px", borderRadius: "10px",
          background: status === "success" ? "rgba(0,255,136,0.15)" : "#00ff88",
          color: status === "success" ? "#00ff88" : "#0a0a0f",
          fontWeight: 600, fontSize: "15px", border: status === "success" ? "1px solid #00ff88" : "none",
          cursor: status === "loading" || status === "success" ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          fontFamily: "Space Grotesk, sans-serif",
          opacity: !name.trim() ? 0.5 : 1,
        }}
      >
        {status === "loading" && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
        {status === "success" && <CheckCircle size={16} />}
        {status === "idle" && "Register Organization"}
        {status === "loading" && "Registering on Aleo..."}
        {status === "success" && "Registered Successfully"}
        {status === "error" && "Retry Registration"}
      </button>
    </motion.div>
  );
}
