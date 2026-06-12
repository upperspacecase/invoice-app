import type { CurrencyCode } from "./types";
import { PLATFORM_FEE_RATE } from "./platform-fee";

// Estimated card-processing fee so the tradie sees their real net before
// sending. Stripe's standard rate varies by region/card; this is the common
// domestic-card baseline (~1.5% + a fixed minor unit), labelled "~" in the UI.
// The actual fee is deducted by Stripe, not us — this is an estimate only.
const STRIPE_PCT = 0.015;
const STRIPE_FIXED_MAJOR: Record<CurrencyCode, number> = {
  GBP: 0.2,
  EUR: 0.25,
  USD: 0.3,
  AUD: 0.3,
  CAD: 0.3,
  JPY: 0,
};

export type NetPreview = {
  amount: number;
  stripe: number; // estimated card processing fee
  nudge: number; // Nudge's 1%
  net: number; // what lands in the tradie's bank
};

export function netPreview(amount: number, currency: CurrencyCode): NetPreview {
  const safe = Number.isFinite(amount) && amount > 0 ? amount : 0;
  const stripe = safe > 0 ? safe * STRIPE_PCT + (STRIPE_FIXED_MAJOR[currency] ?? 0.3) : 0;
  const nudge = safe * PLATFORM_FEE_RATE;
  const net = Math.max(0, safe - stripe - nudge);
  return { amount: safe, stripe, nudge, net };
}
