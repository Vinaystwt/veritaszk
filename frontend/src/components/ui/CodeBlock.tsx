'use client'
import { useState } from 'react'

interface CodeBlockProps {
  code: string
  language?: string
}

export default function CodeBlock({ code, language = '' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative rounded-lg overflow-hidden border border-white/10 bg-[#0d0d0d] my-4">
      {language && (
        <div className="px-4 py-2 text-xs text-gray-500 border-b border-white/5 font-mono">
          {language}
        </div>
      )}
      <button
        onClick={copy}
        className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-white/5 hover:bg-white/10 text-gray-400 transition-colors font-mono"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="text-gray-300 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  )
}
