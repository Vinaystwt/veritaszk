import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";
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
      <body style={{ background: "#0a0a0f", fontFamily: "Space Grotesk, sans-serif" }}>
        <WalletProvider>
          <Navbar />
          <main style={{ paddingTop: "64px" }}>
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  );
}
