"use client";

import { useMemo } from "react";
import {
  WalletProvider,
} from "@demox-labs/aleo-wallet-adapter-react";
import {
  WalletModalProvider,
} from "@demox-labs/aleo-wallet-adapter-reactui";
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";
import { DecryptPermission, WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base";
import "@demox-labs/aleo-wallet-adapter-reactui/styles.css";

export function AleoWalletProvider({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [
    new LeoWalletAdapter({ appName: "VeritasZK" }),
  ], []);

  return (
    <WalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={WalletAdapterNetwork.Testnet}
      autoConnect
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </WalletProvider>
  );
}
