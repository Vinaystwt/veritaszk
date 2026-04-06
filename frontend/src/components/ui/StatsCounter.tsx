'use client'
import { useEffect, useState } from 'react'

interface StatsCounterProps {
  value: number
  label: string
  isLive?: boolean
}

export default function StatsCounter({ value, label, isLive = false }: StatsCounterProps) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    if (value === 0) { setDisplayed(0); return }
    let start = 0
    const duration = 1200
    const startTime = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])

  return (
    <div className="flex items-center gap-3">
      {isLive && (
        <span
          className="w-2 h-2 rounded-full pulse-dot flex-shrink-0"
          style={{ backgroundColor: '#10b981' }}
        />
      )}
      <div>
        <div className="text-2xl font-semibold text-white tabular-nums">{displayed.toLocaleString()}</div>
        <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      </div>
    </div>
  )
}
