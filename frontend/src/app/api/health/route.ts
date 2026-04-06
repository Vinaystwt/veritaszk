import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'VeritasZK API',
    network: 'testnet',
    programs: {
      registry: 'veritaszk_registry.aleo',
      core: 'veritaszk_core.aleo',
      audit: 'veritaszk_audit.aleo',
    },
    timestamp: new Date().toISOString(),
  })
}
