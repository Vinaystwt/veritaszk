'use client'
import { useState } from 'react'

interface CommitmentDisplayProps {
  commitment: string
  showFull?: boolean
}

export default function CommitmentDisplay({ commitment, showFull = false }: CommitmentDisplayProps) {
  const [copied, setCopied] = useState(false)

  const display = showFull
    ? commitment
    : `${commitment.slice(0, 16)}...${commitment.slice(-6)}`

  const copy = async () => {
    await navigator.clipboard.writeText(commitment)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <span className="inline-flex items-center gap-2 font-mono text-sm text-gray-300">
      <span>{display}</span>
      <button
        onClick={copy}
        className="p-1 rounded hover:bg-white/10 transition-colors"
        title="Copy to clipboard"
        style={{ color: copied ? '#10b981' : '#6b7280' }}
      >
        {copied ? '✓' : '⧉'}
      </button>
    </span>
  )
}
