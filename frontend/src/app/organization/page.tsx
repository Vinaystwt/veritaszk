"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useShieldWallet } from "@/hooks/useShieldWallet";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import CommitmentDisplay from "@/components/ui/CommitmentDisplay";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import CodeBlock from "@/components/ui/CodeBlock";
import {
  Shield,
  ShieldCheck,
  Wallet,
  Building2,
  TrendingUp,
  TrendingDown,
  FileCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Download,
  Share2,
  AlertCircle,
  ChevronRight,
  Lock,
  Zap,
  Layers,
  Eye,
  Clock,
  Plus,
  X,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AssetType = "ALEO" | "STABLE" | "WRAPPED" | "OTHER";

type ExpiryOption = 1000 | 5000 | 10000 | 0;

type ThresholdLevel = 1 | 2 | 3;

type Step = 0 | 1 | 2 | 3 | 4;

type ProofGenStatus =
  | "idle"
  | "hashing"
  | "proving"
  | "verifying"
  | "submitting"
  | "done"
  | "error";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ASSET_TYPE_META: Record<
  AssetType,
  { label: string; icon: string; color: string }
> = {
  ALEO: { label: "ALEO", icon: "◆", color: "#10b981" },
  STABLE: { label: "Stable", icon: "$", color: "#3b82f6" },
  WRAPPED: { label: "Wrapped", icon: "↻", color: "#a855f7" },
  OTHER: { label: "Other", icon: "◈", color: "#f59e0b" },
};

const EXPIRY_OPTIONS: { value: ExpiryOption; label: string; sub: string }[] = [
  { value: 1000, label: "1,000 blocks", sub: "~1.7 hours" },
  { value: 5000, label: "5,000 blocks", sub: "~8.3 hours" },
  { value: 10000, label: "10,000 blocks", sub: "~16.7 hours" },
  { value: 0, label: "No expiry", sub: "Until revoked" },
];

const THRESHOLD_META: Record<
  ThresholdLevel,
  { label: string; desc: string; minRatio: number; color: string }
> = {
  1: {
    label: "Level 1",
    desc: "Asset ratio >= 1.05",
    minRatio: 1.05,
    color: "#f59e0b",
  },
  2: {
    label: "Level 2",
    desc: "Asset ratio >= 1.20",
    minRatio: 1.2,
    color: "#10b981",
  },
  3: {
    label: "Level 3",
    desc: "Asset ratio >= 1.50",
    minRatio: 1.5,
    color: "#3b82f6",
  },
};

const PROOF_STATUS_TEXT: Record<ProofGenStatus, string> = {
  idle: "Preparing proof parameters…",
  hashing: "Computing commitment hashes…",
  proving: "Generating zero-knowledge proof…",
  verifying: "Verifying proof integrity…",
  submitting: "Submitting on-chain…",
  done: "Proof generated successfully.",
  error: "Proof generation failed.",
};

const PROOF_STATUS_SEQUENCE: ProofGenStatus[] = [
  "hashing",
  "proving",
  "verifying",
  "submitting",
  "done",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

function shortAddr(addr: string): string {
  return `${addr.slice(0, 10)}…${addr.slice(-6)}`;
}

function randomTxHash(): string {
  const hex = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  return `atest1${hex}`;
}

// ---------------------------------------------------------------------------
// Step indicator data
// ---------------------------------------------------------------------------

const STEPS: { step: number; title: string; subtitle: string; icon: React.ReactNode }[] = [
  { step: 0, title: "Register", subtitle: "Organization identity", icon: <Building2 size={18} /> },
  { step: 1, title: "Position", subtitle: "Declare assets & liabilities", icon: <Layers size={18} /> },
  { step: 2, title: "Configure", subtitle: "Proof parameters", icon: <Zap size={18} /> },
  { step: 3, title: "Generate", subtitle: "Create ZK proof", icon: <ShieldCheck size={18} /> },
  { step: 4, title: "Complete", subtitle: "Verification ready", icon: <CheckCircle2 size={18} /> },
];

// ---------------------------------------------------------------------------
// Sub-components (inline to keep everything in one file)
// ---------------------------------------------------------------------------

function StepTracker({ current, registered }: { current: Step; registered: boolean }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Proof steps">
      {STEPS.map((s, i) => {
        const isActive = current === s.step;
        const isDone = current > s.step;
        const isLocked = s.step > current;
        return (
          <motion.div
            key={s.step}
            initial={false}
            animate={{ opacity: isLocked ? 0.35 : 1 }}
            className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
              isActive ? "bg-white/[0.04]" : ""
            }`}
          >
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
                isDone
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : isActive
                    ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300"
                    : "border-white/10 text-gray-500"
              }`}
            >
              {isDone ? <CheckCircle2 size={16} /> : s.icon}
            </span>
            <div className="min-w-0">
              <p
                className={`truncate text-sm font-medium ${
                  isActive ? "text-white" : "text-gray-400"
                }`}
              >
                {s.title}
              </p>
              <p className="truncate text-xs text-gray-600">{s.subtitle}</p>
            </div>
            {isActive && (
              <span className="ml-auto flex size-2 shrink-0 rounded-full bg-emerald-400 pulse-dot" />
            )}
          </motion.div>
        );
      })}
    </nav>
  );
}

