'use client'
import { useState } from 'react'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
}

export function CodeBlock({ code, language = 'bash', filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div
      className="relative rounded-lg overflow-hidden"
      style={{ background: '#0a0a14', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
          </div>
          {filename && (
            <span className="font-mono text-xs" style={{ color: '#888896' }}>{filename}</span>
          )}
          {!filename && (
            <span className="font-mono text-xs" style={{ color: '#44444f' }}>{language}</span>
          )}
        </div>
        <button
          onClick={copy}
          className="font-mono text-xs px-2 py-0.5 rounded transition-all cursor-pointer"
          style={{
            color: copied ? '#4fffb0' : '#888896',
            background: copied ? 'rgba(79,255,176,0.08)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${copied ? 'rgba(79,255,176,0.2)' : 'rgba(255,255,255,0.06)'}`,
          }}
        >
          {copied ? 'copied' : 'copy'}
        </button>
      </div>

      {/* Code */}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed font-mono" style={{ color: '#c8c8d4', margin: 0 }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}
