'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export function LoadingSpinner({ size = 'md', color = '#4fffb0' }: LoadingSpinnerProps) {
  const sizes = { sm: 16, md: 24, lg: 36 }
  const px = sizes[size]

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle
        cx="12" cy="12" r="10"
        stroke={color}
        strokeWidth="2"
        strokeOpacity="0.2"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SkeletonLine({ width = 'full', height = 4 }: { width?: string | number; height?: number }) {
  const w = typeof width === 'number' ? `${width}px` : width === 'full' ? '100%' : width
  return (
    <div
      className="shimmer rounded"
      style={{ width: w, height: `${height * 4}px`, borderRadius: 4 }}
    />
  )
}
