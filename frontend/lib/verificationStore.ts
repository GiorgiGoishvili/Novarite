/**
 * In-memory verification code store — server-side only.
 *
 * ⚠  DEVELOPMENT / PROTOTYPE LIMITATIONS:
 *   • State lives in the Node process. Codes are lost on server restart.
 *   • In serverless environments (Vercel, AWS Lambda) each cold-start may
 *     get a fresh module instance, so send and verify could hit different
 *     instances. For production, replace this module with Redis (e.g.
 *     Upstash) or a database-backed verification table.
 *   • This module intentionally has no external dependencies so it is
 *     trivial to swap out — just keep the same exported function signatures.
 *
 * Security properties even in this prototype:
 *   • Codes are generated with Node's CSPRNG (crypto.randomInt).
 *   • Stored as SHA-256 hashes — plain codes never persist in memory.
 *   • Codes expire after EXPIRY_MS (10 minutes).
 *   • Attempts are capped at MAX_ATTEMPTS (5) to prevent brute-force.
 *   • Codes are single-use: deleted from the store on successful verification.
 */

import { createHash, randomInt } from "crypto";

const EXPIRY_MS    = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

interface VerificationRecord {
  hashedCode: string;
  expiresAt:  number;
  attempts:   number;
}

// Module-level singleton — persists for the lifetime of the Node process.
const store = new Map<string, VerificationRecord>();

// ─── helpers ──────────────────────────────────────────────────────────────────

function storeKey(type: "email" | "phone", identifier: string): string {
  return `${type}:${identifier.trim().toLowerCase()}`;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

// ─── public API ───────────────────────────────────────────────────────────────

/** Returns a cryptographically random 6-digit string (zero-padded). */
export function generateCode(): string {
  return String(randomInt(100_000, 1_000_000)).padStart(6, "0");
}

/**
 * Store a new hashed code for the given identifier.
 * Overwrites any previous pending code for the same type + identifier.
 */
export function storeCode(
  type: "email" | "phone",
  identifier: string,
  code: string
): void {
  store.set(storeKey(type, identifier), {
    hashedCode: sha256(code),
    expiresAt:  Date.now() + EXPIRY_MS,
    attempts:   0,
  });
}

export type VerifyResult =
  | "ok"
  | "invalid"
  | "expired"
  | "too_many_attempts"
  | "not_found";

/**
 * Verify a submitted code.
 * Deletes the record on success (codes are single-use).
 */
export function verifyCode(
  type: "email" | "phone",
  identifier: string,
  code: string
): VerifyResult {
  const key    = storeKey(type, identifier);
  const record = store.get(key);

  if (!record) return "not_found";

  if (Date.now() > record.expiresAt) {
    store.delete(key);
    return "expired";
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return "too_many_attempts";
  }

  record.attempts++;

  if (sha256(code) !== record.hashedCode) {
    return "invalid";
  }

  store.delete(key); // single-use: invalidate immediately after success
  return "ok";
}
