"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Step = "form" | "processing" | "success";

function CheckoutInner() {
  const params      = useSearchParams();
  const gameId      = params.get("gameId")      ?? "";
  const title       = params.get("title")       ?? "Game";
  const price       = params.get("price")       ?? "0.00";
  const cover       = params.get("cover")       ?? "";
  const downloadUrl = params.get("downloadUrl") ?? "";

  const [step, setStep]           = useState<Step>("form");
  const [name, setName]           = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry]       = useState("");
  const [cvc, setCvc]             = useState("");
  const [errors, setErrors]       = useState<Record<string, string>>({});

  // Suppress unused variable warning — gameId is kept for future Stripe/payment integration
  void gameId;

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!name.trim())       e.name       = "Required";
    if (!cardNumber.trim()) e.cardNumber = "Required";
    if (!expiry.trim())     e.expiry     = "Required";
    if (!cvc.trim())        e.cvc        = "Required";
    return e;
  }

  async function handlePay() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setStep("processing");
    // Simulate processing delay — no real charge, no data sent
    await new Promise((r) => setTimeout(r, 1500));
    setStep("success");
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-sans text-2xl font-extrabold text-nr-ink">Purchase successful</h1>
          <p className="mt-2 font-sans text-sm text-nr-muted">
            {title} has been added to your library.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {downloadUrl && (
              <a
                href={downloadUrl}
                className="block w-full rounded-lg bg-nr-red py-3 text-center font-sans text-sm font-semibold text-white transition-colors hover:bg-nr-redhover"
              >
                Download Game
              </a>
            )}
            <Link
              href="/"
              className="block w-full rounded-lg border border-nr-border py-3 text-center font-sans text-sm font-semibold text-nr-ink transition-colors hover:bg-nr-surface"
            >
              Back to Browse
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Checkout form ───────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-md px-5 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-sans text-sm text-nr-muted transition-colors hover:text-nr-ink mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Browse
        </Link>

        <h1 className="font-sans text-2xl font-extrabold text-nr-ink mb-6">Checkout</h1>

        {/* Order summary */}
        <div className="rounded-xl border border-nr-border bg-nr-surface p-4 mb-6">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-widest text-nr-faint mb-3">
            Order Summary
          </p>
          <div className="flex items-center gap-3">
            {cover ? (
              <img
                src={cover}
                alt={title}
                className="h-14 w-14 rounded-lg object-cover border border-nr-border shrink-0"
              />
            ) : (
              <div className="h-14 w-14 rounded-lg bg-nr-panel border border-nr-border shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm font-semibold text-nr-ink truncate">{title}</p>
              <p className="font-sans text-xs text-nr-muted mt-0.5">Payment method: Card</p>
            </div>
            <p className="font-sans text-sm font-semibold text-nr-ink shrink-0">${price}</p>
          </div>
          <div className="mt-3 border-t border-nr-border pt-3 flex justify-between">
            <p className="font-sans text-sm text-nr-body">Total</p>
            <p className="font-sans text-sm font-extrabold text-nr-ink">${price}</p>
          </div>
        </div>

        {/* Prototype notice */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-6">
          <p className="font-sans text-xs text-amber-700">
            Prototype checkout — no real card is charged.
          </p>
        </div>

        {/* Card form */}
        <div className="space-y-4">
          {/* Cardholder name */}
          <div>
            <label className="block font-sans text-xs font-semibold text-nr-body mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              className="w-full rounded-lg border border-nr-border bg-white px-3 py-2.5 font-sans text-sm text-nr-ink placeholder:text-nr-faint focus:outline-none focus:ring-2 focus:ring-nr-indigo/30"
            />
            {errors.name && (
              <p className="mt-1 font-sans text-xs text-nr-red">{errors.name}</p>
            )}
          </div>

          {/* Card number */}
          <div>
            <label className="block font-sans text-xs font-semibold text-nr-body mb-1">
              Card Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full rounded-lg border border-nr-border bg-white px-3 py-2.5 pr-24 font-sans text-sm text-nr-ink placeholder:text-nr-faint focus:outline-none focus:ring-2 focus:ring-nr-indigo/30"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                <span className="font-sans text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                  VISA
                </span>
                <span className="font-sans text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                  MC
                </span>
              </div>
            </div>
            {errors.cardNumber && (
              <p className="mt-1 font-sans text-xs text-nr-red">{errors.cardNumber}</p>
            )}
          </div>

          {/* Expiry + CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs font-semibold text-nr-body mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM / YY"
                maxLength={7}
                className="w-full rounded-lg border border-nr-border bg-white px-3 py-2.5 font-sans text-sm text-nr-ink placeholder:text-nr-faint focus:outline-none focus:ring-2 focus:ring-nr-indigo/30"
              />
              {errors.expiry && (
                <p className="mt-1 font-sans text-xs text-nr-red">{errors.expiry}</p>
              )}
            </div>
            <div>
              <label className="block font-sans text-xs font-semibold text-nr-body mb-1">
                CVC
              </label>
              <input
                type="text"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="123"
                maxLength={4}
                className="w-full rounded-lg border border-nr-border bg-white px-3 py-2.5 font-sans text-sm text-nr-ink placeholder:text-nr-faint focus:outline-none focus:ring-2 focus:ring-nr-indigo/30"
              />
              {errors.cvc && (
                <p className="mt-1 font-sans text-xs text-nr-red">{errors.cvc}</p>
              )}
            </div>
          </div>
        </div>

        {/* Pay button */}
        <button
          onClick={() => void handlePay()}
          disabled={step === "processing"}
          className="mt-6 block w-full rounded-lg bg-nr-red py-3 text-center font-sans text-sm font-semibold text-white transition-colors hover:bg-nr-redhover disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {step === "processing" ? "Processing payment..." : `Pay $${price}`}
        </button>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CheckoutInner />
    </Suspense>
  );
}
