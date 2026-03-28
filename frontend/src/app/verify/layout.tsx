import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Solvency — VeritasZK",
  description: "Verify any organization's ZK solvency proof on Aleo. No wallet required. Powered by VeritasZK.",
  openGraph: {
    title: "Verify Organization Solvency — VeritasZK",
    description: "Zero-knowledge proof verification. See if an organization is solvent without seeing any financial data.",
    type: "website",
  },
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
