'use client'
import { useState } from 'react'
import { truncateCommitment } from '@/lib/api'

interface CommitmentDisplayProps {
  hash: string
  chars?: number
  showCopy?: boolean
}

export function CommitmentDisplay({ hash, chars = 8, showCopy = true }: CommitmentDisplayProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* ignore */ }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="font-mono text-sm"
        style={{ color: '#888896' }}
        title={hash}
      >
        {truncateCommitment(hash, chars)}
      </span>
      {showCopy && (
        <button
          onClick={copy}
          className="text-xs transition-colors cursor-pointer"
          style={{ color: copied ? '#4fffb0' : '#44444f' }}
          title="Copy full commitment"
        >
          {copied ? '✓' : '⎘'}
        </button>
      )}
    </span>
  )
}
