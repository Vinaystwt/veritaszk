'use client'
import { TIERS } from '@/lib/constants'

interface TierBadgeProps {
  tier: 1 | 2 | 3 | 4
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showName?: boolean
  showRatio?: boolean
}

const TIER_COLORS: Record<number, string> = {
  1: '#8888a0',
  2: '#4fffb0',
  3: '#e5ff4f',
  4: '#ffffff',
}

const TIER_BG: Record<number, string> = {
  1: 'rgba(136,136,160,0.10)',
  2: 'rgba(79,255,176,0.10)',
  3: 'rgba(229,255,79,0.10)',
  4: 'rgba(255,255,255,0.10)',
}

export function TierBadge({ tier, size = 'md', showName = true, showRatio = false }: TierBadgeProps) {
  const info = TIERS.find(t => t.tier === tier)!
  const color = TIER_COLORS[tier]
  const bg = TIER_BG[tier]

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
    xl: 'text-lg px-4 py-2 gap-2',
  }

  return (
    <span
      className={`inline-flex items-center rounded font-mono font-medium ${sizeClasses[size]}`}
      style={{ color, background: bg, border: `1px solid ${color}22` }}
    >
      <span style={{ color }}>T{tier}</span>
      {showName && <span className="opacity-80">{info.name}</span>}
      {showRatio && <span className="opacity-60 text-xs">{info.label}</span>}
    </span>
  )
}

export function TierColor(tier: number): string {
  return TIER_COLORS[tier] ?? '#8888a0'
}
