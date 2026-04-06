const SIZE_MAP = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return (
    <div
      className={`${SIZE_MAP[size]} border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin`}
      aria-label="Loading"
    />
  )
}
