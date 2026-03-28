"use client";

interface Props {
  currentStep: number;
}

const STEPS = ["Register", "Declare Assets", "Declare Liabilities", "Generate Proof"];

export function ProgressStepper({ currentStep }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "32px", overflowX: "auto", paddingBottom: "4px" }}>
      {STEPS.map((step, i) => (
        <div key={step} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0,
              background: i < currentStep ? "#00ff88" : i === currentStep ? "rgba(0,255,136,0.15)" : "rgba(255,255,255,0.05)",
              border: i === currentStep ? "1px solid #00ff88" : i < currentStep ? "none" : "1px solid rgba(255,255,255,0.1)",
              color: i < currentStep ? "#0a0a0f" : i === currentStep ? "#00ff88" : "rgba(255,255,255,0.3)",
            }}>
              {i < currentStep ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: "13px", fontWeight: i === currentStep ? 600 : 400, color: i === currentStep ? "#00ff88" : i < currentStep ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ width: "32px", height: "1px", background: i < currentStep ? "rgba(0,255,136,0.4)" : "rgba(255,255,255,0.08)", margin: "0 8px", flexShrink: 0 }} />
          )}
        </div>
      ))}
    </div>
  );
}
