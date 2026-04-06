import { verifySolvency } from './index'

export interface WebhookConfig {
  url: string
  secret?: string
  events: Array<'proof.generated' | 'proof.expired' | 'proof.revoked'>
  orgCommitment: string
  pollIntervalMs?: number
}

export class VeritasZKWebhook {
  private config: WebhookConfig
  private interval: ReturnType<typeof setInterval> | null = null
  private lastSolvent: boolean | null = null

  constructor(config: WebhookConfig) {
    this.config = config
  }

  start(): void {
    const ms = this.config.pollIntervalMs ?? 60000
    this.interval = setInterval(async () => {
      try {
        const status = await verifySolvency(this.config.orgCommitment)
        const changed = this.lastSolvent !== null &&
          this.lastSolvent !== status.isSolvent

        if (changed || this.lastSolvent === null) {
          const eventType = status.isSolvent
            ? 'proof.generated' : 'proof.revoked'
          if (this.config.events.includes(eventType)) {
            await this.post({ event: eventType,
              orgCommitment: this.config.orgCommitment,
              isSolvent: status.isSolvent,
              timestamp: new Date().toISOString() })
          }
        }

        if (status.isExpired &&
            this.config.events.includes('proof.expired')) {
          await this.post({ event: 'proof.expired',
            orgCommitment: this.config.orgCommitment,
            isSolvent: false,
            timestamp: new Date().toISOString() })
        }

        this.lastSolvent = status.isSolvent
      } catch (e) {
        console.error('VeritasZKWebhook error:', e)
      }
    }, ms)
  }

  stop(): void {
    if (this.interval) { clearInterval(this.interval); this.interval = null }
  }

  private async post(payload: object): Promise<void> {
    await fetch(this.config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }
}
