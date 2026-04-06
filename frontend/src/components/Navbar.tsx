"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(8,8,8,0.85)", backdropFilter: "blur(12px)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "2px", textDecoration: "none" }}>
          <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>VeritasZK</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {[
            { href: "/organization", label: "Prove" },
            { href: "/verifier", label: "Verify" },
            { href: "/public", label: "Dashboard" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: "14px",
                fontWeight: isActive(href) ? 600 : 400,
                color: isActive(href) ? "var(--accent-primary)" : "var(--text-secondary)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => { if (!isActive(href)) e.currentTarget.style.color = "var(--text-primary)"; }}
              onMouseLeave={e => { if (!isActive(href)) e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              {label}
            </Link>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/docs" style={{ fontSize: "13px", color: "var(--text-tertiary)", textDecoration: "none" }}>Docs</Link>
          <Link href="/vision" style={{ fontSize: "13px", color: "var(--text-tertiary)", textDecoration: "none" }}>Vision</Link>
          <a href="https://github.com/Vinaystwt/veritaszk" target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "var(--text-tertiary)", textDecoration: "none" }}>GitHub</a>
          <Link
            href="/organization"
            style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 14px", borderRadius: "6px", border: "1px solid var(--accent-primary)", color: "var(--accent-primary)", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-primary)"; e.currentTarget.style.color = "var(--bg-base)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--accent-primary)"; }}
          >
            Launch App
          </Link>
        </div>
      </div>
    </nav>
  );
}
