'use client'
import { useEffect } from 'react'
import { seedDemoOrgsIfEmpty } from '@/lib/api'

/**
 * Fires once on mount. Seeds demo orgs into the Railway indexer
 * if /api/proofs returns empty. Idempotent via localStorage flag.
 * Called from both the homepage AND /public page.
 */
export function useDemoSeed(): void {
  useEffect(() => {
    seedDemoOrgsIfEmpty()
  }, [])
}
