// MVP: purchase/access records stored in browser localStorage.
// These are per-device — a real backend with a database is needed for production.

export interface Purchase {
  id: string;
  gameId: string;
  gameTitle: string;
  buyerUserId: string;       // username from auth
  buyerWallet: string;       // Solana public key (may be empty for free access without wallet)
  sellerWallet: string;      // developer's Solana public key
  priceSol: number;          // 0 for free access
  transactionSignature: string; // empty for free access
  purchasedAt: string;       // ISO 8601
  network: string;           // "devnet" | "mainnet-beta"
  accessType: "free" | "paid";
}

const STORAGE_KEY = "nr_purchases";

function read(): Purchase[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Purchase[];
  } catch {
    return [];
  }
}

function write(purchases: Purchase[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));
}

export function savePurchase(
  data: Omit<Purchase, "id" | "purchasedAt">
): Purchase {
  const purchase: Purchase = {
    ...data,
    id: `purchase_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    purchasedAt: new Date().toISOString(),
  };
  const all = read();
  all.push(purchase);
  write(all);
  return purchase;
}

export function getPurchases(): Purchase[] {
  return read();
}

export function getUserPurchases(userId: string): Purchase[] {
  return read().filter((p) => p.buyerUserId === userId);
}

export function hasAccess(userId: string, gameId: string): boolean {
  return read().some((p) => p.buyerUserId === userId && p.gameId === gameId);
}

export function getPurchaseForGame(
  userId: string,
  gameId: string
): Purchase | null {
  return (
    read().find((p) => p.buyerUserId === userId && p.gameId === gameId) ?? null
  );
}
