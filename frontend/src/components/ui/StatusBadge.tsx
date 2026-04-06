'use client'

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  ACTIVE: { color: '#10b981', bg: 'rgba(16,185,129,0.10)', label: 'Solvent' },
  EXPIRING: { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', label: 'Expiring' },
  EXPIRED: { color: '#ef4444', bg: 'rgba(239,68,68,0.10)', label: 'Expired' },
  NO_PROOF: { color: '#6b7280', bg: 'rgba(107,114,128,0.10)', label: 'No Proof' },
}

interface StatusBadgeProps {
  status: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'NO_PROOF'
  size?: 'sm' | 'md' | 'lg'
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]}`}
      style={{ color: config.color, background: config.bg }}
    >
      <span
        className="inline-block w-2 h-2 rounded-full pulse-dot"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  )
}
