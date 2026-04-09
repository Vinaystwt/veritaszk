'use client'
import { useState, useEffect } from 'react'
import { getHealth } from '@/lib/api'

export function useLiveBlock(pollIntervalMs = 12000): number {
  const [block, setBlock] = useState<number>(15613711)

  useEffect(() => {
    let cancelled = false

    const fetchBlock = async () => {
      try {
        const health = await getHealth()
        if (!cancelled && health.lastIndexedBlock) {
          setBlock(health.lastIndexedBlock)
        }
      } catch {
        // Keep last known value
      }
    }

    fetchBlock()
    const interval = setInterval(fetchBlock, pollIntervalMs)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [pollIntervalMs])

  return block
}
