"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
// Import directly from the individual package to avoid loading @solana/wallet-adapter-wallets,
// which re-exports the WalletConnect adapter and causes a window.ethereum conflict
// with EVM browser extensions (TypeError: Cannot redefine property: ethereum).
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { useMemo, type ReactNode } from "react";

export default function NovariteWalletProvider({ children }: { children: ReactNode }) {
  const endpoint =
    process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";

  const wallets = useMemo(
    () => [new PhantomWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
