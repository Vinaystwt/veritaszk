"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";
import { generateFieldId, currentTimestamp, ASSET_LABELS, ASSET_COLORS, CONTRACT_ADDRESS } from "@/lib/aleoUtils";
import { useWallet } from "@/context/WalletContext";

export interface DeclaredLiability {
  id: string;
  liability_type: number;
  amount: number;
  liability_id: string;
  timestamp: string;
}

interface Props {
  onLiabilityDeclared: (liability: DeclaredLiability) => void;
}

export function LiabilityDeclarationForm({ onLiabilityDeclared }: Props) {
  const { wallet } = useWallet();
  const publicKey = wallet?.address ?? null;
  const [liabilityType, setLiabilityType] = useState(1);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const amt = parseInt(amount);
    if (!amt || amt <= 0) return;
    setStatus("loading");
    setError("");

    try {
      const liabilityId = generateFieldId();
      const ts = currentTimestamp();

      if (false) {
        // live contract call placeholder
      } else {
        console.log("[SIM] declare_liability called with:", { liabilityType, amt, liabilityId });
        await new Promise((r) => setTimeout(r, 1500));
      }

      onLiabilityDeclared({ id: liabilityId, liability_type: liabilityType, amount: amt, liability_id: liabilityId, timestamp: ts });
      setStatus("success");
      setAmount("");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction failed.");
      setStatus("error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: "32px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", marginBottom: "24px" }}
    >
      <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>Declare Liability</h3>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", marginBottom: "24px" }}>
        Liability amounts are stored privately. Only the proof outcome is ever public.
      </p>

      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>Liability Type</label>
        <div style={{ display: "flex", gap: "8px" }}>
          {[1, 2, 3].map((t) => (
            <button
              key={t}
              onClick={() => setLiabilityType(t)}
              style={{
                flex: 1, padding: "10px", borderRadius: "8px", fontSize: "14px", fontWeight: 500,
                border: liabilityType === t ? `1px solid ${ASSET_COLORS[t]}` : "1px solid rgba(255,255,255,0.1)",
                background: liabilityType === t ? `${ASSET_COLORS[t]}18` : "transparent",
                color: liabilityType === t ? ASSET_COLORS[t] : "rgba(255,255,255,0.5)",
                cursor: "pointer", fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              {ASSET_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>Amount</label>
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 300000"
          disabled={status === "loading"}
          style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: "15px", fontFamily: "Space Grotesk, sans-serif", outline: "none" }}
        />
      </div>

      {error && <p style={{ color: "#ff4444", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!amount || parseInt(amount) <= 0 || status === "loading"}
        style={{
          width: "100%", padding: "13px", borderRadius: "10px",
          background: "rgba(255,68,68,0.08)",
          color: "#ff8888", fontWeight: 600, fontSize: "15px",
          border: "1px solid rgba(255,68,68,0.25)",
          cursor: status === "loading" ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          fontFamily: "Space Grotesk, sans-serif",
          opacity: !amount || parseInt(amount) <= 0 ? 0.5 : 1,
        }}
      >
        {status === "loading" && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
        {status === "success" && <CheckCircle size={16} />}
        {status === "idle" && "Declare Liability Privately"}
        {status === "loading" && "Generating private record on Aleo..."}
        {status === "success" && "Liability Declared ✓"}
        {status === "error" && "Retry"}
      </button>
    </motion.div>
  );
}
