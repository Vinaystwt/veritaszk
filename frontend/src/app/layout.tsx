import type { Metadata } from "next";
import "./globals.css";
import { AleoWalletProvider } from "@/components/WalletProvider";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "VeritasZK — Prove Solvency. Reveal Nothing.",
  description: "The first zero-knowledge solvency proof on Aleo. Verify any organization's financial health without seeing a single number.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#0a0a0f", fontFamily: "Space Grotesk, sans-serif" }}>
        <AleoWalletProvider>
          <Navbar />
          <main style={{ paddingTop: "64px" }}>
            {children}
          </main>
        </AleoWalletProvider>
      </body>
    </html>
  );
}
