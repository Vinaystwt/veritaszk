"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ConnectedWallet, connectPuzzle, connectLeo, connectShield, disconnectPuzzle, detectWallets } from "@/lib/wallets";

interface WalletContextType {
  wallet: ConnectedWallet | null;
  connecting: boolean;
  puzzleAvailable: boolean;
  leoAvailable: boolean;
  shieldAvailable: boolean;
  error: string | null;
  connectWithPuzzle: () => Promise<void>;
  connectWithLeo: () => Promise<void>;
  connectWithShield: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [puzzleAvailable, setPuzzleAvailable] = useState(false);
  const [leoAvailable, setLeoAvailable] = useState(false);
  const [shieldAvailable, setShieldAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectWallets().then(({ puzzle, leo, shield }) => {
      setPuzzleAvailable(puzzle);
      setLeoAvailable(leo);
      setShieldAvailable(shield);
    });
  }, []);

  const connectWithPuzzle = async () => {
    try {
      setConnecting(true);
      setError(null);
      const connected = await connectPuzzle();
      setWallet(connected);
    } catch (err: unknown) {
      console.error("Puzzle connection failed:", err);
      setError(err instanceof Error ? err.message : "Puzzle Wallet connection failed");
    } finally {
      setConnecting(false);
    }
  };

  const connectWithLeo = async () => {
    try {
      setConnecting(true);
      setError(null);
      const connected = await connectLeo();
      setWallet(connected);
    } catch (err: unknown) {
      console.error("Leo connection failed:", err);
      setError("Leo Wallet: unlock your wallet and refresh the page, then try connecting again");
    } finally {
      setConnecting(false);
    }
  };

  const connectWithShield = async () => {
    try {
      setConnecting(true);
      setError(null);
      const connected = await connectShield();
      setWallet(connected);
    } catch (err: unknown) {
      console.error("Shield connection failed:", err);
      setError(err instanceof Error ? err.message : "Shield Wallet connection failed");
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    if (wallet?.walletType === "puzzle") disconnectPuzzle();
    setWallet(null);
    setError(null);
  };

  return (
    <WalletContext.Provider value={{
      wallet, connecting, puzzleAvailable, leoAvailable, shieldAvailable, error,
      connectWithPuzzle, connectWithLeo, connectWithShield, disconnect,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be inside WalletProvider");
  return ctx;
}
