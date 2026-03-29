"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface WalletContextType {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  connect: (walletName?: string) => Promise<void>;
  disconnect: () => void;
  select: (walletName: string) => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const connect = async (walletName?: string) => {
    setConnecting(true);
    try {
      // Try direct window injection
      const leo = (window as any).leoWallet;
      const puzzle = (window as any).puzzle?.puzzleWalletClient;

      if (walletName === "Leo Wallet" && leo) {
        await leo.connect("testnet3");
        await new Promise(r => setTimeout(r, 500));
        const key = leo.publicKey;
        if (key) { setAddress(String(key)); setConnected(true); return; }
      }

      if (walletName === "Puzzle Wallet" && puzzle) {
        await puzzle.connect.mutate();
        await new Promise(r => setTimeout(r, 1000));
        const result = await puzzle.getSelectedAccount.query();
        const addr = result?.account?.address ?? result?.address;
        if (addr) { setAddress(String(addr)); setConnected(true); return; }
      }

      throw new Error("Could not connect wallet");
    } catch (err) {
      console.error("Wallet connection failed:", err);
      throw err;
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setConnected(false);
  };

  const select = (_walletName: string) => {};

  return (
    <WalletContext.Provider value={{ address, connected, connecting, connect, disconnect, select }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be inside WalletProvider");
  return ctx;
}
