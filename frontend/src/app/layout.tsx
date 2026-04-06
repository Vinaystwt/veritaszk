import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "VeritasZK — Prove Solvency. Reveal Nothing.",
  description: "The first zero-knowledge solvency proof on Aleo. Verify any organization's financial health without seeing a single number.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "var(--bg-base)", color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
        <Navbar />
        <main className="px-4 sm:px-6 md:px-10 lg:px-16" style={{ paddingTop: "56px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
