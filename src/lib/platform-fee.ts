// Nudge's whole price, in one place: 1% of an invoice, taken only when it
// actually gets paid, capped per business per calendar year. The cap is in the
// business's default currency. Validate these on real users before treating
// them as final.
export const PLATFORM_FEE_RATE = 0.01; // 1%
export const ANNUAL_FEE_CAP_MAJOR = 2000; // 2,000 / year, in the business's currency

// The fee actually charged on a pay link: 1% clamped to the remaining annual
// cap room. Pure so it can be unit-tested without Stripe. Negative/absent room
// means the cap is reached → no fee on this link.
export function clampFeeMinor(onePercentMinor: number, maxFeeMinor?: number): number {
  if (maxFeeMinor == null) return Math.max(0, Math.round(onePercentMinor));
  return Math.max(0, Math.min(Math.round(onePercentMinor), Math.round(maxFeeMinor)));
}