function WalletBanner({
  demoMode,
}: {
  demoMode: boolean;
}) {
  const { state, address, connect, error, isAvailable } = useShieldWallet();

  if (demoMode) {
    return (
      <GlassCard className="mb-6 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
            <Eye size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-amber-300">Demo Mode</p>
            <p className="truncate text-xs text-gray-500">
              Wallet bypass active — proof flow simulated
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  const connected = state === "ready" && address;

  return (
    <GlassCard className="mb-6 px-4 py-3">
      {connected ? (
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <ShieldCheck size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-emerald-300">
              Shield Wallet Connected
            </p>
            <p className="truncate text-xs text-gray-500 font-mono">
              {shortAddr(address)}
            </p>
          </div>
        </div>
      ) : state === "connecting" ? (
        <div className="flex items-center gap-3">
          <LoadingSpinner size="sm" />
          <p className="text-sm text-gray-400">Connecting wallet…</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-red-500/15 text-red-400">
            <AlertCircle size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={connect}
              className="mt-1 text-xs text-emerald-400 hover:underline"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-white/5 text-gray-400">
              <Wallet size={16} />
            </span>
            <div>
              <p className="text-sm font-medium text-gray-300">
                Shield Wallet
              </p>
              <p className="text-xs text-gray-600">
                {isAvailable
                  ? "Connect to begin"
                  : "Shield extension not detected"}
              </p>
            </div>
          </div>
          <button
            onClick={connect}
            disabled={!isAvailable}
            className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Connect
          </button>
        </div>
      )}
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Register Organization
// ---------------------------------------------------------------------------

function StepRegister({
  onSubmit,
}: {
  onSubmit: (name: string, salt: string) => void;
}) {
  const [orgName, setOrgName] = useState("");
  const [salt] = useState(generateSalt);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = orgName.trim().length >= 2 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setErr(null);
    try {
      // Simulate registration
      await new Promise((r) => setTimeout(r, 1200));
      onSubmit(orgName.trim(), salt);
    } catch (e: any) {
      setErr(e.message ?? "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <h2 className="mb-1 text-lg font-semibold text-white">
        Register Organization
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        Create your on-chain identity. This binds your organization to a
        cryptographic commitment.
      </p>

      <label className="mb-1 block text-xs font-medium text-gray-400">
        Organization Name
      </label>
      <input
        type="text"
        value={orgName}
        onChange={(e) => setOrgName(e.target.value)}
        placeholder="e.g. Acme Holdings LLC"
        className="mb-4 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
        maxLength={64}
        autoFocus
      />

      <label className="mb-1 block text-xs font-medium text-gray-400">
        Salt (auto-generated, do not share)
      </label>
      <div className="mb-6 rounded-lg border border-white/5 bg-black/40 px-4 py-2 font-mono text-xs text-gray-500 break-all">
        {salt}
      </div>

      {err && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
          <AlertCircle size={14} />
          {err}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? (
          <>
            <LoadingSpinner size="sm" />
            Registering…
          </>
        ) : (
          <>
            Register
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Declare Position
// ---------------------------------------------------------------------------

interface DeclaredAssetEntry {
  type: AssetType;
  amount: string;
}

function StepPosition({
  onSubmit,
}: {
  onSubmit: (
    assets: DeclaredAssetEntry[],
    liabilities: string,
    multiWallet: boolean,
  ) => void;
}) {
  const [assets, setAssets] = useState<DeclaredAssetEntry[]>([]);
  const [selectedType, setSelectedType] = useState<AssetType | null>(null);
  const [amount, setAmount] = useState("");
  const [liabilities, setLiabilities] = useState("");
  const [multiWallet, setMultiWallet] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const addAsset = () => {
    if (!selectedType || !amount || Number(amount) <= 0) return;
    setAssets((prev) => [...prev, { type: selectedType, amount }]);
    setAmount("");
    setSelectedType(null);
  };

  const removeAsset = (idx: number) =>
    setAssets((prev) => prev.filter((_, i) => i !== idx));

  const canSubmit = assets.length >= 1 && liabilities.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(assets, liabilities.trim(), multiWallet);
  };

  return (
    <GlassCard className="p-6">
      <h2 className="mb-1 text-lg font-semibold text-white">
        Declare Position
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        Add your organization&apos;s assets and total liabilities. All values
        are committed privately.
      </p>

      {/* Asset type buttons */}
      <label className="mb-2 block text-xs font-medium text-gray-400">
        Select Asset Type
      </label>
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(Object.keys(ASSET_TYPE_META) as AssetType[]).map((t) => {
          const meta = ASSET_TYPE_META[t];
          const active = selectedType === t;
          return (
            <button
              key={t}
              onClick={() => setSelectedType(active ? null : t)}
              className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition ${
                active
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                  : "border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/20"
              }`}
            >
              <span style={{ color: meta.color }}>{meta.icon}</span>
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Amount + Add */}
      {selectedType && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex gap-2"
        >
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            min="0"
            step="any"
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white placeholder-gray-600 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
            onKeyDown={(e) => e.key === "Enter" && addAsset()}
          />
          <button
            onClick={addAsset}
            disabled={!amount || Number(amount) <= 0}
            className="flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            Add
          </button>
        </motion.div>
      )}

      {/* Asset list */}
      {assets.length > 0 && (
        <div className="mb-4 space-y-1.5">
          {assets.map((a, i) => {
            const meta = ASSET_TYPE_META[a.type];
            return (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: meta.color }}>{meta.icon}</span>
                  <span className="text-sm text-gray-300">{meta.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-white">
                    {Number(a.amount).toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeAsset(i)}
                    className="rounded p-1 text-gray-600 transition hover:text-red-400"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Liabilities */}
      <label className="mb-1 block text-xs font-medium text-gray-400">
        Total Liabilities
      </label>
      <div className="relative mb-4">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">
          <TrendingDown size={16} />
        </span>
        <input
          type="text"
          value={liabilities}
          onChange={(e) => setLiabilities(e.target.value)}
          placeholder="e.g. 50000"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
        />
      </div>

      {/* Multi-wallet toggle */}
      <button
        onClick={() => setMultiWallet((p) => !p)}
        className={`mb-6 flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-sm transition ${
          multiWallet
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            : "border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/20"
        }`}
      >
        <span className="flex items-center gap-2">
          <Wallet size={16} />
          Multi-wallet aggregation
        </span>
        <span
          className={`flex size-5 items-center justify-center rounded-full border transition ${
            multiWallet
              ? "border-emerald-500 bg-emerald-500"
              : "border-white/20"
          }`}
        >
          {multiWallet && <CheckCircle2 size={12} className="text-black" />}
        </span>
      </button>

      {err && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
          <AlertCircle size={14} />
          {err}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue
        <ArrowRight size={16} />
      </button>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Configure Proof
// ---------------------------------------------------------------------------

function StepConfigure({
  onSubmit,
}: {
  onSubmit: (expiry: ExpiryOption, threshold: ThresholdLevel) => void;
}) {
  const [expiry, setExpiry] = useState<ExpiryOption>(5000);
  const [threshold, setThreshold] = useState<ThresholdLevel>(2);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = () => {
    onSubmit(expiry, threshold);
  };

  return (
    <GlassCard className="p-6">
      <h2 className="mb-1 text-lg font-semibold text-white">
        Configure Proof
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        Set the validity window and solvency threshold for your proof.
      </p>

      {/* Expiry */}
      <label className="mb-2 block text-xs font-medium text-gray-400">
        Proof Expiry
      </label>
      <div className="mb-6 grid grid-cols-2 gap-2">
        {EXPIRY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setExpiry(opt.value)}
            className={`rounded-lg border px-4 py-3 text-left transition ${
              expiry === opt.value
                ? "border-emerald-500/50 bg-emerald-500/10"
                : "border-white/10 bg-white/[0.02] hover:border-white/20"
            }`}
          >
            <p
              className={`text-sm font-medium ${
                expiry === opt.value ? "text-emerald-300" : "text-gray-300"
              }`}
            >
              {opt.label}
            </p>
            <p className="text-xs text-gray-600">{opt.sub}</p>
          </button>
        ))}
      </div>

      {/* Threshold */}
      <label className="mb-2 block text-xs font-medium text-gray-400">
        Solvency Threshold
      </label>
      <div className="mb-6 space-y-2">
        {([1, 2, 3] as ThresholdLevel[]).map((lvl) => {
          const meta = THRESHOLD_META[lvl];
          const active = threshold === lvl;
          return (
            <button
              key={lvl}
              onClick={() => setThreshold(lvl)}
              className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
                active
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <div>
                <p
                  className={`text-sm font-medium ${
                    active ? "text-emerald-300" : "text-gray-300"
                  }`}
                >
                  {meta.label}
                </p>
                <p className="text-xs text-gray-600">{meta.desc}</p>
              </div>
              <span
                className="flex size-5 items-center justify-center rounded-full border transition"
                style={{
                  borderColor: active ? meta.color : "rgba(255,255,255,0.2)",
                  backgroundColor: active ? meta.color : "transparent",
                }}
              >
                {active && <CheckCircle2 size={12} className="text-black" />}
              </span>
            </button>
          );
        })}
      </div>

      {err && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
          <AlertCircle size={14} />
          {err}
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
      >
        Continue
        <ArrowRight size={16} />
      </button>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// Step 4: Generate Proof
// ---------------------------------------------------------------------------

function StepGenerate({
  orgName,
  assets,
  liabilities,
  expiry,
  threshold,
  onGenerate,
  onBack,
}: {
  orgName: string;
  assets: DeclaredAssetEntry[];
  liabilities: string;
  expiry: ExpiryOption;
  threshold: ThresholdLevel;
  onGenerate: () => void;
  onBack: () => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState<ProofGenStatus>("idle");
  const [err, setErr] = useState<string | null>(null);
  const timersRef = useRef<number[]>([]);

  const totalAssets = assets.reduce(
    (s, a) => s + Number(a.amount),
    0,
  );
  const totalLiabilities = Number(liabilities) || 0;
  const ratio =
    totalLiabilities > 0 ? (totalAssets / totalLiabilities).toFixed(2) : "—";

  const startGeneration = async () => {
    setGenerating(true);
    setGenStatus("idle");
    setErr(null);

    // Run through status sequence
    for (let i = 0; i < PROOF_STATUS_SEQUENCE.length; i++) {
      const status = PROOF_STATUS_SEQUENCE[i];
      const delay = status === "proving" ? 3000 : 1200;
      await new Promise<void>((resolve) => {
        const t = window.setTimeout(() => {
          setGenStatus(status);
          resolve();
        }, delay);
        timersRef.current.push(t);
      });
    }

    // Done — notify parent
    setGenerating(false);
    onGenerate();
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <GlassCard className="p-6">
      <h2 className="mb-1 text-lg font-semibold text-white">
        Generate Proof
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        Review your configuration and generate the zero-knowledge solvency
        proof.
      </p>

      {/* Summary card */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5">
          <span className="text-xs text-gray-500">Organization</span>
          <span className="text-sm font-medium text-white">{orgName}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5">
          <span className="text-xs text-gray-500">Total Assets</span>
          <span className="flex items-center gap-1 text-sm font-medium text-emerald-300">
            <TrendingUp size={14} />
            {totalAssets.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5">
          <span className="text-xs text-gray-500">Total Liabilities</span>
          <span className="flex items-center gap-1 text-sm font-medium text-red-300">
            <TrendingDown size={14} />
            {totalLiabilities.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5">
          <span className="text-xs text-gray-500">Asset / Liability Ratio</span>
          <span
            className={`text-sm font-semibold ${
              typeof ratio === "string" &&
              ratio !== "—" &&
              Number(ratio) >= THRESHOLD_META[threshold].minRatio
                ? "text-emerald-400"
                : "text-amber-400"
            }`}
          >
            {ratio}x
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5">
          <span className="text-xs text-gray-500">Expiry</span>
          <span className="text-sm text-gray-300">
            {expiry === 0
              ? "No expiry"
              : `${expiry.toLocaleString()} blocks`}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5">
          <span className="text-xs text-gray-500">Threshold</span>
          <span
            className="text-sm font-medium"
            style={{ color: THRESHOLD_META[threshold].color }}
          >
            {THRESHOLD_META[threshold].label}
          </span>
        </div>
      </div>

      {/* Generation progress */}
      {generating && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="mb-3 flex items-center gap-3">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-gray-300">
              {PROOF_STATUS_TEXT[genStatus]}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              initial={{ width: "0%" }}
              animate={{
                width: `${
                  ((PROOF_STATUS_SEQUENCE.indexOf(genStatus) + 1) /
                    PROOF_STATUS_SEQUENCE.length) *
                  100
                }%`,
              }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </motion.div>
      )}

      {err && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
          <AlertCircle size={14} />
          {err}
        </div>
      )}

      <div className="flex gap-2">
        {!generating && (
          <button
            onClick={onBack}
            className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-400 transition hover:border-white/20 hover:text-gray-200"
          >
            Back
          </button>
        )}
        <button
          onClick={startGeneration}
          disabled={generating}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {generating ? (
            <>
              <LoadingSpinner size="sm" />
              Generating…
            </>
          ) : (
            <>
              <ShieldCheck size={16} />
              Generate Proof
            </>
          )}
        </button>
      </div>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// Step 5: Success
// ---------------------------------------------------------------------------

function StepSuccess({
  orgName,
  txHash,
  commitment,
  onReset,
}: {
  orgName: string;
  txHash: string;
  commitment: string;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyHash = async () => {
    await navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassCard className="p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="mb-6 text-center"
      >
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
          <ShieldCheck size={32} className="text-emerald-400" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-white">
          Proof Generated
        </h2>
        <div className="mx-auto w-fit">
          <StatusBadge status="ACTIVE" size="md" />
        </div>
        <p className="mt-3 text-sm text-gray-500">
          {orgName} is now verifiably solvent. Your zero-knowledge proof is
          live on-chain.
        </p>
      </motion.div>

      {/* Transaction hash */}
      <div className="mb-4 rounded-lg border border-white/5 bg-black/30 px-4 py-3">
        <p className="mb-1 text-xs text-gray-500">Transaction Hash</p>
        <div className="flex items-center gap-2">
          <CodeBlock code={txHash} />
          <button
            onClick={copyHash}
            className="shrink-0 rounded p-1.5 text-gray-500 transition hover:bg-white/5 hover:text-gray-300"
            title="Copy hash"
          >
            {copied ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>
      </div>

      {/* Commitment */}
      <div className="mb-6">
        <p className="mb-2 text-xs text-gray-500">Commitment</p>
        <CommitmentDisplay commitment={commitment} />
      </div>

      {/* Action buttons */}
      <div className="mb-6 grid grid-cols-3 gap-2">
        <button className="flex flex-col items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-3 text-xs font-medium text-gray-400 transition hover:border-emerald-500/40 hover:text-emerald-300">
          <Download size={18} />
          Export
        </button>
        <button className="flex flex-col items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-3 text-xs font-medium text-gray-400 transition hover:border-emerald-500/40 hover:text-emerald-300">
          <ExternalLink size={18} />
          Explorer
        </button>
        <button className="flex flex-col items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-3 text-xs font-medium text-gray-400 transition hover:border-emerald-500/40 hover:text-emerald-300">
          <Share2 size={18} />
          Share
        </button>
      </div>

      {/* Embed badge section */}
      <div className="mb-6 rounded-lg border border-white/5 bg-black/30 p-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-400">
          <Lock size={12} />
          Embeddable Verification Badge
        </p>
        <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-4 text-center">
          <StatusBadge status="ACTIVE" size="lg" />
          <p className="mt-2 text-xs text-gray-600">
            Embed this badge on your website to show real-time solvency status
          </p>
        </div>
      </div>

      <button
        onClick={onReset}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-400 transition hover:border-white/20 hover:text-gray-200"
      >
        <RefreshCw size={14} />
        Generate New Proof
      </button>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function OrganizationPage() {
  const router = useRouter();
  const [demoMode, setDemoMode] = useState(false);

  // Read demo mode from URL without useSearchParams (avoids Suspense requirement)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setDemoMode(params.get("demo") === "true");
    }
  }, []);

  // Flow state
  const [step, setStep] = useState<Step>(0);
  const [orgName, setOrgName] = useState("");
  const [salt, setSalt] = useState("");
  const [assets, setAssets] = useState<DeclaredAssetEntry[]>([]);
  const [liabilities, setLiabilities] = useState("");
  const [multiWallet, setMultiWallet] = useState(false);
  const [expiry, setExpiry] = useState<ExpiryOption>(5000);
  const [threshold, setThreshold] = useState<ThresholdLevel>(2);
  const [txHash, setTxHash] = useState("");
  const [commitment, setCommitment] = useState("");

  // Registration
  const handleRegister = useCallback(
    (name: string, s: string) => {
      setOrgName(name);
      setSalt(s);
      setStep(1);
    },
    [],
  );

  // Position
  const handlePosition = useCallback(
    (
      a: DeclaredAssetEntry[],
      li: string,
      mw: boolean,
    ) => {
      setAssets(a);
      setLiabilities(li);
      setMultiWallet(mw);
      setStep(2);
    },
    [],
  );

  // Configure
  const handleConfigure = useCallback(
    (e: ExpiryOption, t: ThresholdLevel) => {
      setExpiry(e);
      setThreshold(t);
      setStep(3);
    },
    [],
  );

  // Generate
  const handleGenerate = useCallback(() => {
    const hash = randomTxHash();
    const comm = `commitment_0x${Array.from(
      crypto.getRandomValues(new Uint8Array(32)),
      (b) => b.toString(16).padStart(2, "0"),
    ).join("")}`;
    setTxHash(hash);
    setCommitment(comm);
    setStep(4);
  }, []);

  // Reset
  const handleReset = useCallback(() => {
    setOrgName("");
    setSalt("");
    setAssets([]);
    setLiabilities("");
    setMultiWallet(false);
    setExpiry(5000);
    setThreshold(2);
    setTxHash("");
    setCommitment("");
    setStep(0);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-xs text-emerald-400">
            <Shield size={12} />
            Organization Portal
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {orgName || "Organization Portal"}
          </h1>
          <p className="mt-1 text-base text-gray-500">
            Declare your assets and liabilities privately. Generate a ZK
            solvency proof.
          </p>
        </motion.div>

        {/* Wallet banner */}
        <WalletBanner demoMode={demoMode} />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[280px_1fr]">
          {/* Left: Step tracker — sticky on desktop */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <StepTracker current={step} registered={step > 0} />
          </div>

          {/* Right: Form content — only as tall as needed */}
          <div className="h-fit">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <StepRegister onSubmit={handleRegister} />
                </motion.div>
              )}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <StepPosition onSubmit={handlePosition} />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <StepConfigure onSubmit={handleConfigure} />
                </motion.div>
              )}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <StepGenerate
                    orgName={orgName}
                    assets={assets}
                    liabilities={liabilities}
                    expiry={expiry}
                    threshold={threshold}
                    onGenerate={handleGenerate}
                    onBack={() => setStep(2)}
                  />
                </motion.div>
              )}
              {step === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <StepSuccess
                    orgName={orgName}
                    txHash={txHash}
                    commitment={commitment}
                    onReset={handleReset}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
