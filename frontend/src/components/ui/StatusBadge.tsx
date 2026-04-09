'use client'

type Status = 'active' | 'expired' | 'revoked' | 'expiring'

interface StatusBadgeProps {
  status: Status
  size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<Status, { color: string; bg: string; label: string; pulse?: boolean }> = {
  active:   { color: '#4fffb0', bg: 'rgba(79,255,176,0.10)',  label: 'ACTIVE' },
  expiring: { color: '#e5ff4f', bg: 'rgba(229,255,79,0.10)', label: 'EXPIRING', pulse: true },
  expired:  { color: '#ff4455', bg: 'rgba(255,68,85,0.10)',   label: 'EXPIRED' },
  revoked:  { color: '#666674', bg: 'rgba(102,102,116,0.10)', label: 'REVOKED' },
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]
  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5 gap-1' : 'text-xs px-2 py-1 gap-1.5'

  return (
    <span
      className={`inline-flex items-center rounded font-mono font-semibold tracking-wider ${sizeClass}`}
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}22` }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${cfg.pulse ? 'pulse-dot' : ''}`}
        style={{ background: cfg.color }}
      />
      {cfg.label}
    </span>
  )
}
