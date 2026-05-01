import { PublicKey } from "@solana/web3.js";

export const SOLANA_NETWORK =
  process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";

export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 1) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

export function explorerTxUrl(signature: string): string {
  const cluster =
    SOLANA_NETWORK === "mainnet-beta" ? "" : `?cluster=${SOLANA_NETWORK}`;
  return `https://explorer.solana.com/tx/${signature}${cluster}`;
}

export function explorerAccountUrl(address: string): string {
  const cluster =
    SOLANA_NETWORK === "mainnet-beta" ? "" : `?cluster=${SOLANA_NETWORK}`;
  return `https://explorer.solana.com/address/${address}${cluster}`;
}

export function isValidPublicKey(address: string): boolean {
  if (!address || address.length < 32 || address.length > 44) return false;
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}
