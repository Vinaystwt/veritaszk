import { useState, useEffect, useCallback } from 'react'
import { verifySolvency, getAuditTrail } from './index'
import type { SolvencyStatus, AuditEvent } from './index'

export function useSolvencyStatus(orgCommitment: string) {
  const [status, setStatus] = useState<SolvencyStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!orgCommitment) return
    setLoading(true)
    try {
      const result = await verifySolvency(orgCommitment)
      setStatus(result)
      setError(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [orgCommitment])

  useEffect(() => {
    refetch()
    const interval = setInterval(refetch, 30000)
    return () => clearInterval(interval)
  }, [refetch])

  return { status, loading, error, refetch }
}

export function useAuditTrail(orgCommitment: string) {
  const [events, setEvents] = useState<AuditEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orgCommitment) return
    getAuditTrail(orgCommitment)
      .then(setEvents)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [orgCommitment])

  return { events, loading, error }
}
