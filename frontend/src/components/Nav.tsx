'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useShieldWallet } from '@/hooks/useShieldWallet'

const NAV_LINKS = [
  { href: '/verifier', label: 'Verify' },
  { href: '/public', label: 'Live Ledger' },
  { href: '/vision', label: 'Vision' },
  { href: '/docs', label: 'Docs' },
  { href: '/enterprise', label: 'Enterprise' },
]

const WALLET_ONLY_PAGES = ['/organization']

export function Nav() {
  const pathname = usePathname()
  const wallet = useShieldWallet()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isOrgPage = WALLET_ONLY_PAGES.some(p => pathname.startsWith(p))

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(8,8,13,0.92)' : 'rgba(8,8,13,0.6)',
          backdropFilter: 'blur(20px)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-xs font-mono font-bold transition-all"
              style={{ background: 'rgba(79,255,176,0.12)', border: '1px solid rgba(79,255,176,0.25)', color: '#4fffb0' }}
            >
              ZK
            </div>
            <span className="font-display text-lg tracking-tight" style={{ color: '#f4f4f0' }}>
              VeritasZK
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 rounded text-sm transition-colors font-body"
                  style={{
                    color: active ? '#f4f4f0' : '#888896',
                    background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Right: wallet status + org link */}
          <div className="hidden md:flex items-center gap-3">
            <WalletIndicator wallet={wallet} />
            <Link
              href="/organization"
              className="px-3 py-1.5 rounded text-sm font-body font-medium transition-all"
              style={{
                background: 'rgba(79,255,176,0.10)',
                border: '1px solid rgba(79,255,176,0.20)',
                color: '#4fffb0',
              }}
            >
              Organization →
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 rounded"
            style={{ color: '#888896' }}
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className="block h-px bg-current transition-all" style={{ transform: mobileOpen ? 'rotate(45deg) translateY(7px)' : '' }} />
              <span className="block h-px bg-current transition-all" style={{ opacity: mobileOpen ? 0 : 1 }} />
              <span className="block h-px bg-current transition-all" style={{ transform: mobileOpen ? 'rotate(-45deg) translateY(-7px)' : '' }} />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden"
            style={{
              background: 'rgba(10,10,18,0.98)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2.5 rounded text-sm font-body"
                  style={{ color: pathname === link.href ? '#f4f4f0' : '#888896', background: pathname === link.href ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/organization"
                className="mt-2 px-3 py-2.5 rounded text-sm font-body font-medium text-center"
                style={{ background: 'rgba(79,255,176,0.10)', border: '1px solid rgba(79,255,176,0.20)', color: '#4fffb0' }}
              >
                Organization →
              </Link>
              <div className="mt-2 px-3 py-2">
                <WalletIndicator wallet={wallet} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16" />
    </>
  )
}

function WalletIndicator({ wallet }: { wallet: ReturnType<typeof useShieldWallet> }) {
  const { state, publicKey } = wallet

  if (state === 'CONNECTED' && publicKey) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-xs" style={{ background: 'rgba(79,255,176,0.06)', border: '1px solid rgba(79,255,176,0.15)', color: '#4fffb0' }}>
        <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#4fffb0' }} />
        {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
      </div>
    )
  }

  if (state === 'DEMO_MODE') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-xs" style={{ background: 'rgba(229,255,79,0.06)', border: '1px solid rgba(229,255,79,0.15)', color: '#e5ff4f' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#e5ff4f' }} />
        Demo
      </div>
    )
  }

  return null
}
